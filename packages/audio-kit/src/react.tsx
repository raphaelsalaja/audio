"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { type AudioAnalyser, createMasterAnalyser } from "./analyser";
import {
  getContext as getAudioContext,
  getDestination,
  setListener,
} from "./context";
import { render } from "./engine";
import { type AudioPack, loadPack } from "./pack";
import { playSequence } from "./sequence";
import type {
  AnalyserOptions,
  Listener,
  PlayOptions,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  SoundPack,
  VoiceHandle,
} from "./types";

// ---------------------------------------------------------------------------
// Reduced motion (reactive via useSyncExternalStore)
// ---------------------------------------------------------------------------

function subscribeToReducedMotion(cb: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

// ---------------------------------------------------------------------------
// Context (state/actions split per composition patterns)
// ---------------------------------------------------------------------------

type SoundState = {
  enabled: boolean;
  volume: number;
};

type SoundActions = {
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
};

type SoundContextValue = {
  state: SoundState;
  actions: SoundActions;
};

const DEFAULT_STATE: SoundState = { enabled: true, volume: 1 };
const NOOP_ACTIONS: SoundActions = {
  setEnabled() {},
  setVolume() {},
};

const SoundContext = createContext<SoundContextValue>({
  state: DEFAULT_STATE,
  actions: NOOP_ACTIONS,
});

export function SoundProvider({
  children,
  enabled = true,
  volume = 1,
  onEnabledChange,
  onVolumeChange,
}: {
  children: React.ReactNode;
  enabled?: boolean;
  volume?: number;
  onEnabledChange?: (enabled: boolean) => void;
  onVolumeChange?: (volume: number) => void;
}) {
  const state = useMemo<SoundState>(
    () => ({ enabled, volume }),
    [enabled, volume],
  );

  const onEnabledChangeRef = useRef(onEnabledChange);
  onEnabledChangeRef.current = onEnabledChange;

  const onVolumeChangeRef = useRef(onVolumeChange);
  onVolumeChangeRef.current = onVolumeChange;

  const actions = useMemo<SoundActions>(
    () => ({
      setEnabled: (v) => onEnabledChangeRef.current?.(v),
      setVolume: (v) => onVolumeChangeRef.current?.(v),
    }),
    [],
  );

  const value = useMemo<SoundContextValue>(
    () => ({ state, actions }),
    [state, actions],
  );

  return <SoundContext value={value}>{children}</SoundContext>;
}

// ---------------------------------------------------------------------------
// useSound — stable callback via refs (rerender-defer-reads)
// ---------------------------------------------------------------------------

export function useSound(
  definition: SoundDefinition,
  opts?: PlayOptions,
): () => VoiceHandle | undefined {
  const { state } = use(SoundContext);
  const reducedMotion = usePrefersReducedMotion();

  const stateRef = useRef(state);
  stateRef.current = state;

  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const defRef = useRef(definition);
  defRef.current = definition;

  const optsRef = useRef(opts);
  optsRef.current = opts;

  return useCallback(() => {
    const { enabled, volume } = stateRef.current;
    if (!enabled || reducedMotionRef.current) return undefined;

    const audio = getAudioContext();
    const v = (optsRef.current?.volume ?? 1) * volume;
    return render(
      audio,
      defRef.current,
      { ...optsRef.current, volume: v },
      undefined,
      getDestination(),
    );
  }, []);
}

// ---------------------------------------------------------------------------
// useSequence — stable callbacks via refs
// ---------------------------------------------------------------------------

export function useSequence(
  steps: SequenceStep[],
  options?: SequenceOptions,
): { play: () => void; stop: () => void } {
  const { state } = use(SoundContext);
  const reducedMotion = usePrefersReducedMotion();
  const stopRef = useRef<(() => void) | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const play = useCallback(() => {
    const { enabled, volume } = stateRef.current;
    if (!enabled || reducedMotionRef.current) return;

    stopRef.current?.();

    const audio = getAudioContext();
    const result = playSequence(audio, stepsRef.current, optionsRef.current, {
      volume,
    });
    if (typeof result === "function") {
      stopRef.current = result;
    }
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
  }, []);

  return { play, stop };
}

// ---------------------------------------------------------------------------
// useAnalyser — lazy state initialization with cleanup
// ---------------------------------------------------------------------------

export function useAnalyser(opts?: AnalyserOptions): AudioAnalyser {
  const optsRef = useRef(opts);
  const [analyser] = useState(() => createMasterAnalyser(optsRef.current));

  useEffect(() => {
    return () => analyser.dispose();
  }, [analyser]);

  return analyser;
}

// ---------------------------------------------------------------------------
// usePack — memoized wrapper with useEffect for source changes
// ---------------------------------------------------------------------------

const emptyPack: AudioPack = {
  ready: false,
  name: "",
  sounds: [],
  play() {
    return { stop() {} };
  },
  get() {
    return undefined;
  },
  toJSON() {
    return { name: "", sounds: {} };
  },
};

export function usePack(source: string | SoundPack): AudioPack {
  const { state } = use(SoundContext);
  const reducedMotion = usePrefersReducedMotion();
  const [pack, setPack] = useState<AudioPack | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    let cancelled = false;
    loadPack(source).then((p) => {
      if (!cancelled) setPack(p);
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return useMemo(() => {
    if (!pack) return emptyPack;

    return {
      ...pack,
      play(name: string, opts?: PlayOptions) {
        const { enabled, volume } = stateRef.current;
        if (!enabled || reducedMotionRef.current) return { stop() {} };
        const v = (opts?.volume ?? 1) * volume;
        return pack.play(name, { ...opts, volume: v });
      },
    };
  }, [pack]);
}

// ---------------------------------------------------------------------------
// useListener — updates on position changes via useEffect
// ---------------------------------------------------------------------------

export function useListener(listener: Listener): void {
  useEffect(() => {
    setListener(listener);
  }, [
    listener.positionX,
    listener.positionY,
    listener.positionZ,
    listener.forwardX,
    listener.forwardY,
    listener.forwardZ,
    listener.upX,
    listener.upY,
    listener.upZ,
    listener,
  ]);
}

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
import { type AudioPatch, createPatchInstance, loadPatch } from "./patch";
import { playSequence } from "./sequence";
import type {
  AnalyserOptions,
  Listener,
  PlayOptions,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  SoundPatch,
  VoiceHandle,
} from "./types";


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

/**
 * Context provider that controls global sound state for all descendant hooks.
 *
 * Wrap your app (or a subtree) with `<SoundProvider>` to enable
 * {@link useSound}, {@link useSequence}, and {@link usePatch} to respect
 * a shared enabled/volume state.
 *
 * @param props.enabled - Whether sounds are allowed to play. @defaultValue `true`
 * @param props.volume - Master volume multiplier (0 – 1). @defaultValue `1`
 * @param props.onEnabledChange - Called when a child requests an enabled change
 * @param props.onVolumeChange - Called when a child requests a volume change
 *
 * @example
 * ```tsx
 * <SoundProvider enabled={soundsOn} volume={0.8}>
 *   <App />
 * </SoundProvider>
 * ```
 */
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


/**
 * Returns a stable callback that plays the given sound definition.
 *
 * Respects the nearest {@link SoundProvider}'s enabled/volume state and
 * the user's `prefers-reduced-motion` preference. The callback reference
 * never changes between renders (values are read from refs).
 *
 * @param definition - The sound to play
 * @param opts - Default play options (can be overridden at call time)
 * @returns A function that triggers the sound and returns a {@link VoiceHandle}, or `undefined` if muted
 *
 * @example
 * ```tsx
 * const play = useSound({
 *   source: { type: "sine", frequency: 440 },
 *   envelope: { decay: 0.1 },
 * });
 *
 * <button onClick={play}>Beep</button>
 * ```
 */
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


/**
 * Returns stable `play` and `stop` callbacks for a sound sequence.
 *
 * Calling `play()` starts the sequence; calling `stop()` halts it.
 * Both callbacks are referentially stable across renders.
 *
 * @param steps - Ordered list of {@link SequenceStep}s
 * @param options - Loop and duration settings
 * @returns An object with `play` and `stop` functions
 */
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

  return useMemo(() => ({ play, stop }), [play, stop]);
}


/**
 * Creates and returns an {@link AudioAnalyser} connected to the master bus.
 *
 * The analyser is initialized once (lazy state) and automatically disposed
 * when the component unmounts.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */
export function useAnalyser(opts?: AnalyserOptions): AudioAnalyser {
  const optsRef = useRef(opts);
  const [analyser] = useState(() => createMasterAnalyser(optsRef.current));

  useEffect(() => {
    return () => analyser.dispose();
  }, [analyser]);

  return analyser;
}


const emptyPatch: AudioPatch = {
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

/**
 * Loads a sound patch and returns a context-aware {@link AudioPatch}.
 *
 * The returned patch's `play()` method automatically respects the nearest
 * {@link SoundProvider}'s enabled/volume state and reduced-motion preference.
 * While the patch is loading, an empty no-op patch is returned (`ready: false`).
 *
 * @param source - URL string or in-memory {@link SoundPatch} object
 * @returns An `AudioPatch` (initially empty until loaded)
 *
 * @example
 * ```tsx
 * const patch = usePatch("https://example.com/ui.json");
 *
 * <button onClick={() => patch.play("click")}>Click</button>
 * ```
 */
export function usePatch(source: string | SoundPatch): AudioPatch {
  const { state } = use(SoundContext);
  const reducedMotion = usePrefersReducedMotion();

  const [patch, setPatch] = useState<AudioPatch | null>(() =>
    typeof source !== "string" ? createPatchInstance(source) : null,
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    if (typeof source !== "string") return;
    let cancelled = false;
    loadPatch(source).then((p) => {
      if (!cancelled) setPatch(p);
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return useMemo(() => {
    if (!patch) return emptyPatch;

    return {
      ...patch,
      play(name: string, opts?: PlayOptions) {
        const { enabled, volume } = stateRef.current;
        if (!enabled || reducedMotionRef.current) return { stop() {} };
        const v = (opts?.volume ?? 1) * volume;
        return patch.play(name, { ...opts, volume: v });
      },
    };
  }, [patch]);
}


/**
 * Synchronizes the 3D audio listener with the given position and orientation.
 *
 * The effect only re-runs when individual primitive values change, not when
 * the `listener` object reference changes.
 *
 * @param listener - Listener position and orientation
 */
export function useListener(listener: Listener): void {
  const {
    positionX,
    positionY,
    positionZ,
    forwardX,
    forwardY,
    forwardZ,
    upX,
    upY,
    upZ,
  } = listener;

  useEffect(() => {
    setListener({
      positionX,
      positionY,
      positionZ,
      forwardX,
      forwardY,
      forwardZ,
      upX,
      upY,
      upZ,
    });
  }, [
    positionX,
    positionY,
    positionZ,
    forwardX,
    forwardY,
    forwardZ,
    upX,
    upY,
    upZ,
  ]);
}

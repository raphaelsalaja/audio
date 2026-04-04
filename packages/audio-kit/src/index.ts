import { createAnalyser, createMasterAnalyser } from "./analyser";
import {
  dispose,
  ensureReady,
  getContext,
  getDestination,
  getListener,
  getMasterBus,
  setListener,
  setMasterVolume,
} from "./context";
import { render } from "./engine";
import { bufferToWav, renderToBuffer, renderToWav } from "./offline";
import { definePack, loadPack } from "./pack";
import { playSequence } from "./sequence";
import type {
  OscillatorSource,
  PlayOptions,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  VoiceHandle,
} from "./types";

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export function defineSound(
  definition: SoundDefinition,
): (opts?: PlayOptions) => VoiceHandle {
  return (opts) => {
    const ctx = getContext();
    return render(ctx, definition, opts, undefined, getDestination());
  };
}

export function defineSequence(
  steps: SequenceStep[],
  options?: SequenceOptions,
): (opts?: PlayOptions) => (() => void) | undefined {
  return (opts) => {
    const ctx = getContext();
    return playSequence(ctx, steps, options, opts);
  };
}

// ---------------------------------------------------------------------------
// Shortcuts
// ---------------------------------------------------------------------------

type OscType = OscillatorSource["type"];

function osc(
  type: OscType,
  frequency: number | { start: number; end: number },
  decay: number,
  gain = 0.4,
) {
  return defineSound({
    source: { type, frequency },
    envelope: { decay },
    gain,
  });
}

export function sine(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("sine", frequency, decay, gain);
}

export function triangle(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("triangle", frequency, decay, gain);
}

export function square(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("square", frequency, decay, gain);
}

export function sawtooth(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("sawtooth", frequency, decay, gain);
}

export function noise(
  color: "white" | "pink" | "brown" = "white",
  decay = 0.05,
  gain = 0.4,
) {
  return defineSound({
    source: { type: "noise", color },
    envelope: { decay },
    gain,
  });
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { AudioAnalyser } from "./analyser";
export type { AudioPack } from "./pack";
export type {
  AnalyserOptions,
  BiquadFilter,
  BiquadFilterType,
  BitcrusherEffect,
  ChorusEffect,
  CompressorEffect,
  ConstantSource,
  ContextOptions,
  ConvolverEffect,
  DelayEffect,
  DistortionEffect,
  Effect,
  EffectNode,
  Envelope,
  EQBand,
  EQEffect,
  Filter,
  FilterEnvelope,
  FlangerEffect,
  GainEffect,
  IIRFilter,
  Layer,
  LFO,
  LFOTarget,
  Listener,
  MultiLayerSound,
  NoiseSource,
  OfflineRenderOptions,
  OscillatorSource,
  Panner3D,
  PhaserEffect,
  PlayOptions,
  ReverbEffect,
  SampleSource,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  SoundPack,
  Source,
  StereoPanEffect,
  StreamSource,
  TremoloEffect,
  VibratoEffect,
  VoiceHandle,
  WavetableSource,
} from "./types";
export {
  bufferToWav,
  createAnalyser,
  createMasterAnalyser,
  definePack,
  dispose,
  ensureReady,
  getDestination,
  getListener,
  getMasterBus,
  loadPack,
  renderToBuffer,
  renderToWav,
  setListener,
  setMasterVolume,
};

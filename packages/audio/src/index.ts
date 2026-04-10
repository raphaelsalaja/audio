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
import { createPatchInstance, definePatch, loadPatch } from "./patch";
import { playSequence } from "./sequence";
import type {
  OscillatorSource,
  PlayOptions,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  VoiceHandle,
} from "./types";


/**
 * Binds a {@link SoundDefinition} into a reusable play function.
 *
 * The returned function creates a new voice each time it is called,
 * routing through the master bus.
 *
 * @param definition - The sound to bind
 * @returns A function that plays the sound and returns a {@link VoiceHandle}
 *
 * @example
 * ```typescript
 * import { defineSound } from "@web-kits/audio";
 *
 * const click = defineSound({
 *   source: { type: "sine", frequency: { start: 1800, end: 400 } },
 *   envelope: { attack: 0, decay: 0.08 },
 *   gain: 0.3,
 * });
 *
 * click(); // plays the sound
 * ```
 */
export function defineSound(
  definition: SoundDefinition,
): (opts?: PlayOptions) => VoiceHandle {
  return (opts) => {
    const ctx = getContext();
    return render(ctx, definition, opts, undefined, getDestination());
  };
}

/**
 * Binds a list of {@link SequenceStep}s into a reusable play function.
 *
 * @param steps - Ordered list of sequence steps
 * @param options - Loop and duration settings
 * @returns A function that starts the sequence and returns a stop callback
 *
 * @example
 * ```typescript
 * const melody = defineSequence([
 *   { sound: noteC, at: 0 },
 *   { sound: noteE, at: 0.25 },
 *   { sound: noteG, at: 0.5 },
 * ], { loop: true, duration: 1 });
 *
 * const stop = melody();
 * // later...
 * stop?.();
 * ```
 */
export function defineSequence(
  steps: SequenceStep[],
  options?: SequenceOptions,
): (opts?: PlayOptions) => (() => void) | undefined {
  return (opts) => {
    const ctx = getContext();
    return playSequence(ctx, steps, options, opts);
  };
}


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

/**
 * Shortcut: creates a sine-wave sound with the given frequency and decay.
 *
 * @param frequency - Fixed Hz or `{ start, end }` sweep
 * @param decay - Envelope decay time in seconds
 * @param gain - Output gain (0 – 1). @defaultValue `0.4`
 */
export function sine(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("sine", frequency, decay, gain);
}

/**
 * Shortcut: creates a triangle-wave sound with the given frequency and decay.
 *
 * @param frequency - Fixed Hz or `{ start, end }` sweep
 * @param decay - Envelope decay time in seconds
 * @param gain - Output gain (0 – 1). @defaultValue `0.4`
 */
export function triangle(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("triangle", frequency, decay, gain);
}

/**
 * Shortcut: creates a square-wave sound with the given frequency and decay.
 *
 * @param frequency - Fixed Hz or `{ start, end }` sweep
 * @param decay - Envelope decay time in seconds
 * @param gain - Output gain (0 – 1). @defaultValue `0.4`
 */
export function square(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("square", frequency, decay, gain);
}

/**
 * Shortcut: creates a sawtooth-wave sound with the given frequency and decay.
 *
 * @param frequency - Fixed Hz or `{ start, end }` sweep
 * @param decay - Envelope decay time in seconds
 * @param gain - Output gain (0 – 1). @defaultValue `0.4`
 */
export function sawtooth(
  frequency: number | { start: number; end: number },
  decay: number,
  gain?: number,
) {
  return osc("sawtooth", frequency, decay, gain);
}

/**
 * Shortcut: creates a noise burst with the given color and decay.
 *
 * @param color - Noise spectrum. @defaultValue `"white"`
 * @param decay - Envelope decay time in seconds. @defaultValue `0.05`
 * @param gain - Output gain (0 – 1). @defaultValue `0.4`
 */
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


export type { AudioAnalyser } from "./analyser";
export type { AudioPatch } from "./patch";
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
  SoundPatch,
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
  createPatchInstance,
  definePatch,
  dispose,
  ensureReady,
  getDestination,
  getListener,
  getMasterBus,
  loadPatch,
  renderToBuffer,
  renderToWav,
  setListener,
  setMasterVolume,
};

import type { ContextOptions, Listener } from "./types";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let storedOptions: ContextOptions = {};

/**
 * Returns the shared `AudioContext`, creating one if needed.
 *
 * If the context is suspended (e.g. before a user gesture), it will be
 * resumed automatically. Pass `options` on first call to configure latency
 * and sample rate.
 *
 * @param options - Context creation options (stored for future calls)
 * @returns The shared `AudioContext`
 */
export function getContext(options?: ContextOptions): AudioContext {
  if (options) {
    storedOptions = options;
  }
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext({
      latencyHint: storedOptions.latencyHint,
      sampleRate: storedOptions.sampleRate,
    });
    masterGain = null;
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

/**
 * Ensures the `AudioContext` is running and ready for playback.
 *
 * Unlike {@link getContext}, this awaits the `resume()` promise so the
 * caller can be certain audio output is active before proceeding.
 *
 * @param options - Context creation options
 * @returns A promise that resolves to the active `AudioContext`
 */
export async function ensureReady(
  options?: ContextOptions,
): Promise<AudioContext> {
  const audio = getContext(options);
  if (audio.state === "suspended") {
    await audio.resume();
  }
  return audio;
}

/**
 * Closes the shared `AudioContext` and releases all associated resources.
 *
 * After calling this, the next call to {@link getContext} will create a
 * fresh context.
 */
export function dispose(): void {
  if (ctx) {
    ctx.close();
    ctx = null;
    masterGain = null;
  }
}

/**
 * Returns the master bus `GainNode`, creating it on first access.
 *
 * The master bus sits between all sound output and `ctx.destination`,
 * providing a single point to control global volume.
 */
export function getMasterBus(): GainNode {
  const c = getContext();
  if (!masterGain || masterGain.context !== c) {
    masterGain = c.createGain();
    masterGain.connect(c.destination);
  }
  return masterGain;
}

/**
 * Returns the appropriate destination node for sound output.
 *
 * If a master bus has been created, routes through it; otherwise falls
 * back to `ctx.destination`.
 */
export function getDestination(): AudioNode {
  const c = getContext();
  if (masterGain && masterGain.context === c) {
    return masterGain;
  }
  return c.destination;
}

/**
 * Sets the master volume for all audio output.
 *
 * @param volume - Linear gain value (0 = silent, 1 = unity)
 */
export function setMasterVolume(volume: number): void {
  getMasterBus().gain.value = volume;
}

/**
 * Configures the 3D audio listener position and orientation.
 *
 * @param listener - Position and orientation values
 * @see {@link getListener}
 */
export function setListener(listener: Listener): void {
  const audio = getContext();
  const l = audio.listener;

  l.positionX.value = listener.positionX;
  l.positionY.value = listener.positionY;
  l.positionZ.value = listener.positionZ;

  l.forwardX.value = listener.forwardX ?? 0;
  l.forwardY.value = listener.forwardY ?? 0;
  l.forwardZ.value = listener.forwardZ ?? -1;

  l.upX.value = listener.upX ?? 0;
  l.upY.value = listener.upY ?? 1;
  l.upZ.value = listener.upZ ?? 0;
}

/**
 * Reads the current 3D audio listener position and orientation.
 *
 * @returns A snapshot of the listener's spatial parameters
 * @see {@link setListener}
 */
export function getListener(): Listener {
  const audio = getContext();
  const l = audio.listener;
  return {
    positionX: l.positionX.value,
    positionY: l.positionY.value,
    positionZ: l.positionZ.value,
    forwardX: l.forwardX.value,
    forwardY: l.forwardY.value,
    forwardZ: l.forwardZ.value,
    upX: l.upX.value,
    upY: l.upY.value,
    upZ: l.upZ.value,
  };
}

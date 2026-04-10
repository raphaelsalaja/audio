import { getContext, getMasterBus } from "./context";
import type { AnalyserOptions } from "./types";

/**
 * Wrapper around the native `AnalyserNode` with pre-allocated typed arrays
 * for zero-allocation reads in animation loops.
 */
export type AudioAnalyser = {
  /** The underlying Web Audio `AnalyserNode`. */
  node: AnalyserNode;
  /** Returns byte-scaled frequency magnitudes (0 – 255). */
  getFrequencyData: () => Uint8Array;
  /** Returns byte-scaled time-domain waveform (0 – 255). */
  getTimeDomainData: () => Uint8Array;
  /** Returns frequency magnitudes in dB. */
  getFloatFrequencyData: () => Float32Array;
  /** Returns time-domain waveform as floats (-1 to 1). */
  getFloatTimeDomainData: () => Float32Array;
  /** Number of frequency bins (half of `fftSize`). */
  frequencyBinCount: number;
  /** Disconnects the analyser and releases resources. */
  dispose: () => void;
};

/**
 * Creates a standalone {@link AudioAnalyser}.
 *
 * The caller is responsible for connecting a source to `analyser.node`.
 * Call `analyser.dispose()` when finished to disconnect.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */
export function createAnalyser(opts?: AnalyserOptions): AudioAnalyser {
  const ctx = getContext();
  const node = ctx.createAnalyser();

  node.fftSize = opts?.fftSize ?? 2048;
  node.smoothingTimeConstant = opts?.smoothingTimeConstant ?? 0.8;
  if (opts?.minDecibels !== undefined) node.minDecibels = opts.minDecibels;
  if (opts?.maxDecibels !== undefined) node.maxDecibels = opts.maxDecibels;

  const freqData = new Uint8Array(node.frequencyBinCount);
  const timeData = new Uint8Array(node.fftSize);
  const floatFreqData = new Float32Array(node.frequencyBinCount);
  const floatTimeData = new Float32Array(node.fftSize);

  return {
    node,
    frequencyBinCount: node.frequencyBinCount,

    getFrequencyData() {
      node.getByteFrequencyData(freqData);
      return freqData;
    },

    getTimeDomainData() {
      node.getByteTimeDomainData(timeData);
      return timeData;
    },

    getFloatFrequencyData() {
      node.getFloatFrequencyData(floatFreqData);
      return floatFreqData;
    },

    getFloatTimeDomainData() {
      node.getFloatTimeDomainData(floatTimeData);
      return floatTimeData;
    },

    dispose() {
      try {
        node.disconnect();
      } catch (_) {}
    },
  };
}

/**
 * Creates an {@link AudioAnalyser} that is pre-connected to the master bus.
 *
 * Useful for visualising the combined output of all sounds.
 * The returned analyser automatically disconnects from the master bus on
 * `dispose()`.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */
export function createMasterAnalyser(opts?: AnalyserOptions): AudioAnalyser {
  const bus = getMasterBus();
  const analyser = createAnalyser(opts);

  bus.connect(analyser.node);

  const originalDispose = analyser.dispose;
  analyser.dispose = () => {
    try {
      bus.disconnect(analyser.node);
    } catch (_) {}
    originalDispose();
  };

  return analyser;
}

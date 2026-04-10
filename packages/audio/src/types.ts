/** Standard oscillator waveform source with optional FM synthesis. */
export type OscillatorSource = {
  type: "sine" | "triangle" | "square" | "sawtooth";
  /** Fixed frequency in Hz, or a `{ start, end }` range for a pitch sweep. */
  frequency: number | { start: number; end: number };
  /** Detune in cents. */
  detune?: number;
  /** Frequency modulation: `ratio` is the modulator-to-carrier ratio, `depth` is the modulation index. */
  fm?: { ratio: number; depth: number };
};

/** Procedural noise source (white, pink, or brown). */
export type NoiseSource = {
  type: "noise";
  /** @defaultValue `"white"` */
  color?: "white" | "pink" | "brown";
};

/** Custom waveform built from a harmonic series via `createPeriodicWave`. */
export type WavetableSource = {
  type: "wavetable";
  /** Amplitude of each harmonic (index 0 = fundamental). */
  harmonics: number[];
  /** Fixed frequency in Hz, or a `{ start, end }` range for a pitch sweep. */
  frequency: number | { start: number; end: number };
};

/** Plays a pre-recorded audio sample from a URL or an existing `AudioBuffer`. */
export type SampleSource = {
  type: "sample";
  /** URL of the audio file to fetch and decode. Cached after first load. */
  url?: string;
  /** Pre-decoded buffer to use directly. */
  buffer?: AudioBuffer;
  /** Playback speed multiplier. @defaultValue `1` */
  playbackRate?: number;
  /** Detune in cents. */
  detune?: number;
  /** Whether the sample loops. */
  loop?: boolean;
  /** Loop region start in seconds. */
  loopStart?: number;
  /** Loop region end in seconds. */
  loopEnd?: number;
};

/** Live audio input from a `MediaStream` (e.g. microphone). Requires a real-time `AudioContext`. */
export type StreamSource = {
  type: "stream";
  stream: MediaStream;
};

/** DC offset source, useful for control signals and modulation. */
export type ConstantSource = {
  type: "constant";
  /** @defaultValue `1` */
  offset?: number;
};

/** Union of all audio source types that can drive a {@link Layer}. */
export type Source =
  | OscillatorSource
  | NoiseSource
  | WavetableSource
  | SampleSource
  | StreamSource
  | ConstantSource;

/** Biquad filter type identifiers matching the Web Audio API `BiquadFilterNode.type`. */
export type BiquadFilterType =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "notch"
  | "allpass"
  | "peaking"
  | "lowshelf"
  | "highshelf";

/** Time-varying envelope applied to a filter's cutoff frequency. */
export type FilterEnvelope = {
  /** Time in seconds to ramp from the base frequency to `peak`. @defaultValue `0` */
  attack?: number;
  /** Target frequency in Hz at the peak of the envelope. */
  peak: number;
  /** Time in seconds to decay from `peak` back to the base frequency. */
  decay: number;
};

/** Standard biquad filter with optional frequency envelope. */
export type BiquadFilter = {
  type: BiquadFilterType;
  /** Cutoff or center frequency in Hz. */
  frequency: number;
  /** Q factor (resonance). @defaultValue `1` */
  resonance?: number;
  /** Gain in dB (only applies to peaking / shelf types). */
  gain?: number;
  /** Optional frequency envelope that sweeps the cutoff over time. */
  envelope?: FilterEnvelope;
};

/** Arbitrary IIR filter defined by feedforward and feedback coefficients. */
export type IIRFilter = {
  type: "iir";
  feedforward: number[];
  feedback: number[];
};

/** Union of supported filter types. */
export type Filter = BiquadFilter | IIRFilter;

/**
 * Amplitude envelope (ADSR).
 *
 * Only `decay` is required. Omitting `attack` makes the sound start at full
 * volume; omitting `sustain` lets it fade to silence after the decay phase.
 */
export type Envelope = {
  /** Time in seconds to ramp from silence to peak volume. @defaultValue `0` */
  attack?: number;
  /** Time in seconds for the decay phase. */
  decay: number;
  /** Sustain level as a fraction of peak volume (0 – 1). @defaultValue `0` */
  sustain?: number;
  /** Time in seconds for the release phase after sustain. @defaultValue `0` */
  release?: number;
};

/** Parameter that an {@link LFO} can modulate. */
export type LFOTarget =
  | "frequency"
  | "detune"
  | "gain"
  | "pan"
  | "filter.frequency"
  | "filter.detune"
  | "filter.Q"
  | "filter.gain"
  | "playbackRate";

/** Low-frequency oscillator for periodic modulation of a target parameter. */
export type LFO = {
  /** Waveform shape of the modulator. */
  type: "sine" | "triangle" | "square" | "sawtooth";
  /** Modulation rate in Hz. */
  frequency: number;
  /** Modulation depth (units depend on the target parameter). */
  depth: number;
  /** Which parameter this LFO modulates. */
  target: LFOTarget;
};

/** 3D spatial panner configuration using the Web Audio `PannerNode`. */
export type Panner3D = {
  positionX: number;
  positionY: number;
  positionZ: number;
  orientationX?: number;
  orientationY?: number;
  orientationZ?: number;
  /** @defaultValue `"HRTF"` */
  panningModel?: "equalpower" | "HRTF";
  /** @defaultValue `"inverse"` */
  distanceModel?: "linear" | "inverse" | "exponential";
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
};

/** Position and orientation of the audio listener for 3D spatialization. */
export type Listener = {
  positionX: number;
  positionY: number;
  positionZ: number;
  forwardX?: number;
  forwardY?: number;
  forwardZ?: number;
  upX?: number;
  upY?: number;
  upZ?: number;
};

/** Algorithmic reverb generated from an exponentially-decaying noise impulse. */
export type ReverbEffect = {
  type: "reverb";
  /** Tail length in seconds. @defaultValue `0.5` */
  decay?: number;
  /** Delay in seconds before the reverb onset. @defaultValue `0` */
  preDelay?: number;
  /** High-frequency damping (0 – 1). @defaultValue `0` */
  damping?: number;
  /** Multiplier on the decay length. @defaultValue `1` */
  roomSize?: number;
  /** Dry/wet mix (0 = fully dry, 1 = fully wet). @defaultValue `0.3` */
  mix?: number;
};

/** Convolution reverb using a provided impulse response buffer or URL. */
export type ConvolverEffect = {
  type: "convolver";
  /** URL of the impulse response audio file. */
  url?: string;
  /** Pre-decoded impulse response buffer. */
  buffer?: AudioBuffer;
  /** @defaultValue `0.5` */
  mix?: number;
};

/** Feedback delay with optional filter in the feedback path. */
export type DelayEffect = {
  type: "delay";
  /** Delay time in seconds. @defaultValue `0.25` */
  time?: number;
  /** Feedback gain (0 – 1). @defaultValue `0.3` */
  feedback?: number;
  /** Optional filter applied in the feedback loop. */
  feedbackFilter?: { type: BiquadFilterType; frequency: number; Q?: number };
  /** @defaultValue `0.3` */
  mix?: number;
};

/** Waveshaper-based distortion using a `tanh` transfer curve. */
export type DistortionEffect = {
  type: "distortion";
  /** Drive amount (higher = more distortion). @defaultValue `50` */
  amount?: number;
  /** @defaultValue `0.5` */
  mix?: number;
};

/** Stereo chorus using two LFO-modulated delay lines. */
export type ChorusEffect = {
  type: "chorus";
  /** LFO rate in Hz. @defaultValue `1.5` */
  rate?: number;
  /** LFO depth in seconds. @defaultValue `0.003` */
  depth?: number;
  /** @defaultValue `0.3` */
  mix?: number;
};

/** Flanging effect via a short LFO-modulated delay with feedback. */
export type FlangerEffect = {
  type: "flanger";
  /** LFO rate in Hz. @defaultValue `0.5` */
  rate?: number;
  /** LFO depth in seconds. @defaultValue `0.002` */
  depth?: number;
  /** Feedback gain (0 – 1). @defaultValue `0.5` */
  feedback?: number;
  /** @defaultValue `0.5` */
  mix?: number;
};

/** Multi-stage allpass phaser with LFO sweep. */
export type PhaserEffect = {
  type: "phaser";
  /** LFO rate in Hz. @defaultValue `0.5` */
  rate?: number;
  /** LFO depth in Hz. @defaultValue `1000` */
  depth?: number;
  /** Number of allpass stages. @defaultValue `4` */
  stages?: number;
  /** Feedback gain (0 – 1). @defaultValue `0.5` */
  feedback?: number;
  /** @defaultValue `0.5` */
  mix?: number;
};

/** Amplitude modulation (volume tremolo). */
export type TremoloEffect = {
  type: "tremolo";
  /** LFO rate in Hz. @defaultValue `4` */
  rate?: number;
  /** Modulation depth (0 – 1). @defaultValue `0.5` */
  depth?: number;
};

/** Pitch vibrato via a short modulated delay line. */
export type VibratoEffect = {
  type: "vibrato";
  /** LFO rate in Hz. @defaultValue `5` */
  rate?: number;
  /** LFO depth in seconds. @defaultValue `0.002` */
  depth?: number;
};

/** Bit-depth reduction and optional sample-rate decimation. */
export type BitcrusherEffect = {
  type: "bitcrusher";
  /** Bit depth. @defaultValue `8` */
  bits?: number;
  /** Sample rate reduction factor. @defaultValue `1` */
  sampleRateReduction?: number;
  /** @defaultValue `1` */
  mix?: number;
};

/** Dynamics compressor wrapping the native `DynamicsCompressorNode`. */
export type CompressorEffect = {
  type: "compressor";
  /** Threshold in dB. @defaultValue `-24` */
  threshold?: number;
  /** Knee width in dB. @defaultValue `30` */
  knee?: number;
  /** Compression ratio. @defaultValue `4` */
  ratio?: number;
  /** Attack time in seconds. @defaultValue `0.003` */
  attack?: number;
  /** Release time in seconds. @defaultValue `0.25` */
  release?: number;
};

/** A single band in a parametric EQ. */
export type EQBand = {
  type: "lowshelf" | "highshelf" | "peaking";
  /** Center or corner frequency in Hz. */
  frequency: number;
  /** Gain in dB. */
  gain: number;
  /** Q factor. @defaultValue `1` */
  Q?: number;
};

/** Multi-band parametric equalizer built from chained `BiquadFilterNode`s. */
export type EQEffect = {
  type: "eq";
  bands: EQBand[];
};

/** Simple gain stage. */
export type GainEffect = {
  type: "gain";
  /** Linear gain value. */
  value: number;
};

/** Stereo panner effect. */
export type StereoPanEffect = {
  type: "pan";
  /** Pan position from -1 (full left) to 1 (full right). */
  value: number;
};

/** Union of all effect types that can be applied to a {@link Layer} or globally. */
export type Effect =
  | ReverbEffect
  | ConvolverEffect
  | DelayEffect
  | DistortionEffect
  | ChorusEffect
  | FlangerEffect
  | PhaserEffect
  | TremoloEffect
  | VibratoEffect
  | BitcrusherEffect
  | CompressorEffect
  | EQEffect
  | GainEffect
  | StereoPanEffect;

/**
 * A single audio layer combining a source, envelope, filter chain, effects,
 * LFO modulation, and spatial positioning.
 */
export type Layer = {
  /** The audio source that generates the signal. */
  source: Source;
  /** One or more filters applied before the envelope. */
  filter?: Filter | Filter[];
  /** Amplitude envelope (ADSR). Defaults to a short 0.5 s fade if omitted. */
  envelope?: Envelope;
  /** Output gain (0 – 1). @defaultValue `0.5` */
  gain?: number;
  /** Stereo pan (-1 left, 0 center, 1 right). */
  pan?: number;
  /** 3D spatialization config. Mutually exclusive with `pan`. */
  panner?: Panner3D;
  /** Start delay in seconds relative to the sound's trigger time. */
  delay?: number;
  /** One or more LFOs for periodic modulation. */
  lfo?: LFO | LFO[];
  /** Per-layer effects chain applied after the envelope. */
  effects?: Effect[];
};

/** A sound built from multiple parallel {@link Layer}s with an optional global effects chain. */
export type MultiLayerSound = {
  layers: Layer[];
  /** Effects applied to the summed output of all layers. */
  effects?: Effect[];
};

/**
 * Top-level sound definition: either a single {@link Layer} or a
 * {@link MultiLayerSound} with multiple layers.
 */
export type SoundDefinition = Layer | MultiLayerSound;

/** Handle returned by the engine for stopping an in-flight voice. */
export type VoiceHandle = {
  /**
   * Stops the voice with an optional fade-out.
   *
   * @param releaseTime - Fade-out duration in seconds. @defaultValue `0.015`
   */
  stop: (releaseTime?: number) => void;
};

/** Runtime overrides passed when triggering a sound. */
export type PlayOptions = {
  /** Volume multiplier (0 – 1). */
  volume?: number;
  /** Stereo pan override (-1 left, 0 center, 1 right). */
  pan?: number;
  /** Detune in cents, added to the source's existing detune. */
  detune?: number;
  /** Playback rate multiplier. */
  playbackRate?: number;
  /** Velocity sensitivity (0 – 1). Scales gain and can dim filter cutoffs. */
  velocity?: number;
};

/** A single step in a {@link playSequence} timeline. */
export type SequenceStep = {
  /** A sound definition to render, or a pre-bound play function. */
  sound: SoundDefinition | ((opts?: PlayOptions) => VoiceHandle | undefined);
  /** Absolute time in seconds within the sequence. */
  at?: number;
  /** Relative offset in seconds from the previous step. */
  wait?: number;
  /** Per-step volume override. */
  volume?: number;
};

/** Options for sequence playback. */
export type SequenceOptions = {
  /** Whether the sequence loops indefinitely. */
  loop?: boolean;
  /** Total loop duration in seconds (used when `loop` is true). */
  duration?: number;
};

/** JSON-serializable patch containing named sound definitions. */
export type SoundPatch = {
  /** Optional JSON Schema reference for validation. */
  $schema?: string;
  /** Display name of the patch. */
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  /** Map of sound names to their definitions. */
  sounds: Record<string, SoundDefinition>;
};

/** Configuration for creating an {@link AudioAnalyser}. */
export type AnalyserOptions = {
  /** FFT window size (must be a power of 2). @defaultValue `2048` */
  fftSize?: number;
  /** Smoothing between consecutive frames (0 – 1). @defaultValue `0.8` */
  smoothingTimeConstant?: number;
  /** Minimum dB range for frequency data. */
  minDecibels?: number;
  /** Maximum dB range for frequency data. */
  maxDecibels?: number;
};

/** Options for offline (non-realtime) audio rendering. */
export type OfflineRenderOptions = {
  /** Total render duration in seconds. */
  duration: number;
  /** Sample rate in Hz. @defaultValue `44100` */
  sampleRate?: number;
  /** Number of output channels. @defaultValue `2` */
  numberOfChannels?: number;
};

/** A connectable effect node with an input, output, and optional cleanup. */
export type EffectNode = {
  input: AudioNode;
  output: AudioNode;
  /** Stops any internal oscillators / resources. */
  dispose?: () => void;
};

/** Options passed when creating the shared `AudioContext`. */
export type ContextOptions = {
  /** Hint for the desired audio latency category. */
  latencyHint?: AudioContextLatencyCategory;
  /** Desired sample rate in Hz. */
  sampleRate?: number;
};

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type OscillatorSource = {
  type: "sine" | "triangle" | "square" | "sawtooth";
  frequency: number | { start: number; end: number };
  detune?: number;
  fm?: { ratio: number; depth: number };
};

export type NoiseSource = {
  type: "noise";
  color?: "white" | "pink" | "brown";
};

export type WavetableSource = {
  type: "wavetable";
  harmonics: number[];
  frequency: number | { start: number; end: number };
};

export type SampleSource = {
  type: "sample";
  url?: string;
  buffer?: AudioBuffer;
  playbackRate?: number;
  detune?: number;
  loop?: boolean;
  loopStart?: number;
  loopEnd?: number;
};

export type StreamSource = {
  type: "stream";
  stream: MediaStream;
};

export type ConstantSource = {
  type: "constant";
  offset?: number;
};

export type Source =
  | OscillatorSource
  | NoiseSource
  | WavetableSource
  | SampleSource
  | StreamSource
  | ConstantSource;

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

export type BiquadFilterType =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "notch"
  | "allpass"
  | "peaking"
  | "lowshelf"
  | "highshelf";

export type FilterEnvelope = {
  attack?: number;
  peak: number;
  decay: number;
};

export type BiquadFilter = {
  type: BiquadFilterType;
  frequency: number;
  resonance?: number;
  gain?: number;
  envelope?: FilterEnvelope;
};

export type IIRFilter = {
  type: "iir";
  feedforward: number[];
  feedback: number[];
};

export type Filter = BiquadFilter | IIRFilter;

// ---------------------------------------------------------------------------
// Envelope (amplitude ADSR)
// ---------------------------------------------------------------------------

export type Envelope = {
  attack?: number;
  decay: number;
  sustain?: number;
  release?: number;
};

// ---------------------------------------------------------------------------
// LFO (modulation)
// ---------------------------------------------------------------------------

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

export type LFO = {
  type: "sine" | "triangle" | "square" | "sawtooth";
  frequency: number;
  depth: number;
  target: LFOTarget;
};

// ---------------------------------------------------------------------------
// 3D Spatial Audio
// ---------------------------------------------------------------------------

export type Panner3D = {
  positionX: number;
  positionY: number;
  positionZ: number;
  orientationX?: number;
  orientationY?: number;
  orientationZ?: number;
  panningModel?: "equalpower" | "HRTF";
  distanceModel?: "linear" | "inverse" | "exponential";
  maxDistance?: number;
  refDistance?: number;
  rolloffFactor?: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
};

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

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

export type ReverbEffect = {
  type: "reverb";
  decay?: number;
  preDelay?: number;
  damping?: number;
  roomSize?: number;
  mix?: number;
};

export type ConvolverEffect = {
  type: "convolver";
  url?: string;
  buffer?: AudioBuffer;
  mix?: number;
};

export type DelayEffect = {
  type: "delay";
  time?: number;
  feedback?: number;
  feedbackFilter?: { type: BiquadFilterType; frequency: number; Q?: number };
  mix?: number;
};

export type DistortionEffect = {
  type: "distortion";
  amount?: number;
  mix?: number;
};

export type ChorusEffect = {
  type: "chorus";
  rate?: number;
  depth?: number;
  mix?: number;
};

export type FlangerEffect = {
  type: "flanger";
  rate?: number;
  depth?: number;
  feedback?: number;
  mix?: number;
};

export type PhaserEffect = {
  type: "phaser";
  rate?: number;
  depth?: number;
  stages?: number;
  feedback?: number;
  mix?: number;
};

export type TremoloEffect = {
  type: "tremolo";
  rate?: number;
  depth?: number;
};

export type VibratoEffect = {
  type: "vibrato";
  rate?: number;
  depth?: number;
};

export type BitcrusherEffect = {
  type: "bitcrusher";
  bits?: number;
  sampleRateReduction?: number;
  mix?: number;
};

export type CompressorEffect = {
  type: "compressor";
  threshold?: number;
  knee?: number;
  ratio?: number;
  attack?: number;
  release?: number;
};

export type EQBand = {
  type: "lowshelf" | "highshelf" | "peaking";
  frequency: number;
  gain: number;
  Q?: number;
};

export type EQEffect = {
  type: "eq";
  bands: EQBand[];
};

export type GainEffect = {
  type: "gain";
  value: number;
};

export type StereoPanEffect = {
  type: "pan";
  value: number;
};

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

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export type Layer = {
  source: Source;
  filter?: Filter | Filter[];
  envelope?: Envelope;
  gain?: number;
  pan?: number;
  panner?: Panner3D;
  delay?: number;
  lfo?: LFO | LFO[];
  effects?: Effect[];
};

// ---------------------------------------------------------------------------
// Sound definition
// ---------------------------------------------------------------------------

export type MultiLayerSound = {
  layers: Layer[];
  effects?: Effect[];
};

export type SoundDefinition = Layer | MultiLayerSound;

// ---------------------------------------------------------------------------
// Voice handle (returned by render for stopping sounds mid-flight)
// ---------------------------------------------------------------------------

export type VoiceHandle = {
  stop: (releaseTime?: number) => void;
};

// ---------------------------------------------------------------------------
// Play options (runtime overrides)
// ---------------------------------------------------------------------------

export type PlayOptions = {
  volume?: number;
  pan?: number;
  detune?: number;
  playbackRate?: number;
  velocity?: number;
};

// ---------------------------------------------------------------------------
// Sequence
// ---------------------------------------------------------------------------

export type SequenceStep = {
  sound: SoundDefinition | ((opts?: PlayOptions) => VoiceHandle | undefined);
  at?: number;
  wait?: number;
  volume?: number;
};

export type SequenceOptions = {
  loop?: boolean;
  duration?: number;
};

// ---------------------------------------------------------------------------
// Patches
// ---------------------------------------------------------------------------

export type SoundPatch = {
  $schema?: string;
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  sounds: Record<string, SoundDefinition>;
};

// ---------------------------------------------------------------------------
// Analyser
// ---------------------------------------------------------------------------

export type AnalyserOptions = {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
};

// ---------------------------------------------------------------------------
// Offline rendering
// ---------------------------------------------------------------------------

export type OfflineRenderOptions = {
  duration: number;
  sampleRate?: number;
  numberOfChannels?: number;
};

// ---------------------------------------------------------------------------
// Effect node interface (used by effects.ts)
// ---------------------------------------------------------------------------

export type EffectNode = {
  input: AudioNode;
  output: AudioNode;
  dispose?: () => void;
};

// ---------------------------------------------------------------------------
// Context options
// ---------------------------------------------------------------------------

export type ContextOptions = {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
};

import { createEffect } from "./effects";
import type {
  BiquadFilter,
  ConstantSource,
  Effect,
  Envelope,
  Filter,
  IIRFilter,
  Layer,
  LFO,
  MultiLayerSound,
  NoiseSource,
  OscillatorSource,
  Panner3D,
  PlayOptions,
  SampleSource,
  SoundDefinition,
  StreamSource,
  VoiceHandle,
  WavetableSource,
} from "./types";

const SILENCE = 0.0001;

function isMultiLayer(def: SoundDefinition): def is MultiLayerSound {
  return "layers" in def;
}

function normalize(def: SoundDefinition): MultiLayerSound {
  if (isMultiLayer(def)) return def;
  return { layers: [def], effects: [] };
}

function generateWhiteNoise(data: Float32Array) {
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
}

function generatePinkNoise(data: Float32Array) {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

function generateBrownNoise(data: Float32Array) {
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
}

function createNoiseBuffer(
  ctx: BaseAudioContext,
  color: "white" | "pink" | "brown",
  duration: number,
): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  switch (color) {
    case "pink":
      generatePinkNoise(data);
      break;
    case "brown":
      generateBrownNoise(data);
      break;
    default:
      generateWhiteNoise(data);
      break;
  }

  return buffer;
}

const sampleCache = new Map<string, AudioBuffer>();

async function loadSample(
  ctx: BaseAudioContext,
  url: string,
): Promise<AudioBuffer> {
  const cached = sampleCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  const data = await response.arrayBuffer();
  const decoded = await ctx.decodeAudioData(data);
  sampleCache.set(url, decoded);
  return decoded;
}

type SourceResult = {
  node: AudioNode;
  scheduled?: AudioScheduledSourceNode;
  frequencyParam?: AudioParam;
  detuneParam?: AudioParam;
  playbackRateParam?: AudioParam;
};

function buildOscillatorSource(
  ctx: BaseAudioContext,
  src: OscillatorSource,
  t: number,
  duration: number,
): SourceResult {
  const osc = ctx.createOscillator();
  osc.type = src.type;

  if (typeof src.frequency === "number") {
    osc.frequency.setValueAtTime(src.frequency, t);
  } else {
    osc.frequency.setValueAtTime(src.frequency.start, t);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(src.frequency.end, 1),
      t + duration,
    );
  }

  if (src.detune) {
    osc.detune.value = src.detune;
  }

  osc.start(t);
  osc.stop(t + duration + 0.1);

  let fmMod: OscillatorNode | undefined;
  if (src.fm) {
    const carrierFreq =
      typeof src.frequency === "number" ? src.frequency : src.frequency.start;

    fmMod = ctx.createOscillator();
    fmMod.type = "sine";
    fmMod.frequency.value = carrierFreq * src.fm.ratio;

    const modGain = ctx.createGain();
    modGain.gain.value = src.fm.depth;

    fmMod.connect(modGain);
    modGain.connect(osc.frequency);
    fmMod.start(t);
    fmMod.stop(t + duration + 0.1);
  }

  return {
    node: osc,
    scheduled: osc,
    frequencyParam: osc.frequency,
    detuneParam: osc.detune,
  };
}

function buildNoiseSource(
  ctx: BaseAudioContext,
  src: NoiseSource,
  t: number,
  duration: number,
): SourceResult {
  const color = src.color ?? "white";
  const buffer = createNoiseBuffer(ctx, color, duration + 0.1);
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.start(t);
  node.stop(t + duration + 0.1);
  return { node, scheduled: node };
}

function buildWavetableSource(
  ctx: BaseAudioContext,
  src: WavetableSource,
  t: number,
  duration: number,
): SourceResult {
  const real = new Float32Array(src.harmonics.length + 1);
  const imag = new Float32Array(src.harmonics.length + 1);

  real[0] = 0;
  imag[0] = 0;
  for (let i = 0; i < src.harmonics.length; i++) {
    real[i + 1] = 0;
    imag[i + 1] = src.harmonics[i];
  }

  const wave = ctx.createPeriodicWave(real, imag, {
    disableNormalization: false,
  });

  const osc = ctx.createOscillator();
  osc.setPeriodicWave(wave);

  if (typeof src.frequency === "number") {
    osc.frequency.setValueAtTime(src.frequency, t);
  } else {
    osc.frequency.setValueAtTime(src.frequency.start, t);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(src.frequency.end, 1),
      t + duration,
    );
  }

  osc.start(t);
  osc.stop(t + duration + 0.1);

  return {
    node: osc,
    scheduled: osc,
    frequencyParam: osc.frequency,
    detuneParam: osc.detune,
  };
}

function buildSampleSource(
  ctx: BaseAudioContext,
  src: SampleSource,
  t: number,
): SourceResult {
  const node = ctx.createBufferSource();

  if (src.playbackRate !== undefined) {
    node.playbackRate.value = src.playbackRate;
  }
  if (src.detune !== undefined) {
    node.detune.value = src.detune;
  }
  if (src.loop) {
    node.loop = true;
    if (src.loopStart !== undefined) node.loopStart = src.loopStart;
    if (src.loopEnd !== undefined) node.loopEnd = src.loopEnd;
  }

  if (src.buffer) {
    node.buffer = src.buffer;
    node.start(t);
  } else if (src.url) {
    loadSample(ctx, src.url).then((buf) => {
      node.buffer = buf;
      node.start(Math.max(t, ctx.currentTime));
    });
  }

  return {
    node,
    scheduled: node,
    detuneParam: node.detune,
    playbackRateParam: node.playbackRate,
  };
}

function buildStreamSource(ctx: AudioContext, src: StreamSource): SourceResult {
  const node = ctx.createMediaStreamSource(src.stream);
  return { node };
}

function buildConstantSource(
  ctx: BaseAudioContext,
  src: ConstantSource,
  t: number,
  duration: number,
): SourceResult {
  const node = ctx.createConstantSource();
  node.offset.value = src.offset ?? 1;
  node.start(t);
  node.stop(t + duration + 0.1);
  return { node, scheduled: node };
}

function buildSource(
  ctx: BaseAudioContext,
  src: Layer["source"],
  t: number,
  duration: number,
): SourceResult {
  switch (src.type) {
    case "sine":
    case "triangle":
    case "square":
    case "sawtooth":
      return buildOscillatorSource(ctx, src, t, duration);
    case "noise":
      return buildNoiseSource(ctx, src, t, duration);
    case "wavetable":
      return buildWavetableSource(ctx, src, t, duration);
    case "sample":
      return buildSampleSource(ctx, src, t);
    case "stream":
      return buildStreamSource(ctx as AudioContext, src);
    case "constant":
      return buildConstantSource(ctx, src, t, duration);
  }
}

function buildBiquadFilter(
  ctx: BaseAudioContext,
  filter: BiquadFilter,
  t: number,
): { node: BiquadFilterNode; frequencyParam: AudioParam } {
  const node = ctx.createBiquadFilter();
  node.type = filter.type;
  node.frequency.setValueAtTime(filter.frequency, t);
  node.Q.value = filter.resonance ?? 1;

  if (filter.gain !== undefined) {
    node.gain.value = filter.gain;
  }

  if (filter.envelope) {
    const env = filter.envelope;
    const attackEnd = t + (env.attack ?? 0);

    node.frequency.setValueAtTime(filter.frequency, t);
    node.frequency.linearRampToValueAtTime(env.peak, attackEnd);
    node.frequency.exponentialRampToValueAtTime(
      Math.max(filter.frequency, 1),
      attackEnd + env.decay,
    );
  }

  return { node, frequencyParam: node.frequency };
}

function buildIIRFilter(
  ctx: BaseAudioContext,
  filter: IIRFilter,
): { node: IIRFilterNode } {
  const node = ctx.createIIRFilter(filter.feedforward, filter.feedback);
  return { node };
}

type FilterResult = {
  node: AudioNode;
  frequencyParam?: AudioParam;
  detuneParam?: AudioParam;
  QParam?: AudioParam;
  gainParam?: AudioParam;
};

function buildSingleFilter(
  ctx: BaseAudioContext,
  filter: Filter,
  t: number,
): FilterResult {
  if (filter.type === "iir") {
    const { node } = buildIIRFilter(ctx, filter);
    return { node };
  }

  const { node, frequencyParam } = buildBiquadFilter(ctx, filter, t);
  return {
    node,
    frequencyParam,
    detuneParam: node.detune,
    QParam: node.Q,
    gainParam: node.gain,
  };
}

function buildFilters(
  ctx: BaseAudioContext,
  filters: Filter | Filter[],
  t: number,
): FilterResult[] {
  const arr = Array.isArray(filters) ? filters : [filters];
  return arr.map((f) => buildSingleFilter(ctx, f, t));
}

function _getLayerDuration(envelope?: Envelope): number {
  if (!envelope) return 0.5;
  const attack = envelope.attack ?? 0;
  const decay = envelope.decay;
  const release = envelope.release ?? 0;
  return attack + decay + release;
}

function buildEnvelope(
  ctx: BaseAudioContext,
  envelope: Envelope | undefined,
  gain: number,
  t: number,
): { node: GainNode; duration: number } {
  const node = ctx.createGain();

  if (!envelope) {
    node.gain.setValueAtTime(gain, t);
    node.gain.setTargetAtTime(SILENCE, t, 0.15);
    return { node, duration: 0.5 };
  }

  const attack = envelope.attack ?? 0;
  const decay = envelope.decay;
  const sustain = envelope.sustain ?? 0;
  const release = envelope.release ?? 0;
  const sustainLevel = Math.max(sustain * gain, SILENCE);
  const decayTC = decay / 3;

  node.gain.setValueAtTime(SILENCE, t);

  if (attack > 0) {
    node.gain.linearRampToValueAtTime(gain, t + attack);
  } else {
    node.gain.setValueAtTime(gain, t);
  }

  if (sustain > 0) {
    node.gain.setTargetAtTime(sustainLevel, t + attack, decayTC);
    if (release > 0) {
      const releaseTC = release / 3;
      node.gain.setTargetAtTime(SILENCE, t + attack + decay, releaseTC);
    }
  } else {
    node.gain.setTargetAtTime(SILENCE, t + attack, decayTC);
  }

  return { node, duration: attack + decay + release };
}

function buildLFO(
  ctx: BaseAudioContext,
  lfo: LFO,
  t: number,
  duration: number,
  targets: {
    source: SourceResult;
    filters: FilterResult[];
    envNode: GainNode;
    panner?: StereoPannerNode;
  },
): OscillatorNode | null {
  const osc = ctx.createOscillator();
  osc.type = lfo.type;
  osc.frequency.value = lfo.frequency;

  const gain = ctx.createGain();
  gain.gain.value = lfo.depth;
  osc.connect(gain);

  let target: AudioParam | null = null;

  switch (lfo.target) {
    case "frequency":
      target = targets.source.frequencyParam ?? null;
      break;
    case "detune":
      target = targets.source.detuneParam ?? null;
      break;
    case "gain":
      target = targets.envNode.gain;
      break;
    case "pan":
      target = targets.panner?.pan ?? null;
      break;
    case "playbackRate":
      target = targets.source.playbackRateParam ?? null;
      break;
    case "filter.frequency":
      target = targets.filters[0]?.frequencyParam ?? null;
      break;
    case "filter.detune":
      target = targets.filters[0]?.detuneParam ?? null;
      break;
    case "filter.Q":
      target = targets.filters[0]?.QParam ?? null;
      break;
    case "filter.gain":
      target = targets.filters[0]?.gainParam ?? null;
      break;
  }

  if (target) {
    gain.connect(target);
    osc.start(t);
    osc.stop(t + duration + 0.1);
    return osc;
  }
  return null;
}

function buildPanner3D(ctx: BaseAudioContext, config: Panner3D): PannerNode {
  const panner = ctx.createPanner();
  panner.panningModel = config.panningModel ?? "HRTF";
  panner.distanceModel = config.distanceModel ?? "inverse";

  panner.positionX.value = config.positionX;
  panner.positionY.value = config.positionY;
  panner.positionZ.value = config.positionZ;

  if (config.orientationX !== undefined)
    panner.orientationX.value = config.orientationX;
  if (config.orientationY !== undefined)
    panner.orientationY.value = config.orientationY;
  if (config.orientationZ !== undefined)
    panner.orientationZ.value = config.orientationZ;

  if (config.maxDistance !== undefined) panner.maxDistance = config.maxDistance;
  if (config.refDistance !== undefined) panner.refDistance = config.refDistance;
  if (config.rolloffFactor !== undefined)
    panner.rolloffFactor = config.rolloffFactor;
  if (config.coneInnerAngle !== undefined)
    panner.coneInnerAngle = config.coneInnerAngle;
  if (config.coneOuterAngle !== undefined)
    panner.coneOuterAngle = config.coneOuterAngle;
  if (config.coneOuterGain !== undefined)
    panner.coneOuterGain = config.coneOuterGain;

  return panner;
}

function buildEffectsChain(
  ctx: BaseAudioContext,
  effects: Effect[],
  destination: AudioNode,
): { input: AudioNode; output: AudioNode; dispose: () => void } {
  if (effects.length === 0) {
    return { input: destination, output: destination, dispose() {} };
  }

  const nodes = effects.map((e) => createEffect(ctx, e));

  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].output.connect(nodes[i + 1].input);
  }

  nodes[nodes.length - 1].output.connect(destination);

  return {
    input: nodes[0].input,
    output: nodes[nodes.length - 1].output,
    dispose() {
      for (const n of nodes) n.dispose?.();
    },
  };
}

/**
 * Renders a {@link SoundDefinition} into the Web Audio graph and starts playback.
 *
 * Builds sources, filters, envelopes, LFOs, panners, and effects for every
 * layer, connects them to `destination`, and returns a {@link VoiceHandle}
 * that can stop the sound mid-flight.
 *
 * @param ctx - The `BaseAudioContext` to build nodes in
 * @param definition - A single-layer or multi-layer sound definition
 * @param opts - Runtime overrides (volume, pan, detune, velocity, etc.)
 * @param baseTime - Scheduled start time in seconds (`ctx.currentTime` if omitted)
 * @param destination - Target node to connect to (`ctx.destination` if omitted)
 * @returns A handle with a `stop()` method for cancelling the voice
 */
export function render(
  ctx: BaseAudioContext,
  definition: SoundDefinition,
  opts?: PlayOptions,
  baseTime?: number,
  destination?: AudioNode,
): VoiceHandle {
  const { layers, effects } = normalize(definition);
  const dest = destination ?? ctx.destination;
  const chain = buildEffectsChain(ctx, effects ?? [], dest);
  const t0 = baseTime ?? ctx.currentTime;
  const velocity = opts?.velocity ?? 1;

  const allDisposers: (() => void)[] = [chain.dispose];
  const allSourceNodes: AudioScheduledSourceNode[] = [];
  const allEnvNodes: GainNode[] = [];

  for (const layer of layers) {
    const layerStart = t0 + (layer.delay ?? 0);
    const baseGain = (layer.gain ?? 0.5) * (opts?.volume ?? 1) * velocity;

    const { node: envNode, duration: envDuration } = buildEnvelope(
      ctx,
      layer.envelope,
      baseGain,
      layerStart,
    );
    allEnvNodes.push(envNode);

    const sourceResult = buildSource(
      ctx,
      layer.source,
      layerStart,
      envDuration,
    );

    if (opts?.detune && sourceResult.detuneParam) {
      sourceResult.detuneParam.value += opts.detune;
    }
    if (opts?.playbackRate && sourceResult.playbackRateParam) {
      sourceResult.playbackRateParam.value *= opts.playbackRate;
    }

    let tail: AudioNode = sourceResult.node;

    const filterResults: FilterResult[] = [];
    if (layer.filter) {
      const builtFilters = buildFilters(ctx, layer.filter, layerStart);
      for (const f of builtFilters) {
        tail.connect(f.node);
        tail = f.node;
        filterResults.push(f);
        if (velocity < 1 && f.frequencyParam) {
          const baseFreq = f.frequencyParam.value;
          f.frequencyParam.setValueAtTime(
            baseFreq * (0.5 + 0.5 * velocity),
            layerStart,
          );
        }
      }
    }

    tail.connect(envNode);

    let cursor: AudioNode = envNode;
    const layerDisposers: (() => void)[] = [];

    if (layer.effects && layer.effects.length > 0) {
      const layerFxNodes = layer.effects.map((e) => createEffect(ctx, e));
      for (let i = 0; i < layerFxNodes.length - 1; i++) {
        layerFxNodes[i].output.connect(layerFxNodes[i + 1].input);
      }
      cursor.connect(layerFxNodes[0].input);
      cursor = layerFxNodes[layerFxNodes.length - 1].output;
      for (const n of layerFxNodes) {
        if (n.dispose) layerDisposers.push(n.dispose);
      }
    }

    let stereoPanner: StereoPannerNode | undefined;
    const effectivePan = opts?.pan ?? layer.pan;

    if (layer.panner) {
      const panner3d = buildPanner3D(ctx, layer.panner);
      cursor.connect(panner3d);
      cursor = panner3d;
    } else if (effectivePan !== undefined && effectivePan !== 0) {
      stereoPanner = ctx.createStereoPanner();
      stereoPanner.pan.value = effectivePan;
      cursor.connect(stereoPanner);
      cursor = stereoPanner;
    }

    cursor.connect(chain.input);

    if (layer.lfo) {
      const lfos = Array.isArray(layer.lfo) ? layer.lfo : [layer.lfo];
      for (const l of lfos) {
        buildLFO(ctx, l, layerStart, envDuration, {
          source: sourceResult,
          filters: filterResults,
          envNode,
          panner: stereoPanner,
        });
      }
    }

    if (sourceResult.scheduled) {
      allSourceNodes.push(sourceResult.scheduled);
      const nodesToDisconnect = [
        sourceResult.node,
        envNode,
        ...filterResults.map((f) => f.node),
        ...(stereoPanner ? [stereoPanner] : []),
      ];
      sourceResult.scheduled.onended = () => {
        for (const n of nodesToDisconnect) {
          try {
            n.disconnect();
          } catch (_) {}
        }
        for (const d of layerDisposers) d();
      };
    }

    allDisposers.push(...layerDisposers);
  }

  return {
    stop(releaseTime?: number) {
      const now = ctx.currentTime;
      const fade = releaseTime ?? 0.015;
      for (const env of allEnvNodes) {
        env.gain.cancelScheduledValues(now);
        env.gain.setValueAtTime(env.gain.value, now);
        env.gain.setTargetAtTime(SILENCE, now, fade / 3);
      }
      for (const src of allSourceNodes) {
        try {
          src.stop(now + fade + 0.05);
        } catch (_) {}
      }
    },
  };
}

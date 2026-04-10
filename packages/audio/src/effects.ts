import type {
  BitcrusherEffect,
  ChorusEffect,
  CompressorEffect,
  ConvolverEffect,
  DelayEffect,
  DistortionEffect,
  Effect,
  EffectNode,
  EQEffect,
  FlangerEffect,
  GainEffect,
  PhaserEffect,
  ReverbEffect,
  StereoPanEffect,
  TremoloEffect,
  VibratoEffect,
} from "./types";

// ---------------------------------------------------------------------------
// Wet / dry mix helper
// ---------------------------------------------------------------------------

function withMix(
  ctx: BaseAudioContext,
  mix: number,
  create: (
    input: GainNode,
    output: GainNode,
  ) => { dispose?: () => void } | undefined | void,
): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();

  const dry = ctx.createGain();
  dry.gain.value = 1 - mix;
  input.connect(dry);
  dry.connect(output);

  const wet = ctx.createGain();
  wet.gain.value = mix;
  input.connect(wet);

  const wetOut = ctx.createGain();
  wetOut.connect(output);

  const result = create(wet, wetOut);

  return { input, output, dispose: result?.dispose };
}

// ---------------------------------------------------------------------------
// Reverb — algorithmic impulse response with damping, preDelay, roomSize
// ---------------------------------------------------------------------------

export function createReverb(
  ctx: BaseAudioContext,
  opts: ReverbEffect,
): EffectNode {
  const decay = opts.decay ?? 0.5;
  const mix = opts.mix ?? 0.3;
  const preDelay = opts.preDelay ?? 0;
  const damping = opts.damping ?? 0;
  const roomSize = opts.roomSize ?? 1;

  return withMix(ctx, mix, (wet, wetOut) => {
    const sampleRate = ctx.sampleRate;
    const effectiveDecay = decay * roomSize;
    const length = Math.ceil(sampleRate * effectiveDecay);
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.28));
      }
    }

    if (damping > 0) {
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        const coeff = Math.min(damping, 0.99);
        let prev = 0;
        for (let i = 0; i < length; i++) {
          prev = data[i] * (1 - coeff) + prev * coeff;
          data[i] = prev;
        }
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = buffer;

    if (preDelay > 0) {
      const preDelayNode = ctx.createDelay(Math.max(preDelay + 0.01, 1));
      preDelayNode.delayTime.value = preDelay;
      wet.connect(preDelayNode);
      preDelayNode.connect(convolver);
    } else {
      wet.connect(convolver);
    }
    convolver.connect(wetOut);
  });
}

// ---------------------------------------------------------------------------
// Convolver — user-supplied impulse response
// ---------------------------------------------------------------------------

const irCache = new Map<string, AudioBuffer>();

export function createConvolver(
  ctx: BaseAudioContext,
  opts: ConvolverEffect,
): EffectNode {
  const mix = opts.mix ?? 0.5;

  return withMix(ctx, mix, (wet, wetOut) => {
    const convolver = ctx.createConvolver();

    if (opts.buffer) {
      convolver.buffer = opts.buffer;
    } else if (opts.url) {
      const cached = irCache.get(opts.url);
      if (cached) {
        convolver.buffer = cached;
      } else {
        const url = opts.url;
        fetch(url)
          .then((res) => res.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .then((decoded) => {
            irCache.set(url, decoded);
            convolver.buffer = decoded;
          });
      }
    }

    wet.connect(convolver);
    convolver.connect(wetOut);
  });
}

// ---------------------------------------------------------------------------
// Delay — feedback delay line with optional feedback filter
// ---------------------------------------------------------------------------

export function createDelay(
  ctx: BaseAudioContext,
  opts: DelayEffect,
): EffectNode {
  const time = opts.time ?? 0.25;
  const feedback = opts.feedback ?? 0.3;
  const mix = opts.mix ?? 0.3;

  return withMix(ctx, mix, (wet, wetOut) => {
    const delay = ctx.createDelay(Math.max(time + 0.01, 1));
    delay.delayTime.value = time;

    const fb = ctx.createGain();
    fb.gain.value = feedback;

    wet.connect(delay);
    delay.connect(fb);

    if (opts.feedbackFilter) {
      const filter = ctx.createBiquadFilter();
      filter.type = opts.feedbackFilter.type;
      filter.frequency.value = opts.feedbackFilter.frequency;
      filter.Q.value = opts.feedbackFilter.Q ?? 1;
      fb.connect(filter);
      filter.connect(delay);
    } else {
      fb.connect(delay);
    }

    delay.connect(wetOut);
  });
}

// ---------------------------------------------------------------------------
// Distortion — waveshaper with tanh curve
// ---------------------------------------------------------------------------

export function createDistortion(
  ctx: BaseAudioContext,
  opts: DistortionEffect,
): EffectNode {
  const amount = opts.amount ?? 50;
  const mix = opts.mix ?? 0.5;

  return withMix(ctx, mix, (wet, wetOut) => {
    const shaper = ctx.createWaveShaper();

    const samples = 44100;
    const curve = new Float32Array(samples);
    const k = amount;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(k * x);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";

    wet.connect(shaper);
    shaper.connect(wetOut);
  });
}

// ---------------------------------------------------------------------------
// Chorus — detuned delay pair with LFO modulation
// ---------------------------------------------------------------------------

export function createChorus(
  ctx: BaseAudioContext,
  opts: ChorusEffect,
): EffectNode {
  const rate = opts.rate ?? 1.5;
  const depth = opts.depth ?? 0.003;
  const mix = opts.mix ?? 0.3;

  return withMix(ctx, mix, (wet, wetOut) => {
    const delayL = ctx.createDelay();
    delayL.delayTime.value = 0.012;

    const delayR = ctx.createDelay();
    delayR.delayTime.value = 0.016;

    const lfoL = ctx.createOscillator();
    lfoL.type = "sine";
    lfoL.frequency.value = rate;

    const lfoR = ctx.createOscillator();
    lfoR.type = "sine";
    lfoR.frequency.value = rate * 1.1;

    const lfoGainL = ctx.createGain();
    lfoGainL.gain.value = depth;

    const lfoGainR = ctx.createGain();
    lfoGainR.gain.value = depth;

    lfoL.connect(lfoGainL);
    lfoGainL.connect(delayL.delayTime);
    lfoL.start();

    lfoR.connect(lfoGainR);
    lfoGainR.connect(delayR.delayTime);
    lfoR.start();

    wet.connect(delayL);
    wet.connect(delayR);
    delayL.connect(wetOut);
    delayR.connect(wetOut);

    return {
      dispose() {
        try {
          lfoL.stop();
        } catch (_) {
          /* already stopped */
        }
        try {
          lfoR.stop();
        } catch (_) {
          /* already stopped */
        }
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Flanger — very short delay with LFO and feedback
// ---------------------------------------------------------------------------

export function createFlanger(
  ctx: BaseAudioContext,
  opts: FlangerEffect,
): EffectNode {
  const rate = opts.rate ?? 0.5;
  const depth = opts.depth ?? 0.002;
  const feedback = opts.feedback ?? 0.5;
  const mix = opts.mix ?? 0.5;

  return withMix(ctx, mix, (wet, wetOut) => {
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.005;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = rate;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = depth;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();

    const fb = ctx.createGain();
    fb.gain.value = feedback;
    delay.connect(fb);
    fb.connect(delay);

    wet.connect(delay);
    delay.connect(wetOut);

    return {
      dispose() {
        try {
          lfo.stop();
        } catch (_) {
          /* already stopped */
        }
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Phaser — chain of allpass filters with LFO modulation
// ---------------------------------------------------------------------------

export function createPhaser(
  ctx: BaseAudioContext,
  opts: PhaserEffect,
): EffectNode {
  const rate = opts.rate ?? 0.5;
  const depth = opts.depth ?? 1000;
  const stages = opts.stages ?? 4;
  const feedback = opts.feedback ?? 0.5;
  const mix = opts.mix ?? 0.5;

  return withMix(ctx, mix, (wet, wetOut) => {
    const filters: BiquadFilterNode[] = [];
    const baseFreqs = [200, 600, 1200, 2400, 4800, 8000];

    for (let i = 0; i < stages; i++) {
      const f = ctx.createBiquadFilter();
      f.type = "allpass";
      f.frequency.value = baseFreqs[i % baseFreqs.length];
      f.Q.value = 0.5;
      filters.push(f);
    }

    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = rate;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = depth;

    lfo.connect(lfoGain);
    for (const f of filters) {
      lfoGain.connect(f.frequency);
    }
    lfo.start();

    const fb = ctx.createGain();
    fb.gain.value = feedback;
    filters[filters.length - 1].connect(fb);
    fb.connect(filters[0]);

    wet.connect(filters[0]);
    filters[filters.length - 1].connect(wetOut);

    return {
      dispose() {
        try {
          lfo.stop();
        } catch (_) {
          /* already stopped */
        }
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Tremolo — LFO modulating gain
// ---------------------------------------------------------------------------

export function createTremolo(
  ctx: BaseAudioContext,
  opts: TremoloEffect,
): EffectNode {
  const rate = opts.rate ?? 4;
  const depth = opts.depth ?? 0.5;

  const input = ctx.createGain();
  const output = ctx.createGain();

  const tremGain = ctx.createGain();
  tremGain.gain.value = 1 - depth / 2;
  input.connect(tremGain);
  tremGain.connect(output);

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = rate;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = depth / 2;
  lfo.connect(lfoGain);
  lfoGain.connect(tremGain.gain);
  lfo.start();

  return {
    input,
    output,
    dispose() {
      try {
        lfo.stop();
      } catch (_) {
        /* already stopped */
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Vibrato — LFO modulating a short delay line (pitch modulation)
// ---------------------------------------------------------------------------

export function createVibrato(
  ctx: BaseAudioContext,
  opts: VibratoEffect,
): EffectNode {
  const rate = opts.rate ?? 5;
  const depth = opts.depth ?? 0.002;

  const input = ctx.createGain();
  const output = ctx.createGain();

  const delay = ctx.createDelay();
  delay.delayTime.value = depth;

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = rate;

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain);
  lfoGain.connect(delay.delayTime);
  lfo.start();

  input.connect(delay);
  delay.connect(output);

  return {
    input,
    output,
    dispose() {
      try {
        lfo.stop();
      } catch (_) {
        /* already stopped */
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Bitcrusher — reduce bit depth and optionally sample rate
// ---------------------------------------------------------------------------

export function createBitcrusher(
  ctx: BaseAudioContext,
  opts: BitcrusherEffect,
): EffectNode {
  const bits = opts.bits ?? 8;
  const mix = opts.mix ?? 1;
  const srReduction = opts.sampleRateReduction ?? 1;

  return withMix(ctx, mix, (wet, wetOut) => {
    const shaper = ctx.createWaveShaper();
    const steps = 2 ** bits;
    const samples = 65536;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (srReduction > 1) {
        const blockIndex = Math.floor(i / srReduction) * srReduction;
        const blockX = (blockIndex * 2) / samples - 1;
        curve[i] = Math.round(blockX * steps) / steps;
      } else {
        curve[i] = Math.round(x * steps) / steps;
      }
    }
    shaper.curve = curve;

    wet.connect(shaper);
    shaper.connect(wetOut);
  });
}

// ---------------------------------------------------------------------------
// Compressor
// ---------------------------------------------------------------------------

export function createCompressor(
  ctx: BaseAudioContext,
  opts: CompressorEffect,
): EffectNode {
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = opts.threshold ?? -24;
  comp.knee.value = opts.knee ?? 30;
  comp.ratio.value = opts.ratio ?? 4;
  comp.attack.value = opts.attack ?? 0.003;
  comp.release.value = opts.release ?? 0.25;

  return { input: comp, output: comp };
}

// ---------------------------------------------------------------------------
// Parametric EQ — chain of biquad filters
// ---------------------------------------------------------------------------

export function createEQ(ctx: BaseAudioContext, opts: EQEffect): EffectNode {
  const input = ctx.createGain();
  const output = ctx.createGain();

  if (opts.bands.length === 0) {
    input.connect(output);
    return { input, output };
  }

  const filters = opts.bands.map((band) => {
    const f = ctx.createBiquadFilter();
    f.type = band.type;
    f.frequency.value = band.frequency;
    f.gain.value = band.gain;
    f.Q.value = band.Q ?? 1;
    return f;
  });

  input.connect(filters[0]);
  for (let i = 0; i < filters.length - 1; i++) {
    filters[i].connect(filters[i + 1]);
  }
  filters[filters.length - 1].connect(output);

  return { input, output };
}

// ---------------------------------------------------------------------------
// Gain — simple volume adjustment
// ---------------------------------------------------------------------------

export function createGainEffect(
  ctx: BaseAudioContext,
  opts: GainEffect,
): EffectNode {
  const gain = ctx.createGain();
  gain.gain.value = opts.value;
  return { input: gain, output: gain };
}

// ---------------------------------------------------------------------------
// Stereo Pan — as an effect in the chain
// ---------------------------------------------------------------------------

export function createPanEffect(
  ctx: BaseAudioContext,
  opts: StereoPanEffect,
): EffectNode {
  const panner = ctx.createStereoPanner();
  panner.pan.value = opts.value;
  return { input: panner, output: panner };
}

// ---------------------------------------------------------------------------
// Factory — create any effect from its definition
// ---------------------------------------------------------------------------

export function createEffect(
  ctx: BaseAudioContext,
  effect: Effect,
): EffectNode {
  switch (effect.type) {
    case "reverb":
      return createReverb(ctx, effect);
    case "convolver":
      return createConvolver(ctx, effect);
    case "delay":
      return createDelay(ctx, effect);
    case "distortion":
      return createDistortion(ctx, effect);
    case "chorus":
      return createChorus(ctx, effect);
    case "flanger":
      return createFlanger(ctx, effect);
    case "phaser":
      return createPhaser(ctx, effect);
    case "tremolo":
      return createTremolo(ctx, effect);
    case "vibrato":
      return createVibrato(ctx, effect);
    case "bitcrusher":
      return createBitcrusher(ctx, effect);
    case "compressor":
      return createCompressor(ctx, effect);
    case "eq":
      return createEQ(ctx, effect);
    case "gain":
      return createGainEffect(ctx, effect);
    case "pan":
      return createPanEffect(ctx, effect);
  }
}

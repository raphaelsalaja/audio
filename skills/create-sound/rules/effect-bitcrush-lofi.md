---
title: Bitcrusher - retro / lofi finish
impact: LOW-MEDIUM
impactDescription: Quantizes amplitude (and optionally sample rate). Use for retro and lofi character.
tags: effect, bitcrusher, lofi, retro
prompt: "bitcrushed beep"
example: |
  {
    "source": { "type": "square", "frequency": { "start": 800, "end": 1200 } },
    "filter": { "type": "lowpass", "frequency": 3000 },
    "envelope": { "attack": 0, "decay": 0.08, "sustain": 0, "release": 0.02 },
    "effects": [{ "type": "bitcrusher", "bits": 8, "sampleRateReduction": 4, "mix": 1 }],
    "gain": 0.18
  }
---

## Bitcrusher - retro / lofi finish

- `bits`: 4-8. Lower = more crunchy. Below 4 turns into noise.
- `sampleRateReduction`: 1 (off) to 8 (heavy aliasing). Combine with `bits: 8` for that 8-bit console sound.
- `mix`: usually 1. Mixing bitcrush with the dry signal sounds muddy.

Best paired with `square` or `sawtooth` sources and a lowpass to soften the aliasing edges.

Avoid stacking with `effect-reverb-tail` - the quantization noise gets smeared.

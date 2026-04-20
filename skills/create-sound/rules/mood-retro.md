---
title: Retro - square or sawtooth + lowpass + bitcrusher
impact: MEDIUM
impactDescription: 8-bit / chiptune flavor. Square or sawtooth source plus heavy quantization.
tags: mood, retro, chiptune, bitcrusher
prompt: "retro coin"
example: |
  {
    "source": { "type": "square", "frequency": { "start": 800, "end": 1200 } },
    "filter": { "type": "lowpass", "frequency": 3000 },
    "envelope": { "attack": 0, "decay": 0.08, "sustain": 0, "release": 0.02 },
    "effects": [{ "type": "bitcrusher", "bits": 8, "sampleRateReduction": 4, "mix": 1 }],
    "gain": 0.18
  }
---

## Retro - square or sawtooth + lowpass + bitcrusher

Mutation:

- `source.type: "square"` (or `"sawtooth"`).
- Add `filter: { type: "lowpass", frequency: 3000 }` to soften aliasing.
- Append `effects: [{ type: "bitcrusher", bits: 8, sampleRateReduction: 2-4, mix: 1 }]`.

Pairs naturally with rising or stepped pitch sweeps (coins, power-ups).

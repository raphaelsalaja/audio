---
title: Lo-fi - bitcrusher + lowpass
impact: MEDIUM
impactDescription: Reduces fidelity in two complementary ways: bit reduction and high-frequency loss.
tags: mood, lofi, bitcrusher, filter
prompt: "lofi click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 60 } },
    "filter": { "type": "lowpass", "frequency": 1500 },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "effects": [{ "type": "bitcrusher", "bits": 6, "mix": 0.8 }],
    "gain": 0.2
  }
---

## Lo-fi - bitcrusher + lowpass

Mutation:

- Add `filter: { type: "lowpass", frequency: 1500 }`.
- Append `effects: [{ type: "bitcrusher", bits: 6-8, mix: 0.7-1 }]`.
- Optionally drop `gain` by 0.02 because bitcrushing adds perceived loudness.

Combines well with `mood-retro`.

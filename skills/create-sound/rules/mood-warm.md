---
title: Warm - lowpass + light reverb
impact: MEDIUM
impactDescription: The most common mood adjective. Removes high-frequency bite without dulling the timbre.
tags: mood, warm, filter, reverb
prompt: "warm click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 60 } },
    "filter": { "type": "lowpass", "frequency": 2500 },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "effects": [{ "type": "reverb", "decay": 0.4, "mix": 0.1 }],
    "gain": 0.18
  }
---

## Warm - lowpass + light reverb

Mutation applied on top of the base recipe:

- Add `filter: { type: "lowpass", frequency: 2500 }` (or 2-3 kHz).
- Optionally add `effects: [{ type: "reverb", decay: 0.4, mix: 0.1 }]`.
- If the base used `sawtooth` or `square`, downgrade to `triangle` so the source itself is rounder.

If the base already had a lowpass, lower its cutoff by ~30%.

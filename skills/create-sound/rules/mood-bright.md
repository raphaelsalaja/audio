---
title: Bright - no lowpass, optional FM sparkle
impact: MEDIUM
impactDescription: Inverse of warm. Open the high end and add a touch of FM for sparkle.
tags: mood, bright, fm
prompt: "bright click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 2.5, "depth": 50 } },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "gain": 0.18
  }
---

## Bright - no lowpass, optional FM sparkle

Mutation:

- Remove any `filter` of type `lowpass`, or raise its cutoff above 6 kHz.
- If the base used `triangle`, upgrade to `sine` with `fm: { ratio: 2.5, depth: 50 }` for sparkle.
- Slight `gain` bump (+0.02) is fine but stay under the budget.

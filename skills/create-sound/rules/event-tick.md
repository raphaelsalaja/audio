---
title: Tick - faintest possible sine
impact: MEDIUM
impactDescription: Background scroll/snap/focus events. Almost subliminal so it doesn't fatigue.
tags: event, tick, scroll, focus, transient
prompt: "tick"
example: |
  {
    "source": { "type": "sine", "frequency": 1500, "fm": { "ratio": 0.5, "depth": 60 } },
    "envelope": { "attack": 0, "decay": 0.01, "sustain": 0, "release": 0.004 },
    "gain": 0.15
  }
---

## Tick - faintest possible sine

Highest frequency in the tap family. Decay under 15 ms. `gain` capped at ~0.15 because ticks fire often and must not dominate.

For scroll-snap reduce `gain` to 0.08; for focus/blur reduce to 0.04-0.06.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `tick`, `scrollSnap`, `focus`, `blur`.

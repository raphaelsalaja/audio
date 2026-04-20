---
title: Whoosh - longer, slower swoosh for full-page transitions
impact: LOW-MEDIUM
impactDescription: When the swoosh needs to cover a longer animation (page enter/exit).
tags: event, whoosh, transition, noise, bandpass
prompt: "whoosh"
example: |
  {
    "source": { "type": "noise", "color": "white" },
    "filter": { "type": "bandpass", "frequency": 300, "resonance": 1.5, "envelope": { "attack": 0.04, "peak": 4000, "decay": 0.16 } },
    "envelope": { "attack": 0.02, "decay": 0.25, "sustain": 0, "release": 0.08 },
    "gain": 0.15
  }
---

## Whoosh - longer, slower swoosh for full-page transitions

Same architecture as `swoosh` but everything stretches. Filter attack is 4x longer (0.04 s vs 0.01 s) so the gesture starts gently. Slightly higher `gain` because it spans a longer time window.

`pageEnter` uses bandpass peak 3000 with white noise; `pageExit` uses pink noise with the bandpass envelope inverted (decay only, peak 400).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `whoosh`, `pageEnter`, `pageExit`.

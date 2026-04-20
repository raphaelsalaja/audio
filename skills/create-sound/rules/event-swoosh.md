---
title: Swoosh - white noise through a sweeping bandpass
impact: MEDIUM
impactDescription: Movement and transitions. The bandpass envelope is what makes it directional.
tags: event, swoosh, noise, bandpass
prompt: "swoosh"
example: |
  {
    "source": { "type": "noise", "color": "white" },
    "filter": { "type": "bandpass", "frequency": 300, "resonance": 1.8, "envelope": { "attack": 0.01, "peak": 4000, "decay": 0.08 } },
    "envelope": { "attack": 0.01, "decay": 0.12, "sustain": 0, "release": 0.04 },
    "gain": 0.12
  }
---

## Swoosh - white noise through a sweeping bandpass

White noise is shaped by a bandpass filter whose center frequency sweeps from 300 Hz up to 4 kHz. The sweep direction is the gesture: peak above resting = upward swoosh, peak below resting (e.g., resting 2500, peak 400) = downward.

For `slide-up` use a similar shape with peak 3500. For `slide-down` flip to pink noise with `envelope: { decay: 0.12, peak: 500 }` (no attack on the filter envelope).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `swoosh`, `slide`, `slideUp`, `slideDown`.

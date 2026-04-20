---
title: Notification - FM-rich sine with light reverb
impact: HIGH
impactDescription: Attention-grabbing without being aggressive. FM provides the "bell" character; reverb gives it presence.
tags: event, notification, fm, reverb
prompt: "notification"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 780, "fm": { "ratio": 1.5, "depth": 150 } }, "envelope": { "attack": 0, "decay": 0.4, "sustain": 0.04, "release": 0.15 }, "effects": [{ "type": "reverb", "decay": 0.6, "damping": 0.6, "mix": 0.12 }], "gain": 0.16 },
      { "source": { "type": "sine", "frequency": 1170, "fm": { "ratio": 1.5, "depth": 120 } }, "envelope": { "attack": 0, "decay": 0.35, "sustain": 0.03, "release": 0.15 }, "delay": 0.1, "effects": [{ "type": "reverb", "decay": 0.6, "damping": 0.6, "mix": 0.12 }], "gain": 0.14 }
    ]
  }
---

## Notification - FM-rich sine with light reverb

Two FM bells a fifth apart with 100 ms `delay` between them. The `fm.ratio: 1.5` gives an inharmonic shimmer; the matched reverb on each layer glues them together.

For `ding`: single layer, `fm.ratio: 3.5`, reverb `decay: 0.8`.
For `mention`: lower fundamental (660 Hz), `fm.ratio: 2.5`, slightly more attack.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `notification`, `ding`, `mention`, `badge`.

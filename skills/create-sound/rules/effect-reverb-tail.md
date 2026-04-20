---
title: Reverb tail - small space, low mix
impact: MEDIUM
impactDescription: UI sounds rarely need more than a hint of reverb. Big halls feel cinematic and out of place.
tags: effect, reverb, space
prompt: "click with reverb"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 60 } },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "effects": [{ "type": "reverb", "decay": 0.4, "damping": 0.5, "mix": 0.12 }],
    "gain": 0.18
  }
---

## Reverb tail - small space, low mix

Default UI reverb:

- `decay`: 0.3-0.6 s.
- `damping`: 0.4-0.6 (kills high frequencies in the tail; without this the reverb sounds metallic).
- `mix`: 0.08-0.15. Anything above 0.2 starts to feel like a music production effect.

For per-layer reverb on bell-like sounds (notification, ding), put the reverb inside the layer's `effects` array so each note rings independently. For shared reverb on chords/transitions, put it on the top-level `effects` of the `MultiLayerSound`.

Avoid stacking reverb with delay - choose one.

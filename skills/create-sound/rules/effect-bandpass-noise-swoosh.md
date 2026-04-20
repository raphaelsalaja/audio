---
title: Bandpass noise swoosh - filter envelope is the gesture
impact: MEDIUM
impactDescription: For movement sounds, the filter envelope provides the directional information. The amplitude envelope just gates it.
tags: effect, filter, bandpass, noise, swoosh
prompt: "swoosh transition"
example: |
  {
    "source": { "type": "noise", "color": "white" },
    "filter": { "type": "bandpass", "frequency": 300, "resonance": 1.8, "envelope": { "attack": 0.01, "peak": 4000, "decay": 0.08 } },
    "envelope": { "attack": 0.01, "decay": 0.12, "sustain": 0, "release": 0.04 },
    "gain": 0.12
  }
---

## Bandpass noise swoosh - filter envelope is the gesture

Recipe is on the layer's `filter`, not its `effects`:

```ts
filter: {
  type: "bandpass",
  frequency: <resting Hz>,
  resonance: 1-3,
  envelope: { attack: 0.01-0.04, peak: <target Hz>, decay: 0.08-0.2 },
}
```

- Peak above resting -> upward swoosh.
- Peak below resting -> downward swoosh.
- Higher `resonance` (>2) makes it whistle-like; lower (<1.5) is broader.

Source should be `noise` (white for sharp, pink for soft). Source amplitude envelope just gates the noise window.

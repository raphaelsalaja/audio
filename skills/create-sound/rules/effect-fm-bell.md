---
title: FM bell - high ratio, high depth
impact: MEDIUM
impactDescription: FM with ratios >= 2 produces inharmonic partials that read as "bell". Lives on the source, not in the effects array.
tags: effect, fm, bell
prompt: "bell sound"
example: |
  {
    "source": { "type": "sine", "frequency": 880, "fm": { "ratio": 3.5, "depth": 250 } },
    "envelope": { "attack": 0, "decay": 0.5, "sustain": 0.04, "release": 0.2 },
    "gain": 0.16
  }
---

## FM bell - high ratio, high depth

`source.fm: { ratio, depth }` is structural, not an effect node. To get a bell:

- `ratio`: 2.5-3.5 for harmonic-bell, 2.76 for the "badge" inharmonic clang.
- `depth`: 150-400. Higher depth = more strident.
- `envelope.decay`: at least 0.3 s so the bell can ring.

For a bright "ding", use `ratio: 3.5`, `depth: 250` and add reverb (`decay: 0.7, mix: 0.15`).

For a dull "thud" with body, use `ratio: 0.5`, `depth: 200` and a short envelope.

Pair with `mood-glassy` or `mood-metallic`.

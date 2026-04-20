---
title: Organic - triangle + slight detune + light reverb
impact: LOW-MEDIUM
impactDescription: Softer, less synthetic feel. Triangle is between sine (too pure) and square (too edgy).
tags: mood, organic, triangle, reverb
prompt: "organic pop"
example: |
  {
    "source": { "type": "triangle", "frequency": { "start": 400, "end": 150 }, "detune": 5 },
    "envelope": { "attack": 0.005, "decay": 0.1, "sustain": 0, "release": 0.04 },
    "effects": [{ "type": "reverb", "decay": 0.3, "mix": 0.08 }],
    "gain": 0.2
  }
---

## Organic - triangle + slight detune + light reverb

Mutation:

- `source.type: "triangle"`.
- Add `source.detune: 5-10` for very slight pitch wobble.
- Bump `envelope.attack` from 0 to 0.003-0.008 s so the onset isn't a hard click.
- Append a small reverb (`mix: 0.05-0.1`).

Combines well with `mood-warm`. Avoid combining with `mood-metallic` or `mood-lofi` - they fight the natural feel.

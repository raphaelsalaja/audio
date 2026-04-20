---
title: Glassy - high FM ratio + reverb
impact: MEDIUM
impactDescription: Bell-like, crystalline character. High FM ratio creates inharmonic partials; reverb gives the result presence.
tags: mood, glassy, fm, reverb
prompt: "glassy ding"
example: |
  {
    "source": { "type": "sine", "frequency": 880, "fm": { "ratio": 3.5, "depth": 250 } },
    "envelope": { "attack": 0, "decay": 0.5, "sustain": 0.04, "release": 0.2 },
    "effects": [{ "type": "reverb", "decay": 0.7, "damping": 0.5, "mix": 0.15 }],
    "gain": 0.16
  }
---

## Glassy - high FM ratio + reverb

Mutation:

- `source.type: "sine"`.
- `source.fm: { ratio: 3.5, depth: 200-300 }`.
- Append `effects: [{ type: "reverb", decay: 0.7, damping: 0.5, mix: 0.15 }]`.
- Extend `envelope.decay` to at least 0.3 s so the bell can ring.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `ding`, `sparkle`, `star`.

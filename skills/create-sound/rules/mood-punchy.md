---
title: Punchy - zero attack, very short decay
impact: MEDIUM
impactDescription: Envelope mutation that emphasizes the transient over the body.
tags: mood, punchy, envelope, transient
prompt: "punchy click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 60 } },
    "envelope": { "attack": 0, "decay": 0.04, "sustain": 0, "release": 0.01 },
    "gain": 0.25
  }
---

## Punchy - zero attack, very short decay

Mutation:

- `envelope.attack: 0`.
- `envelope.decay: <= 0.06`.
- `envelope.sustain: 0`.
- `envelope.release: <= 0.015`.
- `gain` bump of +0.05 is fine because the energy lives in a shorter window.

Orthogonal to source-shape moods - apply on top of warm/bright/glassy/metallic.

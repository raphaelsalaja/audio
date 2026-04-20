---
title: Success - ascending three-note sine chord
impact: HIGH
impactDescription: Positive confirmation for completed actions. Multi-layer with cascading delay is what makes it feel celebratory.
tags: event, success, multi-layer, chord
prompt: "success"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 523 }, "envelope": { "attack": 0.003, "decay": 0.3, "sustain": 0.06, "release": 0.1 }, "gain": 0.16 },
      { "source": { "type": "sine", "frequency": 659 }, "envelope": { "attack": 0.003, "decay": 0.28, "sustain": 0.05, "release": 0.1 }, "delay": 0.07, "gain": 0.14 },
      { "source": { "type": "sine", "frequency": { "start": 784, "end": 880 } }, "envelope": { "attack": 0.003, "decay": 0.32, "sustain": 0.06, "release": 0.12 }, "delay": 0.14, "gain": 0.15 }
    ]
  }
---

## Success - ascending three-note sine chord

Three sine layers at C5 / E5 / G5 with `delay` cascading 0.07 s between them. The top note has a small upward sweep (G5 -> A5) so the chord resolves "upward" instead of just stopping.

Layer gains sum to 0.45, comfortably under the 0.6 budget.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `success`.

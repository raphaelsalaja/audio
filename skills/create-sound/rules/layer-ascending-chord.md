---
title: Ascending chord - 3-4 layers with cascading delay
impact: MEDIUM
impactDescription: Success, complete, level-up, confetti. Multiple sustained pitches stagger to feel celebratory.
tags: layer, chord, ascending, multi-layer
prompt: "ascending chord success"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 523 }, "envelope": { "attack": 0.003, "decay": 0.3, "sustain": 0.06, "release": 0.1 }, "gain": 0.16 },
      { "source": { "type": "sine", "frequency": 659 }, "envelope": { "attack": 0.003, "decay": 0.28, "sustain": 0.05, "release": 0.1 }, "delay": 0.07, "gain": 0.14 },
      { "source": { "type": "sine", "frequency": { "start": 784, "end": 880 } }, "envelope": { "attack": 0.003, "decay": 0.32, "sustain": 0.06, "release": 0.12 }, "delay": 0.14, "gain": 0.15 }
    ]
  }
---

## Ascending chord - 3-4 layers with cascading delay

3-4 sine layers spelling out a major triad (C-E-G or C-E-G-C). `delay` increments by ~70 ms for "feels like notes" or ~15 ms for "feels like one gesture".

Top layer gets a small upward sweep so the chord resolves rather than stops.

Cap layer count at 4. Layer gains should sum to <= 0.6. If a layer has `sustain > 0`, all layers should have similar sustain values to avoid staggered ringing.

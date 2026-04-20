---
title: Complete - four-note ascending arpeggio
impact: MEDIUM-HIGH
impactDescription: A "bigger" success for finishing larger actions or workflows. Four layers with tighter delays so it feels decisive.
tags: event, complete, multi-layer, arpeggio
prompt: "complete"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 523 }, "envelope": { "attack": 0.003, "decay": 0.35, "sustain": 0.05, "release": 0.1 }, "gain": 0.15 },
      { "source": { "type": "sine", "frequency": 659 }, "envelope": { "attack": 0.003, "decay": 0.35, "sustain": 0.05, "release": 0.1 }, "delay": 0.015, "gain": 0.13 },
      { "source": { "type": "sine", "frequency": 784 }, "envelope": { "attack": 0.003, "decay": 0.35, "sustain": 0.05, "release": 0.1 }, "delay": 0.03, "gain": 0.12 },
      { "source": { "type": "sine", "frequency": { "start": 1046, "end": 1175 } }, "envelope": { "attack": 0.003, "decay": 0.3, "sustain": 0.04, "release": 0.12 }, "delay": 0.045, "gain": 0.1 }
    ]
  }
---

## Complete - four-note ascending arpeggio

Same C-major triad as `success`, but with C6 added on top and tighter 15 ms `delay` increments so the notes blur into a single gesture rather than reading as discrete pitches.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `complete`.

---
title: Click + body - transient layer over a sustained tone
impact: MEDIUM
impactDescription: Mimics real percussion: a sharp transient (the "click" of a stick) plus a sustained pitch (the body of the drum).
tags: layer, click, body, percussion
prompt: "click with body"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 4000, "fm": { "ratio": 0.5, "depth": 200 } }, "envelope": { "attack": 0, "decay": 0.008, "sustain": 0, "release": 0.003 }, "gain": 0.15 },
      { "source": { "type": "sine", "frequency": { "start": 200, "end": 80 } }, "envelope": { "attack": 0, "decay": 0.12, "sustain": 0, "release": 0.05 }, "gain": 0.18 }
    ]
  }
---

## Click + body - transient layer over a sustained tone

Two layers fired simultaneously (no `delay`):

1. High-frequency transient (3-5 kHz) with sub-10 ms decay - the "stick".
2. Lower-frequency body (80-300 Hz) with longer decay - the "drum".

Used for: send buttons, hard confirms, drum-like UI feedback, anything that needs perceived weight. Both layers use the same source `type` (usually `sine`) so they read as one event.

Gains should be roughly balanced (transient slightly quieter than body).

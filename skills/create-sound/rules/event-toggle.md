---
title: Toggle - paired sines with delay (direction matters)
impact: MEDIUM
impactDescription: On vs off uses the same pair of pitches in opposite order. The delay between them is what makes it read as "two clicks".
tags: event, toggle, multi-layer, on, off
prompt: "toggle on"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 2093 }, "envelope": { "attack": 0, "decay": 0.012, "sustain": 0, "release": 0.004 }, "gain": 0.2 },
      { "source": { "type": "sine", "frequency": 3136 }, "envelope": { "attack": 0, "decay": 0.012, "sustain": 0, "release": 0.004 }, "delay": 0.025, "gain": 0.2 }
    ]
  }
---

## Toggle - paired sines with delay (direction matters)

Two short sines: C7 (2093 Hz) and G7 (3136 Hz), 25 ms apart.

- `toggle-on`: low note first, then high (ascending = enabling).
- `toggle-off`: high note first, then low (descending = disabling).

The same architecture works for `copy` (1200 Hz then 1400 Hz, 40 ms gap) and `sync` (C5 then G5).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `toggleOn`, `toggleOff`, `copy`, `sync`.

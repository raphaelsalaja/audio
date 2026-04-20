---
title: Error - layered sawtooth + square with descending sweep
impact: HIGH
impactDescription: Negative feedback for invalid actions. The descending sweep + sawtooth/square layering reads as "wrong" without being harsh.
tags: event, error, multi-layer, descending
prompt: "error"
example: |
  {
    "layers": [
      { "source": { "type": "sawtooth", "frequency": { "start": 320, "end": 140 } }, "filter": { "type": "lowpass", "frequency": 1200 }, "envelope": { "attack": 0, "decay": 0.25, "sustain": 0, "release": 0.08 }, "gain": 0.22 },
      { "source": { "type": "square", "frequency": { "start": 180, "end": 80 } }, "filter": { "type": "lowpass", "frequency": 800 }, "envelope": { "attack": 0, "decay": 0.2, "sustain": 0, "release": 0.06 }, "delay": 0.03, "gain": 0.12 }
    ]
  }
---

## Error - layered sawtooth + square with descending sweep

Two descending sweeps stacked an octave apart. Lowpass filters keep the result from being abrasive. Same shape works for `delete` (slightly longer decay).

**Incorrect (no filter, sounds like a buzzer):**

```ts
{ source: { type: "sawtooth", frequency: { start: 320, end: 140 } }, envelope: { decay: 0.25 }, gain: 0.22 }
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `error`, `_delete`.

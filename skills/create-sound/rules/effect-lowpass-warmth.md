---
title: Lowpass warmth - the safest filter to add
impact: MEDIUM
impactDescription: 90% of "make it warmer" requests are solved by a lowpass at 2-3 kHz. Lives on the layer, not in the effects array.
tags: effect, filter, lowpass, warm
prompt: "warm sine"
example: |
  {
    "source": { "type": "sine", "frequency": 1300 },
    "filter": { "type": "lowpass", "frequency": 2500 },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "gain": 0.18
  }
---

## Lowpass warmth - the safest filter to add

```ts
filter: { type: "lowpass", frequency: 2500, resonance: 0.7 }
```

- `frequency`: 1500-3000 Hz for "warm". Below 1000 starts muffling the sound.
- `resonance`: omit or set 0.7-1.5. Above 2 the cutoff itself starts to whistle.

Stacks safely with reverb, FM, and most moods. The fastest way to remove harshness from any source.

For dynamic warmth (bright attack -> warm sustain), add a filter envelope:

```ts
filter: {
  type: "lowpass",
  frequency: 2500,
  envelope: { attack: 0, peak: 6000, decay: 0.08 },
}
```

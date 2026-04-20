---
title: Envelope sanity - no zero decay, no infinite sustain without release
impact: HIGH
impactDescription: An envelope with `decay: 0` produces a click; sustain without release leaves the voice ringing forever.
tags: validate, envelope, adsr
---

## Envelope sanity - no zero decay, no infinite sustain without release

Required:

- `envelope.decay > 0` (always). Set to 0.005 minimum.
- If `envelope.sustain > 0`, `envelope.release` must be present and `> 0`.

Recommended:

- `envelope.attack`: 0 for percussive, 0.003-0.05 for sustained tones, up to 0.1 for ambient sounds.
- `envelope.decay + envelope.release`: <= 2 s for any UI sound. Above that, you're writing music, not interface feedback.
- `envelope.sustain`: 0 for transients, 0.03-0.15 for "rings out" tones, 0.3-0.7 only for held loops.

The `validate` script flags `decay <= 0`, `sustain > 0` without `release`, and total durations above 3 s.

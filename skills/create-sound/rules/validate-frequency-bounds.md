---
title: Frequency bounds - 20 Hz to 20 kHz, both ends meaningful
impact: HIGH
impactDescription: Out-of-range frequencies waste CPU at best and cause aliasing or sub-audible mud at worst.
tags: validate, frequency, bounds
---

## Frequency bounds - 20 Hz to 20 kHz, both ends meaningful

Hard bounds:

- `source.frequency` (or both `start`/`end` of a sweep): 20 Hz <= f <= 20000 Hz.
- `filter.frequency`: 20 Hz <= f <= 20000 Hz.
- `filter.envelope.peak`: same range as `filter.frequency`.

Recommended UI bounds:

- Tonal sources: 80 Hz <= f <= 8000 Hz.
- High transient layers (clicks, sticks): up to 5 kHz.
- Sub layers (body, drum): 60-200 Hz.

Anything above 8 kHz risks being inaudible on phone speakers; anything below 60 Hz risks being inaudible on laptop speakers.

The `validate` script flags any frequency outside the hard bounds.

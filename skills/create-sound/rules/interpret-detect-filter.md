---
title: Detect filter type, cutoff, and resonance
order: 5
impact: MEDIUM-HIGH
impactDescription: Filters change perceived brightness; getting the cutoff right is what makes "warm" vs "harsh" reads correct.
tags: interpret, filter, cutoff, resonance
---

## Detect filter type, cutoff, and resonance

Compare the measured spectrum against the expected spectrum for the identified oscillator.

### Cutoff via spectral centroid

```python
from analyze import spectral_centroid
centroid = spectral_centroid(spectrum, freqs)
```

Expected centroids at a 440 Hz fundamental: sine ~440, triangle ~880, sawtooth ~2200, square ~1760. If the measured centroid is significantly lower than expected, a `lowpass` is present; estimate cutoff at the -3 dB point.

### Filter type from rolloff

| Observation                                                        | `filter.type`   |
| ------------------------------------------------------------------ | --------------- |
| High-frequency rolloff steeper than the source would produce       | `lowpass`       |
| Low-frequency rolloff                                              | `highpass`      |
| Narrow band of frequencies passes through                           | `bandpass`      |
| Narrow notch removed                                                | `notch`         |
| Resonant peak near cutoff                                          | High `resonance`|

### Resonance (Q)

```python
from analyze import estimate_resonance
q = estimate_resonance(spectrum, freqs, cutoff_hz)
# Returns 0.1 - 20.0
```

### Filter envelope

If brightness changes over time (bright attack fading to dull), there's a filter envelope:

```python
from analyze import detect_filter_envelope
env = detect_filter_envelope(data, sample_rate)
# -> { "peak": 4000, "resting": 800, "decay_ms": 50 } or None
```

Maps to:

```ts
filter: {
  type: "lowpass",
  frequency: env.resting,
  envelope: { attack: 0, peak: env.peak, decay: env.decay_ms / 1000 },
}
```

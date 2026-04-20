---
title: Detect post-source effects
order: 6
impact: MEDIUM
impactDescription: Reverb/delay/FM/distortion add character; report with confidence rather than as exact values.
tags: interpret, effects, reverb, delay, fm, distortion
---

## Detect post-source effects

Each detector returns a confidence-flavored hint, not a guarantee. Effects are harder to extract than source/envelope - report low confidence when ambiguous.

### Reverb

```python
from analyze import detect_reverb
result = detect_reverb(data, sample_rate, envelope_end_ms=120)
# -> { "type": "reverb", "decay": 0.6 } or None
```

### Delay (autocorrelation)

```python
from analyze import detect_delay
result = detect_delay(data, sample_rate)
# -> { "type": "delay", "time": 0.25, "feedback": 0.3 } or None
```

### FM synthesis

Spectral sidebands at non-integer ratios of the fundamental indicate FM:

```python
from analyze import detect_fm
fm = detect_fm(spectrum, freqs, fundamental_freq)
# -> { "fm": { "ratio": 0.5, "depth": 80 } } or None
```

Maps to `source.fm: { ratio, depth }` (not a separate effect).

### Tremolo and vibrato

Periodic amplitude or frequency modulation in the 1-20 Hz band suggests tremolo/vibrato. Track amplitude or pitch over time and call `detect_lfo` (see `interpret-detect-lfo`).

### Bitcrusher / distortion

| Time-domain signature                             | Effect       |
| ------------------------------------------------- | ------------ |
| Stepped/quantized waveform with aliasing artifacts | `bitcrusher` |
| Flat-topped waveform with added harmonics         | `distortion` |

### Chorus / flanger / phaser

Comb-filter pattern that sweeps over time produces moving notches in the spectrum. Hard to disambiguate algorithmically; flag for human review.

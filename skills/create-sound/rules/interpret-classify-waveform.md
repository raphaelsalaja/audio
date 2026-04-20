---
title: Classify oscillator waveform from harmonics
order: 4
impact: HIGH
impactDescription: Picks source.type. Wrong choice changes the timbre completely even with correct frequency and envelope.
tags: interpret, fft, harmonics, waveform
---

## Classify oscillator waveform from harmonics

Compare the amplitude of the first 8 harmonics against the fundamental.

```python
import numpy as np
from scipy.fft import rfft, rfftfreq
from analyze import classify_waveform

segment = data[:int(sample_rate * 0.02)].astype(float)
segment *= np.hanning(len(segment))
spectrum = np.abs(rfft(segment))
freqs = rfftfreq(len(segment), 1 / sample_rate)

waveform = classify_waveform(spectrum, freqs, fundamental_freq)
# -> "sine" | "triangle" | "square" | "sawtooth" | "wavetable"
```

### Mapping

| Pattern                                         | `source.type` |
| ----------------------------------------------- | ------------- |
| Fundamental only, harmonics < -40 dB            | `sine`        |
| Odd harmonics rolling off as 1/n                | `triangle`    |
| Odd harmonics at roughly equal amplitude        | `square`      |
| All harmonics rolling off as 1/n                | `sawtooth`    |
| Custom harmonic profile (none of the above)    | `wavetable`   |
| No clear harmonic structure, broadband energy   | `noise`       |

### When to fall back to wavetable

If the harmonic profile doesn't match a clean oscillator, extract the harmonic series instead:

```python
from analyze import extract_harmonics
harmonics = extract_harmonics(spectrum, freqs, fundamental_freq, num_harmonics=16)
# -> { source: { type: "wavetable", harmonics, frequency: fundamental_freq } }
```

### Noise color

For broadband signals with no fundamental, classify by spectral slope:

```python
from analyze import classify_noise_color
color = classify_noise_color(spectrum, freqs)  # "white" | "pink" | "brown"
# -> { source: { type: "noise", color } }
```

---
title: Extract fundamental frequency and pitch sweep
order: 2
impact: HIGH
impactDescription: Drives the source.frequency field; everything else (waveform classification, FM detection) depends on knowing the fundamental.
tags: interpret, fft, frequency, pitch
---

## Extract fundamental frequency and pitch sweep

Sample the spectrum at multiple time slices to detect both the static pitch and any sweep.

```python
from analyze import load_mono, analyze_slice

sample_rate, data = load_mono("out/click.wav")

slices = [0, 5, 10, 20, 50]  # ms
freqs_over_time = [analyze_slice(data, sample_rate, t) for t in slices]
```

### Mapping

| Observation                         | Output                                            |
| ----------------------------------- | ------------------------------------------------- |
| All slices within ±5%               | `source.frequency: <Hz>` (static)                  |
| Decreasing across slices            | `source.frequency: { start: <high>, end: <low> }`  |
| Increasing across slices            | `source.frequency: { start: <low>, end: <high> }`  |

### Tips

- Skip the first 1-2 ms if the onset is a click transient; it pollutes the FFT.
- For very short sounds (< 20 ms) use fewer slices and a smaller window.
- Use a Hanning window before FFT (already applied in `analyze_slice`) to reduce spectral leakage.

---
title: Detect LFO modulation
order: 7
impact: LOW-MEDIUM
impactDescription: Periodic sub-audio modulation (tremolo, vibrato, filter sweep). Optional, but missing it produces a duller result than the source.
tags: interpret, lfo, modulation
---

## Detect LFO modulation

An LFO is sub-audio (0.1-20 Hz) periodic modulation of a parameter. Track the parameter over time, then run `detect_lfo`.

```python
from analyze import detect_lfo

# 1. Track amplitude (or pitch, or spectral centroid) at regular intervals
window_ms = 10
samples_per_window = int(sample_rate * window_ms / 1000)
amp_over_time = [
    float(np.max(np.abs(data[i:i + samples_per_window])))
    for i in range(0, len(data) - samples_per_window, samples_per_window)
]

# 2. Detect periodicity
lfo = detect_lfo(np.array(amp_over_time), 1000 / window_ms)
# -> { "frequency": 5.0, "depth": 0.12 } or None
```

### Mapping by tracked parameter

| Parameter tracked   | LFO target              |
| ------------------- | ----------------------- |
| Amplitude           | `gain`                  |
| Pitch               | `frequency` or `detune` |
| Spectral centroid   | `filter.frequency`      |
| Pan position        | `pan`                   |

### Output

```ts
lfo: { type: "sine", frequency: lfo.frequency, depth: lfo.depth, target: "gain" }
```

Pick `type` based on the shape of the modulation: smooth sinusoid -> `sine`, sharp ramp -> `sawtooth`, hard switching -> `square`.

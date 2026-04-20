---
title: Detect multi-layer sounds and stereo positioning
order: 8
impact: MEDIUM
impactDescription: A sound with multiple non-harmonic fundamentals or asymmetric stereo content should be emitted as MultiLayerSound rather than one layer.
tags: interpret, layers, stereo, pan
---

## Detect multi-layer sounds and stereo positioning

### Multiple fundamentals -> MultiLayerSound

Inspect peaks in the spectrum. If two or more strong peaks are not integer multiples of one shared fundamental, the sound is layered.

```python
from scipy.signal import find_peaks

peaks, props = find_peaks(spectrum, height=float(np.max(spectrum)) * 0.2)
peak_freqs = sorted(freqs[peaks])

# Check pairwise ratios. If no shared fundamental explains all peaks, treat as layered.
```

For each detected fundamental, run the full pipeline (frequency, envelope, waveform, filter, effects) and emit one `Layer` per fundamental:

```ts
{
  layers: [
    { source: { ... }, envelope: { ... }, gain: 0.2 },
    { source: { ... }, envelope: { ... }, gain: 0.15, delay: 0.04 },
  ]
}
```

The earlier layer typically gets `delay: 0` (omitted); subsequent layers offset their `delay` to match the measured onset gap.

### Stereo and pan

```python
from analyze import analyze_stereo
stereo = analyze_stereo(data)
# -> { "pan": 0.3, "stereo_width": 0.7 }
```

| `pan` magnitude | Output                          |
| --------------- | ------------------------------- |
| `< 0.05`        | omit (`pan: 0` is default)      |
| `0.05 - 1`      | `pan: <value>`                  |

`stereo_width > 0.5` with `|pan| < 0.05` suggests a stereo effect (chorus, dual-layer). Consider splitting into two layers panned `-0.5` / `+0.5`.

### Fallback

If a sound is unsynthesizable (complex transients, recorded material, irreducible texture), fall back to:

```ts
{ source: { type: "sample", url: "..." } }
```

and note that the original audio file should be used directly rather than re-synthesized.

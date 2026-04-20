---
title: Extract ADSR envelope from amplitude
order: 3
impact: HIGH
impactDescription: Maps directly to envelope.attack/decay/sustain/release; bad values here make the rendered sound feel wrong even if frequencies match.
tags: interpret, envelope, adsr, amplitude
---

## Extract ADSR envelope from amplitude

Smooth the time-domain amplitude, find onset/peak/sustain/end, and derive each ADSR stage.

```python
from analyze import load_mono, extract_envelope

sample_rate, data = load_mono("out/click.wav")
env = extract_envelope(data, sample_rate)
# -> { "attack": 0.0008, "decay": 0.012, "sustain": 0.0, "release": 0.005 }
```

### Output shape

The dict maps 1:1 to the `Envelope` type:

```ts
envelope: {
  attack: env.attack,    // 0 if percussive
  decay: env.decay,
  sustain: env.sustain,  // 0 for transient sounds, 0-1 for sustained
  release: env.release,
}
```

### Heuristics

- `sustain < 0.01` -> drop the field; the sound is percussive.
- `attack < 0.001` -> set `attack: 0`.
- `release < 0.005` -> clamp to `0.005` to avoid clicks at the end.

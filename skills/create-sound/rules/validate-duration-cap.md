---
title: Duration cap - 1 s for transients, 3 s absolute max
impact: MEDIUM
impactDescription: UI sounds that overrun their own animation feel laggy and obnoxious.
tags: validate, duration
---

## Duration cap - 1 s for transients, 3 s absolute max

Estimated total duration:

```
estimated = (envelope.attack ?? 0)
          + envelope.decay
          + (envelope.release ?? 0)
          + max(0, longestEffectTail)  // reverb decay, delay time * 4
```

Targets:

- Click / tap / tick / hover / focus: <= 0.1 s.
- Toggle / copy / sync: <= 0.2 s.
- Modal / drawer / dropdown open/close: <= 0.3 s.
- Success / complete / notification: <= 0.8 s.
- Whoosh / page transition: <= 0.5 s.

Hard ceiling: 3 s. Anything longer should not be a UI sound.

The `validate` script computes the estimated duration and flags layers that exceed 3 s.

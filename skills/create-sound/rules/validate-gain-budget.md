---
title: Gain budget - keep total layer gain under 0.6
impact: HIGH
impactDescription: The engine clips above ~0.7. Even below that, loud UI sounds fatigue users fast.
tags: validate, gain, mixing
---

## Gain budget - keep total layer gain under 0.6

Single layer:

- `gain` between 0.04 and 0.3 for typical UI events.
- Background ticks/scroll-snaps: 0.04-0.10.
- Mid-importance (click, tap, hover): 0.12-0.20.
- High-importance (success, notification): 0.16-0.25.

Multi-layer:

- Sum of all `layer.gain` values must be <= 0.6.
- If you exceed it, scale every layer proportionally rather than picking one to lower.

If a sound includes a heavy reverb (`mix > 0.15`) or distortion, lower the gain budget by 20%.

The `validate` script flags both individual layers above 0.4 and totals above 0.6.

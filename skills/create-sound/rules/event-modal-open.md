---
title: Modal-open - upward sine sweep
impact: MEDIUM
impactDescription: Surface entering view. Ascending sweep matches the spatial direction.
tags: event, modal, open, ascending
prompt: "modal open"
example: |
  {
    "source": { "type": "sine", "frequency": { "start": 430, "end": 1400 } },
    "envelope": { "attack": 0, "decay": 0.08, "sustain": 0, "release": 0.025 },
    "gain": 0.1
  }
---

## Modal-open - upward sine sweep

A single sine sweeping from ~430 Hz up to ~1400 Hz over 80 ms. No FM, no filter; the cleanness signals "appearing".

For `drawer-open` use a slightly lower start (~350 Hz) and lower gain (~0.08).
For `dropdown-open` use a smaller range (500 -> 1200) and decay ~60 ms.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `modalOpen`, `drawerOpen`, `dropdownOpen`.

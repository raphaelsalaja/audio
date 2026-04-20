---
title: Modal-close - downward sine sweep
impact: MEDIUM
impactDescription: Mirror of modal-open. Descending sweep matches the dismiss direction.
tags: event, modal, close, descending
prompt: "modal close"
example: |
  {
    "source": { "type": "sine", "frequency": { "start": 730, "end": 430 } },
    "envelope": { "attack": 0, "decay": 0.08, "sustain": 0, "release": 0.025 },
    "gain": 0.08
  }
---

## Modal-close - downward sine sweep

The inverse of `modalOpen`. Range is narrower because dismiss should feel less assertive than the entrance. Slightly lower `gain` for the same reason.

For `drawer-close` use 800 -> 350. For `dropdown-close` use 900 -> 500.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `modalClose`, `drawerClose`, `dropdownClose`.

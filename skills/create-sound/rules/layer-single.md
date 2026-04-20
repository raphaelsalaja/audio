---
title: Single layer - emit Layer directly
impact: HIGH
impactDescription: Default for transients (click, tap, tick, hover, swoosh). No wrapping, no delay book-keeping.
tags: layer, single
prompt: "single layer click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 60 } },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "gain": 0.18
  }
---

## Single layer - emit Layer directly

When the recipe needs only one source, emit the `Layer` shape directly (not wrapped in `{ layers: [...] }`). The engine accepts both, but the bare-Layer form is the canonical compact representation.

```ts
const sound: SoundDefinition = {
  source: { type: "sine", frequency: 1300 },
  envelope: { decay: 0.012, release: 0.004 },
  gain: 0.18,
};
```

Use this for: click, tap, tick, hover, focus, blur, scroll-snap, single-tone notifications, simple swooshes.

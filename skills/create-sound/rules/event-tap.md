---
title: Tap - static high sine + FM, ultra short
impact: HIGH
impactDescription: Quieter, sharper sibling of click. Used for keyboard taps and finger-tap interactions.
tags: event, tap, transient
prompt: "tap"
example: |
  {
    "source": { "type": "sine", "frequency": 1300, "fm": { "ratio": 0.5, "depth": 100 } },
    "envelope": { "attack": 0, "decay": 0.015, "sustain": 0, "release": 0.005 },
    "gain": 0.2
  }
---

## Tap - static high sine + FM, ultra short

Single high pitch (no sweep), aggressive FM, decay under 20 ms. This is the "key-press" archetype.

**Incorrect (frequency too low, sounds like a thump):**

```ts
{ source: { type: "sine", frequency: 200 }, envelope: { decay: 0.015 }, gain: 0.2 }
```

**Correct:**

```ts
{
  source: { type: "sine", frequency: 1300, fm: { ratio: 0.5, depth: 100 } },
  envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
  gain: 0.2,
}
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `tap`, `keyPress`.

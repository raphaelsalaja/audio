---
title: Click - sine + low FM, very short decay
impact: HIGH
impactDescription: Default click sound; appears in nearly every patch.
tags: event, click, transient
prompt: "click"
example: |
  {
    "source": { "type": "sine", "frequency": { "start": 200, "end": 700 }, "fm": { "ratio": 0.5, "depth": 80 } },
    "envelope": { "attack": 0, "decay": 0.06, "sustain": 0, "release": 0.02 },
    "gain": 0.25
  }
---

## Click - sine + low FM, very short decay

A short ascending sine sweep with light FM. The sweep gives the click "snap"; the FM adds harmonic body without making it metallic.

**Incorrect (decay too long, sounds like a chime):**

```ts
{ source: { type: "sine", frequency: 1300 }, envelope: { decay: 0.5 }, gain: 0.18 }
```

**Correct:**

```ts
{
  source: { type: "sine", frequency: { start: 200, end: 700 }, fm: { ratio: 0.5, depth: 80 } },
  envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
  gain: 0.25,
}
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `click`.

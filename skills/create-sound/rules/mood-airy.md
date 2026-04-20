---
title: Airy - noise source + bandpass with high peak
impact: LOW-MEDIUM
impactDescription: Whispery, breath-like quality. Used for swooshes, page transitions, ambient cues.
tags: mood, airy, noise, bandpass
prompt: "airy whoosh"
example: |
  {
    "source": { "type": "noise", "color": "white" },
    "filter": { "type": "bandpass", "frequency": 600, "resonance": 1.2, "envelope": { "attack": 0.04, "peak": 5000, "decay": 0.18 } },
    "envelope": { "attack": 0.03, "decay": 0.25, "sustain": 0, "release": 0.08 },
    "gain": 0.1
  }
---

## Airy - noise source + bandpass with high peak

Mutation:

- Replace `source` with `{ type: "noise", color: "white" }`.
- Replace `filter` with bandpass envelope reaching a high peak (4-6 kHz).
- Lengthen `envelope.attack` to 0.02-0.04 s so the result fades in rather than snapping.
- Lower `gain` to 0.08-0.12.

If the base was tonal (sine, triangle, etc.), this mood replaces the source entirely - it's a structural change.

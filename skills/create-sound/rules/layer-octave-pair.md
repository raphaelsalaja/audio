---
title: Octave pair - two layers an octave apart with delay
impact: MEDIUM
impactDescription: Toggles, copies, syncs, and confirmations that need exactly two beats.
tags: layer, octave, pair, delay
prompt: "two-layer toggle"
example: |
  {
    "layers": [
      { "source": { "type": "sine", "frequency": 1046 }, "envelope": { "decay": 0.012, "release": 0.004 }, "gain": 0.2 },
      { "source": { "type": "sine", "frequency": 2093 }, "envelope": { "decay": 0.012, "release": 0.004 }, "delay": 0.025, "gain": 0.18 }
    ]
  }
---

## Octave pair - two layers an octave apart with delay

Two layers a fifth or octave apart, separated by 20-50 ms `delay`. Direction (low first vs high first) encodes "on" vs "off", "open" vs "close", etc.

Layer gains should sum to less than 0.5. Both envelopes should match so the second beat doesn't sound disconnected.

If you find yourself reaching for >2 layers, jump to `layer-ascending-chord` instead.

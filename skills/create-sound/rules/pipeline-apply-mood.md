---
title: Apply mood adjectives onto the base layer
order: 3
impact: HIGH
impactDescription: Mood is what makes "click" different from "warm retro click". Apply each adjective as a structured mutation, not as a vibe.
tags: pipeline, mood, adjectives
---

## Apply mood adjectives onto the base layer

After `pipeline-pick-base-layer` produces a starting `SoundDefinition`, scan the prompt for adjective tokens and apply each `mood-*` rule's mutation in order.

### Order of application

1. Source-shape adjectives (`warm`, `bright`, `glassy`, `metallic`, `lofi`, `retro`, `organic`) - mutate `source.type`, `source.fm`, or add `filter`.
2. Envelope adjectives (`punchy`, `airy`) - mutate `envelope.attack` / `envelope.decay`.
3. Effect adjectives (`reverby`, `delayed`, `crushed`) - append to `effects`.

### Conflict resolution

- `warm` + `bright` -> the later token wins.
- `lofi` + `glassy` -> apply both, but cap `effects` at 2 entries.
- `punchy` + `airy` -> they're orthogonal (envelope vs source); both apply.

### Refinement on existing definition (audio + prompt path)

When the input mode is `prompt + audio`, treat each adjective as a refinement on the measured definition rather than from scratch:

| Adjective | Refinement                                                                    |
| --------- | ----------------------------------------------------------------------------- |
| warmer    | add or lower `filter.frequency` (lowpass at ~2500 Hz)                          |
| brighter  | remove lowpass or raise its cutoff above 6 kHz                                 |
| punchier  | clamp `envelope.decay <= 0.06`, set `envelope.attack: 0`                      |
| longer    | extend `envelope.decay` and add `release` if missing                          |
| crisper   | raise `gain` slightly and add `fm: { ratio: 0.5, depth: 50 }`                 |

### Output

A mutated `SoundDefinition`. Hand off to `pipeline-decide-layering`.

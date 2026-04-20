---
title: Detect input mode and route the request
order: 1
impact: CRITICAL
impactDescription: First step. Wrong routing means the agent runs the wrong sub-pipeline and produces a SoundDefinition that doesn't match the user's intent.
tags: pipeline, routing, input
---

## Detect input mode and route the request

Decide which path to run based on what the user provided.

| Input                                    | Path                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| Prompt only (no audio attachment)        | Skip `interpret-*`. Go to `pipeline-pick-base-layer`.         |
| Audio file only                          | Run all `interpret-*` rules. Skip `event-*` / `mood-*`.       |
| Both prompt and audio                    | Run `interpret-*` first, then treat the prompt as a refinement layer over the measured `SoundDefinition`. |

### Detecting audio

Look for attached files matching `*.wav`, `*.mp3`, `*.flac`, `*.ogg`, or any path the user references that resolves to an audio file. A JSON manifest (`*.json` next to a sprite) is also an audio-path signal.

### Refinement examples (prompt + audio)

| Prompt qualifier           | Refinement on measured definition                              |
| -------------------------- | -------------------------------------------------------------- |
| "warmer"                   | add `filter: { type: "lowpass", frequency: 2500 }`             |
| "shorter" / "punchier"     | clamp `envelope.decay` to `<= 0.06`                            |
| "brighter"                 | drop or raise any lowpass cutoff                                |
| "with reverb"              | append `effects: [{ type: "reverb", decay: 0.5, mix: 0.15 }]`  |
| "lower octave"             | halve `source.frequency` (or both `start`/`end`)               |

### Output of this step

Produce an internal note like:

```
Input: prompt + audio
Plan: run interpret-* on out/click.wav, then refine with mood-warm.
```

Then proceed to the next pipeline step.

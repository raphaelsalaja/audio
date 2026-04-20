---
title: Emit, optionally render, optionally round-trip
order: 5
impact: HIGH
impactDescription: Final step. Defines the output contract returned to the user.
tags: pipeline, emit, render, round-trip
---

## Emit, optionally render, optionally round-trip

### 1. Emit

Always return a TypeScript snippet ready to paste into a `.web-kits/<patch>.ts` file:

```ts
import type { SoundDefinition } from "@web-kits/audio";

export const myClick: SoundDefinition = {
  source: { type: "sine", frequency: 1300, fm: { ratio: 0.5, depth: 60 } },
  envelope: { decay: 0.012, release: 0.004 },
  gain: 0.18,
};
```

Plus a one-line rationale that names the prompt tokens you acted on:

> "click" -> base from `event-click`; "warm" -> kept default sine, no extra filter needed at 1.3 kHz.

### 2. Optional preview render

If the user asked for a WAV (or you want to grade your own output), use [`packages/audio/src/offline.ts`](../../../packages/audio/src/offline.ts):

```ts
import { renderToWav } from "@web-kits/audio";
import { writeFile } from "node:fs/promises";

const blob = await renderToWav(myClick, { duration: 0.3 });
await writeFile("preview.wav", Buffer.from(await blob.arrayBuffer()));
```

`duration` should be `attack + decay + release + 0.05` (small tail) or longer if reverb is present.

### 3. Optional round-trip validation

If you generated from a prompt and want to confirm the result matches intent, run the `interpret-*` rules against the rendered WAV and diff measured vs intended values:

| Field             | Acceptable drift                            |
| ----------------- | ------------------------------------------- |
| Fundamental Hz    | ±5%                                         |
| Attack            | ±2 ms                                       |
| Decay             | ±10%                                        |
| Spectral centroid | ±20% of expected for the chosen waveform    |

If drift exceeds tolerance, refine the definition (often by raising/lowering `gain`, tightening `envelope`, or adjusting `filter.frequency`) and render again.

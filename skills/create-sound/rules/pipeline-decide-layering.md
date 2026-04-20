---
title: Decide single-layer vs multi-layer
order: 4
impact: MEDIUM-HIGH
impactDescription: Layering changes whether the result is a Layer or a MultiLayerSound. Get this wrong and emission/validation breaks.
tags: pipeline, layers
---

## Decide single-layer vs multi-layer

| Event class                                | Default                                  |
| ------------------------------------------ | ---------------------------------------- |
| click, tap, tick, hover, focus, swoosh     | 1 layer (`Layer`)                        |
| toggle, copy, send, sync                   | 2 layers (paired pitches with `delay`)   |
| success, complete, level-up, confetti      | 3+ layers (chord with cascading `delay`) |
| error, delete                              | 2 layers (`sawtooth` + `square`)         |

See `layer-single`, `layer-octave-pair`, `layer-ascending-chord`, `layer-click-plus-body` for the concrete shapes.

### Promoting a single Layer to MultiLayerSound

If the prompt or refinement requires more than one layer, wrap:

```ts
{
  layers: [<existing layer>, <new layer>],
  // optional global effects, e.g. sidechain compressor, master EQ
}
```

Per-layer `gain` values should sum to no more than ~0.6 (see `validate-gain-budget`).

### Demoting MultiLayerSound to a single Layer

If only one layer survives mood application, emit the inner `Layer` directly rather than a one-element `MultiLayerSound`. Both validate, but the single-layer form is the canonical compact shape.

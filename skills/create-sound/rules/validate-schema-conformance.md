---
title: Schema conformance - validate against patch.schema.json
impact: CRITICAL
impactDescription: A SoundDefinition that doesn't match the schema will throw at runtime when the engine builds nodes.
tags: validate, schema, json-schema
---

## Schema conformance - validate against patch.schema.json

Every emitted `SoundDefinition` must validate against [packages/audio/schemas/patch.schema.json](../../../packages/audio/schemas/patch.schema.json) (`#/$defs/SoundDefinition`).

Common mistakes:

- Missing `decay` in `envelope` (required).
- Missing `target` in `lfo` (required).
- Setting `pan` outside `[-1, 1]`.
- Using a `filter.type` that isn't one of `lowpass | highpass | bandpass | notch | allpass | peaking | lowshelf | highshelf | iir`.
- Adding a top-level field that isn't in `Layer` or `MultiLayerSound` (e.g. `name`, `description`). The schema is `additionalProperties: false`.
- Confusing `MultiLayerSound.effects` (chain on the mixed bus) with `Layer.effects` (chain on a single layer).

The `validate` script invokes the JSON Schema validator on every rule's `example` field. Any violation aborts the build.

# Sections

Section metadata consumed by `src/build.mjs`. Filename prefix maps to one entry below.

```yaml
sections:
  - prefix: pipeline
    title: Generation Pipeline
    description: Procedural steps the agent runs end-to-end. Start here when handling any create-sound request.
  - prefix: interpret
    title: Audio Interpretation
    description: FFT analysis sub-steps that fire when the user shares an audio file.
  - prefix: event
    title: UI Event Recipes
    description: Concrete SoundDefinition templates per UI event class. Used by the prompt path as the base layer.
  - prefix: mood
    title: Mood Vocabulary
    description: Adjective-to-knob mappings layered onto the base recipe.
  - prefix: layer
    title: Layering Patterns
    description: When to use one layer vs two vs a chord stack.
  - prefix: effect
    title: Effect Recipes
    description: When and how to reach for each effect type.
  - prefix: validate
    title: Output Validation
    description: Checks every emitted SoundDefinition must pass before returning to the user.
```

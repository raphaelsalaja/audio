---
title: Short rule title here
impact: MEDIUM
impactDescription: One-line note about why this rule matters
tags: event, click
prompt: "click"
example: |
  {
    "source": { "type": "sine", "frequency": 1300 },
    "envelope": { "decay": 0.012, "release": 0.004 },
    "gain": 0.18
  }
---

## Short rule title here

Brief explanation of when and why to apply this rule.

**Incorrect (describe what's wrong):**

```ts
{ source: { type: "sine", frequency: 1300 }, envelope: { decay: 0.5 }, gain: 0.18 }
```

**Correct:**

```ts
{ source: { type: "sine", frequency: 1300 }, envelope: { decay: 0.012, release: 0.004 }, gain: 0.18 }
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `<sound-name>`.

## Frontmatter fields

- `title` (required) - short human-readable label.
- `impact` (required) - one of CRITICAL, HIGH, MEDIUM-HIGH, MEDIUM, LOW-MEDIUM, LOW.
- `impactDescription` (optional) - one-line context.
- `tags` (optional) - comma-separated.
- `prompt` (optional) - input the rule should match. Used by `extract-tests.mjs`.
- `example` (optional) - JSON SoundDefinition the rule should produce. Used by `validate.mjs` and `extract-tests.mjs`.
- `inputAudio` (optional, interpret-* only) - relative path to a WAV the rule should analyze.

## Filename

`<section-prefix>-<short-name>.md`. Section prefixes are listed in `_sections.md`.

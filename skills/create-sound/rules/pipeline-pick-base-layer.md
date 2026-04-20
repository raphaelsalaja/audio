---
title: Pick a base layer from the prompt's event class
order: 2
impact: CRITICAL
impactDescription: The base recipe sets the timbral skeleton. Picking the wrong event class makes mood adjustments fight the base.
tags: pipeline, base, event
---

## Pick a base layer from the prompt's event class

Tokenize the prompt and find the strongest event-class signal. Match against the `event-*` rules.

### Token map

| Tokens in prompt                                              | Event rule              |
| ------------------------------------------------------------- | ----------------------- |
| click, tap, key, press, button                                | `event-click` / `event-tap` |
| tick, scroll, snap, focus                                     | `event-tick`            |
| success, complete, win, achievement, level-up, confetti       | `event-success` / `event-complete` |
| error, fail, wrong, invalid, delete, destroy                  | `event-error`           |
| modal, dialog, popup, drawer, sheet, sidebar, dropdown, menu  | `event-modal-open` / `event-modal-close` |
| swoosh, slide, transition, page, tab                          | `event-swoosh` / `event-whoosh` |
| notification, alert, ding, bell, mention, badge               | `event-notification`    |
| toggle, switch, on, off                                       | `event-toggle`          |

### Direction tokens (open vs close)

- "open", "appear", "in", "show", "expand", "confirm" -> ascending pitch.
- "close", "dismiss", "out", "hide", "collapse", "cancel" -> descending pitch.

### Output

A starting `SoundDefinition` literal copied from the chosen event rule's `example`. The next step (`pipeline-apply-mood`) will mutate it.

If no event class fires confidently, default to `event-click` and let mood adjectives do the work.

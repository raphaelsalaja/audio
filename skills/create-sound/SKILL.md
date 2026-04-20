---
name: create-sound
description: >-
  Generate a SoundDefinition for @web-kits/audio from any input - a
  natural-language prompt, an audio file the user shares, or both. Use when the
  user says "create a sound", "/create-sound", "design a sound for X", shares a
  WAV/MP3/sprite, or asks to reverse-engineer a sample. Optionally renders a WAV
  preview and round-trip-validates the result.
---

# Create Sound

> Generated from `rules/*.md` by `src/build.mjs`. Do not edit by hand.

Pick a generation path with `pipeline-detect-input`, then walk the matching section.

## 1. Generation Pipeline

_Procedural steps the agent runs end-to-end. Start here when handling any create-sound request._

### 1.1 Detect input mode and route the request _(CRITICAL)_

Decide which path to run based on what the user provided.

| Input                                    | Path                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| Prompt only (no audio attachment)        | Skip `interpret-*`. Go to `pipeline-pick-base-layer`.         |
| Audio file only                          | Run all `interpret-*` rules. Skip `event-*` / `mood-*`.       |
| Both prompt and audio                    | Run `interpret-*` first, then treat the prompt as a refinement layer over the measured `SoundDefinition`. |

#### Detecting audio

Look for attached files matching `*.wav`, `*.mp3`, `*.flac`, `*.ogg`, or any path the user references that resolves to an audio file. A JSON manifest (`*.json` next to a sprite) is also an audio-path signal.

#### Refinement examples (prompt + audio)

| Prompt qualifier           | Refinement on measured definition                              |
| -------------------------- | -------------------------------------------------------------- |
| "warmer"                   | add `filter: { type: "lowpass", frequency: 2500 }`             |
| "shorter" / "punchier"     | clamp `envelope.decay` to `<= 0.06`                            |
| "brighter"                 | drop or raise any lowpass cutoff                                |
| "with reverb"              | append `effects: [{ type: "reverb", decay: 0.5, mix: 0.15 }]`  |
| "lower octave"             | halve `source.frequency` (or both `start`/`end`)               |

#### Output of this step

Produce an internal note like:

```
Input: prompt + audio
Plan: run interpret-* on out/click.wav, then refine with mood-warm.
```

Then proceed to the next pipeline step.

### 1.2 Pick a base layer from the prompt's event class _(CRITICAL)_

Tokenize the prompt and find the strongest event-class signal. Match against the `event-*` rules.

#### Token map

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

#### Direction tokens (open vs close)

- "open", "appear", "in", "show", "expand", "confirm" -> ascending pitch.
- "close", "dismiss", "out", "hide", "collapse", "cancel" -> descending pitch.

#### Output

A starting `SoundDefinition` literal copied from the chosen event rule's `example`. The next step (`pipeline-apply-mood`) will mutate it.

If no event class fires confidently, default to `event-click` and let mood adjectives do the work.

### 1.3 Apply mood adjectives onto the base layer _(HIGH)_

After `pipeline-pick-base-layer` produces a starting `SoundDefinition`, scan the prompt for adjective tokens and apply each `mood-*` rule's mutation in order.

#### Order of application

1. Source-shape adjectives (`warm`, `bright`, `glassy`, `metallic`, `lofi`, `retro`, `organic`) - mutate `source.type`, `source.fm`, or add `filter`.
2. Envelope adjectives (`punchy`, `airy`) - mutate `envelope.attack` / `envelope.decay`.
3. Effect adjectives (`reverby`, `delayed`, `crushed`) - append to `effects`.

#### Conflict resolution

- `warm` + `bright` -> the later token wins.
- `lofi` + `glassy` -> apply both, but cap `effects` at 2 entries.
- `punchy` + `airy` -> they're orthogonal (envelope vs source); both apply.

#### Refinement on existing definition (audio + prompt path)

When the input mode is `prompt + audio`, treat each adjective as a refinement on the measured definition rather than from scratch:

| Adjective | Refinement                                                                    |
| --------- | ----------------------------------------------------------------------------- |
| warmer    | add or lower `filter.frequency` (lowpass at ~2500 Hz)                          |
| brighter  | remove lowpass or raise its cutoff above 6 kHz                                 |
| punchier  | clamp `envelope.decay <= 0.06`, set `envelope.attack: 0`                      |
| longer    | extend `envelope.decay` and add `release` if missing                          |
| crisper   | raise `gain` slightly and add `fm: { ratio: 0.5, depth: 50 }`                 |

#### Output

A mutated `SoundDefinition`. Hand off to `pipeline-decide-layering`.

### 1.4 Decide single-layer vs multi-layer _(MEDIUM-HIGH)_

| Event class                                | Default                                  |
| ------------------------------------------ | ---------------------------------------- |
| click, tap, tick, hover, focus, swoosh     | 1 layer (`Layer`)                        |
| toggle, copy, send, sync                   | 2 layers (paired pitches with `delay`)   |
| success, complete, level-up, confetti      | 3+ layers (chord with cascading `delay`) |
| error, delete                              | 2 layers (`sawtooth` + `square`)         |

See `layer-single`, `layer-octave-pair`, `layer-ascending-chord`, `layer-click-plus-body` for the concrete shapes.

#### Promoting a single Layer to MultiLayerSound

If the prompt or refinement requires more than one layer, wrap:

```ts
{
  layers: [<existing layer>, <new layer>],
  // optional global effects, e.g. sidechain compressor, master EQ
}
```

Per-layer `gain` values should sum to no more than ~0.6 (see `validate-gain-budget`).

#### Demoting MultiLayerSound to a single Layer

If only one layer survives mood application, emit the inner `Layer` directly rather than a one-element `MultiLayerSound`. Both validate, but the single-layer form is the canonical compact shape.

### 1.5 Emit, optionally render, optionally round-trip _(HIGH)_

#### 1. Emit

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

#### 2. Optional preview render

If the user asked for a WAV (or you want to grade your own output), use [`packages/audio/src/offline.ts`](../../../packages/audio/src/offline.ts):

```ts
import { renderToWav } from "@web-kits/audio";
import { writeFile } from "node:fs/promises";

const blob = await renderToWav(myClick, { duration: 0.3 });
await writeFile("preview.wav", Buffer.from(await blob.arrayBuffer()));
```

`duration` should be `attack + decay + release + 0.05` (small tail) or longer if reverb is present.

#### 3. Optional round-trip validation

If you generated from a prompt and want to confirm the result matches intent, run the `interpret-*` rules against the rendered WAV and diff measured vs intended values:

| Field             | Acceptable drift                            |
| ----------------- | ------------------------------------------- |
| Fundamental Hz    | ±5%                                         |
| Attack            | ±2 ms                                       |
| Decay             | ±10%                                        |
| Spectral centroid | ±20% of expected for the chosen waveform    |

If drift exceeds tolerance, refine the definition (often by raising/lowering `gain`, tightening `envelope`, or adjusting `filter.frequency`) and render again.

## 2. Audio Interpretation

_FFT analysis sub-steps that fire when the user shares an audio file._

### 2.1 Acquire and split source audio _(HIGH)_

The user shared a single file or a sprite (one file containing many sounds). Before any FFT work, get one mono WAV per sound on disk.

#### Sprite from an npm package

```bash
npm pack <package-name> --pack-destination /tmp
tar -xzf /tmp/<package-name>-*.tgz -C /tmp
```

Look for the MP3/WAV plus any JSON manifest mapping sound names to time offsets.

#### Manifest-driven slicing

```bash
ffmpeg -i sprite.mp3 \
  -ss <start_seconds> -t <duration_seconds> \
  -acodec pcm_s16le -ar 44100 \
  output/<name>.wav
```

#### Silence-detection slicing (no manifest)

```bash
ffmpeg -i sprite.mp3 -af silencedetect=noise=-40dB:d=0.05 -f null -
```

Read the `silence_start`/`silence_end` lines and slice between gaps.

#### Output convention

Per-sound WAVs go in `out/<name>.wav` (mono, 44.1 kHz, 16-bit PCM). Downstream interpret rules call `analyze.load_mono(path)` from [src/analyze.py](../src/analyze.py).

### 2.2 Extract fundamental frequency and pitch sweep _(HIGH)_

Sample the spectrum at multiple time slices to detect both the static pitch and any sweep.

```python
from analyze import load_mono, analyze_slice

sample_rate, data = load_mono("out/click.wav")

slices = [0, 5, 10, 20, 50]  # ms
freqs_over_time = [analyze_slice(data, sample_rate, t) for t in slices]
```

#### Mapping

| Observation                         | Output                                            |
| ----------------------------------- | ------------------------------------------------- |
| All slices within ±5%               | `source.frequency: <Hz>` (static)                  |
| Decreasing across slices            | `source.frequency: { start: <high>, end: <low> }`  |
| Increasing across slices            | `source.frequency: { start: <low>, end: <high> }`  |

#### Tips

- Skip the first 1-2 ms if the onset is a click transient; it pollutes the FFT.
- For very short sounds (< 20 ms) use fewer slices and a smaller window.
- Use a Hanning window before FFT (already applied in `analyze_slice`) to reduce spectral leakage.

### 2.3 Extract ADSR envelope from amplitude _(HIGH)_

Smooth the time-domain amplitude, find onset/peak/sustain/end, and derive each ADSR stage.

```python
from analyze import load_mono, extract_envelope

sample_rate, data = load_mono("out/click.wav")
env = extract_envelope(data, sample_rate)
# -> { "attack": 0.0008, "decay": 0.012, "sustain": 0.0, "release": 0.005 }
```

#### Output shape

The dict maps 1:1 to the `Envelope` type:

```ts
envelope: {
  attack: env.attack,    // 0 if percussive
  decay: env.decay,
  sustain: env.sustain,  // 0 for transient sounds, 0-1 for sustained
  release: env.release,
}
```

#### Heuristics

- `sustain < 0.01` -> drop the field; the sound is percussive.
- `attack < 0.001` -> set `attack: 0`.
- `release < 0.005` -> clamp to `0.005` to avoid clicks at the end.

### 2.4 Classify oscillator waveform from harmonics _(HIGH)_

Compare the amplitude of the first 8 harmonics against the fundamental.

```python
import numpy as np
from scipy.fft import rfft, rfftfreq
from analyze import classify_waveform

segment = data[:int(sample_rate * 0.02)].astype(float)
segment *= np.hanning(len(segment))
spectrum = np.abs(rfft(segment))
freqs = rfftfreq(len(segment), 1 / sample_rate)

waveform = classify_waveform(spectrum, freqs, fundamental_freq)
# -> "sine" | "triangle" | "square" | "sawtooth" | "wavetable"
```

#### Mapping

| Pattern                                         | `source.type` |
| ----------------------------------------------- | ------------- |
| Fundamental only, harmonics < -40 dB            | `sine`        |
| Odd harmonics rolling off as 1/n                | `triangle`    |
| Odd harmonics at roughly equal amplitude        | `square`      |
| All harmonics rolling off as 1/n                | `sawtooth`    |
| Custom harmonic profile (none of the above)    | `wavetable`   |
| No clear harmonic structure, broadband energy   | `noise`       |

#### When to fall back to wavetable

If the harmonic profile doesn't match a clean oscillator, extract the harmonic series instead:

```python
from analyze import extract_harmonics
harmonics = extract_harmonics(spectrum, freqs, fundamental_freq, num_harmonics=16)
# -> { source: { type: "wavetable", harmonics, frequency: fundamental_freq } }
```

#### Noise color

For broadband signals with no fundamental, classify by spectral slope:

```python
from analyze import classify_noise_color
color = classify_noise_color(spectrum, freqs)  # "white" | "pink" | "brown"
# -> { source: { type: "noise", color } }
```

### 2.5 Detect filter type, cutoff, and resonance _(MEDIUM-HIGH)_

Compare the measured spectrum against the expected spectrum for the identified oscillator.

#### Cutoff via spectral centroid

```python
from analyze import spectral_centroid
centroid = spectral_centroid(spectrum, freqs)
```

Expected centroids at a 440 Hz fundamental: sine ~440, triangle ~880, sawtooth ~2200, square ~1760. If the measured centroid is significantly lower than expected, a `lowpass` is present; estimate cutoff at the -3 dB point.

#### Filter type from rolloff

| Observation                                                        | `filter.type`   |
| ------------------------------------------------------------------ | --------------- |
| High-frequency rolloff steeper than the source would produce       | `lowpass`       |
| Low-frequency rolloff                                              | `highpass`      |
| Narrow band of frequencies passes through                           | `bandpass`      |
| Narrow notch removed                                                | `notch`         |
| Resonant peak near cutoff                                          | High `resonance`|

#### Resonance (Q)

```python
from analyze import estimate_resonance
q = estimate_resonance(spectrum, freqs, cutoff_hz)
# Returns 0.1 - 20.0
```

#### Filter envelope

If brightness changes over time (bright attack fading to dull), there's a filter envelope:

```python
from analyze import detect_filter_envelope
env = detect_filter_envelope(data, sample_rate)
# -> { "peak": 4000, "resting": 800, "decay_ms": 50 } or None
```

Maps to:

```ts
filter: {
  type: "lowpass",
  frequency: env.resting,
  envelope: { attack: 0, peak: env.peak, decay: env.decay_ms / 1000 },
}
```

### 2.6 Detect post-source effects _(MEDIUM)_

Each detector returns a confidence-flavored hint, not a guarantee. Effects are harder to extract than source/envelope - report low confidence when ambiguous.

#### Reverb

```python
from analyze import detect_reverb
result = detect_reverb(data, sample_rate, envelope_end_ms=120)
# -> { "type": "reverb", "decay": 0.6 } or None
```

#### Delay (autocorrelation)

```python
from analyze import detect_delay
result = detect_delay(data, sample_rate)
# -> { "type": "delay", "time": 0.25, "feedback": 0.3 } or None
```

#### FM synthesis

Spectral sidebands at non-integer ratios of the fundamental indicate FM:

```python
from analyze import detect_fm
fm = detect_fm(spectrum, freqs, fundamental_freq)
# -> { "fm": { "ratio": 0.5, "depth": 80 } } or None
```

Maps to `source.fm: { ratio, depth }` (not a separate effect).

#### Tremolo and vibrato

Periodic amplitude or frequency modulation in the 1-20 Hz band suggests tremolo/vibrato. Track amplitude or pitch over time and call `detect_lfo` (see `interpret-detect-lfo`).

#### Bitcrusher / distortion

| Time-domain signature                             | Effect       |
| ------------------------------------------------- | ------------ |
| Stepped/quantized waveform with aliasing artifacts | `bitcrusher` |
| Flat-topped waveform with added harmonics         | `distortion` |

#### Chorus / flanger / phaser

Comb-filter pattern that sweeps over time produces moving notches in the spectrum. Hard to disambiguate algorithmically; flag for human review.

### 2.7 Detect LFO modulation _(LOW-MEDIUM)_

An LFO is sub-audio (0.1-20 Hz) periodic modulation of a parameter. Track the parameter over time, then run `detect_lfo`.

```python
from analyze import detect_lfo

# 1. Track amplitude (or pitch, or spectral centroid) at regular intervals
window_ms = 10
samples_per_window = int(sample_rate * window_ms / 1000)
amp_over_time = [
    float(np.max(np.abs(data[i:i + samples_per_window])))
    for i in range(0, len(data) - samples_per_window, samples_per_window)
]

# 2. Detect periodicity
lfo = detect_lfo(np.array(amp_over_time), 1000 / window_ms)
# -> { "frequency": 5.0, "depth": 0.12 } or None
```

#### Mapping by tracked parameter

| Parameter tracked   | LFO target              |
| ------------------- | ----------------------- |
| Amplitude           | `gain`                  |
| Pitch               | `frequency` or `detune` |
| Spectral centroid   | `filter.frequency`      |
| Pan position        | `pan`                   |

#### Output

```ts
lfo: { type: "sine", frequency: lfo.frequency, depth: lfo.depth, target: "gain" }
```

Pick `type` based on the shape of the modulation: smooth sinusoid -> `sine`, sharp ramp -> `sawtooth`, hard switching -> `square`.

### 2.8 Detect multi-layer sounds and stereo positioning _(MEDIUM)_

#### Multiple fundamentals -> MultiLayerSound

Inspect peaks in the spectrum. If two or more strong peaks are not integer multiples of one shared fundamental, the sound is layered.

```python
from scipy.signal import find_peaks

peaks, props = find_peaks(spectrum, height=float(np.max(spectrum)) * 0.2)
peak_freqs = sorted(freqs[peaks])

# Check pairwise ratios. If no shared fundamental explains all peaks, treat as layered.
```

For each detected fundamental, run the full pipeline (frequency, envelope, waveform, filter, effects) and emit one `Layer` per fundamental:

```ts
{
  layers: [
    { source: { ... }, envelope: { ... }, gain: 0.2 },
    { source: { ... }, envelope: { ... }, gain: 0.15, delay: 0.04 },
  ]
}
```

The earlier layer typically gets `delay: 0` (omitted); subsequent layers offset their `delay` to match the measured onset gap.

#### Stereo and pan

```python
from analyze import analyze_stereo
stereo = analyze_stereo(data)
# -> { "pan": 0.3, "stereo_width": 0.7 }
```

| `pan` magnitude | Output                          |
| --------------- | ------------------------------- |
| `< 0.05`        | omit (`pan: 0` is default)      |
| `0.05 - 1`      | `pan: <value>`                  |

`stereo_width > 0.5` with `|pan| < 0.05` suggests a stereo effect (chorus, dual-layer). Consider splitting into two layers panned `-0.5` / `+0.5`.

#### Fallback

If a sound is unsynthesizable (complex transients, recorded material, irreducible texture), fall back to:

```ts
{ source: { type: "sample", url: "..." } }
```

and note that the original audio file should be used directly rather than re-synthesized.

## 3. UI Event Recipes

_Concrete SoundDefinition templates per UI event class. Used by the prompt path as the base layer._

### 3.1 Click - sine + low FM, very short decay _(HIGH)_

A short ascending sine sweep with light FM. The sweep gives the click "snap"; the FM adds harmonic body without making it metallic.

**Incorrect (decay too long, sounds like a chime):**

```ts
{ source: { type: "sine", frequency: 1300 }, envelope: { decay: 0.5 }, gain: 0.18 }
```

**Correct:**

```ts
{
  source: { type: "sine", frequency: { start: 200, end: 700 }, fm: { ratio: 0.5, depth: 80 } },
  envelope: { attack: 0, decay: 0.06, sustain: 0, release: 0.02 },
  gain: 0.25,
}
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `click`.

### 3.2 Complete - four-note ascending arpeggio _(MEDIUM-HIGH)_

Same C-major triad as `success`, but with C6 added on top and tighter 15 ms `delay` increments so the notes blur into a single gesture rather than reading as discrete pitches.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `complete`.

### 3.3 Error - layered sawtooth + square with descending sweep _(HIGH)_

Two descending sweeps stacked an octave apart. Lowpass filters keep the result from being abrasive. Same shape works for `delete` (slightly longer decay).

**Incorrect (no filter, sounds like a buzzer):**

```ts
{ source: { type: "sawtooth", frequency: { start: 320, end: 140 } }, envelope: { decay: 0.25 }, gain: 0.22 }
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `error`, `_delete`.

### 3.4 Modal-close - downward sine sweep _(MEDIUM)_

The inverse of `modalOpen`. Range is narrower because dismiss should feel less assertive than the entrance. Slightly lower `gain` for the same reason.

For `drawer-close` use 800 -> 350. For `dropdown-close` use 900 -> 500.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `modalClose`, `drawerClose`, `dropdownClose`.

### 3.5 Modal-open - upward sine sweep _(MEDIUM)_

A single sine sweeping from ~430 Hz up to ~1400 Hz over 80 ms. No FM, no filter; the cleanness signals "appearing".

For `drawer-open` use a slightly lower start (~350 Hz) and lower gain (~0.08).
For `dropdown-open` use a smaller range (500 -> 1200) and decay ~60 ms.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `modalOpen`, `drawerOpen`, `dropdownOpen`.

### 3.6 Notification - FM-rich sine with light reverb _(HIGH)_

Two FM bells a fifth apart with 100 ms `delay` between them. The `fm.ratio: 1.5` gives an inharmonic shimmer; the matched reverb on each layer glues them together.

For `ding`: single layer, `fm.ratio: 3.5`, reverb `decay: 0.8`.
For `mention`: lower fundamental (660 Hz), `fm.ratio: 2.5`, slightly more attack.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `notification`, `ding`, `mention`, `badge`.

### 3.7 Success - ascending three-note sine chord _(HIGH)_

Three sine layers at C5 / E5 / G5 with `delay` cascading 0.07 s between them. The top note has a small upward sweep (G5 -> A5) so the chord resolves "upward" instead of just stopping.

Layer gains sum to 0.45, comfortably under the 0.6 budget.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `success`.

### 3.8 Swoosh - white noise through a sweeping bandpass _(MEDIUM)_

White noise is shaped by a bandpass filter whose center frequency sweeps from 300 Hz up to 4 kHz. The sweep direction is the gesture: peak above resting = upward swoosh, peak below resting (e.g., resting 2500, peak 400) = downward.

For `slide-up` use a similar shape with peak 3500. For `slide-down` flip to pink noise with `envelope: { decay: 0.12, peak: 500 }` (no attack on the filter envelope).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `swoosh`, `slide`, `slideUp`, `slideDown`.

### 3.9 Tap - static high sine + FM, ultra short _(HIGH)_

Single high pitch (no sweep), aggressive FM, decay under 20 ms. This is the "key-press" archetype.

**Incorrect (frequency too low, sounds like a thump):**

```ts
{ source: { type: "sine", frequency: 200 }, envelope: { decay: 0.015 }, gain: 0.2 }
```

**Correct:**

```ts
{
  source: { type: "sine", frequency: 1300, fm: { ratio: 0.5, depth: 100 } },
  envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
  gain: 0.2,
}
```

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `tap`, `keyPress`.

### 3.10 Tick - faintest possible sine _(MEDIUM)_

Highest frequency in the tap family. Decay under 15 ms. `gain` capped at ~0.15 because ticks fire often and must not dominate.

For scroll-snap reduce `gain` to 0.08; for focus/blur reduce to 0.04-0.06.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `tick`, `scrollSnap`, `focus`, `blur`.

### 3.11 Toggle - paired sines with delay (direction matters) _(MEDIUM)_

Two short sines: C7 (2093 Hz) and G7 (3136 Hz), 25 ms apart.

- `toggle-on`: low note first, then high (ascending = enabling).
- `toggle-off`: high note first, then low (descending = disabling).

The same architecture works for `copy` (1200 Hz then 1400 Hz, 40 ms gap) and `sync` (C5 then G5).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `toggleOn`, `toggleOff`, `copy`, `sync`.

### 3.12 Whoosh - longer, slower swoosh for full-page transitions _(LOW-MEDIUM)_

Same architecture as `swoosh` but everything stretches. Filter attack is 4x longer (0.04 s vs 0.01 s) so the gesture starts gently. Slightly higher `gain` because it spans a longer time window.

`pageEnter` uses bandpass peak 3000 with white noise; `pageExit` uses pink noise with the bandpass envelope inverted (decay only, peak 400).

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `whoosh`, `pageEnter`, `pageExit`.

## 4. Mood Vocabulary

_Adjective-to-knob mappings layered onto the base recipe._

### 4.1 Airy - noise source + bandpass with high peak _(LOW-MEDIUM)_

Mutation:

- Replace `source` with `{ type: "noise", color: "white" }`.
- Replace `filter` with bandpass envelope reaching a high peak (4-6 kHz).
- Lengthen `envelope.attack` to 0.02-0.04 s so the result fades in rather than snapping.
- Lower `gain` to 0.08-0.12.

If the base was tonal (sine, triangle, etc.), this mood replaces the source entirely - it's a structural change.

### 4.2 Bright - no lowpass, optional FM sparkle _(MEDIUM)_

Mutation:

- Remove any `filter` of type `lowpass`, or raise its cutoff above 6 kHz.
- If the base used `triangle`, upgrade to `sine` with `fm: { ratio: 2.5, depth: 50 }` for sparkle.
- Slight `gain` bump (+0.02) is fine but stay under the budget.

### 4.3 Glassy - high FM ratio + reverb _(MEDIUM)_

Mutation:

- `source.type: "sine"`.
- `source.fm: { ratio: 3.5, depth: 200-300 }`.
- Append `effects: [{ type: "reverb", decay: 0.7, damping: 0.5, mix: 0.15 }]`.
- Extend `envelope.decay` to at least 0.3 s so the bell can ring.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `ding`, `sparkle`, `star`.

### 4.4 Lo-fi - bitcrusher + lowpass _(MEDIUM)_

Mutation:

- Add `filter: { type: "lowpass", frequency: 1500 }`.
- Append `effects: [{ type: "bitcrusher", bits: 6-8, mix: 0.7-1 }]`.
- Optionally drop `gain` by 0.02 because bitcrushing adds perceived loudness.

Combines well with `mood-retro`.

### 4.5 Metallic - inharmonic FM ratio _(MEDIUM)_

Mutation:

- `source.type: "sine"` (or `square` for a harsher result).
- `source.fm: { ratio: 2.76, depth: 300-400 }` - 2.76 is the inharmonic ratio used by `badge` in `.web-kits/core.ts` and reads as bell-metal.
- Short release; metallic shouldn't sustain.

Avoid stacking with `mood-warm` - they cancel each other out.

Reference: [.web-kits/core.ts](../../../.web-kits/core.ts) `badge`.

### 4.6 Organic - triangle + slight detune + light reverb _(LOW-MEDIUM)_

Mutation:

- `source.type: "triangle"`.
- Add `source.detune: 5-10` for very slight pitch wobble.
- Bump `envelope.attack` from 0 to 0.003-0.008 s so the onset isn't a hard click.
- Append a small reverb (`mix: 0.05-0.1`).

Combines well with `mood-warm`. Avoid combining with `mood-metallic` or `mood-lofi` - they fight the natural feel.

### 4.7 Punchy - zero attack, very short decay _(MEDIUM)_

Mutation:

- `envelope.attack: 0`.
- `envelope.decay: <= 0.06`.
- `envelope.sustain: 0`.
- `envelope.release: <= 0.015`.
- `gain` bump of +0.05 is fine because the energy lives in a shorter window.

Orthogonal to source-shape moods - apply on top of warm/bright/glassy/metallic.

### 4.8 Retro - square or sawtooth + lowpass + bitcrusher _(MEDIUM)_

Mutation:

- `source.type: "square"` (or `"sawtooth"`).
- Add `filter: { type: "lowpass", frequency: 3000 }` to soften aliasing.
- Append `effects: [{ type: "bitcrusher", bits: 8, sampleRateReduction: 2-4, mix: 1 }]`.

Pairs naturally with rising or stepped pitch sweeps (coins, power-ups).

### 4.9 Warm - lowpass + light reverb _(MEDIUM)_

Mutation applied on top of the base recipe:

- Add `filter: { type: "lowpass", frequency: 2500 }` (or 2-3 kHz).
- Optionally add `effects: [{ type: "reverb", decay: 0.4, mix: 0.1 }]`.
- If the base used `sawtooth` or `square`, downgrade to `triangle` so the source itself is rounder.

If the base already had a lowpass, lower its cutoff by ~30%.

## 5. Layering Patterns

_When to use one layer vs two vs a chord stack._

### 5.1 Ascending chord - 3-4 layers with cascading delay _(MEDIUM)_

3-4 sine layers spelling out a major triad (C-E-G or C-E-G-C). `delay` increments by ~70 ms for "feels like notes" or ~15 ms for "feels like one gesture".

Top layer gets a small upward sweep so the chord resolves rather than stops.

Cap layer count at 4. Layer gains should sum to <= 0.6. If a layer has `sustain > 0`, all layers should have similar sustain values to avoid staggered ringing.

### 5.2 Click + body - transient layer over a sustained tone _(MEDIUM)_

Two layers fired simultaneously (no `delay`):

1. High-frequency transient (3-5 kHz) with sub-10 ms decay - the "stick".
2. Lower-frequency body (80-300 Hz) with longer decay - the "drum".

Used for: send buttons, hard confirms, drum-like UI feedback, anything that needs perceived weight. Both layers use the same source `type` (usually `sine`) so they read as one event.

Gains should be roughly balanced (transient slightly quieter than body).

### 5.3 Octave pair - two layers an octave apart with delay _(MEDIUM)_

Two layers a fifth or octave apart, separated by 20-50 ms `delay`. Direction (low first vs high first) encodes "on" vs "off", "open" vs "close", etc.

Layer gains should sum to less than 0.5. Both envelopes should match so the second beat doesn't sound disconnected.

If you find yourself reaching for >2 layers, jump to `layer-ascending-chord` instead.

### 5.4 Single layer - emit Layer directly _(HIGH)_

When the recipe needs only one source, emit the `Layer` shape directly (not wrapped in `{ layers: [...] }`). The engine accepts both, but the bare-Layer form is the canonical compact representation.

```ts
const sound: SoundDefinition = {
  source: { type: "sine", frequency: 1300 },
  envelope: { decay: 0.012, release: 0.004 },
  gain: 0.18,
};
```

Use this for: click, tap, tick, hover, focus, blur, scroll-snap, single-tone notifications, simple swooshes.

## 6. Effect Recipes

_When and how to reach for each effect type._

### 6.1 Bandpass noise swoosh - filter envelope is the gesture _(MEDIUM)_

Recipe is on the layer's `filter`, not its `effects`:

```ts
filter: {
  type: "bandpass",
  frequency: <resting Hz>,
  resonance: 1-3,
  envelope: { attack: 0.01-0.04, peak: <target Hz>, decay: 0.08-0.2 },
}
```

- Peak above resting -> upward swoosh.
- Peak below resting -> downward swoosh.
- Higher `resonance` (>2) makes it whistle-like; lower (<1.5) is broader.

Source should be `noise` (white for sharp, pink for soft). Source amplitude envelope just gates the noise window.

### 6.2 Bitcrusher - retro / lofi finish _(LOW-MEDIUM)_

- `bits`: 4-8. Lower = more crunchy. Below 4 turns into noise.
- `sampleRateReduction`: 1 (off) to 8 (heavy aliasing). Combine with `bits: 8` for that 8-bit console sound.
- `mix`: usually 1. Mixing bitcrush with the dry signal sounds muddy.

Best paired with `square` or `sawtooth` sources and a lowpass to soften the aliasing edges.

Avoid stacking with `effect-reverb-tail` - the quantization noise gets smeared.

### 6.3 FM bell - high ratio, high depth _(MEDIUM)_

`source.fm: { ratio, depth }` is structural, not an effect node. To get a bell:

- `ratio`: 2.5-3.5 for harmonic-bell, 2.76 for the "badge" inharmonic clang.
- `depth`: 150-400. Higher depth = more strident.
- `envelope.decay`: at least 0.3 s so the bell can ring.

For a bright "ding", use `ratio: 3.5`, `depth: 250` and add reverb (`decay: 0.7, mix: 0.15`).

For a dull "thud" with body, use `ratio: 0.5`, `depth: 200` and a short envelope.

Pair with `mood-glassy` or `mood-metallic`.

### 6.4 Lowpass warmth - the safest filter to add _(MEDIUM)_

```ts
filter: { type: "lowpass", frequency: 2500, resonance: 0.7 }
```

- `frequency`: 1500-3000 Hz for "warm". Below 1000 starts muffling the sound.
- `resonance`: omit or set 0.7-1.5. Above 2 the cutoff itself starts to whistle.

Stacks safely with reverb, FM, and most moods. The fastest way to remove harshness from any source.

For dynamic warmth (bright attack -> warm sustain), add a filter envelope:

```ts
filter: {
  type: "lowpass",
  frequency: 2500,
  envelope: { attack: 0, peak: 6000, decay: 0.08 },
}
```

### 6.5 Reverb tail - small space, low mix _(MEDIUM)_

Default UI reverb:

- `decay`: 0.3-0.6 s.
- `damping`: 0.4-0.6 (kills high frequencies in the tail; without this the reverb sounds metallic).
- `mix`: 0.08-0.15. Anything above 0.2 starts to feel like a music production effect.

For per-layer reverb on bell-like sounds (notification, ding), put the reverb inside the layer's `effects` array so each note rings independently. For shared reverb on chords/transitions, put it on the top-level `effects` of the `MultiLayerSound`.

Avoid stacking reverb with delay - choose one.

## 7. Output Validation

_Checks every emitted SoundDefinition must pass before returning to the user._

### 7.1 Duration cap - 1 s for transients, 3 s absolute max _(MEDIUM)_

Estimated total duration:

```
estimated = (envelope.attack ?? 0)
          + envelope.decay
          + (envelope.release ?? 0)
          + max(0, longestEffectTail)  // reverb decay, delay time * 4
```

Targets:

- Click / tap / tick / hover / focus: <= 0.1 s.
- Toggle / copy / sync: <= 0.2 s.
- Modal / drawer / dropdown open/close: <= 0.3 s.
- Success / complete / notification: <= 0.8 s.
- Whoosh / page transition: <= 0.5 s.

Hard ceiling: 3 s. Anything longer should not be a UI sound.

The `validate` script computes the estimated duration and flags layers that exceed 3 s.

### 7.2 Envelope sanity - no zero decay, no infinite sustain without release _(HIGH)_

Required:

- `envelope.decay > 0` (always). Set to 0.005 minimum.
- If `envelope.sustain > 0`, `envelope.release` must be present and `> 0`.

Recommended:

- `envelope.attack`: 0 for percussive, 0.003-0.05 for sustained tones, up to 0.1 for ambient sounds.
- `envelope.decay + envelope.release`: <= 2 s for any UI sound. Above that, you're writing music, not interface feedback.
- `envelope.sustain`: 0 for transients, 0.03-0.15 for "rings out" tones, 0.3-0.7 only for held loops.

The `validate` script flags `decay <= 0`, `sustain > 0` without `release`, and total durations above 3 s.

### 7.3 Frequency bounds - 20 Hz to 20 kHz, both ends meaningful _(HIGH)_

Hard bounds:

- `source.frequency` (or both `start`/`end` of a sweep): 20 Hz <= f <= 20000 Hz.
- `filter.frequency`: 20 Hz <= f <= 20000 Hz.
- `filter.envelope.peak`: same range as `filter.frequency`.

Recommended UI bounds:

- Tonal sources: 80 Hz <= f <= 8000 Hz.
- High transient layers (clicks, sticks): up to 5 kHz.
- Sub layers (body, drum): 60-200 Hz.

Anything above 8 kHz risks being inaudible on phone speakers; anything below 60 Hz risks being inaudible on laptop speakers.

The `validate` script flags any frequency outside the hard bounds.

### 7.4 Gain budget - keep total layer gain under 0.6 _(HIGH)_

Single layer:

- `gain` between 0.04 and 0.3 for typical UI events.
- Background ticks/scroll-snaps: 0.04-0.10.
- Mid-importance (click, tap, hover): 0.12-0.20.
- High-importance (success, notification): 0.16-0.25.

Multi-layer:

- Sum of all `layer.gain` values must be <= 0.6.
- If you exceed it, scale every layer proportionally rather than picking one to lower.

If a sound includes a heavy reverb (`mix > 0.15`) or distortion, lower the gain budget by 20%.

The `validate` script flags both individual layers above 0.4 and totals above 0.6.

### 7.5 Schema conformance - validate against patch.schema.json _(CRITICAL)_

Every emitted `SoundDefinition` must validate against [packages/audio/schemas/patch.schema.json](../../../packages/audio/schemas/patch.schema.json) (`#/$defs/SoundDefinition`).

Common mistakes:

- Missing `decay` in `envelope` (required).
- Missing `target` in `lfo` (required).
- Setting `pan` outside `[-1, 1]`.
- Using a `filter.type` that isn't one of `lowpass | highpass | bandpass | notch | allpass | peaking | lowshelf | highshelf | iir`.
- Adding a top-level field that isn't in `Layer` or `MultiLayerSound` (e.g. `name`, `description`). The schema is `additionalProperties: false`.
- Confusing `MultiLayerSound.effects` (chain on the mixed bus) with `Layer.effects` (chain on a single layer).

The `validate` script invokes the JSON Schema validator on every rule's `example` field. Any violation aborts the build.

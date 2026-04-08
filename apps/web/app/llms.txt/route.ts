export function GET() {
  const content = `# Audio Kit

> Declarative audio synthesis for the web.

## Overview

Audio Kit lets you describe sounds as plain objects and play them with a single function call. No imperative node wiring. No class hierarchies. Just JSON in, audio out.

- Package: audio-kit (npm)
- Repository: https://github.com/raphaelsalaja/audio-kit
- Docs: https://audio-kit.dev

## Core API

- defineSound(definition) - Returns a function that plays the sound
- defineSequence(steps, options?) - Returns { play, stop } for sequenced sounds
- ensureReady() - Resume AudioContext after user gesture
- sine(freq, decay, gain?) - Oscillator shortcut
- triangle(freq, decay, gain?) - Oscillator shortcut
- square(freq, decay, gain?) - Oscillator shortcut
- sawtooth(freq, decay, gain?) - Oscillator shortcut
- noise(color?, decay?, gain?) - Noise shortcut

## Sound Definition Structure

A sound is a Layer or MultiLayerSound object:

Layer: { source, filter?, envelope?, gain?, pan?, panner?, lfo?, effects? }
MultiLayerSound: { layers: Layer[], effects? }

### Sources
- Oscillator: { type: "sine"|"triangle"|"square"|"sawtooth", frequency }
- Noise: { type: "noise", color?: "white"|"pink"|"brown" }
- Wavetable: { type: "wavetable", harmonics, frequency }
- Sample: { type: "sample", url?, buffer? }

### Effects
reverb, delay, chorus, phaser, flanger, tremolo, vibrato, bitcrusher, compressor, eq, distortion, gain, pan

### Envelope (ADSR)
{ attack?, decay, sustain?, release? }

## React Bindings (audio-kit/react)

- useSound(definition, options?) - Returns play function
- useSequence(steps, options?) - Returns { play, stop }
- usePack(source) - Load and play patches
- useAnalyser(options?) - FFT/waveform analysis
- useListener(listener) - 3D audio listener
- SoundProvider - Context for enabled/volume state

## Patches

JSON files with name, sounds, and optional $schema for validation.
CLI: npx audio-kit add | list | remove | init

## Documentation Pages

- / - Overview
- /introduction/installation - Getting started
- /concepts/sources - Sound sources
- /concepts/filters - Frequency filters
- /concepts/envelopes - ADSR envelopes
- /concepts/effects - Audio effects
- /concepts/modulation - LFO modulation
- /concepts/layers - Multi-layer sounds
- /concepts/spatial - 3D spatial audio
- /integrations/patches - Patches
- /integrations/react - React hooks
- /api/sounds/define-sound - defineSound API
- /api/reference/types - Type reference
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

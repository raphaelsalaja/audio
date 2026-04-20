---
title: Acquire and split source audio
order: 1
impact: HIGH
impactDescription: Every audio-path run starts here; without per-sound WAVs the rest of the pipeline cannot run.
tags: interpret, audio, ffmpeg, sprite
---

## Acquire and split source audio

The user shared a single file or a sprite (one file containing many sounds). Before any FFT work, get one mono WAV per sound on disk.

### Sprite from an npm package

```bash
npm pack <package-name> --pack-destination /tmp
tar -xzf /tmp/<package-name>-*.tgz -C /tmp
```

Look for the MP3/WAV plus any JSON manifest mapping sound names to time offsets.

### Manifest-driven slicing

```bash
ffmpeg -i sprite.mp3 \
  -ss <start_seconds> -t <duration_seconds> \
  -acodec pcm_s16le -ar 44100 \
  output/<name>.wav
```

### Silence-detection slicing (no manifest)

```bash
ffmpeg -i sprite.mp3 -af silencedetect=noise=-40dB:d=0.05 -f null -
```

Read the `silence_start`/`silence_end` lines and slice between gaps.

### Output convention

Per-sound WAVs go in `out/<name>.wav` (mono, 44.1 kHz, 16-bit PCM). Downstream interpret rules call `analyze.load_mono(path)` from [src/analyze.py](../src/analyze.py).

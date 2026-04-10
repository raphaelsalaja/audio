import { render } from "./engine";
import type {
  OfflineRenderOptions,
  PlayOptions,
  SoundDefinition,
} from "./types";

/**
 * Renders a sound definition to an `AudioBuffer` using `OfflineAudioContext`.
 *
 * No speakers are involved — the entire render happens in memory.
 *
 * @param definition - The sound to render
 * @param options - Duration, sample rate, and channel count
 * @param playOpts - Runtime overrides (volume, detune, etc.)
 * @returns A promise resolving to the rendered `AudioBuffer`
 */
export async function renderToBuffer(
  definition: SoundDefinition,
  options: OfflineRenderOptions,
  playOpts?: PlayOptions,
): Promise<AudioBuffer> {
  const sampleRate = options.sampleRate ?? 44100;
  const channels = options.numberOfChannels ?? 2;
  const length = Math.ceil(options.duration * sampleRate);

  const offline = new OfflineAudioContext(channels, length, sampleRate);

  render(offline, definition, playOpts, 0, offline.destination);

  return offline.startRendering();
}

/**
 * Encodes an `AudioBuffer` as a 16-bit PCM WAV `Blob`.
 *
 * @param buffer - The audio buffer to encode
 * @returns A `Blob` with MIME type `audio/wav`
 */
export function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;

  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Convenience wrapper that renders a sound and encodes it as a WAV `Blob`.
 *
 * Equivalent to calling {@link renderToBuffer} followed by {@link bufferToWav}.
 *
 * @param definition - The sound to render
 * @param options - Duration, sample rate, and channel count
 * @param playOpts - Runtime overrides
 * @returns A promise resolving to a WAV `Blob`
 */
export async function renderToWav(
  definition: SoundDefinition,
  options: OfflineRenderOptions,
  playOpts?: PlayOptions,
): Promise<Blob> {
  const buffer = await renderToBuffer(definition, options, playOpts);
  return bufferToWav(buffer);
}

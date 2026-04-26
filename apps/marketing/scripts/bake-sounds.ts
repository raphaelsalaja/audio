// Bakes every sound in the selected patches to a WAV file using the same
// renderToWav() the library ships, so what plays in the video is byte-for-byte
// what users will hear when they install the package.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  AudioBuffer as NodeAudioBuffer,
  AudioContext as NodeAudioContext,
  OfflineAudioContext as NodeOfflineAudioContext,
} from "node-web-audio-api";

// Polyfill BEFORE importing @web-kits/audio.
type Globalish = typeof globalThis & {
  OfflineAudioContext?: unknown;
  AudioContext?: unknown;
  AudioBuffer?: unknown;
  BaseAudioContext?: unknown;
};
const g = globalThis as Globalish;
if (!g.OfflineAudioContext) g.OfflineAudioContext = NodeOfflineAudioContext;
if (!g.AudioContext) g.AudioContext = NodeAudioContext;
if (!g.AudioBuffer) g.AudioBuffer = NodeAudioBuffer;
if (!g.BaseAudioContext) g.BaseAudioContext = NodeAudioContext;

const audio = await import("@web-kits/audio");
const renderToBuffer = audio.renderToBuffer;

type Envelope = { attack?: number; decay: number; release?: number };
type Layer = { envelope?: Envelope; delay?: number };
type RawDefinition = {
  layers?: Layer[];
  envelope?: Envelope;
  delay?: number;
  source?: unknown;
  gain?: number;
  // biome-ignore lint/suspicious/noExplicitAny: pass-through to the library
  [key: string]: any;
};

// Patches we sample for the carousel. The first one (`playful`) drives the
// primitives stage, so it must always be present.
const PATCHES = ["playful", "soft", "retro", "crisp"] as const;
type PatchId = (typeof PATCHES)[number];

const FPS = 60;
const SAMPLE_RATE = 48_000;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const patchesDir = join(repoRoot, ".web-kits");
const outDir = resolve(here, "../public/sounds");
const generatedFile = resolve(here, "../src/generated/sounds.ts");

function estimateDuration(def: RawDefinition): number {
  const layers: Layer[] = def.layers ?? [
    { envelope: def.envelope, delay: def.delay },
  ];
  let max = 0;
  for (const layer of layers) {
    const env = layer.envelope ?? { decay: 0.5 };
    const total =
      (layer.delay ?? 0) + (env.attack ?? 0) + env.decay + (env.release ?? 0);
    if (total > max) max = total;
  }
  // Add a tail so release tails finish cleanly.
  return Math.max(0.2, max + 0.15);
}

function bufferToWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const ab = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(ab);
  const writeString = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(off + i, str.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++)
    channels.push(buffer.getChannelData(ch));
  let offset = headerSize;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Uint8Array(ab);
}

type Manifest = {
  patches: Record<
    PatchId,
    {
      name: string;
      sounds: Record<
        string,
        { src: string; durationInSeconds: number; durationInFrames: number }
      >;
    }
  >;
};

async function bakePatch(
  patch: PatchId,
): Promise<Manifest["patches"][PatchId]> {
  const patchPath = join(patchesDir, `${patch}.json`);
  const patchUrl = pathToFileURL(patchPath).href;
  const data = (await import(
    patchUrl,
    { with: { type: "json" } } as unknown as ImportCallOptions,
  ))
    .default as {
    name: string;
    sounds: Record<string, RawDefinition>;
  };
  const patchOutDir = join(outDir, patch);
  await mkdir(patchOutDir, { recursive: true });
  const sounds: Manifest["patches"][PatchId]["sounds"] = {};
  for (const [name, def] of Object.entries(data.sounds)) {
    const duration = estimateDuration(def);
    const buffer = await renderToBuffer(
      def as unknown as Parameters<typeof renderToBuffer>[0],
      {
        duration,
        sampleRate: SAMPLE_RATE,
        numberOfChannels: 1,
      },
    );
    const wav = bufferToWav(buffer);
    const file = join(patchOutDir, `${name}.wav`);
    await writeFile(file, wav);
    const rel = `/${relative(resolve(here, "../public"), file).replace(/\\/g, "/")}`;
    sounds[name] = {
      src: rel,
      durationInSeconds: duration,
      durationInFrames: Math.ceil(duration * FPS),
    };
  }
  console.log(`baked ${patch}: ${Object.keys(sounds).length} sounds`);
  return { name: data.name, sounds };
}

function emitGenerated(manifest: Manifest): string {
  const header = [
    "// AUTO-GENERATED by scripts/bake-sounds.ts. Do not edit.",
    "// Re-run with `pnpm --filter @web-kits/marketing bake`.",
    "",
    'import { staticFile } from "remotion";',
    "",
    "export type SoundEntry = {",
    "  src: string;",
    "  durationInSeconds: number;",
    "  durationInFrames: number;",
    "};",
    "",
  ];
  const body: string[] = [];
  for (const [patch, info] of Object.entries(manifest.patches)) {
    body.push(
      `export const ${patch} = {`,
      `  name: ${JSON.stringify(info.name)},`,
      "  sounds: {",
    );
    for (const [name, entry] of Object.entries(info.sounds)) {
      body.push(
        `    ${JSON.stringify(name)}: {`,
        `      src: staticFile(${JSON.stringify(entry.src.replace(/^\//, ""))}),`,
        `      durationInSeconds: ${entry.durationInSeconds.toFixed(4)},`,
        `      durationInFrames: ${entry.durationInFrames},`,
        "    } satisfies SoundEntry,",
      );
    }
    body.push("  },", "} as const;", "");
  }
  body.push(
    `export const PATCHES = [${PATCHES.map((p) => `"${p}"`).join(", ")}] as const;`,
    `export type PatchId = (typeof PATCHES)[number];`,
    "",
  );
  return [...header, ...body].join("\n");
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const manifest: Manifest = { patches: {} as Manifest["patches"] };
  for (const patch of PATCHES) {
    manifest.patches[patch] = await bakePatch(patch);
  }
  await writeFile(generatedFile, emitGenerated(manifest));
  console.log(`wrote ${relative(repoRoot, generatedFile)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

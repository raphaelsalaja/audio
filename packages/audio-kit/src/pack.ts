import { getContext, getDestination } from "./context";
import { render } from "./engine";
import type {
  PlayOptions,
  SoundDefinition,
  SoundPack,
  VoiceHandle,
} from "./types";

export type AudioPack = {
  ready: boolean;
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  sounds: string[];
  play: (name: string, opts?: PlayOptions) => VoiceHandle;
  get: (name: string) => SoundDefinition | undefined;
  toJSON: () => SoundPack;
};

function createPackInstance(data: SoundPack): AudioPack {
  const soundNames = Object.keys(data.sounds);

  return {
    ready: true,
    name: data.name,
    author: data.author,
    version: data.version,
    description: data.description,
    tags: data.tags,
    sounds: soundNames,

    play(name: string, opts?: PlayOptions) {
      const def = data.sounds[name];
      if (!def)
        throw new Error(`Sound "${name}" not found in pack "${data.name}"`);
      const ctx = getContext();
      return render(ctx, def, opts, undefined, getDestination());
    },

    get(name: string) {
      return data.sounds[name];
    },

    toJSON() {
      return structuredClone(data);
    },
  };
}

export function definePack(data: SoundPack): AudioPack {
  return createPackInstance(data);
}

export async function loadPack(source: string | SoundPack): Promise<AudioPack> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok)
      throw new Error(`Failed to load pack from ${source}: ${response.status}`);
    const data: SoundPack = await response.json();
    return createPackInstance(data);
  }
  return createPackInstance(source);
}

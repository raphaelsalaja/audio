import { getContext, getDestination } from "./context";
import { render } from "./engine";
import type {
  PlayOptions,
  SoundDefinition,
  SoundPatch,
  VoiceHandle,
} from "./types";

export type AudioPatch = {
  ready: boolean;
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  sounds: string[];
  play: (name: string, opts?: PlayOptions) => VoiceHandle;
  get: (name: string) => SoundDefinition | undefined;
  toJSON: () => SoundPatch;
};

function createPatchInstance(data: SoundPatch): AudioPatch {
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
        throw new Error(`Sound "${name}" not found in patch "${data.name}"`);
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

export function definePatch(data: SoundPatch): AudioPatch {
  return createPatchInstance(data);
}

export async function loadPatch(source: string | SoundPatch): Promise<AudioPatch> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok)
      throw new Error(`Failed to load patch from ${source}: ${response.status}`);
    const data: SoundPatch = await response.json();
    return createPatchInstance(data);
  }
  return createPatchInstance(source);
}

import { getContext, getDestination } from "./context";
import { render } from "./engine";
import type {
  PlayOptions,
  SoundDefinition,
  SoundPatch,
  VoiceHandle,
} from "./types";

/**
 * A loaded sound patch with methods to play individual sounds by name.
 *
 * @example
 * ```typescript
 * const patch = await loadPatch("https://example.com/ui-sounds.json");
 * patch.play("click");
 * ```
 */
export type AudioPatch = {
  /** `true` once the patch data has been loaded and parsed. */
  ready: boolean;
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  /** Names of all sounds contained in this patch. */
  sounds: string[];
  /**
   * Plays a named sound from the patch.
   *
   * @param name - Sound name (must exist in {@link sounds})
   * @param opts - Runtime overrides
   * @throws {Error} If the sound name is not found in the patch
   */
  play: (name: string, opts?: PlayOptions) => VoiceHandle;
  /** Returns the raw {@link SoundDefinition} for a named sound, or `undefined`. */
  get: (name: string) => SoundDefinition | undefined;
  /** Returns a deep-cloned copy of the underlying {@link SoundPatch} data. */
  toJSON: () => SoundPatch;
};

export function createPatchInstance(data: SoundPatch): AudioPatch {
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

/**
 * Creates an {@link AudioPatch} from an in-memory {@link SoundPatch} object.
 *
 * @param data - The sound patch data
 * @returns A ready-to-play `AudioPatch`
 */
export function definePatch(data: SoundPatch): AudioPatch {
  return createPatchInstance(data);
}

/**
 * Loads a sound patch from a URL or an in-memory object.
 *
 * When `source` is a string, it is fetched as JSON and decoded into a
 * {@link SoundPatch}. When it is already a `SoundPatch`, it is used directly.
 *
 * @param source - URL string or `SoundPatch` object
 * @returns A promise that resolves to a ready-to-play {@link AudioPatch}
 * @throws {Error} If the network request fails
 */
export async function loadPatch(
  source: string | SoundPatch,
): Promise<AudioPatch> {
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok)
      throw new Error(
        `Failed to load patch from ${source}: ${response.status}`,
      );
    const data: SoundPatch = await response.json();
    return createPatchInstance(data);
  }
  return createPatchInstance(source);
}

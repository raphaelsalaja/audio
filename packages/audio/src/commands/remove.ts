import { unlink } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { getInstalledPatches, getPatchesDir, regenerateIndex } from "./utils.js";

export interface RemoveOptions {
  yes?: boolean;
}

export function parseRemoveOptions(args: string[]): {
  patches: string[];
  options: RemoveOptions;
} {
  const options: RemoveOptions = {};
  const patches: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-y" || arg === "--yes") {
      options.yes = true;
    } else if (arg && !arg.startsWith("-")) {
      patches.push(arg);
    }
  }

  return { patches, options };
}

export async function remove(args: string[]) {
  const { patches: patchNames, options } = parseRemoveOptions(args);

  p.intro("@web-kits/audio remove");

  const patches = await getInstalledPatches();

  if (patches.length === 0) {
    p.log.warn("No patches installed.");
    p.outro("Nothing to remove.");
    return;
  }

  let files: string[];

  if (patchNames.length > 0) {
    const matched = patches.filter((pk) =>
      patchNames.some((n) => n.toLowerCase() === pk.name.toLowerCase()),
    );
    if (matched.length === 0) {
      p.log.error(`No matching patches found for: ${patchNames.join(", ")}`);
      return;
    }
    files = matched.map((pk) => pk.file);
  } else {
    const selected = await p.multiselect({
      message: "Select patches to remove",
      options: patches.map((pk) => ({
        value: pk.file,
        label: pk.name,
        hint: `${pk.soundCount} sounds`,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    files = selected as string[];
    if (files.length === 0) {
      p.outro("No patches selected.");
      return;
    }
  }

  if (!options.yes) {
    const confirmed = await p.confirm({
      message: `Remove ${files.length} patch(es)?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  const dir = getPatchesDir();
  const removed: string[] = [];

  for (const file of files) {
    try {
      await unlink(join(dir, file));
      const pk = patches.find((item) => item.file === file);
      removed.push(pk?.name ?? file);
    } catch (err) {
      p.log.warn(`Failed to remove ${file}: ${err}`);
    }
  }

  await regenerateIndex(dir);

  p.note(removed.map((n) => `  - ${n}`).join("\n"), "Removed patches");
  p.outro("Done!");
}

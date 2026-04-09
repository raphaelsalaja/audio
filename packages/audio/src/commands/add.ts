import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  type DiscoveredPatch,
  type InstalledPatch,
  type PatchIndexEntry,
  discoverPatchesFromGitHub,
  discoverPatchesFromLocal,
  ensureConfig,
  fetchPatchIndex,
  fetchPatchJson,
  generateModule,
  getInstalledPatches,
  getPatchesDir,
  isGitHubSource,
  isLocalSource,
  regenerateIndex,
  registerPatch,
  validatePatch,
} from "./utils.js";

export interface AddOptions {
  list?: boolean;
  yes?: boolean;
  patch?: string;
}

export function parseAddOptions(args: string[]): {
  source: string | undefined;
  options: AddOptions;
} {
  const options: AddOptions = {};
  let source: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-y" || arg === "--yes") {
      options.yes = true;
    } else if (arg === "-l" || arg === "--list") {
      options.list = true;
    } else if (arg === "--patch") {
      options.patch = args[++i];
    } else if (arg && !arg.startsWith("-")) {
      source = arg;
    }
  }

  return { source, options };
}

export async function add(args: string[]) {
  const { source, options } = parseAddOptions(args);

  p.intro("@web-kits/audio add");

  if (!source) {
    await addFromRegistry(options);
    return;
  }

  if (isLocalSource(source)) {
    await addFromLocal(source, options);
    return;
  }

  if (source.startsWith("http") && source.endsWith(".json")) {
    await addFromUrl(source, options);
    return;
  }

  if (isGitHubSource(source)) {
    await addFromGitHub(source, options);
    return;
  }

  await addFromUrl(source, options);
}

async function addFromLocal(source: string, options: AddOptions) {
  const s = p.spinner();
  s.start("Scanning local path for patches...");

  let discovered: DiscoveredPatch[];
  try {
    discovered = await discoverPatchesFromLocal(source);
    s.stop(`Found ${discovered.length} patch(es)`);
  } catch (err) {
    s.stop("Failed to scan local path.");
    p.log.error(String(err));
    process.exit(1);
  }

  if (discovered.length === 0) {
    p.log.warn("No valid sound patches found at this path.");
    p.outro("Patches must be JSON files with a name and sounds object.");
    return;
  }

  if (options.list) {
    printPatchList(discovered);
    return;
  }

  const toInstall = selectPatches(discovered, options);
  if (!toInstall || toInstall.length === 0) return;

  const installed = await getInstalledPatches();
  const installedNames = new Set(
    installed.map((p: InstalledPatch) => p.name),
  );

  const final = options.yes
    ? toInstall
    : await confirmOverwrites(toInstall, installedNames);
  if (!final || final.length === 0) return;

  const dl = p.spinner();
  dl.start(`Installing ${final.length} patch(es)...`);

  const results: string[] = [];
  for (const patch of final) {
    try {
      const raw = await readFile(patch.downloadUrl, "utf-8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (!validatePatch(data)) {
        p.log.warn(`Skipping ${patch.name}: invalid patch format`);
        continue;
      }
      await writePatch(patch.name, data);
      results.push(data.name);
    } catch (err) {
      p.log.warn(`Failed to install ${patch.name}: ${err}`);
    }
  }

  dl.stop(`Installed ${results.length} patch(es)`);
  p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed patches");
  p.outro("Done!");
}

async function addFromGitHub(source: string, options: AddOptions) {
  const s = p.spinner();
  s.start("Scanning repository for patches...");

  let discovered: DiscoveredPatch[];
  try {
    discovered = await discoverPatchesFromGitHub(source);
    s.stop(`Found ${discovered.length} patch(es)`);
  } catch (err) {
    s.stop("Failed to scan repository.");
    p.log.error(String(err));
    process.exit(1);
  }

  if (discovered.length === 0) {
    p.log.warn("No valid sound patches found in this repository.");
    p.outro("Patches must be JSON files with a name and sounds object.");
    return;
  }

  if (options.list) {
    printPatchList(discovered);
    return;
  }

  const installed = await getInstalledPatches();
  const installedNames = new Set(
    installed.map((p: InstalledPatch) => p.name),
  );

  const toInstall = await resolvePatchSelection(
    discovered,
    installedNames,
    options,
  );
  if (!toInstall || toInstall.length === 0) return;

  const dl = p.spinner();
  dl.start(`Installing ${toInstall.length} patch(es)...`);

  const results: string[] = [];
  for (const patch of toInstall) {
    try {
      const data = await fetchPatchJson(patch.downloadUrl);
      if (!validatePatch(data)) {
        p.log.warn(`Skipping ${patch.name}: invalid patch format`);
        continue;
      }
      await writePatch(patch.name, data);
      registerPatch(patch.downloadUrl);
      results.push(data.name);
    } catch (err) {
      p.log.warn(`Failed to install ${patch.name}: ${err}`);
    }
  }

  dl.stop(`Installed ${results.length} patch(es)`);

  p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed patches");
  p.outro("Done!");
}

async function addFromUrl(url: string, options: AddOptions) {
  const s = p.spinner();
  s.start("Fetching patch...");

  try {
    const data = await fetchPatchJson(url);
    if (!validatePatch(data)) {
      s.stop("Invalid patch format.");
      p.log.error(
        "The fetched JSON is not a valid sound patch (missing name or sounds).",
      );
      process.exit(1);
    }
    s.stop(`Fetched "${data.name}"`);

    if (options.list) {
      console.log(
        `  ${pc.bold(data.name)}  ${pc.dim(`${Object.keys(data.sounds).length} sounds`)}`,
      );
      console.log();
      return;
    }

    await writePatch(data.name, data);
    registerPatch(url);
  } catch (err) {
    s.stop("Failed to fetch patch.");
    p.log.error(String(err));
    process.exit(1);
  }
}

async function addFromRegistry(options: AddOptions) {
  const s = p.spinner();
  s.start("Fetching available patches...");

  let index: Awaited<ReturnType<typeof fetchPatchIndex>>;
  try {
    index = await fetchPatchIndex();
    s.stop(`Found ${index.length} patches`);
  } catch (err) {
    s.stop("Failed to fetch patch index.");
    p.log.error(String(err));
    process.exit(1);
  }

  if (options.list) {
    console.log();
    for (const entry of index) {
      console.log(`  ${pc.bold(entry.name)}  ${pc.dim(entry.description)}`);
    }
    console.log();
    return;
  }

  const installed = await getInstalledPatches();
  const installedNames = new Set(
    installed.map((p: InstalledPatch) => p.name),
  );

  let names: string[];

  if (options.patch) {
    const patchName = options.patch;
    names = [patchName];
    const match = index.find(
      (e: PatchIndexEntry) =>
        e.name.toLowerCase() === patchName.toLowerCase(),
    );
    if (!match) {
      p.log.error(`Patch "${patchName}" not found in registry.`);
      process.exit(1);
    }
  } else if (options.yes) {
    names = index.map((e: PatchIndexEntry) => e.name);
  } else {
    const selected = await p.multiselect({
      message: "Select patches to install",
      options: index.map((entry: PatchIndexEntry) => ({
        value: entry.name,
        label: `${entry.name}${installedNames.has(entry.name) ? " (installed)" : ""}`,
        hint: entry.description,
      })),
    });

    if (p.isCancel(selected)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    names = selected as string[];
    if (names.length === 0) {
      p.outro("No patches selected.");
      return;
    }
  }

  if (!options.yes) {
    const existing = names.filter((n) => installedNames.has(n));
    if (existing.length > 0) {
      const overwrite = await p.confirm({
        message: `${existing.length} patch(es) already installed. Overwrite?`,
      });
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
    }
  }

  const dl = p.spinner();
  dl.start(`Downloading ${names.length} patch(es)...`);

  const results: string[] = [];
  for (const name of names) {
    try {
      const data = await fetchPatchJson(name);
      if (!validatePatch(data)) {
        p.log.warn(`Skipping ${name}: invalid patch format`);
        continue;
      }
      await writePatch(name, data);
      results.push(data.name);
    } catch (err) {
      p.log.warn(`Failed to download ${name}: ${err}`);
    }
  }

  dl.stop(`Downloaded ${results.length} patch(es)`);

  p.note(results.map((n) => `  - ${n}`).join("\n"), "Installed patches");
  p.outro("Done!");
}

function printPatchList(patches: DiscoveredPatch[]) {
  console.log();
  for (const patch of patches) {
    const desc = patch.description ? `  ${pc.dim(patch.description)}` : "";
    console.log(
      `  ${pc.bold(patch.name)}  ${pc.dim(`${patch.soundCount} sounds`)}${desc}`,
    );
  }
  console.log();
}

function selectPatches(
  discovered: DiscoveredPatch[],
  options: AddOptions,
): DiscoveredPatch[] {
  if (options.patch) {
    const patchName = options.patch;
    const match = discovered.filter(
      (d) => d.name.toLowerCase() === patchName.toLowerCase(),
    );
    if (match.length === 0) {
      p.log.error(`Patch "${patchName}" not found.`);
      process.exit(1);
    }
    return match;
  }
  if (options.yes) return discovered;
  return discovered;
}

async function resolvePatchSelection(
  discovered: DiscoveredPatch[],
  installedNames: Set<string>,
  options: AddOptions,
): Promise<DiscoveredPatch[]> {
  if (options.patch) {
    const patchName = options.patch;
    const match = discovered.filter(
      (d) => d.name.toLowerCase() === patchName.toLowerCase(),
    );
    if (match.length === 0) {
      p.log.error(`Patch "${patchName}" not found.`);
      process.exit(1);
    }
    return match;
  }

  if (options.yes) return discovered;

  if (discovered.length === 1) return discovered;

  return await promptPatchSelection(discovered, installedNames);
}

async function promptPatchSelection(
  discovered: DiscoveredPatch[],
  installedNames: Set<string>,
) {
  const selected = await p.multiselect({
    message: "Select patches to install",
    options: discovered.map((patch) => ({
      value: patch.name,
      label: `${patch.name}${installedNames.has(patch.name) ? " (installed)" : ""}`,
      hint: patch.description
        ? `${patch.soundCount} sounds — ${patch.description}`
        : `${patch.soundCount} sounds`,
    })),
  });

  if (p.isCancel(selected)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const names = new Set(selected as string[]);
  return discovered.filter((d) => names.has(d.name));
}

async function confirmOverwrites(
  patches: DiscoveredPatch[],
  installedNames: Set<string>,
): Promise<DiscoveredPatch[]> {
  const existing = patches.filter((patch) => installedNames.has(patch.name));
  if (existing.length === 0) return patches;

  const overwrite = await p.confirm({
    message: `${existing.length} patch(es) already installed. Overwrite?`,
  });
  if (p.isCancel(overwrite) || !overwrite) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  return patches;
}

async function writePatch(filename: string, data: Record<string, unknown>) {
  await ensureConfig();
  const dir = getPatchesDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const slug = filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const moduleSource = generateModule(
    data as { name: string; sounds: Record<string, unknown> },
  );
  const target = join(dir, `${slug}.ts`);
  await writeFile(target, moduleSource, "utf-8");
  await regenerateIndex(dir);
}

import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  fetchPatchIndex,
  fetchPatchJson,
  generateModule,
  getInstalledPatches,
  getPatchesDir,
  regenerateIndex,
  validatePatch,
} from "./utils.js";

export async function update(_args: string[]) {
  console.log();
  console.log(pc.bold("@web-kits/audio update"));
  console.log();

  const installed = await getInstalledPatches();

  if (installed.length === 0) {
    console.log(pc.dim("No patches installed."));
    console.log(
      pc.dim(`Install patches with ${pc.reset("npx @web-kits/audio add")}`),
    );
    console.log();
    return;
  }

  let registry: Awaited<ReturnType<typeof fetchPatchIndex>>;
  try {
    registry = await fetchPatchIndex();
  } catch (err) {
    console.log(pc.red(`Failed to fetch registry: ${err}`));
    process.exit(1);
  }

  const registryMap = new Map(registry.map((e) => [e.name.toLowerCase(), e]));

  const toUpdate = installed.filter((pk) =>
    registryMap.has(pk.name.toLowerCase()),
  );

  if (toUpdate.length === 0) {
    console.log(pc.dim("No installed patches found in the registry."));
    console.log();
    return;
  }

  const s = p.spinner();
  s.start(`Updating ${toUpdate.length} patch(es)...`);

  let successCount = 0;
  let failCount = 0;

  const dir = getPatchesDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  for (const entry of toUpdate) {
    try {
      const data = await fetchPatchJson(entry.name);
      if (!validatePatch(data)) {
        failCount++;
        continue;
      }

      const slug = entry.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const moduleSource = generateModule(
        data as { name: string; sounds: Record<string, unknown> },
      );
      const target = join(dir, `${slug}.ts`);
      await writeFile(target, moduleSource, "utf-8");
      successCount++;
    } catch {
      failCount++;
    }
  }

  await regenerateIndex(dir);

  s.stop("Update complete");

  console.log();
  if (successCount > 0) {
    console.log(`${pc.green("✓")} Updated ${successCount} patch(es)`);
  }
  if (failCount > 0) {
    console.log(`${pc.red("✗")} Failed to update ${failCount} patch(es)`);
  }
  console.log();
}

import * as p from "@clack/prompts";
import { getInstalledPatches, getPatchesDir } from "./utils.js";

export async function list(_args: string[]) {
  p.intro("@web-kits/audio list");

  const patches = await getInstalledPatches();

  if (patches.length === 0) {
    p.log.warn(`No patches found in ${getPatchesDir()}`);
    p.outro("Run `@web-kits/audio add` to install patches.");
    return;
  }

  const rows = patches.map(
    (patch) =>
      `  ${patch.name.padEnd(16)} ${String(patch.soundCount).padStart(3)} sounds   ${patch.description ?? ""}`,
  );

  p.note(rows.join("\n"), `${patches.length} patch(es) installed`);
  p.outro(getPatchesDir());
}

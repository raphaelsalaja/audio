import pc from "picocolors";
import { fetchPatchIndex, getInstalledPatches } from "./utils.js";

export async function check(_args: string[]) {
  console.log();
  console.log(pc.bold("@web-kits/audio check"));
  console.log();
  console.log(pc.dim("Checking for updates..."));
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

  const available: string[] = [];
  const notInRegistry: string[] = [];

  for (const entry of installed) {
    const regEntry = registryMap.get(entry.name.toLowerCase());
    if (regEntry) {
      available.push(entry.name);
    } else {
      notInRegistry.push(entry.name);
    }
  }

  if (available.length === 0) {
    console.log(pc.dim("No installed patches found in the registry."));
    console.log();
    return;
  }

  console.log(
    `${pc.green("✓")} ${available.length} patch(es) can be refreshed from the registry:`,
  );
  console.log();
  for (const name of available) {
    console.log(`  ${pc.cyan("↑")} ${name}`);
  }
  console.log();
  console.log(
    `${pc.dim("Run")} ${pc.reset("npx @web-kits/audio update")} ${pc.dim("to re-download latest versions")}`,
  );

  if (notInRegistry.length > 0) {
    console.log();
    console.log(
      pc.dim(`${notInRegistry.length} patch(es) not found in registry:`),
    );
    for (const name of notInRegistry) {
      console.log(`  ${pc.dim("•")} ${name}`);
    }
  }

  console.log();
}

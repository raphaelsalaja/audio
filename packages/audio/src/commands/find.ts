import pc from "picocolors";
import { fetchPatchIndex } from "./utils.js";

export async function find(args: string[]) {
  const query = args.join(" ").toLowerCase();

  console.log();
  console.log(pc.bold("@web-kits/audio find"));
  console.log();

  let index: Awaited<ReturnType<typeof fetchPatchIndex>>;
  try {
    index = await fetchPatchIndex();
  } catch (err) {
    console.log(pc.red(`Failed to fetch registry: ${err}`));
    process.exit(1);
  }

  if (index.length === 0) {
    console.log(pc.dim("No patches available in the registry."));
    console.log();
    return;
  }

  const matches = query
    ? index.filter((entry) => {
        const haystack =
          `${entry.name} ${entry.description} ${(entry.tags ?? []).join(" ")}`.toLowerCase();
        return haystack.includes(query);
      })
    : index;

  if (matches.length === 0) {
    console.log(pc.dim(`No patches found for "${query}"`));
    console.log();
    return;
  }

  console.log(
    pc.dim(`Install with ${pc.reset("npx @web-kits/audio add --patch <name>")}`),
  );
  console.log();

  for (const entry of matches) {
    const tags =
      entry.tags && entry.tags.length > 0
        ? `  ${pc.dim(entry.tags.join(", "))}`
        : "";
    console.log(`  ${pc.bold(entry.name)}${tags}`);
    if (entry.description) {
      console.log(`  ${pc.dim(entry.description)}`);
    }
    console.log();
  }
}

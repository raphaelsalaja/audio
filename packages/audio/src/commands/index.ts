import pc from "picocolors";
import { add } from "./add.js";
import { check } from "./check.js";
import { find } from "./find.js";
import { init } from "./init.js";
import { list } from "./list.js";
import { remove } from "./remove.js";
import { update } from "./update.js";

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
  add,
  a: add,
  find,
  search: find,
  f: find,
  s: find,
  list,
  ls: list,
  remove,
  rm: remove,
  check,
  update,
  upgrade: update,
  init,
};

function showBanner() {
  console.log();
  console.log(pc.bold("@web-kits/audio"));
  console.log();
  console.log(pc.dim("Manage sound patches for your project."));
  console.log();
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio add")} ${pc.dim("[source]")}    ${pc.dim("Install sound patches")}`,
  );
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio find")} ${pc.dim("[query]")}    ${pc.dim("Search for patches")}`,
  );
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio list")}              ${pc.dim("List installed patches")}`,
  );
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio remove")}            ${pc.dim("Remove installed patches")}`,
  );
  console.log();
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio check")}             ${pc.dim("Check for updates")}`,
  );
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio update")}            ${pc.dim("Update installed patches")}`,
  );
  console.log();
  console.log(
    `  ${pc.dim("$")} ${pc.reset("npx @web-kits/audio init")}              ${pc.dim("Create a new sound patch")}`,
  );
  console.log();
  console.log(
    `${pc.dim("try:")} npx @web-kits/audio add raphaelsalaja/audio-kit`,
  );
  console.log();
}

function showHelp() {
  console.log(`
${pc.bold("Usage:")} @web-kits/audio <command> [options]

${pc.bold("Manage Patches:")}
  add [source]    Install sound patches
  find [query]    Search for patches in the registry
  list, ls        List installed patches
  remove, rm      Remove installed patches

${pc.bold("Updates:")}
  check           Check for available updates
  update          Update all installed patches

${pc.bold("Project:")}
  init            Create a new sound patch

${pc.bold("Add Options:")}
  -l, --list      Preview available patches without installing
  -y, --yes       Skip confirmation prompts
  --patch <name>  Install a specific patch by name

${pc.bold("Remove Options:")}
  -y, --yes       Skip confirmation prompts

${pc.bold("Source Formats:")}
  ./local/path                    Local file or directory
  owner/repo                      GitHub shorthand
  https://github.com/user/repo    Full GitHub URL
  https://...patch.json           Direct URL to a patch file
  ${pc.dim("(no argument)")}                   Browse the registry

${pc.bold("Options:")}
  --help, -h      Show this help message
  --version, -v   Show version number

${pc.bold("Examples:")}
  ${pc.dim("$")} @web-kits/audio add raphaelsalaja/audio-kit
  ${pc.dim("$")} @web-kits/audio add ./patches/
  ${pc.dim("$")} @web-kits/audio add raphaelsalaja/audio-kit --list
  ${pc.dim("$")} @web-kits/audio add --patch core -y
  ${pc.dim("$")} @web-kits/audio remove core -y
  ${pc.dim("$")} @web-kits/audio find ambient
  ${pc.dim("$")} @web-kits/audio check
  ${pc.dim("$")} @web-kits/audio update
`);
}

export async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    showBanner();
    return;
  }

  if (command === "--help" || command === "-h") {
    showHelp();
    return;
  }

  if (command === "--version" || command === "-v") {
    try {
      const { readFileSync } = await import("node:fs");
      const { join, dirname } = await import("node:path");
      const { fileURLToPath } = await import("node:url");
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const pkg = JSON.parse(
        readFileSync(join(__dirname, "..", "package.json"), "utf-8"),
      );
      console.log(pkg.version);
    } catch {
      console.log("0.0.0");
    }
    return;
  }

  const handler = COMMANDS[command];
  if (!handler) {
    console.log(pc.red(`Unknown command: ${command}`));
    console.log(
      `Run ${pc.bold("@web-kits/audio --help")} for usage information.`,
    );
    process.exit(1);
  }

  await handler(args.slice(1));
}

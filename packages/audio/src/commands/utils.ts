import { existsSync, mkdirSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, resolve } from "node:path";
import * as p from "@clack/prompts";

export const REGISTRY_BASE = "https://audio.raphaelsalaja.com/api";

const CONFIG_DIR = ".web-kits";
const CONFIG_FILE = "config.json";

export interface WebKitsConfig {
  output: string;
}

function configPath(): string {
  return resolve(process.cwd(), CONFIG_DIR, CONFIG_FILE);
}

export function getConfig(): WebKitsConfig | null {
  const p = configPath();
  if (!existsSync(p)) return null;
  try {
    const raw = JSON.parse(
      require("node:fs").readFileSync(p, "utf-8"),
    ) as Record<string, unknown>;
    if (typeof raw.output === "string") return { output: raw.output };
  } catch {}
  return null;
}

export async function ensureConfig(): Promise<WebKitsConfig> {
  const existing = getConfig();
  if (existing) return existing;

  const output = await p.select({
    message: "Where should patches be generated?",
    options: [
      { value: ".web-kits", label: ".web-kits", hint: "default" },
      { value: "src/audio", label: "src/audio" },
      { value: "lib/audio", label: "lib/audio" },
      { value: "__custom__", label: "Custom path..." },
    ],
  });

  if (p.isCancel(output)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  let outputDir = output as string;

  if (outputDir === "__custom__") {
    const custom = await p.text({
      message: "Enter output path",
      placeholder: ".web-kits",
      validate: (v) => (v.length === 0 ? "Path is required" : undefined),
    });
    if (p.isCancel(custom)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    outputDir = custom as string;
  }

  const config: WebKitsConfig = { output: outputDir };
  const dir = resolve(process.cwd(), CONFIG_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  require("node:fs").writeFileSync(
    configPath(),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf-8",
  );

  return config;
}

export interface PatchIndexEntry {
  name: string;
  file: string;
  description: string;
  tags: string[];
}

export interface InstalledPatch {
  file: string;
  name: string;
  description?: string;
  tags?: string[];
  soundCount: number;
}

export interface DiscoveredPatch {
  name: string;
  path: string;
  downloadUrl: string;
  description?: string;
  soundCount: number;
}

export function getPatchesDir(): string {
  const config = getConfig();
  const output = config?.output ?? ".web-kits";
  return resolve(process.cwd(), output);
}

export function parseGitHubSource(source: string): {
  owner: string;
  repo: string;
  branch: string;
  path: string;
} | null {
  const normalizedSource = source.replace(/\/+$/, "").replace(/\.git$/, "");

  const ghUrlMatch = normalizedSource.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+)(?:\/(.+))?)?$/,
  );
  if (ghUrlMatch) {
    return {
      owner: ghUrlMatch[1],
      repo: ghUrlMatch[2],
      branch: ghUrlMatch[3] ?? "main",
      path: ghUrlMatch[4] ?? "",
    };
  }

  const shorthand = normalizedSource.match(/^([^/]+)\/([^/]+)$/);
  if (shorthand) {
    return {
      owner: shorthand[1],
      repo: shorthand[2],
      branch: "main",
      path: "",
    };
  }

  return null;
}

interface GitHubTreeItem {
  path: string;
  type: string;
}

export async function discoverPatchesFromGitHub(
  source: string,
): Promise<DiscoveredPatch[]> {
  const parsed = parseGitHubSource(source);
  if (!parsed) {
    throw new Error(
      `Invalid source: ${source}. Use owner/repo or a GitHub URL.`,
    );
  }

  const { owner, repo, branch, path: subPath } = parsed;

  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(treeUrl, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repo tree: ${res.status}`);
  }

  const tree = (await res.json()) as { tree: GitHubTreeItem[] };

  const jsonFiles = tree.tree.filter((item) => {
    if (item.type !== "blob" || !item.path.endsWith(".json")) return false;
    if (subPath && !item.path.startsWith(subPath)) return false;
    if (item.path.includes("node_modules/")) return false;
    if (item.path.includes("package.json")) return false;
    if (item.path.includes("tsconfig")) return false;
    if (item.path.includes(".changeset/")) return false;
    return true;
  });

  const patches: DiscoveredPatch[] = [];

  for (const file of jsonFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
    try {
      const r = await fetch(rawUrl);
      if (!r.ok) continue;
      const data = (await r.json()) as Record<string, unknown>;
      if (!validatePatch(data)) continue;

      patches.push({
        name: data.name,
        path: file.path,
        downloadUrl: rawUrl,
        description: (data as { description?: string }).description,
        soundCount: Object.keys(data.sounds).length,
      });
    } catch {}
  }

  return patches;
}

export function isGitHubSource(source: string): boolean {
  return parseGitHubSource(source) !== null;
}

export function isLocalSource(source: string): boolean {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return false;
  }
  const abs = isAbsolute(source) ? source : resolve(process.cwd(), source);
  return existsSync(abs);
}

export async function discoverPatchesFromLocal(
  source: string,
): Promise<DiscoveredPatch[]> {
  const abs = isAbsolute(source) ? source : resolve(process.cwd(), source);

  if (abs.endsWith(".json")) {
    const raw = await readFile(abs, "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!validatePatch(data)) {
      throw new Error(`${source} is not a valid sound patch.`);
    }
    return [
      {
        name: data.name,
        path: abs,
        downloadUrl: abs,
        description: (data as { description?: string }).description,
        soundCount: Object.keys(data.sounds).length,
      },
    ];
  }

  const files = await readdir(abs);
  const patches: DiscoveredPatch[] = [];

  for (const file of files) {
    if (!file.endsWith(".json") || file === "index.json") continue;
    try {
      const filePath = join(abs, file);
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (!validatePatch(data)) continue;
      patches.push({
        name: data.name,
        path: filePath,
        downloadUrl: filePath,
        description: (data as { description?: string }).description,
        soundCount: Object.keys(data.sounds).length,
      });
    } catch {}
  }

  return patches;
}

export async function fetchPatchIndex(): Promise<PatchIndexEntry[]> {
  const res = await fetch(`${REGISTRY_BASE}/patches`);
  if (!res.ok) {
    throw new Error(`Failed to fetch patch index: ${res.status}`);
  }
  return res.json() as Promise<PatchIndexEntry[]>;
}

export async function fetchPatchJson(
  nameOrUrl: string,
): Promise<Record<string, unknown>> {
  const url = nameOrUrl.startsWith("http")
    ? nameOrUrl
    : `${REGISTRY_BASE}/patch/${nameOrUrl}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch patch: ${res.status}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export async function registerPatch(url: string): Promise<void> {
  try {
    await fetch(`${REGISTRY_BASE}/patches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {}
}

export function validatePatch(
  data: Record<string, unknown>,
): data is { name: string; sounds: Record<string, unknown> } {
  return (
    typeof data.name === "string" &&
    typeof data.sounds === "object" &&
    data.sounds !== null
  );
}

export async function getInstalledPatches(): Promise<InstalledPatch[]> {
  const dir = getPatchesDir();
  if (!existsSync(dir)) return [];

  const files = await readdir(dir);
  const patches: InstalledPatch[] = [];

  for (const file of files) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    try {
      const raw = await readFile(join(dir, file), "utf-8");
      const nameMatch = raw.match(/^\/\/ patch: (.+)$/m);
      const exportCount = (raw.match(/^export const /gm) ?? []).length;
      const name = nameMatch?.[1] ?? basename(file, ".ts");
      patches.push({
        file,
        name,
        soundCount: Math.max(0, exportCount - 1),
      });
    } catch {}
  }

  return patches;
}

const RESERVED = new Set([
  "break",
  "case",
  "catch",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "finally",
  "for",
  "function",
  "if",
  "in",
  "instanceof",
  "new",
  "return",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "class",
  "const",
  "enum",
  "export",
  "extends",
  "import",
  "super",
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield",
  "await",
]);

function toCamelCase(s: string): string {
  let id = s
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[^a-zA-Z_$]/, "_$&");
  if (RESERVED.has(id)) id = `_${id}`;
  return id;
}

export function generateModule(data: {
  name: string;
  sounds: Record<string, unknown>;
}): string {
  const entries = Object.entries(data.sounds);
  const ids = entries.map(([key]) => toCamelCase(key));

  const lines: string[] = [
    `// ${data.name} — generated by @web-kits/audio (do not edit)`,
    `// patch: ${data.name}`,
    `import type { SoundDefinition, SoundPatch } from "@web-kits/audio";`,
    "",
  ];

  for (let i = 0; i < entries.length; i++) {
    const [, def] = entries[i];
    lines.push(
      `export const ${ids[i]}: SoundDefinition = ${JSON.stringify(def)};`,
    );
  }

  const { sounds: _, $schema: _s, ...meta } = data as Record<string, unknown>;
  const soundsObj = ids.map((id, i) => {
    const key = entries[i][0];
    return id === key ? id : `${JSON.stringify(key)}: ${id}`;
  });

  lines.push(
    "",
    `export const _patch: SoundPatch = {`,
    `  ...${JSON.stringify(meta)},`,
    `  sounds: { ${soundsObj.join(", ")} },`,
    `};`,
    "",
  );

  return lines.join("\n");
}

export async function regenerateIndex(dir: string): Promise<void> {
  if (!existsSync(dir)) return;

  const files = await readdir(dir);
  const modules = files
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => basename(f, ".ts"))
    .sort();

  const lines = [
    "// generated by @web-kits/audio (do not edit)",
    ...modules.map((m) => `export * as ${toCamelCase(m)} from "./${m}";`),
    "",
  ];

  await writeFile(join(dir, "index.ts"), lines.join("\n"), "utf-8");
}

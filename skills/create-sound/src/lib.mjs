// Tiny helpers shared by build/validate/extract-tests.
// Hand-rolled to avoid any external deps.

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = resolve(HERE, "..");
export const RULES_DIR = join(SKILL_ROOT, "rules");
export const SECTIONS_FILE = join(RULES_DIR, "_sections.md");

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function readRuleFiles() {
  const entries = await readdir(RULES_DIR);
  return entries
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort();
}

/**
 * Parse a markdown file with YAML-ish frontmatter.
 * We only need a small subset: scalar string/number/bool, comma-separated lists,
 * and the `example: |` pipe block (raw multi-line string).
 */
export function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, body: raw };
  const fmText = raw.slice(4, end);
  const body = raw.slice(end + 5);

  const data = {};
  const lines = fmText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    if (value === "|" || value === ">") {
      // Multi-line block. Collect indented lines until dedent.
      const blockLines = [];
      let j = i + 1;
      let baseIndent = null;
      for (; j < lines.length; j++) {
        const next = lines[j];
        if (!next.length) {
          blockLines.push("");
          continue;
        }
        const indent = next.match(/^( *)/)[1].length;
        if (baseIndent === null) baseIndent = indent;
        if (indent < baseIndent && next.trim().length > 0) break;
        blockLines.push(next.slice(baseIndent));
      }
      data[key] = blockLines.join("\n").replace(/\s+$/, "");
      i = j - 1;
      continue;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }
  return { data, body: body.replace(/^\n+/, "") };
}

export async function readSections() {
  const raw = await readFile(SECTIONS_FILE, "utf8");
  // The file is markdown; the YAML lives between the first ```yaml fence pair.
  const match = raw.match(/```yaml\n([\s\S]*?)```/);
  if (!match) throw new Error("_sections.md is missing a ```yaml fence");
  const yaml = match[1];

  const sections = [];
  let current = null;
  for (const line of yaml.split("\n")) {
    if (/^\s*-\s*prefix:/.test(line)) {
      if (current) sections.push(current);
      current = { prefix: line.split(":")[1].trim() };
    } else if (/^\s+title:/.test(line) && current) {
      current.title = line.slice(line.indexOf(":") + 1).trim();
    } else if (/^\s+description:/.test(line) && current) {
      current.description = line.slice(line.indexOf(":") + 1).trim();
    }
  }
  if (current) sections.push(current);
  return sections;
}

export function prefixOf(filename) {
  const idx = filename.indexOf("-");
  return idx === -1 ? null : filename.slice(0, idx);
}

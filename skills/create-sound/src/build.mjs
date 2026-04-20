#!/usr/bin/env node
// Build SKILL.md from rules/*.md.
// Run: node src/build.mjs (or `pnpm --dir skills/create-sound build`)

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseFrontmatter,
  prefixOf,
  readRuleFiles,
  readSections,
  RULES_DIR,
  SKILL_ROOT,
} from "./lib.mjs";

const meta = JSON.parse(
  await readFile(join(SKILL_ROOT, "metadata.json"), "utf8"),
);

const sections = await readSections();
const sectionByPrefix = new Map(sections.map((s) => [s.prefix, s]));

const ruleFiles = await readRuleFiles();
const grouped = new Map();
for (const s of sections) grouped.set(s.prefix, []);

for (const file of ruleFiles) {
  const prefix = prefixOf(file);
  if (!prefix || !sectionByPrefix.has(prefix)) {
    console.warn(`build: skipping ${file} (no matching section prefix)`);
    continue;
  }
  const raw = await readFile(join(RULES_DIR, file), "utf8");
  const { data, body } = parseFrontmatter(raw);
  grouped.get(prefix).push({ file, data, body });
}

for (const [, items] of grouped) {
  items.sort((a, b) => {
    const ao = parseOrder(a.data.order);
    const bo = parseOrder(b.data.order);
    if (ao !== bo) return ao - bo;
    return (a.data.title ?? a.file).localeCompare(b.data.title ?? b.file);
  });
}

function parseOrder(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

const lines = [];
lines.push("---");
lines.push("name: create-sound");
lines.push("description: >-");
const desc = meta.abstract.replace(/\s+/g, " ").trim();
const wrapped = wrapText(desc, 78).map((l) => `  ${l}`);
lines.push(...wrapped);
lines.push("---");
lines.push("");
lines.push("# Create Sound");
lines.push("");
lines.push(
  `> Generated from \`rules/*.md\` by \`src/build.mjs\`. Do not edit by hand.`,
);
lines.push("");
lines.push(
  "Pick a generation path with `pipeline-detect-input`, then walk the matching section.",
);
lines.push("");

let sectionIdx = 0;
for (const section of sections) {
  sectionIdx++;
  const items = grouped.get(section.prefix) ?? [];
  if (items.length === 0) continue;

  lines.push(`## ${sectionIdx}. ${section.title}`);
  lines.push("");
  lines.push(`_${section.description}_`);
  lines.push("");

  let ruleIdx = 0;
  for (const { data, body } of items) {
    ruleIdx++;
    const number = `${sectionIdx}.${ruleIdx}`;
    const impact = data.impact ? ` _(${data.impact})_` : "";
    lines.push(`### ${number} ${data.title ?? "(untitled)"}${impact}`);
    lines.push("");
    lines.push(stripFirstHeading(body).trimEnd());
    lines.push("");
  }
}

const outPath = join(SKILL_ROOT, "SKILL.md");
await writeFile(outPath, `${lines.join("\n").trimEnd()}\n`);
console.log(
  `build: wrote ${outPath} (${ruleFiles.length} rules across ${sections.length} sections)`,
);

function wrapText(text, width) {
  const words = text.split(/\s+/);
  const out = [];
  let line = "";
  for (const w of words) {
    if (!line.length) {
      line = w;
    } else if (line.length + 1 + w.length <= width) {
      line += ` ${w}`;
    } else {
      out.push(line);
      line = w;
    }
  }
  if (line.length) out.push(line);
  return out;
}

function stripFirstHeading(body) {
  const lines = body.split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.length && lines[0].startsWith("## ")) {
    lines.shift();
    while (lines.length && !lines[0].trim()) lines.shift();
  }

  let inFence = false;
  return lines
    .map((line) => {
      if (/^```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const m = line.match(/^(#{2,5})\s/);
      if (!m) return line;
      return `#${line}`;
    })
    .join("\n");
}

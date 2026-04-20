#!/usr/bin/env node
// Extract test cases from rule frontmatter into test-cases.json.
// Each rule with `prompt` + `example` becomes a prompt-path case.
// Each rule with `inputAudio` + `example` becomes an audio-path case.
// Run: node src/extract-tests.mjs (or `pnpm --dir skills/create-sound extract-tests`)

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseFrontmatter,
  prefixOf,
  readRuleFiles,
  RULES_DIR,
  SKILL_ROOT,
} from "./lib.mjs";

const ruleFiles = await readRuleFiles();
const cases = [];

for (const file of ruleFiles) {
  const prefix = prefixOf(file);
  const raw = await readFile(join(RULES_DIR, file), "utf8");
  const { data } = parseFrontmatter(raw);

  const id = file.replace(/\.md$/, "");

  if (data.inputAudio && data.example) {
    cases.push({
      id,
      kind: "audio",
      section: prefix,
      title: data.title,
      inputAudio: data.inputAudio,
      expected: safeParse(data.example, file),
    });
    continue;
  }

  if (data.prompt && data.example) {
    cases.push({
      id,
      kind: "prompt",
      section: prefix,
      title: data.title,
      prompt: data.prompt,
      expected: safeParse(data.example, file),
    });
  }
}

const outPath = join(SKILL_ROOT, "test-cases.json");
await writeFile(
  outPath,
  `${JSON.stringify({ generated: true, count: cases.length, cases }, null, 2)}\n`,
);
console.log(
  `extract-tests: wrote ${outPath} (${cases.length} case(s) from ${ruleFiles.length} rule(s))`,
);

function safeParse(text, file) {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`extract-tests: ${file} example is not valid JSON: ${err.message}`);
  }
}

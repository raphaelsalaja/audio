#!/usr/bin/env node
// Validate every rule's frontmatter, section prefix, and (where present) example.
// Run: node src/validate.mjs (or `pnpm --dir skills/create-sound validate`)

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  parseFrontmatter,
  prefixOf,
  readRuleFiles,
  readSections,
  RULES_DIR,
} from "./lib.mjs";

const REQUIRED = ["title", "impact"];
const ALLOWED_IMPACTS = new Set([
  "CRITICAL",
  "HIGH",
  "MEDIUM-HIGH",
  "MEDIUM",
  "LOW-MEDIUM",
  "LOW",
]);

const sections = await readSections();
const knownPrefixes = new Set(sections.map((s) => s.prefix));
const ruleFiles = await readRuleFiles();

const errors = [];
const warnings = [];

for (const file of ruleFiles) {
  const prefix = prefixOf(file);
  if (!knownPrefixes.has(prefix)) {
    errors.push(`${file}: prefix "${prefix}" is not in _sections.md`);
    continue;
  }

  const raw = await readFile(join(RULES_DIR, file), "utf8");
  const { data } = parseFrontmatter(raw);

  for (const key of REQUIRED) {
    if (!data[key]) errors.push(`${file}: missing required frontmatter "${key}"`);
  }

  if (data.impact && !ALLOWED_IMPACTS.has(data.impact)) {
    errors.push(
      `${file}: impact "${data.impact}" is not one of ${[...ALLOWED_IMPACTS].join(", ")}`,
    );
  }

  if (data.example) {
    const exampleErrors = validateExample(data.example, file, prefix);
    errors.push(...exampleErrors);
  } else if (
    prefix === "event" ||
    prefix === "mood" ||
    prefix === "layer" ||
    prefix === "effect"
  ) {
    warnings.push(
      `${file}: rules in section "${prefix}" should normally include an \`example\` block`,
    );
  }
}

for (const w of warnings) console.warn(`warn: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\nvalidate: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(
  `validate: ${ruleFiles.length} rule(s) ok (${warnings.length} warning(s)).`,
);

function validateExample(example, file, prefix) {
  let parsed;
  try {
    parsed = JSON.parse(example);
  } catch (err) {
    return [`${file}: example is not valid JSON: ${err.message}`];
  }

  const errs = [];
  const layers = "layers" in parsed ? parsed.layers : [parsed];

  if (!Array.isArray(layers) || layers.length === 0) {
    errs.push(`${file}: example has no layers`);
    return errs;
  }

  let totalGain = 0;
  for (const [i, layer] of layers.entries()) {
    if (!layer.source) {
      errs.push(`${file}: layer[${i}] missing required "source"`);
      continue;
    }

    const freqErr = checkFrequency(layer.source.frequency, file, i);
    if (freqErr) errs.push(freqErr);

    if (layer.envelope) {
      if (typeof layer.envelope.decay !== "number" || layer.envelope.decay <= 0) {
        errs.push(`${file}: layer[${i}].envelope.decay must be > 0`);
      }
      if (
        typeof layer.envelope.sustain === "number" &&
        layer.envelope.sustain > 0 &&
        (typeof layer.envelope.release !== "number" || layer.envelope.release <= 0)
      ) {
        errs.push(
          `${file}: layer[${i}] sustain > 0 requires release > 0 (validate-envelope-sanity)`,
        );
      }
    }

    if (layer.filter) {
      const filters = Array.isArray(layer.filter) ? layer.filter : [layer.filter];
      for (const [fi, f] of filters.entries()) {
        if (typeof f.frequency === "number") {
          if (f.frequency < 20 || f.frequency > 20000) {
            errs.push(
              `${file}: layer[${i}].filter[${fi}].frequency ${f.frequency} out of bounds (20-20000)`,
            );
          }
        }
      }
    }

    if (typeof layer.gain === "number") {
      if (layer.gain < 0 || layer.gain > 0.6) {
        errs.push(
          `${file}: layer[${i}].gain ${layer.gain} outside recommended 0-0.6 (validate-gain-budget)`,
        );
      }
      totalGain += layer.gain;
    }
  }

  if (layers.length > 1 && totalGain > 0.6) {
    errs.push(
      `${file}: total layer gain ${totalGain.toFixed(2)} exceeds 0.6 budget (validate-gain-budget)`,
    );
  }

  return errs;
}

function checkFrequency(value, file, layerIdx) {
  if (value === undefined) return null; // noise/sample have no frequency
  if (typeof value === "number") {
    if (value < 20 || value > 20000) {
      return `${file}: layer[${layerIdx}].source.frequency ${value} out of bounds (20-20000)`;
    }
    return null;
  }
  if (value && typeof value === "object" && "start" in value && "end" in value) {
    if (value.start < 20 || value.start > 20000) {
      return `${file}: layer[${layerIdx}].source.frequency.start ${value.start} out of bounds`;
    }
    if (value.end < 20 || value.end > 20000) {
      return `${file}: layer[${layerIdx}].source.frequency.end ${value.end} out of bounds`;
    }
    return null;
  }
  return `${file}: layer[${layerIdx}].source.frequency has unexpected shape`;
}

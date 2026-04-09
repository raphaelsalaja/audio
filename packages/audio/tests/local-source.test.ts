import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  discoverPatchesFromLocal,
  isLocalSource,
} from "../src/commands/utils.js";

describe("isLocalSource", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(
      tmpdir(),
      `audio-kit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns true for an existing directory", () => {
    expect(isLocalSource(tempDir)).toBe(true);
  });

  it("returns true for an existing file", () => {
    const file = join(tempDir, "patch.json");
    writeFileSync(file, "{}");
    expect(isLocalSource(file)).toBe(true);
  });

  it("returns false for a non-existent path", () => {
    expect(isLocalSource(join(tempDir, "nope"))).toBe(false);
  });

  it("returns false for HTTP URLs", () => {
    expect(isLocalSource("https://example.com/patch.json")).toBe(false);
  });

  it("returns false for owner/repo shorthand", () => {
    expect(isLocalSource("raphaelsalaja/audio-kit")).toBe(false);
  });
});

describe("discoverPatchesFromLocal", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(
      tmpdir(),
      `audio-kit-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("discovers a single patch file", async () => {
    const file = join(tempDir, "core.json");
    writeFileSync(
      file,
      JSON.stringify({
        name: "Core",
        description: "Core UI sounds",
        sounds: { click: {}, pop: {}, toggle: {} },
      }),
    );

    const patches = await discoverPatchesFromLocal(file);
    expect(patches).toHaveLength(1);
    expect(patches[0].name).toBe("Core");
    expect(patches[0].soundCount).toBe(3);
    expect(patches[0].description).toBe("Core UI sounds");
  });

  it("discovers patches from a directory", async () => {
    writeFileSync(
      join(tempDir, "patch-a.json"),
      JSON.stringify({ name: "A", sounds: { click: {} } }),
    );
    writeFileSync(
      join(tempDir, "patch-b.json"),
      JSON.stringify({ name: "B", sounds: { pop: {}, toggle: {} } }),
    );
    writeFileSync(join(tempDir, "not-a-patch.json"), JSON.stringify({ foo: 1 }));

    const patches = await discoverPatchesFromLocal(tempDir);
    expect(patches).toHaveLength(2);

    const names = patches.map((p) => p.name).sort();
    expect(names).toEqual(["A", "B"]);
  });

  it("throws for an invalid single patch file", async () => {
    const file = join(tempDir, "bad.json");
    writeFileSync(file, JSON.stringify({ foo: "bar" }));

    await expect(discoverPatchesFromLocal(file)).rejects.toThrow(
      "not a valid sound patch",
    );
  });

  it("skips index.json in directories", async () => {
    writeFileSync(
      join(tempDir, "index.json"),
      JSON.stringify({ name: "Index", sounds: { x: {} } }),
    );
    writeFileSync(
      join(tempDir, "real.json"),
      JSON.stringify({ name: "Real", sounds: { y: {} } }),
    );

    const patches = await discoverPatchesFromLocal(tempDir);
    expect(patches).toHaveLength(1);
    expect(patches[0].name).toBe("Real");
  });

  it("returns empty array for directory with no valid patches", async () => {
    writeFileSync(join(tempDir, "readme.txt"), "not json");
    const patches = await discoverPatchesFromLocal(tempDir);
    expect(patches).toEqual([]);
  });
});

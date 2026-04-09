import { describe, expect, it } from "vitest";
import { validatePatch } from "../src/commands/utils.js";

describe("validatePatch", () => {
  it("returns true for a valid patch with name and sounds", () => {
    const data = {
      name: "test-patch",
      sounds: { click: { source: { type: "sine" } } },
    };
    expect(validatePatch(data)).toBe(true);
  });

  it("returns true for a patch with empty sounds object", () => {
    const data = { name: "empty", sounds: {} };
    expect(validatePatch(data)).toBe(true);
  });

  it("returns false when name is missing", () => {
    const data = { sounds: { click: {} } };
    expect(validatePatch(data)).toBe(false);
  });

  it("returns false when name is not a string", () => {
    const data = { name: 42, sounds: {} };
    expect(validatePatch(data as Record<string, unknown>)).toBe(false);
  });

  it("returns false when sounds is missing", () => {
    const data = { name: "test" };
    expect(validatePatch(data as Record<string, unknown>)).toBe(false);
  });

  it("returns false when sounds is null", () => {
    const data = { name: "test", sounds: null };
    expect(validatePatch(data as Record<string, unknown>)).toBe(false);
  });

  it("returns false when sounds is a string", () => {
    const data = { name: "test", sounds: "not-an-object" };
    expect(validatePatch(data as Record<string, unknown>)).toBe(false);
  });

  it("returns false for empty object", () => {
    expect(validatePatch({})).toBe(false);
  });
});

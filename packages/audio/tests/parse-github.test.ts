import { describe, expect, it } from "vitest";
import { isGitHubSource, parseGitHubSource } from "../src/commands/utils.js";

describe("parseGitHubSource", () => {
  it("parses owner/repo shorthand", () => {
    const result = parseGitHubSource("raphaelsalaja/audio");
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "",
    });
  });

  it("parses full GitHub URL", () => {
    const result = parseGitHubSource("https://github.com/raphaelsalaja/audio");
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "",
    });
  });

  it("parses GitHub URL with trailing slash", () => {
    const result = parseGitHubSource("https://github.com/raphaelsalaja/audio/");
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "",
    });
  });

  it("parses GitHub URL with .git suffix", () => {
    const result = parseGitHubSource(
      "https://github.com/raphaelsalaja/audio.git",
    );
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "",
    });
  });

  it("parses GitHub URL with branch", () => {
    const result = parseGitHubSource(
      "https://github.com/raphaelsalaja/audio/tree/develop",
    );
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "develop",
      path: "",
    });
  });

  it("parses GitHub URL with branch and path", () => {
    const result = parseGitHubSource(
      "https://github.com/raphaelsalaja/audio/tree/main/packs",
    );
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "packs",
    });
  });

  it("returns null for a plain URL", () => {
    expect(parseGitHubSource("https://example.com/pack.json")).toBeNull();
  });

  it("returns null for a local path", () => {
    expect(parseGitHubSource("./packs/core.json")).toBeNull();
  });

  it("returns null for a single word", () => {
    expect(parseGitHubSource("audio")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseGitHubSource("")).toBeNull();
  });

  it("parses owner/repo shorthand with .git suffix", () => {
    const result = parseGitHubSource("raphaelsalaja/audio.git");
    expect(result).toEqual({
      owner: "raphaelsalaja",
      repo: "audio",
      branch: "main",
      path: "",
    });
  });
});

describe("isGitHubSource", () => {
  it("returns true for owner/repo", () => {
    expect(isGitHubSource("raphaelsalaja/audio")).toBe(true);
  });

  it("returns true for GitHub URL", () => {
    expect(isGitHubSource("https://github.com/raphaelsalaja/audio")).toBe(true);
  });

  it("returns false for a URL that is not GitHub", () => {
    expect(isGitHubSource("https://example.com/pack.json")).toBe(false);
  });

  it("returns false for a single word", () => {
    expect(isGitHubSource("packs")).toBe(false);
  });
});

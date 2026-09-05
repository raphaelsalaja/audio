# @web-kits/audio

## 0.2.0

### Patch Changes

- Restore the Node.js interpreter header so the installed `audio` CLI runs correctly.

### Minor Changes

- ec45185: Add a `jitter` option to `PlayOptions` for per-voice random variation. Pick any combination of `detune` (cents), `volume` (fraction), and `playbackRate` (fraction) to humanize repeated triggers — so buttons pressed in quick succession no longer sound identical.

  ```ts
  click({ jitter: { detune: 60 } });
  ```

## 0.1.0

### Minor Changes

- adbb53d: Rename "packs" to "patches" across the entire API surface, CLI, and documentation. Generated TypeScript modules replace JSON files for zero-ceremony consumption.

  **Breaking changes:**
  - `loadPack` → `loadPatch`, `definePack` → `definePatch`, `usePack` → `usePatch`
  - `SoundPack` → `SoundPatch`, `AudioPack` → `AudioPatch`
  - CLI commands now use "patch" terminology (`add`, `list`, `remove`, `init`, `update`)
  - `packs/` directory renamed to `patches/`
  - `pack.schema.json` redirects to the new canonical `patch.schema.json`

  **New features:**
  - CLI generates TypeScript modules with pre-wired `defineSound()` exports
  - Configurable output directory via `.web-kits/config.json`
  - Barrel `index.ts` auto-generated for namespace imports

### Patch Changes

- a1db6a2: Migrate CLI output to use `@clack/prompts` consistently across all commands, replacing raw `console.log` + `picocolors` in `index`, `find`, `check`, and `update`.
- f204940: `init` command now creates patches in `.web-kits/` instead of the working directory, establishing a standard location for shareable sound patches.

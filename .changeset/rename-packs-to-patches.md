---
"@web-kits/audio": minor
---

Rename "packs" to "patches" across the entire API surface, CLI, and documentation. Generated TypeScript modules replace JSON files for zero-ceremony consumption.

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

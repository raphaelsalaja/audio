# audio-kit

[![npm](https://img.shields.io/npm/v/audio-kit)](https://www.npmjs.com/package/audio-kit)
[![license](https://img.shields.io/github/license/raphaelsalaja/audio-kit)](LICENSE)
[![CI](https://github.com/raphaelsalaja/audio-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/raphaelsalaja/audio-kit/actions/workflows/ci.yml)

Declarative audio synthesis for the web. Describe sounds as plain objects, play them with one function call.

## Install

```bash
npm install audio-kit
```

## Quick start

```ts
import { defineSound, ensureReady } from "audio-kit";

const click = defineSound({
  source: { type: "sine", frequency: { start: 1200, end: 300 } },
  envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
  gain: 0.3,
});

await ensureReady();
click();
```

### React

```tsx
import { usePack } from "audio-kit/react";

function App() {
  const pack = usePack("/packs/ui-essentials.json");

  return (
    <button onClick={() => pack.play("click")} disabled={!pack.ready}>
      Click me
    </button>
  );
}
```

## CLI

Browse and install community sound packs directly from GitHub repos:

```bash
# Browse the registry
npx audio-kit add

# Install from a GitHub repo
npx audio-kit add user/repo

# Create a new pack
npx audio-kit init

# List installed packs
npx audio-kit list
```

## Monorepo structure

```
packages/audio-kit   Core library + CLI (published to npm)
apps/docs            Documentation site (Fumadocs)
apps/web             Pack registry and homepage (audio-kit.dev)
ui/                  Shared UI components
packs/               First-party sound packs
```

## Documentation

Full docs at [audio-kit.dev](https://audio-kit.dev).

## References

- Built on the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Pack discovery and CLI inspired by [skills.sh](https://skills.sh) by Vercel

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## License

[MIT](LICENSE)

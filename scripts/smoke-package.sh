#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_dir="$(mktemp -d)"
trap 'rm -rf "$smoke_dir"' EXIT

cd "$repo_dir/packages/audio"
expected_version="$(node -p 'require("./package.json").version')"
npm pack --pack-destination "$smoke_dir" --json > "$smoke_dir/pack.json"
tarball="$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))[0].filename' "$smoke_dir/pack.json")"

npm install --prefix "$smoke_dir/consumer" "$smoke_dir/$tarball" \
  --ignore-scripts --no-audit --no-fund

cd "$smoke_dir/consumer"
node --input-type=module -e '
  import { defineSound } from "@web-kits/audio";
  if (typeof defineSound !== "function") throw new Error("Missing defineSound export");
'

actual_version="$(./node_modules/.bin/audio --version)"
if [[ "$actual_version" != "$expected_version" ]]; then
  echo "Expected CLI version $expected_version, got $actual_version" >&2
  exit 1
fi
./node_modules/.bin/audio --help
echo "Packed @web-kits/audio@$expected_version passed installation and CLI checks."

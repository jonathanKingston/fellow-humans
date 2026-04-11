# AGENTS.md

## Cursor Cloud specific instructions

**Fellow Humans** is a Chrome extension (Manifest V2) that replaces immigration/migration-related text on web pages with more humane alternatives. It has zero npm/pip dependencies and no backend services.

### Project structure

- `src/` — Extension source: `manifest.json`, `contentScript.js`, icons
- `Makefile` — Packs the `.crx` using `google-chrome --pack-extension`
- `FellowHumans.crx` — Pre-built extension package

### Running / testing the extension

1. **Load as unpacked extension:** `google-chrome --no-sandbox --load-extension=/workspace/src <url>`
2. **Serve a test page over HTTP** (file:// URLs don't allow content scripts by default): use `python3 -m http.server` or similar from a directory containing test HTML files.
3. The extension replaces text in real time via a `MutationObserver`, so dynamically loaded content is also handled.

### Building

The `Makefile` runs `google-chrome --pack-extension=src --pack-extension-key=FellowHumans.pem`. Since the `.pem` is gitignored, generate a throwaway key for testing with `openssl genrsa 2048 > FellowHumans.pem`. Use `xvfb-run` if no display is available.

### Caveats

- No test framework, linter, or CI is configured. Validation is manual: load the extension and verify text replacements on a page.
- The extension uses Manifest V2. Chrome 147+ still loads it in developer mode but may warn.

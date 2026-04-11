# AGENTS.md

## Cursor Cloud specific instructions

**Fellow Humans** is a browser extension (Manifest V3) that replaces immigration/migration-related text on web pages with more humane alternatives. It has no backend services and only a small Node-based test dependency set.

### Project structure

- `src/` — Extension source: `manifest.json`, `contentScript.js`, icons
- `Makefile` — Builds browser upload packages into `dist/`
- `test/` — Node tests and manual smoke-test fixture

### Running / testing the extension

1. **Serve a test page over HTTP** (file:// URLs don't allow content scripts by default): `python3 -m http.server 8000`
2. **Use the bundled smoke page:** open `http://127.0.0.1:8000/test/manual/smoke.html`
3. **Chrome:** launch with `google-chrome --no-sandbox --load-extension=/workspace/src http://127.0.0.1:8000/test/manual/smoke.html`
4. **Firefox:** use a temporary add-on install for `/workspace/src`, then open the same smoke page.
5. The extension replaces text in real time via a `MutationObserver`, so dynamically loaded content is also handled.

### Building

Run `make build`. It creates `dist/fellow-humans-chrome.zip` and `dist/fellow-humans-firefox.xpi` directly from `src/`.

### Caveats

- Validation should include `npm test` plus a manual smoke test in a browser.
- Chrome and Firefox packaging both use the same source tree; store publishing/signing is not automated in-repo yet.

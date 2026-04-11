# Fellow Humans

<img src="src/FH.svg" alt="Fellow Humans logo" width="128" height="128" />

Replaces lots of strings of text like 'migration' to 'movement' and 'migrants' to 'fellow humans'.

[Chrome Store extension](https://chrome.google.com/webstore/detail/fellow-humans/npncpfbngkohbacfblnojfihgnnlcbpf)

## Manifest V3

The extension now uses Chrome Manifest V3.

## Tests

Install dependencies and run the automated test suite:

```bash
npm install
npm test
```

The test suite exercises the content script logic and validates that manifest-declared assets exist.

## Builds

Generated browser packages should not be committed. Build outputs now go to `dist/`:

```bash
make build
```

That produces:

- `dist/fellow-humans-chrome.zip` for Chrome Web Store uploads
- `dist/fellow-humans-firefox.xpi` for Firefox temporary installs or AMO uploads

Both packages are built from the contents of `src/`.

## Manual smoke test

Serve the bundled smoke page over HTTP and load the extension temporarily:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/test/manual/smoke.html`.

The page covers:

- initial replacements in page content and the document title
- dynamic replacements triggered after page load

## Firefox support

The extension currently uses standard Manifest V3 `content_scripts` and plain DOM APIs only, so the runtime logic is browser-neutral. The included smoke page is suitable for validating the same behavior in Firefox via a temporary add-on install.

## Build automation outline

A minimal CI workflow can automate builds without adding more project dependencies:

1. Check out the repository.
2. Run `npm ci`.
3. Run `npm test`.
4. Run `make build`.
5. Upload `dist/fellow-humans-chrome.zip` and `dist/fellow-humans-firefox.xpi` as build artifacts.
6. Optionally add separate publish jobs that submit those artifacts to the Chrome Web Store and AMO using repository secrets.

If you want that fully wired in, the next step would be adding a GitHub Actions workflow under `.github/workflows/`.

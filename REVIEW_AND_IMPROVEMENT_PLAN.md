# Review and improvement plan

## Validation summary

- `npm test` passes after installing the documented Node dependencies with `npm ci`.
- `make build` produces both browser packages from `src/`.
- A manual Chrome smoke test confirms the extension rewrites:
  - page title text on initial load
  - static page copy on initial load
  - dynamically appended text via the existing `MutationObserver`

## Findings

### 1. Title-cased phrases are rewritten with incorrect capitalization

- Reproduced with `changeAllInstances('Migration Policy')`.
- Current output: `movement Policy`
- Expected output: `Movement Policy`
- Root cause: `replaceText()` treats a sentence-cased source string as a signal to call `sentenceCase(replaceWith)`, which preserves the replacement in lowercase for single-word replacements.
- Impact: user-visible grammar regression in titles, headings, and labels that use title case.

### 2. In-place text updates are not rewritten after page load

- Reproduced by initializing the content script and then changing an existing text node's `nodeValue` to `migration update`.
- Current output remains `migration update`.
- Root cause: `observerConfig.characterData` is `false`, and the observer callback only handles `childList` mutations.
- Impact: pages that update existing text nodes in place will bypass the extension even though newly appended nodes are handled.

## Improvement plan

### Priority 1: fix correctness issues

1. Update the casing logic in `replaceText()` so title-cased matches return `upperCaseFirst(replaceWith)` instead of lowercase sentence-case output.
2. Extend the observer to handle `characterData` mutations and reprocess the mutated text node safely.
3. Add regression tests for both issues before or alongside the code changes.

### Priority 2: expand automated coverage

1. Add targeted tests for:
   - title-cased phrases such as `Migration Policy`
   - in-place text-node updates after `init()`
   - overlapping replacements such as `migrants migrated`
   - punctuation and delimiter cases such as `immigration/migration`
2. Add a focused browser-level smoke check for Firefox to confirm the MV3 content script behaves the same there.

### Priority 3: clarify intended language behavior

1. Decide whether replacements inside hyphenated compounds such as `Re-migration` are desirable.
2. Decide whether all-uppercase matches should stay fully uppercase or convert to title case for readability.
3. Document these language rules in `README.md` so future changes can preserve the intended editorial behavior.

## Suggested implementation order

1. Add failing tests for capitalization and `characterData` mutation handling.
2. Fix `replaceText()` capitalization behavior.
3. Update the observer config and callback to process text mutations.
4. Re-run `npm test`, `make build`, and the manual browser smoke test in Chrome and Firefox.

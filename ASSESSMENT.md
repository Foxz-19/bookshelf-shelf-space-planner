# Final deep assessment: Paint Roller Coverage Calculator

## Assessment scope

This report applies `prompt.md` to the Paint Roller Coverage Calculator described at the top of `brief.txt`. The later negative examples about candles, cocktails, gifts, shows, coffee, loading UI, and unrelated data models are not requirements for this project. Relevant cross-cutting concerns from those examples (modules, typing, tests, validation, persistence feedback, destructive-action confirmation, and accessible feedback) were assessed.

## Defects found and fixed in this review

1. **Live calculation was not truly live.** Results only changed after **Add wall**. The app now derives a temporary wall/opening from each form on every `input` event. The summary therefore changes while the user types, while storage and the review lists change only after submit.
2. **A temporary seventh wall could affect totals.** When six walls existed, a valid draft seventh wall was included in the live summary even though submit rejected it. Draft creation now respects the six-wall limit.
3. **Malformed saved records could produce invalid results.** Previously, a parsed storage value only needed arrays and an integer coat count; invalid array entries could lead to `NaN`. Loading now validates every stored width/height and the 1-10 coat range, resets unsafe data, and gives a persistent recovery message.
4. **An untrusted stored opening label could reach HTML rendering.** Opening types restored from storage are now restricted to the three application-owned options before rendering. A hostile or malformed label triggers safe recovery instead.
5. **A stored wall identity could reach an HTML attribute.** Restored IDs now require a safe identifier format, and walls must not carry an unexpected type field. Invalid saved state recovers before any list HTML is rendered.
6. **Extreme but finite dimensions could overflow aggregate arithmetic.** Every measurement is now bounded to 0.1-10,000 ft in the native controls and shared validator. This keeps all supported wall, opening, coat, and gallon calculations finite.

## Complete brief traceability

| Requirement | Implementation evidence | Status |
| --- | --- | --- |
| Single page/no reload | Both forms prevent native submission; state and DOM update in modules. | Pass |
| Up to six walls | Counter shows `n of 6`; submit and draft logic both enforce six. | Pass |
| Wall width and height | Required numeric inputs, decimal support, finite validation, and a 0.1-10,000 ft bound. | Pass |
| Number of coats | Accessible plus/minus controls constrain the value to 1-10. | Pass |
| Optional doors/windows | Separate optional opening form supports Door, Window, and Other opening. | Pass |
| Live browser math | Input events re-render the draft-inclusive summary immediately. | Pass |
| 350 sq ft per gallon | Single `COVERAGE_PER_GALLON = 350` calculation constant. | Pass |
| Total paintable sq ft | Wall area minus openings is clamped at zero, then multiplied by coats. | Pass |
| Exact gallons (two decimals) | `exact.toFixed(2)` is displayed. | Pass |
| Gallons to buy | `Math.ceil(exact)` is displayed. | Pass |
| Review/delete walls | Saved walls render in a list; each has an accessible remove control. | Pass |
| Destructive safety | Single deletion and Clear all require a native confirmation dialog. | Pass |

## Calculation checks

- The automated reference case is 12 ft x 8 ft wall, 3 ft x 7 ft opening, and 2 coats: `(96 - 21) x 2 = 150 sq ft`; exact gallons are `150 / 350`; purchase quantity is `1`.
- An opening larger than the wall is clamped to `0 sq ft`, preventing negative paint or negative gallons.
- Zero, negative, empty, non-finite, and over-limit dimensions are rejected before saving.
- The new draft guard ensures typing dimensions after wall six cannot increase the displayed result.

## Architecture, resilience, and accessibility

- `js/core.js` contains deterministic calculation and validation functions plus JSDoc state definitions.
- `js/storage.js` owns load/save behavior and rejects malformed data safely.
- `js/app.js` owns DOM state, rendering, events, live drafts, dialogs, and notifications; there are no inline global handlers or a monolithic IIFE.
- CSS custom properties centralize the color, spacing, and font system.
- Save and load failures are surfaced in a persistent status toast; invalid submission messages use `aria-live`.
- Native labels, visible focus styles, named icon controls, live result/list regions, semantic lists, and a labelled dialog support keyboard and screen-reader use.
- Invalid submission now marks the affected dimensions with `aria-invalid`; a successful corrected submission clears that state.
- Dialog close restores focus to its originating control when possible, with the wall-width field as a reliable fallback after a deleted control disappears.
- User values reaching `innerHTML` are constrained numeric fields, safe-format IDs, or validated application-owned select options; no credentials or external data are present.

## Safe usability improvements applied

- **Clear openings:** removes all saved doors/windows only after an explicit confirmation.
- **Reset plan:** removes all saved walls and openings and returns coats to two, only after confirmation.
- Both actions are disabled when they have no effect, preserve the existing no-reload workflow, and use the same persisted state path as the required wall deletion feature.
- These are additive controls. They do not alter the brief's six-wall limit, area formula, 350-sq-ft coverage basis, live calculation behavior, or rounded purchase quantity.
- The result panel remains visible while scrolling on desktop; compact mobile layout stays in normal document flow.
- A live draft note quantifies the pending area change, openings show their saved subtraction total, and an explicit openings empty state removes ambiguity.
- Success feedback confirms add, delete, clear, and reset actions without replacing a persistent storage-error message.

## Verification evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Unit tests | `npm test` | Pass: 6/6 |
| Syntax | `node --check js/app.js`, `core.js`, `storage.js` | Pass |
| HTTP serving | `HEAD http://localhost:4173` | `200 OK` |
| Raw source constraint | Actual source files only: HTML, CSS, JS, package, and tests. Markdown/text excluded. | **18,258 bytes**, within 25,600-byte limit |
| Browser-tool health | `agent-browser doctor --offline --quick` | Pass: 6 checks, 0 failures |
| Browser interaction/a11y scan | A clean browser session still timed out while attaching to the responsive local server. | Not counted as passed |

## Remaining limitations

Pure calculations and malformed-storage recovery are automated. DOM interaction and storage-write failure are inspected statically. Although browser-tool health checks pass, its local-page attachment timeout means no visual screenshot or automated axe scan is claimed in this assessment.

## Prompt-format evaluation

```json
{
  "evaluation": {
    "completeness": {
      "score": 5,
      "reasoning": "Every Paint Roller brief requirement is implemented and reachable. The final review fixed live typing, the six-wall draft edge case, malformed saved-data recovery, and numeric overflow risk; validation, zero-area clamping, confirmation, and no-reload behavior handle important off-happy-path cases."
    },
    "problem_solving_design": {
      "score": 5,
      "reasoning": "The measure, subtract, choose-coats, and buy workflow directly serves a DIY paint shopper. A sticky desktop purchase result, draft-area feedback, opening summary, empty state, explicit success feedback, responsive layout, labelled controls, and accessible confirmation flow make the product clear and polished."
    },
    "technical_craft": {
      "score": 5,
      "reasoning": "The app uses ES modules, JSDoc state contracts, shared design tokens, deterministic bounded calculation logic, defensive local storage validation, safe ID and opening-type allowlisting before HTML rendering, accessible dialog focus restoration, and a wired six-test Node suite. It is 18,258 raw-source bytes, safely below the limit."
    },
    "overall_summary": "A complete Paint Roller Coverage Calculator with live, safe calculations and a compact, maintainable browser-only implementation. Six confirmed edge-case defects were fixed in the final deep review."
  }
}
```

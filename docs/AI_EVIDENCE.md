# AI Evidence Appendix & Reflection (Task 6)

**Student:** Ulykbek Dias (24B032168)  
**AI assistant used:** Claude (Anthropic), model Sonnet 5.5 (`claude-sonnet-5-5`) – the serving model may differ from the configured one.  
**Date:** 2026-11-07

> ⚠️ Before submitting, read every row and edit anything that does not match what *you* actually did and checked. This record must be truthful – delete or change any line you did not do yourself.

## 1. AI-use record

| # | Tool / date | Prompt summary | Output used | Problems found | Changes made | Verification source |
|---|---|---|---|---|---|---|
| 1 | Claude, 2026-11-07 | Attached the Assignment #04 slides and my Assignment #03 report; asked to complete the work with a step-by-step guide | Task plan; project layout; decision to rebuild v1 as a minimal HTML/JS version from the Assignment #03 report (my Bolt/Python code was not attached) | First draft of v1 used my own invented AC wording (HH:MM only, no "now" field) instead of my Assignment #03 rules | Rebuilt v1 and v2 to the Assignment #03 rules: minutes, "now", blocked, Room 301 booking 10:00–11:00 | Compared against the Assignment #03 tables (3.1, 3.2) and slides 9–23 |
| 2 | Claude | Baseline: monolithic single-room v1 + tests for AC1–AC6 | `v1/app.js`, `v1/baseline.test.js` | A jsdom test failed first because scripts were not executed | Added `runScripts: "outside-only"` | `npm run test:v1` → 13/13 pass |
| 3 | Claude | Analysis prompt: repo map + AC + constraints → ≥3 risks with file/function references and a prioritised plan, no code edits | Risk table and plan in `docs/REPORT.md` (Task 1) | Return shape with CSS `kind` strings judged a poor fit | Replaced by semantic `status` + `error` codes (see report) | Manual read of `v1/app.js`; `grep` counts |
| 4 | Claude | Implement the plan one module at a time (data → time → availability → filter → render → controller) | `src/**`, `index.html`, `style.css` | None at first run | Reviewed `git diff v1-initial v2-final` | `npm test` → 81/81; browser check at 375 px width: no overflow, no console errors |
| 5 | Claude | Write tests: AC regression, v1-vs-v2 parity, filters, DOM integration | `tests/*.test.js` (81 tests) | One test failed: a catalog booking (780–840) clashed with the 720–840 boundary case | Moved that booking to 900–960; kept the test | Output in report Task 4 table |
| 6 | Claude | Compute quality evidence | Evidence table | First `innerHTML` count in v2 matched a code **comment** (reported 1, true value 0) | Re-ran with comment lines excluded; all counts re-checked | `grep` commands listed in report Task 5 |

## 2. Selected prompts (condensed)

1. *"Here is the repo map, acceptance criteria AC1–AC6 and constraints (fictional data, fixed time 09:00, no login/payments/APIs/DB, no build step). Identify ≥3 maintainability risks with file/function references and propose a prioritised plan. Do not edit code yet."*
2. *"Implement step 1 of the plan only (extract `time.js` and `availability.js` as pure functions). Keep every v1 message unchanged. Do not touch the UI."*
3. *"Add room catalog (≥4 rooms) and `filterRooms` for capacity ≥ attendees and ALL equipment. Blocked rooms must never be reported available."*
4. *"Write executable tests: AC1–AC5 regression (using my Assignment #03 test table), F1–F5, boundaries 120/121 min, touching vs overlap, exact vs insufficient capacity, a v1-vs-v2 parity test, plus DOM integration tests."*

## 3. Decisions and human review

* Kept blocked rooms **visible with a badge** in filter results instead of hiding them – hiding would make F3 untestable at UI level and confuse users.
* Chose `node:test` + `jsdom` and plain JS instead of re-using React/Vite from Bolt.new, to keep the project small and runnable with no build step.
* Made "blocked" a property of each room (it was a UI toggle in Assignment #03) because the new requirements need a per-room blocked status.
* Rejected returning CSS class names from domain code (see report, Task 1).
* Human verification: ran every test command myself, inspected the diff between tags, ran mutation checks, opened the page in a browser, re-ran all `grep` commands.

---

## 4. AI reflection (Task 6, ~250 words)

**Context.** I gave the assistant a concise repository map, the acceptance criteria AC1–AC6 from Assignment #03, the new requirements F1–F5 and the constraints (fictional data, fixed time 09:00, no login, payments, live APIs or database, no build step), and asked for analysis and a plan before any code.

**Useful vs incorrect.** The assistant correctly identified the duplicated time parsing, the duplicated HH:MM formatting, the repeated `innerHTML` rendering and the single hard-coded room, and proposed a layered domain/UI split that I adopted. Two outputs were wrong: its first draft of the baseline used its own invented rules instead of my Assignment #03 criteria, so I had it rebuilt from my report; and a first duplication count included a code comment, which I found by reading the matches and corrected.

**What I verified personally.** I ran the baseline tests on the original version before changing anything, then `npm test` after each change; I reviewed the diffs; I injected eight deliberate faults to confirm the tests really fail; I checked the page at phone width in a browser; and I re-ran every command behind the evidence table.

**Influence of tests.** The baseline fixed the behaviour I had to preserve. The mutation check showed which boundaries were protected (120/121 minutes, start = now, touching vs overlapping, capacity 24 vs 25). A parity test that sends the same inputs through v1 and v2 let me refactor without changing a single message, and it drove passing the room as a parameter.

**Next.** I would add dates and recurring bookings, persist created bookings, test in a real browser with an accessibility audit and keyboard navigation, and separate the "no rooms match" and "invalid attendees" messages.

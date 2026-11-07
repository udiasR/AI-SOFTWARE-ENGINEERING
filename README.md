# Smart Campus – Room Availability Checker (Assignment #04)

AI-assisted evolution of a single-room prototype (v1) into a multi-room, filterable, modular app (v2).
Fictional data only. No login, payments, live APIs or database.

## Versions (Git)
| Tag | Commit | Contents |
|---|---|---|
| `v1-initial` | `a587cb9` | `v1/` – single-room monolith (Assignment #03 behaviour) + 13 baseline tests |
| `v2-final` | `fc62d5a` | `src/`, `index.html`, `tests/` – catalog, filters, refactor, 81 tests |

Compare: `git diff v1-initial v2-final --stat`

> v1 is a minimal HTML/JS re-creation of my Assignment #03 prototype (Python `can_book` + Bolt.new page); AC1–AC6 are the Assignment #03 criteria, listed in `docs/REPORT.md`.

## Setup
Requires Node.js ≥ 20 and (for the browser) Python 3 or any static file server.
```bash
npm install
```

## Run the app
```bash
npm start            # serves http://localhost:8080  -> open /index.html (v2)
# v1 (original): open v1/index.html directly in a browser
```
(ES modules need http://, not file://.)

## Run the tests
```bash
npm test             # v2: 81 tests (AC regression 14, v1-vs-v2 parity 46, filters 9, DOM integration 12)
npm run test:v1      # v1 baseline: 13 tests
```
Recorded actual output: `results/v1-baseline-tests.txt`, `results/v2-tests.txt`.

## Layout
```
index.html, style.css          UI shell (v2)
src/data/rooms.js              fictional catalog (frozen), fixed NOW = 09:00
src/domain/time.js             parseTime, intervalsOverlap
src/domain/availability.js     validateRequest, checkAvailability (AC1-AC5)
src/domain/filter.js           filterRooms, parseAttendees (F1, F2)
src/ui/render.js               DOM rendering only
src/ui/app.js                  controller (events, state, F4, F5)
tests/                         regression, filters, ui.integration
v1/                            original version + baseline tests
docs/                          REPORT.md, AI_EVIDENCE.md, diagrams, screenshot
```

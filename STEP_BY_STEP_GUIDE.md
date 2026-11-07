# Step-by-step guide – Assignment #04 (Smart Campus Room Availability Checker)

**Deadline: 08 Nov 2026, 23:59:59.** Email to **kibo.kz.contact.01@gmail.com** only – never to z.aldamuratov@kbtu.kz (not even cc). Wrong format = rejected, no resubmission.

## Phase 0 – Understand what is graded
Six tasks: (1) codebase analysis, (2) feature extension, (3) refactoring, (4) ≥10 executable tests, (5) quality evidence table, (6) 200–300-word AI reflection. Deliverables: source for initial + final versions (or Git commits), README, tests + real results, report with diagrams, AI evidence appendix. Optional MCP/Skill extension – skip it.

## Phase 1 – Set up (10 min)
1. Unzip the package, `cd smart-campus-a04`, run `npm install`.
2. Run `npm run test:v1` → expect **13/13**. Run `npm test` → expect **81/81**. This is your baseline evidence.
3. `npm start`, open http://localhost:8080/index.html and try: attendees `25` + tick *projector* → pick *Seminar Room B*, 09:30–10:00 → conflict message; attendees `500` → empty state; pick the BLOCKED room → "blocked".
4. `v1/` is a re-creation of your Assignment #03 behaviour (minutes, "now", blocked, Room 301 booking 10:00–11:00). If your instructor wants your original Bolt/Python code, add it to the repo as `assignment03/` and cite it in the report; the tests here do not depend on it.

## Phase 2 – Task 1: analysis (AI session, 20 min)
Give your AI assistant: a repo map (file list + one line each), your AC1–AC6, constraints (fictional data, fixed time, no login/payments/APIs/DB). Prompt:
> "Identify at least 3 maintainability risks with file/function references. Propose a prioritised improvement plan. Do NOT edit code yet."

Then **verify each claim yourself** by opening the file (`grep -n "parseInt" v1/app.js`). Keep one suggestion you rejected or changed *and why* (the report has one example – replace it with yours if you disagree with the AI at any point).

## Phase 3 – Tasks 2 + 3: implement and refactor (one change at a time)
Order used here (commit after each, run `npm test` each time):
1. `src/domain/time.js` (parse + overlap) → 2. `src/domain/availability.js` (AC1–AC4 as pure functions taking `room`) → 3. `src/data/rooms.js` (≥4 rooms with id, name, capacity, equipment, blocked, bookings; deep-freeze) → 4. `src/domain/filter.js` (F1 capacity ≥, F2 ALL equipment) → 5. `src/ui/render.js` (one message renderer) → 6. `src/ui/app.js` (events; F4 empty state; F5 re-check on room change).

Rules: ask the AI for a *plan*, not a rewrite; read every diff (`git diff`); keep v1 messages unchanged so behaviour stays identical.

## Phase 4 – Task 4: tests
Files: `tests/regression.test.js` (AC1–AC5 + 120/121, touching/overlap), `tests/parity.test.js` (same inputs through v1 and v2), `tests/filters.test.js` (F1–F4, exact capacity), `tests/ui.integration.test.js` (DOM, F5, AC6). Run `npm test` and save output to `results/`. **Prove the tests are real:** break the code on purpose (e.g. change `<` to `<=` in `intervalsOverlap`) and confirm a test fails, then revert.

## Phase 5 – Task 5: evidence (no invented numbers)
Re-run the commands listed in `docs/REPORT.md` → Task 5 table (grep counts, `wc`, test output) on **your** final code. Write down *how* each number was obtained. Include at least one limitation.

## Phase 6 – Task 6 + AI record
Edit `docs/AI_EVIDENCE.md`: tool, date, prompts, outputs used, problems found, changes, verification. **Every sentence must be true for your own session** – remove anything you did not do (e.g. don't claim a browser check you skipped). Rewrite the reflection in your voice, 200–300 words, answering the 5 questions.

## Phase 7 – Package and submit
1. Check your name in `docs/REPORT.md`; regenerate Word copy: `cd docs && pandoc REPORT.md -o REPORT.docx`.
2. Commit any edits: `git add -A && git commit -m "final"` (tags `v1-initial` / `v2-final` already mark the two versions).
3. Zip **without** `node_modules` (e.g. `zip -r Surname_Name_A04.zip . -x "node_modules/*"`; keep `.git`).
4. New email to kibo.kz.contact.01@gmail.com, subject exactly:  
   `Software Engineering - Assignment #04 - Ulykbek Dias`  
   (slide example: `Software Engineering - Assignment #04 - Aldamuratov Jomart`; if your surname/name order differs, adjust). Attach the zip (and the report/AI appendix as separate files if you like). Mention the AI assistant name in the body.
5. Check the course page/LMS for any other formatting rule – the slides say non-conforming submissions are rejected.

## Final checklist (from the slides)
- [ ] Existing availability rules still work (`npm test`)
- [ ] ≥ 4 fictional rooms  - [ ] Capacity and equipment filters work
- [ ] ≥ 10 executable tests with recorded results
- [ ] Refactoring + evaluation evidence (diagrams, table)
- [ ] AI use + human review documented  - [ ] Email subject/recipient correct

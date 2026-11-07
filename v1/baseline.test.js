// Baseline tests: the Assignment #03 acceptance criteria (AC1-AC6) run against the ORIGINAL v1 code.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");
const { checkAvailability: check, EXISTING } = require("./app.js");

const NOW = "540"; // 09:00
const run = (s, e, blocked = false) => check(String(s), String(e), NOW, blocked);

test("AC4 free slot after the booking is available (660-720)", () => assert.equal(run(660, 720).kind, "ok"));
test("AC4 overlap is unavailable (630-690)", () => {
  const r = run(630, 690); assert.equal(r.kind, "err"); assert.match(r.message, /Overlaps existing booking 10:00-11:00/);
});
test("AC4 touching endpoints are not overlap (560-600 and 660-720)", () => {
  assert.equal(run(560, 600).kind, "ok"); assert.equal(run(660, 720).kind, "ok");
});
test("AC3 blocked room rejects everything, even a free slot", () => {
  assert.equal(run(660, 720, true).kind, "err"); assert.match(run(660, 720, true).message, /blocked/);
});
test("AC3 blocked + start = now reports blocked", () => assert.match(run(540, 570, true).message, /blocked/));
test("AC2 boundary: exactly 120 minutes allowed (720-840)", () => assert.equal(run(720, 840).kind, "ok"));
test("AC2 boundary: 121 minutes rejected (720-841)", () => {
  const r = run(720, 841); assert.equal(r.kind, "err"); assert.match(r.message, /121 min/);
});
test("AC1 start must be strictly after now (540-570 rejected, 541-570 ok)", () => {
  assert.equal(run(540, 570).kind, "err"); assert.equal(run(541, 570).kind, "ok");
});
test("AC1 reversed times give a message (700-650)", () => assert.equal(run(700, 650).kind, "warn"));
test("AC1 range: 1380-1440 ok, 1400-1441 rejected", () => {
  assert.equal(run(1380, 1440).kind, "ok"); assert.equal(run(1400, 1441).kind, "warn");
});
test("AC1 integer minutes / HH:MM only: 600.5 and 11:00:59 rejected, 10:30 accepted", () => {
  assert.equal(run("600.5", 660).kind, "warn"); assert.equal(run("11:00:59", "12:00").kind, "warn");
  assert.equal(check("10:30", "11:30", "09:00", false).kind, "err"); // overlaps booking, but parsed fine
});
test("AC5 existing bookings are immutable and unchanged by checks", () => {
  const before = JSON.stringify(EXISTING); run(630, 690); run(720, 840);
  assert.equal(JSON.stringify(EXISTING), before); assert.ok(Object.isFrozen(EXISTING) && Object.isFrozen(EXISTING[0]));
});
test("AC5/AC6 UI: stale result is cleared when the blocked toggle changes; messages are in a status region", () => {
  const dom = new JSDOM(fs.readFileSync(__dirname + "/index.html", "utf8"), { runScripts: "outside-only" });
  dom.window.eval(fs.readFileSync(__dirname + "/app.js", "utf8"));
  const d = dom.window.document, ev = (n, t) => n.dispatchEvent(new dom.window.Event(t, { bubbles: true }));
  d.getElementById("start").value = "660"; d.getElementById("end").value = "720";
  d.getElementById("check").click();
  assert.equal(d.querySelector("#result .ok") !== null, true);
  d.getElementById("blocked").checked = true; ev(d.getElementById("blocked"), "change");
  assert.equal(d.getElementById("result").textContent, "");
  assert.equal(d.getElementById("result").getAttribute("role"), "status");
});

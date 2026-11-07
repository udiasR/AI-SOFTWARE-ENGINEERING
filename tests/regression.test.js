// AC1-AC5 regression checks (the Assignment #03 acceptance criteria) against the refactored domain layer.
import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS } from "../src/data/rooms.js";
import { checkAvailability, STATUS, REASON } from "../src/domain/availability.js";

const R301 = ROOMS.find((r) => r.id === "301");
const R401 = ROOMS.find((r) => r.id === "401"); // blocked
const NOW = "540"; // 09:00
const run = (s, e, room = R301) => checkAvailability(room, { start: String(s), end: String(e), now: NOW });

test("AC4 free slot after the booking is available (660-720)", () => assert.equal(run(660, 720).status, STATUS.AVAILABLE));
test("AC4 overlap is unavailable and names the booking (630-690)", () => {
  const r = run(630, 690);
  assert.equal(r.status, STATUS.UNAVAILABLE); assert.equal(r.reason, REASON.OVERLAP);
  assert.match(r.message, /Overlaps existing booking 10:00-11:00/);
});
test("AC4 boundary: touching endpoints are not overlap (560-600, 660-720); 1-minute overlap is", () => {
  assert.equal(run(560, 600).status, STATUS.AVAILABLE); assert.equal(run(660, 720).status, STATUS.AVAILABLE);
  assert.equal(run(560, 601).reason, REASON.OVERLAP);
});
test("AC3 blocked room rejects everything, even a free slot (660-720)", () => {
  const r = run(660, 720, R401); assert.equal(r.reason, REASON.BLOCKED); assert.equal(r.status, STATUS.UNAVAILABLE);
});
test("AC3 blocked + start = now still reports blocked", () => assert.equal(run(540, 570, R401).reason, REASON.BLOCKED));
test("AC2 boundary: exactly 120 minutes allowed (720-840)", () => assert.equal(run(720, 840).status, STATUS.AVAILABLE));
test("AC2 boundary: 121 minutes rejected (720-841)", () => {
  const r = run(720, 841); assert.equal(r.reason, REASON.TOO_LONG); assert.match(r.message, /121 min/);
});
test("AC1 start must be strictly after now (540 rejected, 541 accepted)", () => {
  assert.equal(run(540, 570).reason, REASON.NOT_AFTER_NOW); assert.equal(run(541, 570).status, STATUS.AVAILABLE);
});
test("AC1 reversed or equal times give an amber message (700-650, 700-700)", () => {
  assert.equal(run(700, 650).status, STATUS.INVALID); assert.equal(run(700, 650).reason, REASON.ORDER);
  assert.equal(run(700, 700).reason, REASON.ORDER);
});
test("AC1 range: 1380-1440 allowed, 1400-1441 rejected", () => {
  assert.equal(run(1380, 1440).status, STATUS.AVAILABLE); assert.equal(run(1400, 1441).reason, REASON.END_RANGE);
});
test("AC1 integer minutes / HH:MM only: floats, sci-notation, hex, HH:MM:SS, negatives rejected", () => {
  for (const bad of ["600.5", "1e3", "0x2d0", "11:00:59", "-30", "abc", ""]) {
    assert.equal(run(bad, 700).reason, REASON.START_FORMAT, bad);
  }
  assert.equal(checkAvailability(R301, { start: "09:30", end: "10:30", now: "09:00" }).reason, REASON.OVERLAP); // HH:MM parsed
});
test("AC5 booking data is immutable and unchanged by checks", () => {
  const before = JSON.stringify(ROOMS); run(630, 690); run(720, 840);
  assert.equal(JSON.stringify(ROOMS), before);
  assert.ok(Object.isFrozen(R301.bookings) && Object.isFrozen(R301.bookings[0]));
  assert.throws(() => R301.bookings.push({}), TypeError);
});
test("Room data separation: result uses the chosen room's own bookings only", () => {
  const R210 = ROOMS.find((r) => r.id === "210");
  assert.equal(run(600, 630, R301).reason, REASON.OVERLAP);      // 301 booked 10:00-11:00
  assert.equal(run(600, 630, R210).status, STATUS.AVAILABLE);    // 210 booked 11:00-13:00
});
test("No room selected gives an amber message", () => assert.equal(checkAvailability(null, { start: "600", end: "630" }).reason, REASON.NO_ROOM));

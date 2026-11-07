// F1-F4 filtering rules (domain level).
import test from "node:test";
import assert from "node:assert/strict";
import { ROOMS } from "../src/data/rooms.js";
import { filterRooms, parseAttendees, equipmentOptions } from "../src/domain/filter.js";

const ids = (rs) => rs.map((r) => r.id);

test("catalog has at least four rooms with required fields", () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.ok(r.id && r.name && r.capacity > 0 && Array.isArray(r.equipment) && typeof r.blocked === "boolean" && Array.isArray(r.bookings));
  }
});
test("F1 capacity boundary: exact capacity matches, one more does not", () => {
  assert.ok(ids(filterRooms(ROOMS, { attendees: 24 })).includes("210")); // capacity 24 == 24
  assert.ok(!ids(filterRooms(ROOMS, { attendees: 25 })).includes("210")); // 25 > 24
});
test("F1 no capacity filter when attendees is null", () => {
  assert.equal(filterRooms(ROOMS, { attendees: null }).length, ROOMS.length);
});
test("F2 equipment filter requires ALL selected items", () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ["projector", "whiteboard"] })), ["301", "302", "401"]);
  assert.deepEqual(ids(filterRooms(ROOMS, { equipment: ["computers", "whiteboard"] })), []); // no room has both
});
test("F1+F2 combined", () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 35, equipment: ["video-conference"] })), ["401"]);
});
test("F3 blocked rooms still listed but flagged (availability blocks them, see regression tests)", () => {
  const r = filterRooms(ROOMS, { attendees: 35, equipment: ["video-conference"] })[0];
  assert.equal(r.blocked, true);
});
test("F4 impossible requirements give an empty list", () => {
  assert.deepEqual(filterRooms(ROOMS, { attendees: 500 }), []);
});
test("attendee input parsing", () => {
  assert.deepEqual(parseAttendees(""), { ok: true, value: null });
  assert.deepEqual(parseAttendees(" 25 "), { ok: true, value: 25 });
  for (const bad of ["0", "-3", "2.5", "abc"]) assert.equal(parseAttendees(bad).ok, false, bad);
});
test("equipment options are derived from the catalog", () => {
  assert.deepEqual(equipmentOptions(ROOMS), ["computers", "microphone", "projector", "video-conference", "whiteboard"]);
});

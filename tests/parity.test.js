// Behaviour parity: the SAME inputs must give the SAME status and message in v1 (original) and v2 (refactored).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { ROOMS } from "../src/data/rooms.js";
import { checkAvailability, STATUS } from "../src/domain/availability.js";

const v1 = createRequire(import.meta.url)("../v1/app.js");
const room301 = ROOMS.find((r) => r.id === "301");
const KIND = { ok: STATUS.AVAILABLE, warn: STATUS.INVALID, err: STATUS.UNAVAILABLE };

// Compare on v1's single booking (10:00-11:00) so room data is identical: use a 301 copy with only that booking.
const room = { ...room301, bookings: [{ start: 600, end: 660 }] };
const blockedRoom = { ...room, blocked: true };

const cases = [
  ["660", "720", "540"], ["630", "690", "540"], ["560", "600", "540"], ["720", "840", "540"], ["720", "841", "540"],
  ["540", "570", "540"], ["541", "570", "540"], ["700", "650", "540"], ["700", "700", "540"], ["1380", "1440", "540"],
  ["1400", "1441", "540"], ["600.5", "660", "540"], ["1e3", "1100", "540"], ["0x2d0", "0x2e0", "540"], ["11:00:59", "12:00", "540"],
  ["-30", "30", "0"], ["10:30", "11:30", "09:00"], ["09:30", "10:30", "09:00"], ["24:00", "25:00", "540"], ["600", "660", "abc"],
  ["", "", "540"], ["1380", "1440", "1439"], ["100", "200", "100"],
];

for (const [s, e, n] of cases) {
  for (const blocked of [false, true]) {
    test(`parity: ${s}-${e} now=${n} blocked=${blocked}`, () => {
      const a = v1.checkAvailability(s, e, n, blocked);
      const b = checkAvailability(blocked ? blockedRoom : room, { start: s, end: e, now: n });
      assert.equal(KIND[a.kind], b.status);
      assert.equal(a.message, b.message);
    });
  }
}

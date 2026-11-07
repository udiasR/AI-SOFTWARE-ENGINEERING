// Booking / availability rules (AC1-AC5). Pure functions: no DOM, no mutation.
import { parseTime, formatTime, intervalsOverlap } from "./time.js";
import { DEFAULT_NOW } from "../data/rooms.js";

export const MAX_MINUTES = 120;
export const DAY_END = 1440;

/** invalid = malformed input (amber) | unavailable = rule violation (red) | available (green) */
export const STATUS = Object.freeze({ AVAILABLE: "available", INVALID: "invalid", UNAVAILABLE: "unavailable" });

export const REASON = Object.freeze({
  START_FORMAT: "START_FORMAT", END_FORMAT: "END_FORMAT", NOW_FORMAT: "NOW_FORMAT",
  START_RANGE: "START_RANGE", END_RANGE: "END_RANGE", ORDER: "ORDER", NO_ROOM: "NO_ROOM",
  BLOCKED: "BLOCKED", NOT_AFTER_NOW: "NOT_AFTER_NOW", TOO_LONG: "TOO_LONG", OVERLAP: "OVERLAP",
  AVAILABLE: "AVAILABLE",
});

const invalid = (reason, message) => ({ status: STATUS.INVALID, reason, message });
const unavailable = (reason, message, extra = {}) => ({ status: STATUS.UNAVAILABLE, reason, message, ...extra });

/** AC1: parse and validate raw text. Returns {ok:true,s,e,n} or {ok:false,result}. Room-independent. */
export function parseRequest({ start, end, now = DEFAULT_NOW }) {
  const s = parseTime(start), e = parseTime(end), n = parseTime(now);
  if (s === null) return { ok: false, result: invalid(REASON.START_FORMAT, `Start time must be HH:MM or minutes (0-${DAY_END}).`) };
  if (e === null) return { ok: false, result: invalid(REASON.END_FORMAT, `End time must be HH:MM or minutes (0-${DAY_END}).`) };
  if (n === null) return { ok: false, result: invalid(REASON.NOW_FORMAT, `Current time must be HH:MM or minutes (0-${DAY_END - 1}).`) };
  if (s > DAY_END) return { ok: false, result: invalid(REASON.START_RANGE, `Start time must be between 0 and ${DAY_END}.`) };
  if (e > DAY_END) return { ok: false, result: invalid(REASON.END_RANGE, `End time must be between 0 and ${DAY_END}.`) };
  if (s >= e) return { ok: false, result: invalid(REASON.ORDER, "Start must be strictly before end.") };
  return { ok: true, s, e, n };
}

/** Checks ONE room using that room's own bookings only. Returns {status, reason, message, conflict?}. */
export function checkAvailability(room, request) {
  if (!room) return invalid(REASON.NO_ROOM, "Select a room first.");
  const p = parseRequest(request);
  if (!p.ok) return p.result;
  const { s, e, n } = p;
  if (room.blocked) return unavailable(REASON.BLOCKED, `Room ${room.id} is currently blocked.`);            // AC3
  if (s <= n) return unavailable(REASON.NOT_AFTER_NOW, `Start (${formatTime(s)}) must be strictly after the current time (${formatTime(n)}).`);
  if (e - s > MAX_MINUTES) return unavailable(REASON.TOO_LONG, `Duration is ${e - s} min. Maximum allowed is ${MAX_MINUTES} minutes.`); // AC2
  const conflict = room.bookings.find((b) => intervalsOverlap(s, e, b.start, b.end));                       // AC4
  if (conflict) {
    return unavailable(REASON.OVERLAP,
      `Overlaps existing booking ${formatTime(conflict.start)}-${formatTime(conflict.end)} (${conflict.start}-${conflict.end}).`, { conflict });
  }
  return { status: STATUS.AVAILABLE, reason: REASON.AVAILABLE, message: `Room ${room.id} is available ${formatTime(s)}-${formatTime(e)}.` };
}

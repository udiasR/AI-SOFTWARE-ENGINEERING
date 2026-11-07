// Pure time helpers: the single source of truth for time parsing, formatting and interval maths.
// Times are integer minutes after midnight; input may be "HH:MM" or digits-only minutes.

/** "HH:MM" or digits-only minutes -> integer minutes, or null when the format is invalid. */
export function parseTime(text) {
  if (typeof text !== "string") return null;
  const hm = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  if (/^\d+$/.test(text)) return Number(text);
  return null;
}

/** minutes -> "HH:MM" (1440 -> "24:00"). */
export function formatTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Half-open overlap: touching intervals (end === start) do NOT overlap. */
export function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

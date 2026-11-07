// Room filtering rules (F1, F2). Pure functions.

/** Blank -> no capacity filter. Otherwise must be a whole number >= 1. */
export function parseAttendees(raw) {
  const text = String(raw ?? "").trim();
  if (text === "") return { ok: true, value: null };
  if (!/^\d+$/.test(text) || Number(text) < 1) return { ok: false, message: "Attendees must be a whole number of 1 or more." };
  return { ok: true, value: Number(text) };
}

/** F1: capacity >= attendees. F2: room has ALL required equipment items. */
export function filterRooms(rooms, { attendees = null, equipment = [] } = {}) {
  return rooms.filter((r) => (attendees === null || r.capacity >= attendees) && equipment.every((item) => r.equipment.includes(item)));
}

/** All distinct equipment items in the catalog, sorted - used to build the checkboxes. */
export function equipmentOptions(rooms) {
  return [...new Set(rooms.flatMap((r) => r.equipment))].sort();
}

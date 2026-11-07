// Fictional room catalog (data only - no logic). Deep-frozen so booking data is immutable (AC5).
// Times are integer minutes after midnight (600 = 10:00).
export const DEFAULT_NOW = "09:00"; // fixed starting "current time" (still editable in the UI, as in Assignment #03)

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => typeof v === "object" && v !== null && deepFreeze(v));
  return Object.freeze(o);
};

export const ROOMS = deepFreeze([
  { id: "301", name: "Lecture Hall", floor: "Floor 3", capacity: 120, equipment: ["microphone", "projector", "whiteboard"],
    blocked: false, bookings: [{ start: 600, end: 660 }, { start: 900, end: 960 }] }, // 10:00-11:00 is the A#03 booking
  { id: "302", name: "Seminar Room", floor: "Floor 3", capacity: 30, equipment: ["projector", "whiteboard"],
    blocked: false, bookings: [{ start: 570, end: 630 }, { start: 840, end: 960 }] },
  { id: "210", name: "Computer Lab", floor: "Floor 2", capacity: 24, equipment: ["computers", "projector"],
    blocked: false, bookings: [{ start: 660, end: 780 }] },
  { id: "115", name: "Study Room", floor: "Floor 1", capacity: 6, equipment: ["whiteboard"],
    blocked: false, bookings: [{ start: 720, end: 750 }] },
  { id: "401", name: "Innovation Studio", floor: "Floor 4", capacity: 40, equipment: ["projector", "video-conference", "whiteboard"],
    blocked: true, bookings: [{ start: 600, end: 720 }] },
]);

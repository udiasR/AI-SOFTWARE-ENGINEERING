// Smart Campus - Room Availability Checker (v1 = Assignment #03 behaviour, single room, monolithic)
// Reconstructed from the Assignment #03 report (Bolt.new V3 final): one file holds data, parsing,
// validation, rules and DOM code. Times are integer minutes after midnight (HH:MM also accepted).

const ROOM = { id: "301", name: "Lecture Hall", floor: "Floor 3" };
const EXISTING = Object.freeze([Object.freeze({ start: 600, end: 660 })]); // 10:00-11:00

function checkAvailability(startText, endText, nowText, blocked) {
  let s, e, n;
  // --- parse start (copy 1)
  if (/^\d{1,2}:\d{2}$/.test(startText)) {
    const p = startText.split(":");
    s = parseInt(p[0]) * 60 + parseInt(p[1]);
  } else if (/^\d+$/.test(startText)) {
    s = parseInt(startText);
  } else {
    return { kind: "warn", message: "Start time must be HH:MM or minutes (0-1440)." };
  }
  // --- parse end (copy 2)
  if (/^\d{1,2}:\d{2}$/.test(endText)) {
    const p = endText.split(":");
    e = parseInt(p[0]) * 60 + parseInt(p[1]);
  } else if (/^\d+$/.test(endText)) {
    e = parseInt(endText);
  } else {
    return { kind: "warn", message: "End time must be HH:MM or minutes (0-1440)." };
  }
  // --- parse now (copy 3)
  if (/^\d{1,2}:\d{2}$/.test(nowText)) {
    const p = nowText.split(":");
    n = parseInt(p[0]) * 60 + parseInt(p[1]);
  } else if (/^\d+$/.test(nowText)) {
    n = parseInt(nowText);
  } else {
    return { kind: "warn", message: "Current time must be HH:MM or minutes (0-1439)." };
  }
  if (s < 0 || s > 1440) return { kind: "warn", message: "Start time must be between 0 and 1440." };
  if (e < 0 || e > 1440) return { kind: "warn", message: "End time must be between 0 and 1440." };
  if (s >= e) return { kind: "warn", message: "Start must be strictly before end." };

  if (blocked) return { kind: "err", message: "Room " + ROOM.id + " is currently blocked." };
  if (s <= n) {
    const sh = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    const nh = String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
    return { kind: "err", message: "Start (" + sh + ") must be strictly after the current time (" + nh + ")." };
  }
  if (e - s > 120) {
    return { kind: "err", message: "Duration is " + (e - s) + " min. Maximum allowed is 120 minutes." };
  }
  for (const b of EXISTING) {
    if (s < b.end && b.start < e) {
      const bs = String(Math.floor(b.start / 60)).padStart(2, "0") + ":" + String(b.start % 60).padStart(2, "0");
      const be = String(Math.floor(b.end / 60)).padStart(2, "0") + ":" + String(b.end % 60).padStart(2, "0");
      return { kind: "err", message: "Overlaps existing booking " + bs + "-" + be + " (" + b.start + "-" + b.end + ")." };
    }
  }
  const s2 = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const e2 = String(Math.floor(e / 60)).padStart(2, "0") + ":" + String(e % 60).padStart(2, "0");
  return { kind: "ok", message: "Room " + ROOM.id + " is available " + s2 + "-" + e2 + "." };
}

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const clearResult = () => { $("result").innerHTML = ""; };
  $("check").addEventListener("click", () => {
    const r = checkAvailability($("start").value.trim(), $("end").value.trim(), $("now").value.trim(), $("blocked").checked);
    if (r.kind === "ok") {
      $("result").innerHTML = '<div class="ok">' + r.message + "</div>";
    } else if (r.kind === "warn") {
      $("result").innerHTML = '<div class="warn">' + r.message + "</div>";
    } else {
      $("result").innerHTML = '<div class="err">' + r.message + "</div>";
    }
  });
  ["start", "end", "now"].forEach((id) => $(id).addEventListener("input", clearResult));
  $("blocked").addEventListener("change", clearResult);
}

if (typeof module !== "undefined") module.exports = { checkAvailability, EXISTING, ROOM };

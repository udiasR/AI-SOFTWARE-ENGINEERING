// Controller: wires DOM events to the domain layer and the renderer. No business rules live here.
import { ROOMS, DEFAULT_NOW } from "../data/rooms.js";
import { checkAvailability } from "../domain/availability.js";
import { filterRooms, parseAttendees, equipmentOptions } from "../domain/filter.js";
import { renderResult, renderMessage, renderEquipmentCheckboxes, renderRoomList } from "./render.js";

export function initApp(doc, { rooms = ROOMS } = {}) {
  const $ = (id) => doc.getElementById(id);
  const state = { selectedId: null };

  renderEquipmentCheckboxes($("equipment-group"), equipmentOptions(rooms));

  const request = () => ({ start: $("start").value.trim(), end: $("end").value.trim(), now: $("now").value.trim() });
  const selectedRoom = () => rooms.find((r) => r.id === state.selectedId) ?? null;
  const hasTimes = () => request().start !== "" && request().end !== "";

  function refreshRooms() {
    const att = parseAttendees($("attendees").value);
    const equipment = [...doc.querySelectorAll('input[name="equipment"]:checked')].map((c) => c.value);
    $("attendees-error").textContent = att.ok ? "" : att.message;
    const visible = att.ok ? filterRooms(rooms, { attendees: att.value, equipment }) : [];
    if (!visible.some((r) => r.id === state.selectedId)) {
      state.selectedId = null; // selected room was filtered out
      renderMessage($("result"), "", "");
    }
    const empty = att.ok ? "No rooms match your requirements. Try fewer attendees or less equipment." : att.message;
    renderRoomList($("room-list"), visible, state.selectedId, empty);
    $("check").disabled = visible.length === 0;
  }

  function runCheck() {
    renderResult($("result"), checkAvailability(selectedRoom(), request()));
  }

  $("attendees").addEventListener("input", refreshRooms);
  $("equipment-group").addEventListener("change", refreshRooms);
  $("room-list").addEventListener("change", (ev) => {
    state.selectedId = ev.target.value;
    // F5: switching rooms refreshes the result for the new room, or clears it if no times were entered yet.
    if (hasTimes()) runCheck();
    else renderMessage($("result"), "", "");
  });
  $("check").addEventListener("click", runCheck);

  // AC5 (Assignment #03): any change to the time inputs clears a stale result.
  ["start", "end", "now"].forEach((id) => $(id).addEventListener("input", () => renderMessage($("result"), "", "")));

  refreshRooms();
  return { state, refreshRooms, runCheck };
}

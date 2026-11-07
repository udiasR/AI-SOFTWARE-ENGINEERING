// Presentation only: builds DOM from view data. Uses textContent (no innerHTML) so data is never parsed as HTML.
import { STATUS } from "../domain/availability.js";

// One place that maps a result status to a CSS class (replaces the 3 duplicated branches of v1).
const STATUS_CLASS = {
  [STATUS.AVAILABLE]: "ok",    // green
  [STATUS.INVALID]: "warn",    // amber: malformed input
  [STATUS.UNAVAILABLE]: "err", // red: rule violation
};

function el(doc, tag, props = {}, text) {
  const node = doc.createElement(tag);
  Object.assign(node, props);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Single message renderer used for every result/hint/empty message. */
export function renderMessage(container, kind, message) {
  container.replaceChildren();
  if (!message) return;
  container.appendChild(el(container.ownerDocument, "div", { className: kind }, message));
}

export function renderResult(container, result) {
  renderMessage(container, STATUS_CLASS[result.status], result.message);
}

export function renderEquipmentCheckboxes(container, items) {
  const doc = container.ownerDocument;
  container.replaceChildren(
    ...items.map((item) => {
      const label = el(doc, "label", { className: "check" });
      label.append(el(doc, "input", { type: "checkbox", name: "equipment", value: item }), ` ${item}`);
      return label;
    }),
  );
}

export function renderRoomList(container, rooms, selectedId, emptyMessage) {
  const doc = container.ownerDocument;
  container.replaceChildren();
  if (rooms.length === 0) {
    container.appendChild(el(doc, "p", { className: "empty", id: "rooms-empty" }, emptyMessage));
    return;
  }
  for (const r of rooms) {
    const label = el(doc, "label", { className: "room" });
    const radio = el(doc, "input", { type: "radio", name: "room", value: r.id, checked: r.id === selectedId });
    const info = `Room ${r.id} - ${r.name} (${r.floor}) - capacity ${r.capacity} - ${r.equipment.join(", ")}`;
    label.append(radio, ` ${info}`);
    if (r.blocked) label.appendChild(el(doc, "span", { className: "badge" }, "BLOCKED"));
    container.appendChild(label);
  }
}

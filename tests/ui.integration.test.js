// Integration / UI behaviour checks: real index.html + real controller in a jsdom DOM.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { initApp } from "../src/ui/app.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function setup() {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  initApp(document);
  const $ = (id) => document.getElementById(id);
  const fire = (node, type) => node.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
  const type = (id, value) => { $(id).value = value; fire($(id), "input"); };
  const tick = (value) => { const c = document.querySelector(`input[name=equipment][value="${value}"]`); c.checked = true; fire(c, "change"); };
  const pick = (id) => { const r = document.querySelector(`input[name=room][value="${id}"]`); r.checked = true; fire(r, "change"); };
  const roomIds = () => [...document.querySelectorAll("input[name=room]")].map((r) => r.value);
  return { document, $, type, tick, pick, roomIds, click: (id) => $(id).dispatchEvent(new dom.window.Event("click", { bubbles: true })) };
}

test("UI: all rooms listed initially; result region is an aria-live status (AC6)", () => {
  const { roomIds, $ } = setup();
  assert.equal(roomIds().length, 5);
  assert.equal($("result").getAttribute("role"), "status");
  assert.equal($("result").getAttribute("aria-live"), "polite");
});
test("UI: successful filtering (capacity + equipment) shows only matching rooms", () => {
  const { roomIds, type, tick } = setup();
  type("attendees", "35"); tick("projector");
  assert.deepEqual(roomIds(), ["301", "401"]);
});
test("UI: unsuccessful filtering shows empty state and disables the check button (F4)", () => {
  const { document, $, type } = setup();
  type("attendees", "500");
  assert.equal(roomIds2(document).length, 0);
  assert.match($("rooms-empty").textContent, /No rooms match/);
  assert.equal($("check").disabled, true);
});
test("UI: invalid attendees shows a clear error", () => {
  const { $, type } = setup();
  type("attendees", "-2");
  assert.match($("attendees-error").textContent, /whole number/);
});
test("UI: availability check uses the CHOSEN room's bookings", () => {
  const { $, type, pick, click } = setup();
  type("start", "10:00"); type("end", "10:30");
  pick("301"); click("check");
  assert.match($("result").textContent, /Overlaps existing booking 10:00-11:00/);
  pick("210"); click("check");
  assert.match($("result").textContent, /Room 210 is available/);
});
test("UI F5: switching rooms refreshes the result when times are entered", () => {
  const { $, type, pick } = setup();
  type("start", "10:00"); type("end", "10:30");
  pick("301"); // no click needed: the change event re-checks
  assert.equal($("result").firstElementChild.className, "err");
  pick("115");
  assert.equal($("result").firstElementChild.className, "ok");
});
test("UI F5: switching rooms with no times entered clears the old result", () => {
  const { $, type, pick } = setup();
  type("start", "10:00"); type("end", "10:30"); pick("301");
  assert.notEqual($("result").textContent, "");
  type("start", ""); type("end", ""); // typing clears the result as well
  pick("302");
  assert.equal($("result").textContent, "");
});
test("UI F3: blocked room is badged and reported blocked (red), never available", () => {
  const { document, $, type, pick } = setup();
  type("start", "900"); type("end", "960");
  pick("401");
  assert.match($("result").textContent, /Room 401 is currently blocked/);
  assert.equal($("result").firstElementChild.className, "err");
  assert.match(document.body.textContent, /BLOCKED/);
});
test("UI: filtering out the selected room clears selection and result", () => {
  const { $, type, tick, pick, roomIds } = setup();
  type("start", "10:00"); type("end", "10:30");
  pick("301");
  tick("computers"); // only room 210 has computers
  assert.deepEqual(roomIds(), ["210"]);
  assert.equal($("result").textContent, "");
});
test("UI AC5(A#03): editing any time input clears a stale result", () => {
  const { $, type, pick, click } = setup();
  type("start", "660"); type("end", "720"); pick("302"); click("check");
  assert.equal($("result").firstElementChild.className, "ok");
  type("now", "10:00");
  assert.equal($("result").textContent, "");
});
test("UI AC1/AC6: malformed input gives an amber message; rule violation gives a red one", () => {
  const { $, type, pick, click } = setup();
  pick("301"); type("start", "abc"); type("end", "700"); click("check");
  assert.equal($("result").firstElementChild.className, "warn");
  type("start", "720"); type("end", "841"); click("check");
  assert.equal($("result").firstElementChild.className, "err");
  assert.match($("result").textContent, /Duration is 121 min/);
});
test("UI AC6: the page has a mobile viewport meta tag and a stylesheet", () => {
  const { document } = setup();
  assert.match(document.querySelector('meta[name="viewport"]').content, /width=device-width/);
  assert.ok(document.querySelector('link[rel="stylesheet"]'));
});
function roomIds2(document) { return [...document.querySelectorAll("input[name=room]")]; }

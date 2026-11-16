import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, signSession, verifySession } from "./auth.js";

const S = "secret";

test("hash roundtrip", async () => {
  assert.equal(await verifyPassword("hunter2hunter2", await hashPassword("hunter2hunter2")), true);
});
test("wrong password fails", async () => {
  assert.equal(await verifyPassword("nope", await hashPassword("hunter2hunter2")), false);
});
test("valid cookie, including dotted username", async () => {
  assert.equal(await verifySession(await signSession("a.b", S), S), "a.b");
});
test("tampered cookie rejected", async () => {
  const t = await signSession("andre", S);
  assert.equal(await verifySession(t.replace("andre", "admin"), S), null);
  assert.equal(await verifySession(t, "other"), null);
});
test("expired cookie rejected", async () => {
  const t = await signSession("andre", S, Date.now() - 31 * 86400 * 1000);
  assert.equal(await verifySession(t, S), null);
});

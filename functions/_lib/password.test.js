import { test } from "node:test";
import assert from "node:assert/strict";
import * as pw from "../api/password.js";
import * as detail from "../api/admin/users/[name].js";
import { hashPassword, verifyPassword } from "./auth.js";
import { kv } from "./testkv.js";

async function setup() {
  const DATA = kv();
  await DATA.put("user:ani", JSON.stringify({ ...(await hashPassword("oldpass12")), admin: true, extra: 1 }));
  await DATA.put("user:bob", JSON.stringify(await hashPassword("bobpass12")));
  return { DATA };
}
const post = (env, body) => pw.onRequestPost({ env, data: { user: "ani" }, request: new Request("http://x/api/password", { method: "POST", body }) });
const change = (env, body) => post(env, JSON.stringify(body));

test("change password keeps other fields, old stops working", async () => {
  const env = await setup();
  assert.equal((await change(env, { current: "oldpass12", password: "newpass123" })).status, 200);
  const rec = await env.DATA.get("user:ani", "json");
  assert.equal(await verifyPassword("newpass123", rec), true);
  assert.equal(await verifyPassword("oldpass12", rec), false);
  assert.equal(rec.admin, true);
  assert.equal(rec.extra, 1);
});

test("wrong current is 403, short new is 400, bad body is 400", async () => {
  const env = await setup();
  assert.equal((await change(env, { current: "nope", password: "newpass123" })).status, 403);
  assert.equal((await change(env, { current: "oldpass12", password: "short" })).status, 400);
  assert.equal((await post(env, "x")).status, 400);
});

test("admin reset: non-admin 403, admin gets working password, unknown 404", async () => {
  const env = await setup();
  const reset = (user, name) => detail.onRequestPost({ env, data: { user }, params: { name } });
  assert.equal((await reset("bob", "bob")).status, 403);
  const { name, password } = await (await reset("ani", "bob")).json();
  assert.equal(name, "bob");
  assert.equal(await verifyPassword(password, await env.DATA.get("user:bob", "json")), true);
  assert.equal((await reset("ani", "ghost")).status, 404);
});

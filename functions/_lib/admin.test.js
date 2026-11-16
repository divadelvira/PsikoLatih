import { test } from "node:test";
import assert from "node:assert/strict";
import * as list from "../api/admin/users.js";
import * as detail from "../api/admin/users/[name].js";
import * as progress from "../api/progress.js";
import { summarize } from "./summary.js";
import { kv } from "./testkv.js";

const P = { lastSeen: 50, quizBest: { "a/1": {}, "a/2": {} }, kraepelin: [{}], personality: { disc: {} },
  attempts: [{ kind: "kuis", title: "Q", pct: 80, ts: 100 }, { kind: "simulasi", title: "S", pct: 60, ts: 90 }] };

async function setup() {
  const DATA = kv();
  await DATA.put("user:diva", JSON.stringify({ admin: true }));
  await DATA.put("user:ani", JSON.stringify({}));
  await DATA.put("progress:ani", JSON.stringify(P));
  return { DATA };
}

test("non-admin gets 403 on both endpoints", async () => {
  const env = await setup();
  assert.equal((await list.onRequestGet({ env, data: { user: "ani" } })).status, 403);
  assert.equal((await detail.onRequestGet({ env, data: { user: "ani" }, params: { name: "ani" } })).status, 403);
});

test("admin lists users with summaries, sorted by name", async () => {
  const env = await setup();
  const { users } = await (await list.onRequestGet({ env, data: { user: "diva" } })).json();
  assert.deepEqual(users.map((u) => u.name), ["ani", "diva"]);
  assert.deepEqual(users[0].summary, { sims: 1, quizzes: 2, last: { title: "Q", pct: 80, ts: 100 }, kraepelin: 1, personality: ["disc"], lastActive: 100 });
  assert.equal(users[1].admin, true);
  assert.equal(users[1].summary.last, null);
});

test("detail returns parsed progress, null when empty, 404 when unknown", async () => {
  const env = await setup();
  const get = async (name) => detail.onRequestGet({ env, data: { user: "diva" }, params: { name } });
  assert.deepEqual(await (await get("ani")).json(), { name: "ani", progress: P });
  assert.deepEqual(await (await get("diva")).json(), { name: "diva", progress: null });
  assert.equal((await get("ghost")).status, 404);
});

test("GET /api/progress reports admin flag", async () => {
  const env = await setup();
  const r = await (await progress.onRequestGet({ env, data: { user: "diva" } })).json();
  assert.deepEqual(r, { user: "diva", admin: true, progress: null });
});

test("summarize tolerates null, invalid and malformed fields", () => {
  const empty = { sims: 0, quizzes: 0, last: null, kraepelin: 0, personality: [], lastActive: null };
  assert.deepEqual(summarize(null), empty);
  assert.deepEqual(summarize("{bad"), empty);
  assert.deepEqual(summarize('{"attempts":5,"quizBest":null,"personality":"x"}'), empty);
});

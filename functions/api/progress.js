import { json, err } from "../_lib/auth.js";
import { loadUser, pendingRequests } from "../_lib/access.js";
import { redemptions, getSettings } from "../_lib/shop.js";

const MAX = 256 * 1024;

export async function onRequestGet({ env, data }) {
  const [progress, u, all, rdm, set] = await Promise.all([env.DATA.get(`progress:${data.user}`), loadUser(env, data.user), pendingRequests(env), redemptions(env), getSettings(env)]);
  const admin = u?.admin === true;
  const requests = all.filter((r) => r.user === data.user).map(({ id, type, target, at }) => ({ id, type, target, at }));
  const out = { user: data.user, admin, progress, role: u?.role ?? null, roles: u?.roles ?? [], mods: u?.mods ?? [], requests, wa: set.wa || null };
  // Admin: count of things waiting (access requests + rewards to hand over). User: vouchers already handed over.
  if (admin) out.notif = all.length + rdm.filter((r) => !r.done).length;
  else out.done = rdm.filter((r) => r.user === data.user && r.done).map((r) => r.id);
  return json(out);
}

async function save({ request, env, data }) {
  const body = await request.text();
  if (new TextEncoder().encode(body).length > MAX) return err("Data terlalu besar", 413);
  try { JSON.parse(body); } catch { return err("Data bukan JSON", 400); }
  await env.DATA.put(`progress:${data.user}`, body);
  return new Response(null, { status: 204 });
}
export const onRequestPut = save;
export const onRequestPost = save; // sendBeacon

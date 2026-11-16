import { json, err, isAdmin, hashPassword } from "../../../_lib/auth.js";

export async function onRequestGet({ env, data, params }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const name = String(params.name);
  if (!(await env.DATA.get(`user:${name}`))) return err("Pengguna tidak ditemukan", 404);
  const raw = await env.DATA.get(`progress:${name}`);
  let progress = null;
  try { progress = raw ? JSON.parse(raw) : null; } catch { /* corrupt blob -> null */ }
  return json({ name, progress });
}

export async function onRequestPost({ env, data, params }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const name = String(params.name);
  const rec = await env.DATA.get(`user:${name}`, "json");
  if (!rec) return err("Pengguna tidak ditemukan", 404);
  const temp = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  await env.DATA.put(`user:${name}`, JSON.stringify({ ...rec, ...(await hashPassword(temp)) }));
  return json({ name, password: temp });
}

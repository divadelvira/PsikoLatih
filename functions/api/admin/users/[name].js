import { json, err, isAdmin } from "../../../_lib/auth.js";

export async function onRequestGet({ env, data, params }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const name = String(params.name);
  if (!(await env.DATA.get(`user:${name}`))) return err("Pengguna tidak ditemukan", 404);
  const raw = await env.DATA.get(`progress:${name}`);
  let progress = null;
  try { progress = raw ? JSON.parse(raw) : null; } catch { /* corrupt blob -> null */ }
  return json({ name, progress });
}

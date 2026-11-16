import { json, err, isAdmin } from "../_lib/auth.js";

const MAX = 256 * 1024;

export async function onRequestGet({ env, data }) {
  const [progress, admin] = await Promise.all([env.DATA.get(`progress:${data.user}`), isAdmin(env, data.user)]);
  return json({ user: data.user, admin, progress });
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

import { hashPassword, signSession, sessionCookie, json, err, readJson, USERNAME_RE } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  if (!b) return err("Data tidak valid", 400);
  const name = String(b.username ?? "").toLowerCase();
  const password = String(b.password ?? "");
  const code = String(b.invite ?? "").trim().toLowerCase();
  if (!USERNAME_RE.test(name)) return err("Username 3-32 karakter: huruf, angka, _ . -", 400);
  if (password.length < 8) return err("Password minimal 8 karakter", 400);
  const inv = /^[a-z0-9]{6,32}$/.test(code) ? await env.DATA.get(`invite:${code}`, "json") : null;
  if (!inv || inv.expires <= Date.now()) return err("Kode undangan salah, sudah dipakai, atau kedaluwarsa", 403);
  // shortcut: KV get-then-delete/put is not atomic (and edge reads can lag ~60s), so one code could
  // register two users in a race; fine for hand-shared invites, move to D1/Durable Object if abused.
  if (await env.DATA.get(`user:${name}`)) return err("Username sudah dipakai", 409);
  await env.DATA.delete(`invite:${code}`);
  await env.DATA.put(`user:${name}`, JSON.stringify(await hashPassword(password)));
  const token = await signSession(name, env.SESSION_SECRET);
  return json({ user: name }, 200, { "Set-Cookie": sessionCookie(token) });
}

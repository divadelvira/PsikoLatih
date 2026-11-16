import { json, err, readJson, hashPassword, verifyPassword } from "../_lib/auth.js";

// shortcut: sessions are stateless HMAC cookies, so other devices stay logged in until their cookie expires; add a per-user session version if that matters.
export async function onRequestPost({ request, env, data }) {
  const body = await readJson(request);
  if (!body) return err("Data tidak valid", 400);
  const { current, password } = body;
  if (typeof password !== "string" || password.length < 8) return err("Password baru minimal 8 karakter", 400);
  const rec = await env.DATA.get(`user:${data.user}`, "json");
  if (!rec || typeof current !== "string" || !(await verifyPassword(current, rec))) return err("Password lama salah", 403);
  await env.DATA.put(`user:${data.user}`, JSON.stringify({ ...rec, ...(await hashPassword(password)) }));
  return json({ ok: true });
}

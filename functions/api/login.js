import { hashPassword, verifyPassword, signSession, sessionCookie, json, err, readJson } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  const name = String(b?.username ?? "").toLowerCase();
  const password = String(b?.password ?? "");
  const rec = await env.DATA.get(`user:${name}`, "json");
  // Hash a dummy when the user is missing so timing does not reveal which usernames exist.
  const ok = rec ? await verifyPassword(password, rec) : (await hashPassword(password), false);
  if (!ok) return err("Username atau password salah", 401);
  const token = await signSession(name, env.SESSION_SECRET);
  return json({ user: name }, 200, { "Set-Cookie": sessionCookie(token) });
}

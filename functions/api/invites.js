import { json, err, isAdmin, INVITE_TTL } from "../_lib/auth.js";

// Admin only. POST creates a single-use invite valid for 30 minutes; GET lists the active ones.
export async function onRequestPost({ env, data }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const expires = Date.now() + INVITE_TTL * 1000;
  const meta = { expires, by: data.user };
  await env.DATA.put(`invite:${code}`, JSON.stringify(meta), { expirationTtl: INVITE_TTL, metadata: meta });
  return json({ code, expires });
}

export async function onRequestGet({ env, data }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const { keys } = await env.DATA.list({ prefix: "invite:" });
  const now = Date.now();
  const invites = keys
    .map((k) => ({ code: k.name.slice(7), expires: k.metadata?.expires ?? 0 }))
    .filter((i) => i.expires > now)
    .sort((a, b) => b.expires - a.expires);
  return json({ invites });
}

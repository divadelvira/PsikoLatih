import { json, err, isAdmin } from "../../_lib/auth.js";
import { summarize } from "../../_lib/summary.js";

// shortcut: KV list + per-user gets, fine to a few hundred users; move to D1 beyond that.
export async function onRequestGet({ env, data }) {
  if (!(await isAdmin(env, data.user))) return err("Khusus admin", 403);
  const { keys } = await env.DATA.list({ prefix: "user:" });
  const users = await Promise.all(keys.map(async ({ name: k }) => {
    const name = k.slice(5);
    const [u, raw] = await Promise.all([env.DATA.get(k, "json"), env.DATA.get(`progress:${name}`)]);
    return { name, admin: u?.admin === true, summary: summarize(raw) };
  }));
  return json({ users: users.sort((a, b) => a.name.localeCompare(b.name)) });
}

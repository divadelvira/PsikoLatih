import { getCookie, verifySession, err } from "./_lib/auth.js";

const PUBLIC = ["/login", "/login/", "/api/login", "/api/register"];
const isPublic = (p) => PUBLIC.includes(p) || p.startsWith("/_astro/") || p.startsWith("/favicon");

export async function onRequest({ request, env, next, data }) {
  const path = new URL(request.url).pathname;
  const user = await verifySession(getCookie(request), env.SESSION_SECRET);
  data.user = user;

  if (user && (path === "/login" || path === "/login/")) {
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }
  if (isPublic(path) || user) return next();
  if (path.startsWith("/api/")) return err("Belum login", 401);
  return new Response(null, { status: 302, headers: { Location: "/login" } });
}

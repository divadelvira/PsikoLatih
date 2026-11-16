const enc = new TextEncoder();
const ITER = 100000;
export const SESSION_TTL = 2592000;
export const USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (buf) => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Constant-time compare (length leak only).
export function safeEqual(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  let d = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ (y[i % (y.length || 1)] ?? 0);
  return d === 0;
}

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: b64(salt), hash: b64(await pbkdf2(password, salt)) };
}

export async function verifyPassword(password, { salt, hash }) {
  return safeEqual(b64(await pbkdf2(password, unb64(salt))), hash);
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function signSession(name, secret, now = Date.now()) {
  const payload = `${name}.${Math.floor(now / 1000) + SESSION_TTL}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

// Returns username or null. Name may contain dots, so split from the right.
export async function verifySession(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop(), exp = parts.pop(), name = parts.join(".");
  if (!/^\d+$/.test(exp) || Number(exp) <= now / 1000) return null;
  if (!safeEqual(await hmac(secret, `${name}.${exp}`), sig)) return null;
  return name;
}

export function getCookie(request, key = "sid") {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === key) return part.slice(i + 1).trim();
  }
  return null;
}

export const sessionCookie = (token) =>
  `sid=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}`;
export const clearCookie = () => "sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}
export const err = (message, status) => json({ error: message }, status);

export async function readJson(request) {
  try { return (await request.json()) ?? {}; } catch { return null; }
}

export const INVITE_TTL = 1800; // 30 minutes
export const isAdmin = async (env, user) => !!user && (await env.DATA.get(`user:${user}`, "json"))?.admin === true;

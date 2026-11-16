export function kv() {
  const m = new Map();
  return {
    async get(k, type) { const e = m.get(k); return e === undefined ? null : type === "json" ? JSON.parse(e.v) : e.v; },
    async put(k, v, o = {}) { m.set(k, { v, metadata: o.metadata }); },
    async delete(k) { m.delete(k); },
    async list({ prefix }) { return { keys: [...m].filter(([k]) => k.startsWith(prefix)).map(([name, e]) => ({ name, metadata: e.metadata })) }; },
  };
}

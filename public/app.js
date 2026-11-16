/* js/lib/util.js */
/* Utilitas umum */
window.PSI = window.PSI || {};
(function (P) {
  // --- RNG (bisa seeded) ---
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    if (seed === undefined || seed === null) seed = Math.floor(Math.random() * 2 ** 31);
    const r = mulberry32(seed);
    const api = {
      seed,
      next: r,
      int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)),
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      chance: (p) => r() < p,
      shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      sample: (arr, n) => api.shuffle(arr).slice(0, n),
    };
    return api;
  }
  P.rng = makeRng;
  P.R = makeRng(); // global rng

  P.shuffle = (arr) => P.R.shuffle(arr);
  P.pick = (arr) => P.R.pick(arr);
  P.randInt = (lo, hi) => P.R.int(lo, hi);
  P.uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  // --- Format ---
  P.fmtTime = (sec) => {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  P.fmtDur = (sec) => {
    sec = Math.round(sec);
    if (sec < 60) return `${sec} dtk`;
    const m = Math.floor(sec / 60), s = sec % 60;
    return s ? `${m} mnt ${s} dtk` : `${m} mnt`;
  };
  P.fmtDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  P.pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  P.letter = (i) => "ABCDEFGH"[i];
  P.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  P.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // --- DOM ---
  P.h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  P.$ = (sel, root) => (root || document).querySelector(sel);
  P.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  P.toast = (msg, ms = 2200) => {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), ms);
  };
  P.modal = (html, opts = {}) => new Promise((resolve) => {
    const m = document.getElementById("modal");
    m.innerHTML = `<div class="modal-box">${html}</div>`;
    m.hidden = false;
    const close = (v) => { m.hidden = true; m.innerHTML = ""; resolve(v); };
    m.onclick = (e) => { if (e.target === m && !opts.locked) close(null); };
    P.$$("[data-close]", m).forEach((b) => b.addEventListener("click", () => close(b.dataset.close)));
  });
  P.confirm = (title, body, okText = "Ya, lanjutkan", cancelText = "Batal") =>
    P.modal(`<h2>${title}</h2><p class="muted">${body}</p><div class="row" style="justify-content:flex-end;margin-top:1rem"><button class="btn" data-close="">${cancelText}</button><button class="btn btn-primary" data-close="ok">${okText}</button></div>`).then((v) => v === "ok");

  // --- Shuffle options while tracking the correct answer ---
  P.shuffleOptions = (q, rng) => {
    const r = rng || P.R;
    const opts = q.o || q.options || [], ans = q.a !== undefined ? q.a : q.answer;
    if (q.noShuffle) return { options: opts, answer: ans, map: opts.map((_, i) => i) };
    const idx = r.shuffle(opts.map((_, i) => i));
    return { options: idx.map((i) => opts[i]), answer: idx.indexOf(ans), map: idx };
  };

  // Array helpers
  P.sum = (a) => a.reduce((s, v) => s + v, 0);
  P.avg = (a) => (a.length ? P.sum(a) / a.length : 0);
  P.groupBy = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); (m[k] = m[k] || []).push(x); return m; }, {});
  P.uniqueBy = (arr, fn) => { const seen = new Set(); return arr.filter((x) => { const k = fn(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
})(window.PSI);

/* js/lib/icons.js */
/* Set ikon SVG satu gaya: viewBox 24, stroke 1.75, ujung bulat */
(function (P) {
  const D = {
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/><path d="M8 7h8M8 10.5h6"/>',
    hash: '<path d="M9 4 7 20M17 4l-2 16M4 9h17M3 15h17"/>',
    puzzle: '<path d="M9 4h4a1 1 0 0 1 1 1v2a2 2 0 1 0 0 4v2h3a1 1 0 0 1 1 1v2a2 2 0 1 1 0 4v0h-3v-2a2 2 0 1 0-4 0v2H8a1 1 0 0 1-1-1v-3H5a2 2 0 1 1 0-4h2V5a1 1 0 0 1 1-1z"/>',
    shapes: '<path d="M12 3 4.5 15h15z"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><circle cx="7" cy="18" r="3"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h3l7 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/><path d="M8 15v4.5"/>',
    brain: '<path d="M9.5 4A3 3 0 0 0 6.6 7.9 3.5 3.5 0 0 0 5 14a3.5 3.5 0 0 0 3 5.5h1.5V4z"/><path d="M14.5 4a3 3 0 0 1 2.9 3.9A3.5 3.5 0 0 1 19 14a3.5 3.5 0 0 1-3 5.5h-1.5V4z"/><path d="M9.5 10H7M14.5 10H17M9.5 14.5H8M14.5 14.5H16"/>',
    mask: '<path d="M4 6c2.5-1.3 5-2 8-2s5.5.7 8 2v6a8 8 0 0 1-16 0z"/><path d="M8 11c.7-.7 1.8-.7 2.5 0M13.5 11c.7-.7 1.8-.7 2.5 0"/><path d="M9 15.5c1.8 1.4 4.2 1.4 6 0"/>',
    pencil: '<path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="m14 7 3 3"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-3.5M4 13a8 8 0 0 0 14.5 3.5"/><path d="M20 4v4h-4M4 20v-4h4"/>',
    arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    play: '<path d="M7 5v14l12-7z"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/><path d="M12 8v4l3 2"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    alert: '<path d="M12 4 3 20h18z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M8 13.5a5.5 5.5 0 1 1 8 0c-.8.8-1.3 1.6-1.5 2.5h-5c-.2-.9-.7-1.7-1.5-2.5z"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4M17 6h2.5a2.5 2.5 0 0 1-2.5 4"/><path d="M12 14v3M8.5 20h7M10 17h4v3h-4z"/>',
    keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.2"/><rect x="13" y="4" width="7" height="7" rx="1.2"/><rect x="4" y="13" width="7" height="7" rx="1.2"/><rect x="13" y="13" width="7" height="7" rx="1.2"/>',
    coffee: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10h1.5a2 2 0 0 1 0 4H16"/><path d="M8 4.5v2M11 4.5v2"/>',
    fire: '<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.5.5-2.5 1.2-3.5.4 1 1 1.6 1.8 2 .3-2.5.2-5 1-7z"/>',
    trash: '<path d="M5 7h14M9 7V4h6v3M8 7l.8 13h6.4L16 7"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
    bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
    eraser: '<path d="m7 20 9.5-9.5a2 2 0 0 0 0-2.8l-2.2-2.2a2 2 0 0 0-2.8 0L4 13a2 2 0 0 0 0 2.8L7 19"/><path d="M7 20h13"/><path d="m9 11 4.5 4.5"/>',
  };
  P.icon = function (name, size = 20, cls = "") {
    const d = D[name] || D.info;
    return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  };
  P.ICONS = D;
})(window.PSI);

/* js/lib/svg.js */
/* Renderer bentuk SVG untuk soal figural */
(function (P) {
  const S = {};
  const NS = "http://www.w3.org/2000/svg";

  // Shape path generators (centered at 0,0, size r)
  function polygon(n, r, rot = -90) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      pts.push([(r * Math.cos(a)).toFixed(2), (r * Math.sin(a)).toFixed(2)]);
    }
    return pts.map((p) => p.join(",")).join(" ");
  }
  function star(r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = ((-90 + 36 * i) * Math.PI) / 180;
      pts.push([(rr * Math.cos(a)).toFixed(2), (rr * Math.sin(a)).toFixed(2)]);
    }
    return pts.map((p) => p.join(",")).join(" ");
  }
  S.shapeNames = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "star", "cross", "arrow", "heart", "semicircle", "rect"];
  S.shapeLabel = { circle: "lingkaran", square: "persegi", triangle: "segitiga", diamond: "belah ketupat", pentagon: "segi lima", hexagon: "segi enam", star: "bintang", cross: "tanda plus", arrow: "panah", heart: "hati", semicircle: "setengah lingkaran", rect: "persegi panjang" };

  /**
   * Render one shape element string.
   * opts: {shape, x, y, r, fill: 'solid'|'none'|'half'|'hatch'|'dot', rotate, stroke, color, label, labelSize}
   */
  S.shape = function (o) {
    const r = o.r || 18, x = o.x || 0, y = o.y || 0, rot = o.rotate || 0;
    const stroke = o.color || "var(--fig-stroke)";
    const sw = o.strokeWidth || 2.2;
    let fillAttr = "none";
    if (o.fill === "solid") fillAttr = o.color || "var(--fig-fill)";
    else if (o.fill === "hatch") fillAttr = "url(#hatch)";
    else if (o.fill === "dot") fillAttr = "url(#dots)";
    else if (o.fill === "gray") fillAttr = "#9aa0b8";
    const common = `fill="${fillAttr}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
    let body = "";
    switch (o.shape) {
      case "circle": body = `<circle r="${r}" ${common}/>`; break;
      case "square": body = `<rect x="${-r * 0.88}" y="${-r * 0.88}" width="${r * 1.76}" height="${r * 1.76}" ${common}/>`; break;
      case "rect": body = `<rect x="${-r}" y="${-r * 0.55}" width="${r * 2}" height="${r * 1.1}" ${common}/>`; break;
      case "triangle": body = `<polygon points="${polygon(3, r * 1.08)}" ${common}/>`; break;
      case "diamond": body = `<polygon points="${polygon(4, r)}" ${common}/>`; break;
      case "pentagon": body = `<polygon points="${polygon(5, r)}" ${common}/>`; break;
      case "hexagon": body = `<polygon points="${polygon(6, r, 0)}" ${common}/>`; break;
      case "star": body = `<polygon points="${star(r * 1.05)}" ${common}/>`; break;
      case "cross": { const w = r * 0.36, L = r * 0.95; body = `<path d="M${-w} ${-L} h${2 * w} v${L - w} h${L - w} v${2 * w} h${-(L - w)} v${L - w} h${-2 * w} v${-(L - w)} h${-(L - w)} v${-2 * w} h${L - w} z" ${common}/>`; break; }
      case "arrow": { const L = r * 1.05, w = r * 0.32, hw = r * 0.62, hl = r * 0.55; body = `<path d="M${-w} ${L} v${-(2 * L - hl)} h${-(hw - w)} L0 ${-L} L${hw} ${-L + hl} h${-(hw - w)} v${2 * L - hl} z" ${common}/>`; break; }
      case "heart": body = `<path d="M0 ${r * 0.9} C${-r * 1.5} ${-r * 0.1} ${-r * 0.7} ${-r * 1.1} 0 ${-r * 0.4} C${r * 0.7} ${-r * 1.1} ${r * 1.5} ${-r * 0.1} 0 ${r * 0.9} z" ${common}/>`; break;
      case "semicircle": body = `<path d="M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 z" ${common}/>`; break;
      case "half": body = `<circle r="${r}" ${common}/><path d="M0 ${-r} A${r} ${r} 0 0 1 0 ${r} z" fill="${stroke}" stroke="none"/>`; break;
      case "dot": body = `<circle r="${r * 0.3}" fill="${stroke}" stroke="none"/>`; break;
      case "line": body = `<line x1="${-r}" y1="0" x2="${r}" y2="0" ${common}/>`; break;
      case "lineArrow": body = `<line x1="0" y1="${r}" x2="0" y2="${-r * 0.7}" ${common}/><polygon points="0,${-r} ${-r * 0.4},${-r * 0.45} ${r * 0.4},${-r * 0.45}" fill="${stroke}" stroke="none"/>`; break;
      case "L": body = `<path d="M${-r * 0.6} ${-r} v${2 * r} h${1.3 * r}" ${common.replace(/fill="[^"]*"/, 'fill="none"')}/>`; break;
      case "F": body = `<path d="M${-r * 0.6} ${r} v${-2 * r} h${1.3 * r} M${-r * 0.6} 0 h${r * 0.9}" ${common.replace(/fill="[^"]*"/, 'fill="none"')}/>`; break;
      case "P": body = `<path d="M${-r * 0.6} ${r} v${-2 * r} h${r * 0.8} a${r * 0.5} ${r * 0.5} 0 0 1 0 ${r} h${-r * 0.8}" ${common.replace(/fill="[^"]*"/, 'fill="none"')}/>`; break;
      default: body = `<circle r="${r}" ${common}/>`;
    }
    if (o.fill === "half") {
      // overlay half fill (top half)
      body += `<clipPath id="c${o.cid || "h"}"><rect x="${-r * 1.2}" y="${-r * 1.2}" width="${r * 2.4}" height="${r * 1.2}"/></clipPath>` +
        body.replace(/fill="[^"]*"/, `fill="${stroke}"`).replace(/\/>$/, ` clip-path="url(#c${o.cid || "h"})"/>`);
    }
    let label = "";
    if (o.label !== undefined && o.label !== null && o.label !== "") {
      const fs = o.labelSize || r * 0.95;
      const lc = o.fill === "solid" ? "var(--fig-bg)" : "var(--fig-stroke)";
      label = `<text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="700" font-family="var(--mono)" fill="${lc}">${o.label}</text>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${body}${label}</g>`;
  };

  S.defs = `<defs>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--fig-stroke)" stroke-width="2"/></pattern>
    <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="var(--fig-stroke)"/></pattern>
  </defs>`;

  /** Wrap content in an svg with viewBox */
  S.svg = function (inner, w, h, opts = {}) {
    const cls = opts.cls ? ` class="${opts.cls}"` : "";
    const bg = opts.frame ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" fill="var(--fig-bg)" stroke="var(--line-strong)" stroke-width="1.5"/>` : "";
    return `<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}" width="${opts.width || w}" height="${opts.height || h}"${cls} role="img">${S.defs}${bg}${inner}</svg>`;
  };

  /** Render a panel (cell) containing a list of shape objects, as svg */
  S.panel = function (items, size = 100, opts = {}) {
    const inner = items.map((it, i) => S.shape(Object.assign({ cid: (opts.cid || "p") + i }, it))).join("");
    return S.svg(inner, size, size, Object.assign({ frame: true }, opts));
  };

  /** Render a row of panels (sequence) with an optional '?' box at the end */
  S.sequence = function (panels, opts = {}) {
    const size = opts.size || 96, gap = opts.gap || 10;
    const n = panels.length + (opts.question ? 1 : 0);
    const w = n * size + (n - 1) * gap, h = size;
    let inner = "";
    panels.forEach((items, k) => {
      const x = k * (size + gap);
      inner += `<g transform="translate(${x} 0)"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="8" fill="var(--fig-bg)" stroke="var(--line-strong)" stroke-width="1.5"/>` +
        items.map((it, i) => S.shape(Object.assign({ cid: "s" + k + "_" + i }, it, { x: (it.x || 0) + size / 2, y: (it.y || 0) + size / 2 }))).join("") + `</g>`;
    });
    if (opts.question) {
      const x = (n - 1) * (size + gap);
      inner += `<g transform="translate(${x} 0)"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="8" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${size / 2}" y="${size / 2 + 12}" text-anchor="middle" font-size="36" font-weight="800" fill="var(--primary)" font-family="var(--font)">?</text></g>`;
    }
    return S.svg(inner, w, h, { width: "100%", height: "auto" }).replace('width="100%" height="auto"', `style="max-width:${w}px;width:100%;height:auto"`);
  };

  /** Render matrix 3x3 with last cell '?' */
  S.matrix = function (cells, opts = {}) {
    const size = opts.size || 90, gap = 8, cols = 3;
    const w = cols * size + (cols - 1) * gap, h = w;
    let inner = "";
    cells.forEach((items, k) => {
      const cx = (k % cols) * (size + gap), cy = Math.floor(k / cols) * (size + gap);
      if (items === null) {
        inner += `<g transform="translate(${cx} ${cy})"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="8" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${size / 2}" y="${size / 2 + 12}" text-anchor="middle" font-size="34" font-weight="800" fill="var(--primary)" font-family="var(--font)">?</text></g>`;
      } else {
        inner += `<g transform="translate(${cx} ${cy})"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="8" fill="var(--fig-bg)" stroke="var(--line-strong)" stroke-width="1.5"/>` +
          items.map((it, i) => S.shape(Object.assign({ cid: "m" + k + "_" + i }, it, { x: (it.x || 0) + size / 2, y: (it.y || 0) + size / 2 }))).join("") + `</g>`;
      }
    });
    return S.svg(inner, w, h).replace(/width="\d+" height="\d+"/, `style="max-width:${w}px;width:100%;height:auto"`);
  };

  /** Mirror helper: returns a transform string for a group of items */
  S.transformItems = function (items, kind, size = 100) {
    // kind: 'mirrorH' (cermin vertikal → kiri-kanan tertukar), 'mirrorV' (atas-bawah), 'rot90','rot180','rot270'
    return items.map((it) => {
      const c = Object.assign({}, it);
      const x = it.x || 0, y = it.y || 0, rot = it.rotate || 0;
      if (kind === "mirrorH") { c.x = -x; c.rotate = -rot; c.flipX = !it.flipX; }
      else if (kind === "mirrorV") { c.y = -y; c.rotate = 180 - rot; c.flipX = !it.flipX; }
      else if (kind === "rot90") { c.x = -y; c.y = x; c.rotate = rot + 90; }
      else if (kind === "rot180") { c.x = -x; c.y = -y; c.rotate = rot + 180; }
      else if (kind === "rot270") { c.x = y; c.y = -x; c.rotate = rot + 270; }
      return c;
    });
  };

  // Shape with flipX support (scale -1) wrapper
  const baseShape = S.shape;
  S.shape = function (o) {
    if (o.flipX) {
      const inner = baseShape(Object.assign({}, o, { x: 0, y: 0, rotate: 0, flipX: false }));
      return `<g transform="translate(${o.x || 0} ${o.y || 0}) rotate(${o.rotate || 0}) scale(-1 1)">${inner}</g>`;
    }
    return baseShape(o);
  };

  /** Simple Wartegg stimuli (8 boxes) drawing into a canvas 2d context, size s */
  S.warteggStimulus = function (ctx, idx, s) {
    ctx.save();
    ctx.strokeStyle = "#111"; ctx.fillStyle = "#111"; ctx.lineWidth = Math.max(2, s * 0.012); ctx.lineCap = "round";
    switch (idx) {
      case 0: ctx.beginPath(); ctx.arc(s * 0.5, s * 0.5, s * 0.025, 0, Math.PI * 2); ctx.fill(); break; // titik tengah
      case 1: ctx.beginPath(); ctx.moveTo(s * 0.22, s * 0.2); ctx.bezierCurveTo(s * 0.26, s * 0.32, s * 0.36, s * 0.36, s * 0.42, s * 0.3); ctx.stroke(); break; // lengkung kecil
      case 2: { const x0 = s * 0.2, y0 = s * 0.7; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * s * 0.08, y0); ctx.lineTo(x0 + i * s * 0.08, y0 - s * (0.1 + i * 0.1)); ctx.stroke(); } break; } // garis naik
      case 3: ctx.fillRect(s * 0.68, s * 0.14, s * 0.18, s * 0.18); break; // kotak hitam kanan atas
      case 4: ctx.beginPath(); ctx.moveTo(s * 0.18, s * 0.78); ctx.lineTo(s * 0.18, s * 0.5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 0.22, s * 0.82); ctx.lineTo(s * 0.5, s * 0.82); ctx.stroke(); break; // dua garis tegak lurus
      case 5: ctx.beginPath(); ctx.moveTo(s * 0.18, s * 0.26); ctx.lineTo(s * 0.5, s * 0.26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 0.72, s * 0.32); ctx.lineTo(s * 0.72, s * 0.62); ctx.stroke(); break; // garis horizontal & vertikal terpisah
      case 6: { for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * (Math.PI / 2); ctx.beginPath(); ctx.arc(s * 0.6 + Math.cos(a) * s * 0.26, s * 0.78 + Math.sin(a) * s * 0.26, s * 0.012, 0, Math.PI * 2); ctx.fill(); } break; } // titik-titik lengkung
      case 7: ctx.beginPath(); ctx.arc(s * 0.5, s * 0.36, s * 0.3, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); break; // lengkung besar
    }
    ctx.restore();
  };

  P.SVG = S;
})(window.PSI);

/* js/core/store.js */
/* Penyimpanan progres & riwayat (localStorage) */
(function (P) {
  const KEY = "psikolatih.v1";
  const def = () => ({
    theme: null,
    materiRead: {},      // "module/section" -> ts
    quizBest: {},        // "module/section" -> {score, total, pct, ts}
    attempts: [],        // riwayat simulasi/kuis: {id, kind, title, moduleId, ts, score, total, pct, durasi, sections:[], items:[]}
    kraepelin: [],       // {ts, cols, perCol:[], errors, avg, ...}
    personality: {},     // testId -> {ts, result}
    wartegg: [],         // {ts, checklist}
    lastSeen: Date.now(),
    daysActive: [],
  });
  let data = null;
  function load() {
    if (data) return data;
    try { data = Object.assign(def(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { data = def(); }
    // hari aktif (streak)
    const today = new Date().toISOString().slice(0, 10);
    if (!data.daysActive.includes(today)) { data.daysActive.push(today); if (data.daysActive.length > 400) data.daysActive = data.daysActive.slice(-400); }
    save();
    return data;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* abaikan */ } }

  const Store = {
    get: () => load(),
    save,
    reset() { data = def(); save(); },
    setTheme(t) { load().theme = t; save(); },
    markMateri(moduleId, sectionId) { load().materiRead[`${moduleId}/${sectionId}`] = Date.now(); save(); },
    isMateriRead(moduleId, sectionId) { return !!load().materiRead[`${moduleId}/${sectionId}`]; },
    recordQuiz(moduleId, sectionId, score, total) {
      const d = load(); const k = `${moduleId}/${sectionId}`; const pct = P.pct(score, total);
      const prev = d.quizBest[k];
      if (!prev || pct > prev.pct) d.quizBest[k] = { score, total, pct, ts: Date.now() };
      d.quizBest[k].tries = (prev && prev.tries ? prev.tries : 0) + 1;
      save();
    },
    quizBest(moduleId, sectionId) { return load().quizBest[`${moduleId}/${sectionId}`] || null; },
    addAttempt(a) { const d = load(); a.id = a.id || P.uid(); d.attempts.unshift(a); if (d.attempts.length > 60) d.attempts.length = 60; save(); return a.id; },
    attempts() { return load().attempts; },
    attempt(id) { return load().attempts.find((a) => a.id === id) || null; },
    deleteAttempt(id) { const d = load(); d.attempts = d.attempts.filter((a) => a.id !== id); save(); },
    addKraepelin(r) { const d = load(); d.kraepelin.unshift(r); if (d.kraepelin.length > 30) d.kraepelin.length = 30; save(); },
    savePersonality(testId, result) { load().personality[testId] = { ts: Date.now(), result }; save(); },
    personality(testId) { return load().personality[testId] || null; },
    addWartegg(c) { const d = load(); d.wartegg.unshift(c); if (d.wartegg.length > 10) d.wartegg.length = 10; save(); },
    streak() {
      const days = new Set(load().daysActive); let n = 0; const d = new Date();
      for (;;) { const k = d.toISOString().slice(0, 10); if (days.has(k)) { n++; d.setDate(d.getDate() - 1); } else break; }
      return n;
    },
    moduleProgress(mod) {
      // persentase: materi dibaca + kuis tiap bagian ≥ 60%
      const secs = mod.sections || []; if (!secs.length) return 0;
      let pts = 0, max = 0;
      secs.forEach((s) => {
        max += 2;
        if (Store.isMateriRead(mod.id, s.id)) pts += 1;
        const b = Store.quizBest(mod.id, s.id); if (b && b.pct >= 60) pts += 1;
      });
      return Math.round((pts / max) * 100);
    },
    export() { return JSON.stringify(load(), null, 2); },
  };
  P.Store = Store;
})(window.PSI);

/* js/data/modules.js */
/* Definisi modul, bagian, dan materi pembelajaran */
(function (P) {
  const ex = (q, a) => `<div class="example"><div class="ex-q">${q}</div><div class="ex-a">${a}</div></div>`;
  const step = (n, t) => `<div class="step"><span class="n">${n}</span><div>${t}</div></div>`;
  const tip = (t) => `<div class="callout callout-tip"><span class="co-ico">${P.icon("bulb", 22)}</span><div>${t}</div></div>`;
  const warn = (t) => `<div class="callout callout-danger"><span class="co-ico">${P.icon("alert", 22)}</span><div>${t}</div></div>`;
  const info = (t) => `<div class="callout callout-info"><span class="co-ico">${P.icon("info", 22)}</span><div>${t}</div></div>`;

  P.MODULES = [
    /* ===================================================================== VERBAL */
    {
      id: "verbal", title: "Kemampuan Verbal", short: "Verbal", icon: "book", kind: "kognitif",
      color: "linear-gradient(135deg,#2563eb,#7c3aed)", accent: "#4f46e5",
      desc: "Sinonim, antonim, analogi kata, dan pemahaman wacana. Mengukur kosakata dan kemampuan melihat hubungan makna.",
      sections: [
        {
          id: "sinonim", title: "Sinonim (Persamaan Kata)", desc: "Memilih kata yang maknanya paling dekat dengan kata utama.",
          quiz: { count: 12, time: 300 }, sim: { count: 10, time: 240 }, source: ["bank"],
          materi: `
<p class="lead">Tes sinonim menilai luasnya kosakata dan ketepatan memahami makna. Kata yang diuji sering berupa <b>kata serapan</b>, <b>istilah baku yang jarang dipakai sehari-hari</b>, atau <b>kata bermakna ganda</b>.</p>
<h2>Apa yang diukur</h2>
<p>HRD menggunakan tes ini untuk menilai kemampuan komunikasi tertulis, ketelitian membaca dokumen, dan wawasan umum. Satu kata dipilih untuk "mewakili" ratusan kata lain pada tingkat kesulitan yang sama.</p>
<h2>Cara menjawab</h2>
${step(1, "<b>Pahami kata utama dulu</b> sebelum melihat pilihan. Tanyakan: kata ini biasanya dipakai dalam kalimat apa? Misal <i>rabat</i> → \"dapat rabat 10%\" → potongan harga.")}
${step(2, "<b>Buat kalimat pendek</b> dengan kata utama, lalu ganti dengan tiap pilihan. Pilihan yang membuat kalimat tetap bermakna sama adalah jawabannya.")}
${step(3, "<b>Gunakan akar kata / asal serapan</b>. <i>Evokasi</i> (evoke = membangkitkan) → penggugah rasa. <i>Transendental</i> (transcend = melampaui) → abstrak/di luar jangkauan indra.")}
${step(4, "<b>Eliminasi</b>: buang pilihan yang merupakan antonim, dan pilihan yang hanya mirip bunyi/ejaan (jebakan paling umum).")}
<h2>Trik cepat</h2>
<ul>
<li><b>Jebakan bunyi</b>: <i>insomnia</i> ≠ <i>somnolen</i>; <i>motilitas</i> (gerak) ≠ <i>mortalitas</i> (angka kematian). Pembuat soal sengaja memasukkan kata yang mirip.</li>
<li><b>Awalan/akhiran serapan</b>: <i>a-/an-</i> = tidak (anomali, asimetris), <i>pre-</i> = sebelum, <i>post-</i> = sesudah, <i>kontra-</i> = lawan, <i>-isme</i> = paham.</li>
<li><b>Bidang makna</b>: jika kata utama istilah ekonomi (<i>defisit</i>), pilihan yang benar hampir pasti juga istilah ekonomi (<i>kekurangan</i>), bukan istilah emosi.</li>
<li>Kalau benar-benar tidak tahu, pilih kata yang <b>paling netral dan umum</b> di antara pilihan — statistik menunjukkan ini lebih sering benar daripada menebak acak.</li>
</ul>
<h2>Contoh terbimbing</h2>
${ex("EVOKASI = …<br>a. Penggugah rasa &nbsp; b. Penilaian &nbsp; c. Perubahan &nbsp; d. Pengungsian &nbsp; e. Izin menetap", "Akar kata <i>evoke</i> (Inggris) = membangkitkan/menggugah. Pilihan b–e tidak ada hubungannya dengan \"membangkitkan\". <b>Jawaban: A</b>. Perhatikan <i>evakuasi</i> (pengungsian) adalah jebakan bunyi.")}
${ex("SINE QUA NON = …<br>a. Tiada berair &nbsp; b. Harus ada &nbsp; c. Air mineral &nbsp; d. Kelengkapan &nbsp; e. Selalu negatif", "Frasa Latin <i>sine qua non</i> = \"tanpanya tidak (bisa)\" → syarat mutlak, harus ada. <b>Jawaban: B</b>. Pilihan a dan c adalah jebakan dari kata \"qua\" yang mirip \"aqua\".")}
${ex("MUDUN = …<br>a. Problema &nbsp; b. Beradab &nbsp; c. Referensi &nbsp; d. Setuju &nbsp; e. Mufakat", "Kata Arab serapan <i>mudun</i>/<i>madani</i> = beradab, berperadaban kota. <b>Jawaban: B</b>. Ini tipe soal sulit: kata yang jarang dipakai, sehingga kamu harus mengenali rumpun kata (<i>madani</i>, <i>tamadun</i>).")}
<h2>Kesalahan umum</h2>
${warn("Memilih kata yang <b>berkaitan</b> tapi bukan <b>sepadan</b>. Contoh: PROTEKSI → <i>pengawasan</i> (berkaitan) vs <i>perlindungan</i> (sepadan). Sinonim harus bisa saling menggantikan dalam kalimat.")}
${tip("Buat daftar kosakata pribadi. Setiap kali salah di kuis, catat kata + artinya + satu kalimat contoh. Kosakata psikotes cenderung berulang antar perusahaan.")}
`
        },
        {
          id: "antonim", title: "Antonim (Lawan Kata)", desc: "Menentukan kata yang maknanya berlawanan.",
          quiz: { count: 12, time: 300 }, sim: { count: 10, time: 240 }, source: ["bank"],
          materi: `
<p class="lead">Tes antonim sering dianggap lebih sulit dari sinonim karena <b>otak kita secara otomatis mencari persamaan</b>. Banyak peserta salah karena lupa bahwa yang dicari adalah <b>lawan</b>, bukan padanan.</p>
<h2>Cara menjawab</h2>
${step(1, "Tulis/ucapkan dalam hati: <b>\"LAWAN dari …\"</b> sebelum membaca pilihan. Ini mencegah refleks memilih sinonim.")}
${step(2, "Tentukan dulu <b>arti kata utama</b>. Jika kata utama tidak dikenal, cari lawan dari pilihan jawaban: dua pilihan yang saling berlawanan biasanya salah satunya adalah jawaban, satunya lagi sinonim kata utama (jebakan).")}
${step(3, "Cari lawan yang <b>setara tingkatannya</b>. Lawan <i>gigantik</i> bukan sekadar <i>kecil</i>, tetapi <i>mungil/kerdil</i>. Lawan <i>amatir</i> adalah <i>profesional</i>, bukan <i>pintar</i>.")}
${step(4, "Perhatikan <b>kelas kata</b>: lawan kata kerja harus kata kerja, lawan kata sifat harus kata sifat.")}
<h2>Pola lawan kata yang sering keluar</h2>
<table><tr><th>Pola</th><th>Contoh</th></tr>
<tr><td>Kata serapan ↔ serapan</td><td>progresif ↔ regresif, konveks ↔ konkaf, mayor ↔ minor, eksplisit ↔ implisit</td></tr>
<tr><td>Awalan negasi</td><td>stabil ↔ labil, simetris ↔ asimetris, normal ↔ abnormal</td></tr>
<tr><td>Arah/posisi</td><td>hulu ↔ hilir, nadir ↔ zenit, apriori ↔ aposteriori</td></tr>
<tr><td>Kata Melayu klasik</td><td>bongsor ↔ kerdil, sahih ↔ palsu, gasal ↔ genap</td></tr>
<tr><td>Ekonomi/sosial</td><td>defisit ↔ surplus, deflasi ↔ inflasi, sentralisasi ↔ desentralisasi</td></tr></table>
<h2>Contoh terbimbing</h2>
${ex("NOMADEN >< …<br>a. Berpindah &nbsp; b. Menetap &nbsp; c. Pengembara &nbsp; d. Liar &nbsp; e. Bebas", "Nomaden = hidup berpindah-pindah. Pilihan a dan c adalah <b>sinonim</b> (jebakan). Lawan yang tepat: <b>B. Menetap</b> (sedenter).")}
${ex("PROMINEN >< …<br>a. Terkenal &nbsp; b. Biasa &nbsp; c. Mencolok &nbsp; d. Terhormat &nbsp; e. Penting", "Prominen = menonjol, terkemuka. Tiga pilihan (a, c, d, e) adalah sinonim. Satu-satunya lawan: <b>B. Biasa</b>. Soal seperti ini cepat dijawab dengan mencari \"yang berbeda sendiri\".")}
${warn("Jangan pilih lawan yang \"terlalu jauh\". Lawan <i>optimis</i> adalah <i>pesimis</i>, bukan <i>sedih</i>. Lawan <i>canggih</i> adalah <i>kuno/sederhana</i>, bukan <i>rusak</i>.")}
`
        },
        {
          id: "analogi", title: "Analogi (Padanan Hubungan Kata)", desc: "Menemukan pasangan kata dengan hubungan yang sama.",
          quiz: { count: 12, time: 360 }, sim: { count: 10, time: 300 }, source: ["bank"],
          materi: `
<p class="lead">Analogi verbal menguji kemampuan <b>melihat hubungan</b>, bukan sekadar arti kata. Format: <code>A : B = C : D</code>. Kuncinya adalah mengubah pasangan pertama menjadi <b>kalimat hubungan</b>, lalu mengujinya pada tiap pilihan.</p>
<h2>Metode "kalimat jembatan"</h2>
${step(1, "Buat kalimat yang menghubungkan A dan B <b>sespesifik mungkin</b>. <i>SENAPAN : BERBURU</i> → \"Senapan adalah <b>alat</b> yang <b>digunakan untuk</b> berburu.\"")}
${step(2, "Masukkan tiap pilihan ke kalimat yang sama. \"Perangkap adalah alat yang digunakan untuk menangkap\" ✔. \"Kapal adalah alat untuk berlabuh\" ✘ (berlabuh bukan tujuan kapal).")}
${step(3, "Jika lebih dari satu pilihan lolos, <b>perketat kalimat</b>: tambahkan sifat hubungan (bagian dari, bahan dasar, urutan, intensitas, sebab-akibat).")}
${step(4, "Cek <b>arah</b> hubungan. Jika A → B adalah \"bahan → hasil\", pilihan dengan \"hasil → bahan\" salah meskipun kata-katanya cocok.")}
<h2>Jenis hubungan yang sering muncul</h2>
<table><tr><th>Hubungan</th><th>Contoh</th><th>Kalimat jembatan</th></tr>
<tr><td>Fungsi / alat</td><td>pisau : memotong</td><td>… digunakan untuk …</td></tr>
<tr><td>Bagian – keseluruhan</td><td>jari : tangan</td><td>… adalah bagian dari …</td></tr>
<tr><td>Bahan – hasil</td><td>tanah liat : bata</td><td>… adalah bahan untuk membuat …</td></tr>
<tr><td>Sebab – akibat</td><td>api : panas</td><td>… menimbulkan …</td></tr>
<tr><td>Tingkatan / intensitas</td><td>hangat : panas</td><td>… lebih rendah dari …</td></tr>
<tr><td>Tempat – pelaku</td><td>rumah sakit : dokter</td><td>… adalah tempat … bekerja</td></tr>
<tr><td>Ilmu – objek</td><td>meteorologi : cuaca</td><td>… mempelajari …</td></tr>
<tr><td>Kondisi – ketiadaan</td><td>rambut : gundul</td><td>tanpa … disebut …</td></tr>
<tr><td>Urutan / proses</td><td>telur : ulat : kepompong</td><td>… lalu menjadi …</td></tr>
<tr><td>Sinonim / antonim</td><td>fiktif : fakta</td><td>… berlawanan dengan …</td></tr></table>
<h2>Contoh terbimbing</h2>
${ex("KEPALA : HELM = …<br>a. Sabut : kelapa &nbsp; b. Rumah : atap &nbsp; c. Jari : cincin &nbsp; d. Album : foto &nbsp; e. Kaki : kaus", "Kalimat jembatan: \"Helm <b>melindungi</b> kepala <b>dari atas</b>.\" Uji: atap melindungi rumah dari atas ✔. Cincin menghias jari (bukan melindungi) ✘. Kaus menutupi kaki tapi bukan pelindung ✘. <b>Jawaban: B</b>.")}
${ex("RAMBUT : GUNDUL = …<br>a. Bulu : cabut &nbsp; b. Mobil : mogok &nbsp; c. Botak : kepala &nbsp; d. Pakaian : bugil &nbsp; e. Lantai : licin", "\"Keadaan <b>tanpa</b> rambut disebut gundul.\" → Keadaan tanpa pakaian disebut bugil ✔. Pilihan c membalik arah (botak : kepala). <b>Jawaban: D</b>.")}
${ex("METEOROLOGI : CUACA = …<br>a. Astronomi : fisika &nbsp; b. Gerontologi : keturunan &nbsp; c. Pedagogik : sekolah &nbsp; d. Patologi : penyakit &nbsp; e. Antropologi : fosil", "\"Meteorologi adalah ilmu yang <b>mempelajari</b> cuaca.\" Patologi mempelajari penyakit ✔. Gerontologi mempelajari penuaan (bukan keturunan); antropologi mempelajari manusia (fosil = arkeologi/paleontologi). <b>Jawaban: D</b>. Soal sulit menguji pengetahuan istilah, bukan hanya logika.")}
${tip("Jika pasangan soal berupa <b>tiga kata</b> (A : B : C), hubungan biasanya <b>urutan</b> atau <b>proses</b>. Cari pilihan yang urutannya konsisten, bukan hanya temanya sama.")}
`
        },
        {
          id: "wacana", title: "Pemahaman Wacana & Penalaran Verbal", desc: "Menarik kesimpulan dari teks: benar, salah, atau tidak dapat disimpulkan.",
          quiz: { count: 10, time: 480 }, sim: { count: 8, time: 420 }, source: ["bank"],
          materi: `
<p class="lead">Format yang kini dominan di perusahaan multinasional dan startup (misalnya tes online seperti SHL, Talent Q, atau <i>graduate program</i>): kamu membaca teks pendek, lalu menilai sebuah pernyataan <b>TRUE / FALSE / CANNOT SAY</b> (Benar / Salah / Tidak dapat disimpulkan). Juga termasuk soal <b>kalimat acak</b> dan <b>ide pokok</b>.</p>
<h2>Aturan emas: hanya dari teks</h2>
${info("Jawaban harus bersumber <b>hanya</b> dari informasi di dalam teks, <b>bukan</b> dari pengetahuan atau pendapatmu. Ini aturan yang paling sering dilanggar peserta.")}
<table><tr><th>Jawaban</th><th>Kapan dipilih</th></tr>
<tr><td><b>Benar</b></td><td>Pernyataan <b>secara logis mengikuti</b> dari teks (dinyatakan langsung atau bisa diturunkan tanpa asumsi tambahan).</td></tr>
<tr><td><b>Salah</b></td><td>Pernyataan <b>bertentangan</b> dengan teks.</td></tr>
<tr><td><b>Tidak dapat disimpulkan</b></td><td>Teks <b>tidak memberi cukup informasi</b> untuk memutuskan benar atau salah — walaupun menurut pengetahuan umum pernyataan itu benar.</td></tr></table>
<h2>Cara menjawab</h2>
${step(1, "Baca <b>pernyataan dulu</b>, baru teks. Kamu jadi tahu informasi apa yang harus dicari.")}
${step(2, "Temukan kalimat di teks yang membahas hal yang sama. Bandingkan <b>kata per kata</b>: subjek, jumlah (<i>semua/sebagian/beberapa</i>), waktu, dan tingkat kepastian (<i>mungkin/dapat/pasti</i>).")}
${step(3, "Waspadai <b>penguatan klaim</b>. Teks: \"minum air <i>dapat membantu</i> mengurangi kalori\". Pernyataan: \"minum air <i>pasti</i> menurunkan berat badan\" → Tidak dapat disimpulkan (klaim diperkuat dan objeknya diganti).")}
${step(4, "Jika teks menyebut studi/penelitian, pernyataan tentang <b>sebab-akibat</b> yang tidak ditulis eksplisit biasanya \"tidak dapat disimpulkan\".")}
<h2>Contoh terbimbing</h2>
${ex("Teks: <i>Tim ahli gizi mempublikasikan penelitian bahwa minum air sebelum makan dapat mengurangi konsumsi kalori. Peserta yang minum segelas air 30 menit sebelum makan mengonsumsi lebih sedikit kalori dan merasa kenyang lebih cepat.</i><br>Pernyataan: \"Minum air sebelum makan dapat membantu mengonsumsi lebih sedikit kalori.\"", "Teks menyatakan langsung: minum air sebelum makan → mengurangi konsumsi kalori. Pernyataan memakai kata \"dapat membantu\" — tingkat kepastiannya sama dengan teks. <b>Jawaban: BENAR</b>.")}
${ex("Teks yang sama. Pernyataan: \"Peserta penelitian berhasil menurunkan berat badan.\"", "Teks hanya membahas <b>kalori</b> dan rasa kenyang, tidak menyebut berat badan sama sekali. Walaupun secara logika umum mungkin terjadi, teks tidak memberi informasi itu. <b>Jawaban: TIDAK DAPAT DISIMPULKAN</b>.")}
<h2>Kalimat acak & ide pokok</h2>
<ul><li>Untuk <b>kalimat acak</b>: cari kalimat pembuka (biasanya mengandung subjek utama tanpa kata rujukan seperti <i>ini, tersebut, ia, mereka</i>), lalu rangkai berdasarkan kata penghubung (<i>kemudian, akibatnya, namun</i>).</li>
<li>Untuk <b>ide pokok</b>: biasanya ada di kalimat pertama atau terakhir paragraf. Kalimat lain berfungsi sebagai penjelas/contoh.</li></ul>
${tip("Di tes online berbahasa Inggris, kata kunci penentu: <i>some/all/most/only/always/never/may/must</i>. Satu kata ini sering mengubah jawaban dari TRUE menjadi CANNOT SAY.")}
`
        },
      ],
    },

    /* ===================================================================== NUMERIK */
    {
      id: "numerik", title: "Kemampuan Numerik", short: "Numerik", icon: "hash", kind: "kognitif",
      color: "linear-gradient(135deg,#0891b2,#2563eb)", accent: "#0891b2",
      desc: "Deret angka & huruf, aritmatika cepat, soal cerita, dan perbandingan kuantitatif.",
      sections: [
        {
          id: "deret-angka", title: "Deret Angka", desc: "Menemukan pola dan melanjutkan deret.",
          quiz: { count: 12, time: 480 }, sim: { count: 10, time: 420 }, source: ["bank", "gen:deret"],
          materi: `
<p class="lead">Deret angka adalah materi psikotes paling universal: muncul di hampir semua perusahaan, BUMN, bank, hingga tes TIU dan IST. Kuncinya bukan kemampuan hitung, melainkan <b>mengenali jenis pola</b> dengan cepat.</p>
<h2>Langkah standar</h2>
${step(1, "<b>Tulis selisih</b> antar suku di bawah deret. Jika selisih konstan → deret aritmetika. Jika selisih membentuk pola lagi (misal +2, +4, +6) → deret bertingkat.")}
${step(2, "Jika selisih tidak berpola, coba <b>rasio</b> (dibagi): 3, 6, 12, 24 → ×2. Atau campuran: ×2 lalu +1 bergantian.")}
${step(3, "Jika masih tidak jelas, <b>pecah menjadi dua atau tiga deret berselang</b> (suku ganjil dan suku genap). Contoh: 5, 7, 10, 12, 15 → suku ke-1,3,5: 5,10,15 (+5) dan suku ke-2,4: 7,12 (+5).")}
${step(4, "Cek <b>pola kelompok</b> (blok 3 angka berulang dengan perubahan) dan <b>pola istimewa</b>: bilangan kuadrat (1,4,9,16), kubik (1,8,27), prima (2,3,5,7,11), Fibonacci (1,1,2,3,5,8).")}
${step(5, "<b>Verifikasi</b>: pola yang kamu temukan harus cocok pada <b>semua</b> suku, bukan hanya tiga suku pertama.")}
<h2>Katalog pola</h2>
<table><tr><th>Jenis</th><th>Contoh</th><th>Kunci</th></tr>
<tr><td>Aritmetika</td><td>4, 9, 14, 19, <b>24</b></td><td>+5 tetap</td></tr>
<tr><td>Geometri</td><td>2, 6, 18, 54, <b>162</b></td><td>×3 tetap</td></tr>
<tr><td>Bertingkat</td><td>2, 3, 5, 8, 12, <b>17</b></td><td>selisih +1,+2,+3,+4,+5</td></tr>
<tr><td>Dua operasi bergantian</td><td>3, 6, 5, 10, 9, <b>18</b></td><td>×2, −1, ×2, −1</td></tr>
<tr><td>Dua deret berselang</td><td>1, 20, 3, 17, 5, 14, <b>7</b></td><td>ganjil +2; genap −3</td></tr>
<tr><td>Kelompok tiga</td><td>2, 5, 7 | 3, 6, 8 | 4, <b>7, 9</b></td><td>tiap blok +1</td></tr>
<tr><td>Larik "fibonacci"</td><td>1, 3, 4, 7, 11, <b>18</b></td><td>suku = jumlah dua sebelumnya</td></tr>
<tr><td>Kuadrat ± k</td><td>2, 5, 10, 17, 26, <b>37</b></td><td>n² + 1</td></tr>
<tr><td>Pangkat campur</td><td>1, 4, 27, 256</td><td>nⁿ</td></tr>
<tr><td>Deret turun bertingkat</td><td>50, 40, 31, 23, <b>16</b></td><td>−10, −9, −8, −7</td></tr></table>
<h2>Contoh terbimbing</h2>
${ex("2 – 4 – 2 – 4 – 6 – 4 – 6 – 8 – 6 – 8 – 10 – 8 – … ?", "Lihat per kelompok tiga: (2,4,2) (4,6,4) (6,8,6) (8,10,8) → pola \"naik 2, turun 2\" dan setiap blok mulai +2 dari blok sebelumnya. Blok berikut: (10,12,10). Suku selanjutnya adalah awal blok baru: <b>10</b>. Jebakan: peserta yang hanya melihat 3 suku pertama mengira pola \"2,4\" berulang.")}
${ex("9 – 5 – 1 – 2 – 10 – 6 – 2 – 3 – 11 – 7 – … ?", "Kelompok empat: (9,5,1,2) (10,6,2,3) (11,7,?,?). Setiap posisi naik +1 antar blok → 11, 7, <b>3</b>, 4. Jawaban: 3.")}
${ex("26 – 5 – 9 – 25 – 6 – 11 – 24 – 7 – … ?", "Tiga deret berselang: 26, 25, 24 (−1); 5, 6, 7 (+1); 9, 11, <b>13</b> (+2). Jawaban: 13.")}
${warn("Pola yang kamu temukan harus bisa <b>memprediksi suku berikutnya secara unik</b>. Jika dua pola sama-sama cocok dengan semua suku yang diberikan, pilih yang <b>lebih sederhana</b> — pembuat soal hampir selalu memakai pola paling sederhana yang konsisten.")}
${tip("Batas waktu umumnya 30–60 detik per soal. Jika 40 detik belum ketemu pola, <b>tandai dan lewati</b>. Soal berikutnya mungkin lebih mudah dan nilainya sama.")}
`
        },
        {
          id: "deret-huruf", title: "Deret Huruf", desc: "Pola alfabet: lompatan, selang-seling, dan kelompok.",
          quiz: { count: 10, time: 360 }, sim: { count: 6, time: 240 }, source: ["bank", "gen:deret-huruf"],
          materi: `
<p class="lead">Deret huruf adalah deret angka yang "disamarkan": A=1, B=2, …, Z=26. Peserta yang hafal posisi huruf akan jauh lebih cepat.</p>
<h2>Persiapan wajib</h2>
<p>Hafalkan <b>titik acuan</b> ini agar tidak perlu menghitung dari A setiap kali:</p>
<div class="row"><span class="badge badge-primary">A=1</span><span class="badge badge-primary">E=5</span><span class="badge badge-primary">J=10</span><span class="badge badge-primary">O=15</span><span class="badge badge-primary">T=20</span><span class="badge badge-primary">Z=26</span></div>
<p class="mt-2">Dari acuan itu, huruf lain dihitung ±1 atau ±2. Misal M = J+3 = 13; R = T−2 = 18.</p>
<h2>Pola yang sering muncul</h2>
<ul>
<li><b>Lompatan tetap</b>: A, C, E, G → +2. D, H, L, P → +4.</li>
<li><b>Lompatan membesar</b>: A, B, D, G, K → +1, +2, +3, +4.</li>
<li><b>Dua deret berselang</b>: A, Z, B, Y, C, X → maju dari depan, mundur dari belakang.</li>
<li><b>Huruf pengganggu tetap</b>: A, B, C, <u>I, J</u>, D, E, F, <u>I, J</u>, … → \"I J\" sekadar pemisah.</li>
<li><b>Pengulangan bertambah</b>: A, B, B, C, C, C, D, D, D, D → huruf ke-n diulang n kali.</li>
<li><b>Campur angka</b>: A1, C3, E5, G7 → huruf dan angka naik bersama.</li>
<li><b>Huruf berpasangan</b>: AZ, BY, CX, DW → pasangan dari ujung yang berlawanan.</li>
</ul>
<h2>Contoh terbimbing</h2>
${ex("a – m – n – b – o – p – c – … ?", "Dua deret: a, b, c (+1) diselingi dua huruf berurutan m-n, o-p, q-r. Setelah c datang <b>q</b>.")}
${ex("d – f – h – j – … ?", "Konversi: 4, 6, 8, 10 → +2 → 12 = <b>l</b>. Hitung dari acuan J=10: 10+2 = 12 → L.")}
${ex("a – b – c – c – d – e – f – f – f – g – h – i – i – i – i – … ?", "Pola: tiga huruf berurutan, lalu huruf terakhir diulang (pengulangan bertambah: c×2, f×3, i×4). Blok berikut: j, k, l lalu l diulang 5 kali. Suku setelah i-i-i-i adalah <b>j</b>.")}
${tip("Kalau deret berupa kombinasi huruf besar dan kecil (A, b, C, d), huruf besar/kecil biasanya hanya pengalih perhatian — konsentrasi pada posisi alfabetnya.")}
`
        },
        {
          id: "aritmatika", title: "Aritmatika & Tes Angka", desc: "Operasi cepat: persen, pecahan, desimal, akar, aljabar sederhana.",
          quiz: { count: 12, time: 480 }, sim: { count: 10, time: 420 }, source: ["bank"],
          materi: `
<p class="lead">Tes angka menilai <b>kecepatan dan ketepatan</b> berhitung tanpa kalkulator. Soalnya tidak sulit secara konsep, tetapi waktunya ketat (± 30–40 detik/soal). Yang membedakan peserta adalah <b>penguasaan jalan pintas</b>.</p>
<h2>Jalan pintas yang wajib dikuasai</h2>
<h3>1. Persen ↔ pecahan ↔ desimal</h3>
<table><tr><th>Pecahan</th><th>Desimal</th><th>Persen</th><th>Pecahan</th><th>Desimal</th><th>Persen</th></tr>
<tr><td>1/2</td><td>0,5</td><td>50%</td><td>1/8</td><td>0,125</td><td>12,5%</td></tr>
<tr><td>1/3</td><td>0,333</td><td>33,3%</td><td>3/8</td><td>0,375</td><td>37,5%</td></tr>
<tr><td>2/3</td><td>0,667</td><td>66,7%</td><td>5/8</td><td>0,625</td><td>62,5%</td></tr>
<tr><td>1/4</td><td>0,25</td><td>25%</td><td>7/8</td><td>0,875</td><td>87,5%</td></tr>
<tr><td>3/4</td><td>0,75</td><td>75%</td><td>1/16</td><td>0,0625</td><td>6,25%</td></tr>
<tr><td>1/5</td><td>0,2</td><td>20%</td><td>1/6</td><td>0,1667</td><td>16,7%</td></tr></table>
<h3>2. Persen cepat</h3>
<ul><li>x% dari y = y% dari x. <i>8% dari 50 = 50% dari 8 = 4</i>.</li>
<li>Pecah: 33% dari 163 ≈ 1/3 × 163 = 54,33.</li>
<li>\"a adalah berapa persen dari b\" = a/b × 100. <i>28 dari 70 = 28/70 = 0,4 = 40%</i>.</li>
<li>6,5 berapa % dari 6 → 6,5/6 = 1,0833 → <b>108,33%</b> (lebih dari 100% karena pembilangnya lebih besar).</li></ul>
<h3>3. Kuadrat & akar</h3>
<ul><li>Hafal kuadrat 1–30: 11²=121, 12²=144, 13²=169, 14²=196, 15²=225, 16²=256, 17²=289, 18²=324, 19²=361, 21²=441, 25²=625.</li>
<li>Angka berakhiran 5: 85² = (8×9) lalu tulis 25 → <b>7225</b>. 65² = (6×7)|25 = 4225.</li>
<li>√(a²+b²) → cek tripel Pythagoras: (3,4,5), (6,8,10), (5,12,13), (8,15,17).</li>
<li>√(0,0625) = 0,25 ; (0,25)² = 0,0625. Hitung angka tanpa koma dulu, baru letakkan koma: jumlah desimal dikalikan (2 desimal × 2 = 4 desimal).</li></ul>
<h3>4. Desimal & pembagian</h3>
<ul><li>4,036 : 0,04 → geser koma 2 digit pada keduanya: 403,6 : 4 = <b>100,9</b>.</li>
<li>Perkirakan dulu: 304,09 : 64,7 ≈ 300 : 65 ≈ 4,6 → pilih opsi yang dekat (4,70).</li>
<li>0,875 : 1/4 = 0,875 × 4 = 3,5.</li></ul>
<h3>5. Aljabar substitusi</h3>
<p>Jika p=2, q=3, r = p² + 2pq + q² = (p+q)² = 25 → pqr = 2×3×25 = <b>150</b>. Kenali bentuk (a+b)² dan (a−b)² untuk menghemat waktu.</p>
<h2>Contoh terbimbing</h2>
${ex("(55 + 30)² = …", "= 85². Trik akhiran 5: 8×9 = 72, tulis 25 → <b>7225</b>. Tanpa trik, butuh perkalian panjang 20 detik; dengan trik 3 detik.")}
${ex("√(2 − 0,56) + √(1 − 0,64) = …", "√1,44 + √0,36 = 1,2 + 0,6 = <b>1,8</b>. Kenali 144 dan 36 sebagai kuadrat sempurna.")}
${ex("15 = 37,5% dari …", "37,5% = 3/8. Maka 3/8 × N = 15 → N = 15 × 8/3 = <b>40</b>.")}
${warn("Kesalahan paling sering: <b>salah posisi koma</b> dan <b>salah baca tanda</b> (÷ dibaca ×, − dibaca +). Setelah dapat hasil, lakukan cek masuk akal 2 detik: \"4,036 dibagi angka kecil (0,04) pasti hasilnya jauh lebih besar dari 4\" → 100,9 masuk akal, 1,009 tidak.")}
`
        },
        {
          id: "cerita", title: "Soal Cerita & Numerical Reasoning", desc: "Menerjemahkan narasi dan tabel/grafik menjadi perhitungan.",
          quiz: { count: 10, time: 600 }, sim: { count: 8, time: 540 }, source: ["bank"],
          materi: `
<p class="lead">Soal cerita menguji kemampuan <b>memodelkan masalah</b>: kecepatan-jarak-waktu, debit, pekerjaan bersama, untung-rugi, perbandingan, umur, campuran, dan membaca tabel/grafik (<i>numerical reasoning</i> ala perusahaan multinasional).</p>
<h2>Cara menjawab</h2>
${step(1, "<b>Tulis yang diketahui dan ditanya</b> dalam simbol. Jangan menghitung sambil membaca.")}
${step(2, "<b>Samakan satuan</b> sebelum menghitung (liter ↔ mililiter, jam ↔ menit, km/jam ↔ m/detik).")}
${step(3, "Pilih <b>rumus/model</b>: jarak = kecepatan × waktu; volume = debit × waktu; untung = jual − modal; pekerjaan bersama: 1/t = 1/a + 1/b.")}
${step(4, "Hitung, lalu <b>cek masuk akal</b> dengan perkiraan kasar dan satuan jawaban.")}
<h2>Model-model standar</h2>
<table><tr><th>Tipe</th><th>Rumus / cara</th></tr>
<tr><td>Debit</td><td>waktu = volume ÷ debit. Kolam 1.200 L diisi 80% = 960 L dengan debit 0,6 L/dtk → 1.600 dtk = 26,7 menit.</td></tr>
<tr><td>Pekerjaan bersama</td><td>A selesai 6 hari, B 3 hari → per hari 1/6 + 1/3 = 1/2 → bersama 2 hari.</td></tr>
<tr><td>Kejar-mengejar</td><td>waktu = selisih jarak awal ÷ selisih kecepatan.</td></tr>
<tr><td>Berpapasan</td><td>waktu = jarak ÷ (v₁ + v₂).</td></tr>
<tr><td>Persentase berantai</td><td>Naik 20% lalu turun 20% ≠ kembali: 100 → 120 → 96 (turun 4%).</td></tr>
<tr><td>Untung/rugi</td><td>% untung = untung ÷ <b>modal</b> × 100 (bukan ÷ harga jual).</td></tr>
<tr><td>Rata-rata gabungan</td><td>(n₁·x̄₁ + n₂·x̄₂) ÷ (n₁+n₂); bukan rata-rata dari dua rata-rata.</td></tr>
<tr><td>Perbandingan</td><td>A:B = 2:3 dan B:C = 4:5 → samakan B: A:B:C = 8:12:15.</td></tr>
<tr><td>Umur</td><td>Selisih umur <b>selalu tetap</b>; pakai itu sebagai persamaan kedua.</td></tr></table>
<h2>Data sufficiency (kecukupan data)</h2>
<p>Format khusus di tes multinasional: \"Berapa waktu per pelanggan?\" (1) staf menghabiskan rata-rata 3,4 jam/hari menelepon; (2) staf melayani 25–45 pelanggan/hari. Tanyakan: <b>apakah tiap pernyataan sendiri cukup? apakah gabungan cukup?</b> Di sini (1) saja tidak cukup (tidak tahu jumlah pelanggan), (2) saja tidak cukup, dan gabungan hanya memberi <b>rentang</b> 4,5–8,2 menit — bukan nilai pasti → jawaban \"gabungan pun tidak cukup\". Pelajari apakah soal meminta nilai tunggal atau rentang.</p>
<h2>Membaca tabel</h2>
${ex("Tabel resep: Kue A memakai tepung 400 g, gula 10 g, mentega 30 g, krim 100 g; harga jual $5,75. Harga bahan per kg: tepung $3, gula $5, mentega $20, krim $15, telur $40. Berapa gram telur harus ditambahkan ke Kue A agar <b>tidak lagi untung</b>?", "Biaya A = 0,4×3 + 0,01×5 + 0,03×20 + 0,1×15 = 1,20+0,05+0,60+1,50 = $3,35. Laba = 5,75 − 3,35 = $2,40. Telur $40/kg = $0,04/g → 2,40 ÷ 0,04 = <b>60 g</b>. Kuncinya: konversi per kg → per gram, dan membaca hanya baris yang relevan.")}
${tip("Pada tes online, kalkulator di layar biasanya diizinkan tetapi <b>tabelnya banyak kolom pengecoh</b>. Latih membaca pertanyaan dulu, lalu ambil hanya 2–3 angka yang dibutuhkan.")}
`
        },
        {
          id: "kuantitatif", title: "Perbandingan Kuantitatif (Logika Number)", desc: "Menentukan hubungan dua nilai: x > y, x < y, x = y, atau tidak dapat ditentukan.",
          quiz: { count: 10, time: 420 }, sim: { count: 8, time: 360 }, source: ["bank"],
          materi: `
<p class="lead">Kamu diberi dua besaran, <b>x</b> dan <b>y</b>, lalu memilih: x &gt; y, x &lt; y, x = y, atau <b>hubungan tidak dapat ditentukan</b>. Jenis ini populer di tes BUMN, bank, dan TIU. Tidak perlu menghitung sampai tuntas — cukup tahu <b>mana yang lebih besar</b>.</p>
<h2>Strategi</h2>
${step(1, "<b>Sederhanakan</b> kedua sisi ke bentuk yang sama (semua jadi desimal, atau semua jadi pecahan).")}
${step(2, "Jika ada <b>variabel</b>, uji dengan beberapa nilai: 0, 1, bilangan negatif, dan pecahan (0,5). Jika hasil hubungannya berubah-ubah → <b>tidak dapat ditentukan</b>.")}
${step(3, "Jika kedua bentuk <b>identik setelah disederhanakan</b> → x = y. Misal berat p kotak @ q kg vs q kotak @ p kg → sama-sama pq.")}
${step(4, "Hati-hati <b>kuadrat dan tanda negatif</b>: −(3)⁶ negatif, sedangkan (−3)⁶ positif.")}
<h2>Contoh terbimbing</h2>
${ex("x = 1/16 dan y = 16%", "1/16 = 0,0625; 16% = 0,16. Maka <b>x &lt; y</b>. Jebakan: angka 16 muncul di keduanya, tapi nilainya berbeda jauh.")}
${ex("2ˣ = 64 dan 3ʸ = 81", "2⁶ = 64 → x = 6. 3⁴ = 81 → y = 4. <b>x &gt; y</b>.")}
${ex("p sembarang bilangan; x = −3p² + 5 dan y = −2p² + 7", "x − y = −p² − 2 &lt; 0 untuk semua p (karena p² ≥ 0). Jadi <b>x &lt; y selalu</b>. Jangan jawab \"tidak dapat ditentukan\" hanya karena ada variabel — ujilah dulu.")}
${ex("x = 3p² + 4 dan y = 2p + 10", "Uji p=0: x=4, y=10 → x&lt;y. Uji p=3: x=31, y=16 → x&gt;y. Hubungan berubah → <b>tidak dapat ditentukan</b>.")}
${warn("\"Tidak dapat ditentukan\" bukan jawaban untuk \"saya tidak tahu\". Pilih hanya jika kamu bisa menunjukkan <b>dua nilai variabel</b> yang memberi hubungan berbeda.")}
`
        },
      ],
    },

    /* ===================================================================== LOGIKA */
    {
      id: "logika", title: "Penalaran Logis", short: "Logika", icon: "puzzle", kind: "kognitif",
      color: "linear-gradient(135deg,#7c3aed,#db2777)", accent: "#7c3aed",
      desc: "Silogisme, penalaran analitis (puzzle urutan/posisi), dan logika pernyataan.",
      sections: [
        {
          id: "silogisme", title: "Silogisme & Penarikan Kesimpulan", desc: "Menarik kesimpulan yang pasti benar dari dua premis.",
          quiz: { count: 12, time: 540 }, sim: { count: 10, time: 480 }, source: ["bank"],
          materi: `
<p class="lead">Silogisme memberi dua pernyataan (premis) dan meminta <b>kesimpulan yang pasti benar</b>. Kesalahan terbesar peserta: menambahkan pengetahuan dunia nyata atau menganggap \"mungkin benar\" sebagai \"pasti benar\".</p>
<h2>Empat kata kunci</h2>
<table><tr><th>Kata</th><th>Arti logis</th><th>Catatan</th></tr>
<tr><td><b>Semua A adalah B</b></td><td>setiap A pasti B</td><td>tidak berarti semua B adalah A!</td></tr>
<tr><td><b>Sebagian / sementara / ada A yang B</b></td><td>minimal satu A adalah B</td><td>belum tentu ada A yang bukan B</td></tr>
<tr><td><b>Tidak ada A yang B</b></td><td>A dan B terpisah total</td><td>bisa dibalik: tidak ada B yang A</td></tr>
<tr><td><b>Jika P maka Q</b></td><td>P cukup untuk Q</td><td>sah: tidak Q → tidak P (kontraposisi); <u>tidak sah</u>: Q → P, atau tidak P → tidak Q</td></tr></table>
<h2>Rumus yang sah</h2>
<ul>
<li><b>Semua A = B, semua B = C</b> → semua A = C.</li>
<li><b>Semua A = B, sebagian C = A</b> → sebagian C = B.</li>
<li><b>Semua A = B, tidak ada B yang C</b> → tidak ada A yang C.</li>
<li><b>Sebagian A = B, semua B = C</b> → sebagian A = C.</li>
<li><b>Semua A = B, X bukan B</b> → X bukan A (kontraposisi).</li>
<li><b>Semua A = B, sebagian A = C</b> → sebagian B = C (ada anggota yang B sekaligus C).</li>
</ul>
<h2>Teknik diagram lingkaran</h2>
<p>Gambar \"semua A adalah B\" sebagai lingkaran A <b>di dalam</b> B. \"Sebagian A adalah B\" sebagai dua lingkaran <b>beririsan</b>. \"Tidak ada A yang B\" sebagai lingkaran <b>terpisah</b>. Kesimpulan yang pasti benar adalah yang berlaku <b>di semua kemungkinan gambar</b>.</p>
<h2>Contoh terbimbing</h2>
${ex("Semua pekerja harus mengenakan topi pengaman. Sebagian pekerja mengenakan sarung tangan.", "Lingkaran \"pekerja\" di dalam \"bertopi\". Sebagian pekerja juga di dalam \"bersarung tangan\". Maka pasti ada pekerja yang bertopi <b>dan</b> bersarung tangan → <b>\"Sebagian pekerja mengenakan topi pengaman dan sarung tangan.\"</b> Kesimpulan \"sebagian pekerja tidak bertopi\" salah karena bertentangan dengan premis 1.")}
${ex("Semua seniman kreatif. Sebagian ilmuwan tidak kreatif.", "Ilmuwan yang tidak kreatif pasti <b>bukan seniman</b> (karena semua seniman kreatif). Maka: <b>\"Sebagian ilmuwan bukan seniman.\"</b> Kita tidak bisa menyimpulkan \"tidak ada seniman yang ilmuwan\" karena sebagian ilmuwan lain mungkin kreatif dan seniman.")}
${ex("Semua jenis ikan bernapas dengan insang. Paus bernapas dengan paru-paru.", "Paus tidak punya sifat wajib ikan → <b>paus bukan jenis ikan</b> (kontraposisi). Jangan terpengaruh nama \"ikan paus\" dalam bahasa sehari-hari.")}
${ex("Semua manusia tidak bertanduk. Semua kucing tidak memamah biak.", "Kedua premis tidak memiliki <b>istilah penghubung</b> (middle term). Tidak ada kesimpulan yang bisa ditarik → <b>\"Tidak dapat ditarik kesimpulan.\"</b>")}
<h2>Menilai penalaran (benar / salah pada premis / salah pada kesimpulan)</h2>
<p>Beberapa soal meminta menilai apakah sebuah penalaran tiga kalimat <b>sah</b>. Periksa: (1) apakah premis mayor masuk akal sebagai aturan umum, (2) apakah premis minor benar-benar masuk dalam cakupan premis mayor, (3) apakah kesimpulan mengikuti secara logis. Contoh: \"Di perusahaan A tidak ada cuti tahunan. Manis karyawan perusahaan A. Maka Manis boleh cuti tahunan.\" → premis benar, <b>kesimpulan salah</b>.</p>
${warn("<b>Jangan pernah membalik \"semua\"</b>. \"Semua dokter anggota asosiasi\" tidak berarti \"semua anggota asosiasi adalah dokter\". Ini jebakan nomor satu di seluruh soal silogisme.")}
`
        },
        {
          id: "analitis", title: "Penalaran Analitis (Puzzle)", desc: "Urutan, posisi, jadwal, dan pengelompokan dari sekumpulan syarat.",
          quiz: { count: 10, time: 720 }, sim: { count: 8, time: 600 }, source: ["bank"],
          materi: `
<p class="lead">Kamu diberi beberapa syarat tentang orang/benda (urutan duduk, peringkat, jadwal, pasangan), lalu menjawab pertanyaan yang hanya bisa dijawab dengan <b>menyusun semua syarat sekaligus</b>. Ini mengukur kemampuan analisis sistematis, bukan hafalan.</p>
<h2>Metode tabel/garis</h2>
${step(1, "Baca semua syarat sekali, lalu <b>gambar kerangka</b>: garis posisi (1–6) untuk soal urutan, tabel nama × atribut untuk soal pengelompokan, lingkaran untuk meja bundar.")}
${step(2, "Masukkan dulu <b>syarat yang pasti</b> (\"A di posisi ke-3\", \"B bukan guru\"). Tandai dengan ✔/✘.")}
${step(3, "Lalu masukkan <b>syarat relatif</b> (\"C tepat di kanan D\", \"E lebih tinggi dari F\"). Gabungkan menjadi blok: [D C].")}
${step(4, "Jika ada beberapa kemungkinan, <b>cabangkan</b> (kasus 1, kasus 2). Pertanyaan \"pasti benar\" harus berlaku di <b>semua</b> cabang; \"mungkin benar\" cukup di satu cabang.")}
${step(5, "Gunakan <b>eliminasi</b>: coret opsi yang melanggar satu syarat saja. Seringkali tersisa satu tanpa perlu menyusun lengkap.")}
<h2>Kosakata yang menjebak</h2>
<ul><li>\"<b>Tepat</b> di sebelah\" = bersebelahan langsung; \"di sebelah kanan\" = bisa jauh.</li>
<li>\"<b>Di antara</b> A dan B\" belum tentu tepat di tengah.</li>
<li>\"<b>Tidak lebih</b> dari 3\" = ≤ 3 (termasuk 3).</li>
<li>\"Hanya satu dari A atau B\" = tepat satu, tidak keduanya.</li></ul>
<h2>Contoh terbimbing</h2>
${ex("Firman mengenal 5 wanita: Ade, Bea, Cindi, Deby, Eva. (1) 3 orang &lt;30 th, 2 orang &gt;30 th. (2) 2 guru, 3 sekretaris. (3) Ade & Cindi segolongan umur. (4) Deby & Eva beda golongan umur. (5) Bea & Eva pekerjaannya sama. (6) Cindi & Deby pekerjaannya beda. (7) Firman memilih guru yang berumur &gt;30. Siapa?", "Umur: Ade=Cindi (segolongan). Deby≠Eva. Karena hanya 2 orang &gt;30, dan Ade+Cindi segolongan: jika Ade&Cindi &gt;30 maka Deby/Eva salah satunya &gt;30 → total 3 &gt;30, melanggar. Jadi Ade&Cindi &lt;30; satu dari Deby/Eva &gt;30; Bea &gt;30.<br>Pekerjaan: Bea=Eva. Cindi≠Deby. Hanya 2 guru. Jika Bea&Eva guru → Ade, Cindi, Deby sekretaris → tapi Cindi≠Deby melanggar. Jadi Bea&Eva sekretaris; guru = dua dari {Ade,Cindi,Deby} dengan Cindi≠Deby → guru = Ade + (Cindi atau Deby). Guru &gt;30 hanya mungkin <b>Deby</b> (Ade &lt;30, Cindi &lt;30). Maka Deby guru dan &gt;30 → Eva &lt;30. <b>Jawaban: Deby.</b>")}
${ex("Ayub, Bakri, Ciputra diinterogasi. Salah satunya pembunuh dan pembunuhnya pengacara. Ayub: (1) saya bukan pengacara, (2) saya tak terlibat. Bakri: (3) saya pengacara, (4) saya tak terlibat. Ciputra: (5) saya bukan pengacara, (6) seorang pengacara yang membunuh. Hanya 2 pernyataan benar; hanya 1 dari mereka bukan pengacara.", "(6) benar (diberitahu soal). Berarti hanya 1 pernyataan lain yang benar. Hanya satu orang bukan pengacara → di antara (1),(3),(5) tepat satu klaim \"bukan pengacara\" benar... Uji: jika Ciputra pembunuh, (5) salah dan (6) benar; maka (1)-(4) semua harus salah → (2) salah berarti Ayub terlibat → kontradiksi (hanya satu pembunuh). Jika Bakri pembunuh, (4) salah; sisa benar hanya satu dari (1),(2),(3),(5); (2) benar (Ayub tak terlibat) → (1),(3),(5) salah → Ayub pengacara, Bakri bukan pengacara → tapi pembunuh harus pengacara, kontradiksi. Jadi <b>Ayub pembunuhnya</b>: (2) salah, (4) benar, (1) salah (Ayub pengacara ✔), (3) dan (5) salah → Bakri bukan pengacara, Ciputra pengacara → tepat satu bukan pengacara ✔.")}
${tip("Untuk soal dengan 3–5 pertanyaan dari satu cerita, investasikan 1–2 menit menyusun diagram lengkap di awal. Pertanyaan selanjutnya akan terjawab dalam hitungan detik.")}
`
        },
        {
          id: "pernyataan", title: "Logika Pernyataan (Implikasi & Negasi)", desc: "Kontraposisi, negasi 'semua/sebagian', dan ekuivalensi.",
          quiz: { count: 10, time: 420 }, sim: { count: 8, time: 360 }, source: ["bank"],
          materi: `
<p class="lead">Bagian ini menguji aturan formal logika: <b>implikasi</b> (jika–maka), <b>negasi</b>, dan <b>ekuivalensi</b>. Soalnya pendek tetapi sangat menjebak karena bertentangan dengan intuisi bahasa sehari-hari.</p>
<h2>Implikasi: p → q</h2>
<table><tr><th>Bentuk</th><th>Kalimat</th><th>Sah?</th></tr>
<tr><td>Asli</td><td>Jika hujan, jalan basah.</td><td>—</td></tr>
<tr><td><b>Kontraposisi</b> (~q → ~p)</td><td>Jika jalan tidak basah, maka tidak hujan.</td><td><b>Sah</b> (ekuivalen)</td></tr>
<tr><td>Konvers (q → p)</td><td>Jika jalan basah, maka hujan.</td><td>Tidak sah (bisa disiram)</td></tr>
<tr><td>Invers (~p → ~q)</td><td>Jika tidak hujan, jalan tidak basah.</td><td>Tidak sah</td></tr></table>
<h2>Negasi (ingkaran)</h2>
<ul>
<li>Negasi \"<b>semua</b> A adalah B\" = \"<b>sebagian/ada</b> A yang <b>bukan</b> B\" (bukan \"semua A bukan B\").</li>
<li>Negasi \"<b>sebagian</b> A adalah B\" = \"<b>semua</b> A <b>bukan</b> B\" / \"tidak ada A yang B\".</li>
<li>Negasi \"p <b>dan</b> q\" = \"~p <b>atau</b> ~q\".</li>
<li>Negasi \"p <b>atau</b> q\" = \"~p <b>dan</b> ~q\".</li>
<li>Negasi \"jika p maka q\" = \"p <b>dan</b> ~q\" (p terjadi tapi q tidak).</li>
</ul>
<h2>Penarikan kesimpulan</h2>
<ul>
<li><b>Modus ponens</b>: p → q; p. ∴ q.</li>
<li><b>Modus tollens</b>: p → q; ~q. ∴ ~p.</li>
<li><b>Silogisme hipotetis</b>: p → q; q → r. ∴ p → r.</li>
<li><b>Tidak sah</b>: p → q; q. ∴ p (afirmasi konsekuen). p → q; ~p. ∴ ~q (negasi anteseden).</li>
</ul>
<h2>Contoh terbimbing</h2>
${ex("Jika seorang karyawan rajin, ia mendapat bonus. Andi tidak mendapat bonus. Kesimpulan?", "Modus tollens: tidak bonus → tidak rajin. <b>Andi tidak rajin.</b>")}
${ex("Jika listrik padam, mesin berhenti. Mesin berhenti. Kesimpulan?", "Afirmasi konsekuen — <b>tidak sah</b>. Mesin bisa berhenti karena sebab lain. Jawaban: \"tidak dapat disimpulkan bahwa listrik padam\".")}
${ex("Negasi dari \"Semua peserta lulus dan mendapat sertifikat\" adalah …", "Negasi (p dan q) = ~p atau ~q → <b>\"Ada peserta yang tidak lulus atau tidak mendapat sertifikat.\"</b>")}
${warn("\"Beberapa siswa tidak hadir\" <b>bukan</b> negasi dari \"beberapa siswa hadir\" — keduanya bisa benar bersamaan. Negasi yang benar: \"semua siswa tidak hadir\".")}
`
        },
      ],
    },

    /* ===================================================================== FIGURAL */
    {
      id: "figural", title: "Penalaran Figural & Spasial", short: "Figural", icon: "shapes", kind: "kognitif",
      color: "linear-gradient(135deg,#059669,#0891b2)", accent: "#059669",
      desc: "Deret gambar, matriks, pencerminan, rotasi, dan klasifikasi gambar. Soal dibangkitkan acak tanpa batas.",
      sections: [
        {
          id: "deret-gambar", title: "Deret Gambar", desc: "Melanjutkan urutan gambar yang berubah teratur.",
          quiz: { count: 10, time: 480 }, sim: { count: 8, time: 400 }, source: ["gen:fig-seq"],
          materi: `
<p class="lead">Dalam deret gambar, <b>beberapa atribut berubah bersamaan</b> dengan aturan masing-masing. Tugasmu memisahkan atribut-atribut itu lalu memprediksi gambar berikutnya. Tes ini muncul di psikotes Shopee, Unilever, BUMN, CFIT, hingga IST.</p>
<h2>Atribut yang harus diperiksa (urut)</h2>
${step(1, "<b>Bentuk</b>: tetap, bergantian (persegi ↔ belah ketupat), atau bersiklus (○ → △ → □ → ○).")}
${step(2, "<b>Jumlah</b>: elemen bertambah/berkurang tetap (1, 2, 3, …) atau bergantian.")}
${step(3, "<b>Arsiran/warna</b>: kosong ↔ hitam, atau siklus kosong → arsir → hitam.")}
${step(4, "<b>Rotasi</b>: panah/elemen berputar tetap (misal 45° atau 90° searah jarum jam). Hitung sudut per langkah.")}
${step(5, "<b>Posisi</b>: elemen kecil berpindah mengelilingi sudut/sisi (kanan atas → kanan bawah → kiri bawah …).")}
${step(6, "<b>Ukuran</b>: membesar/mengecil, atau bertukar besar-kecil.")}
<h2>Contoh terbimbing</h2>
${ex("Lima gambar: garis dengan ujung berbentuk persegi/belah ketupat, berwarna kosong/hitam, dengan panah di ujung lain yang arahnya berputar.", "Pisahkan tiga pola: (1) bentuk: persegi → belah ketupat → persegi → … jadi ke-6 = belah ketupat; (2) warna: kosong → hitam → kosong → … jadi ke-6 = hitam; (3) arah panah berputar tiap langkah: atas, kiri-bawah, kanan, kiri-atas, bawah → berikutnya kanan-atas. Pilihan yang memenuhi <b>ketiganya</b> sekaligus adalah jawaban. Peserta yang hanya mengecek satu atribut akan terjebak pengecoh yang benar 2 dari 3.")}
<h2>Trik eliminasi</h2>
<ul><li>Cek satu atribut saja dulu pada <b>semua pilihan</b>, coret yang salah. Lalu atribut kedua. Biasanya tersisa satu.</li>
<li>Pengecoh standar: (a) benar bentuk tapi salah warna, (b) benar semua tapi rotasi kurang satu langkah, (c) cermin dari jawaban yang benar.</li>
<li>Jika rotasi, tentukan <b>arah</b> (searah/berlawanan jarum jam) dan <b>besarnya</b> dari dua langkah pertama, lalu verifikasi di langkah ketiga.</li></ul>
${tip("Soal di platform ini dibangkitkan acak dengan 2–4 atribut berubah sekaligus pada tingkat sulit. Setelah menjawab, baca penjelasan yang merinci setiap atribut: ini melatih kebiasaan memeriksa semua atribut.")}
`
        },
        {
          id: "matriks", title: "Matriks Gambar (3×3)", desc: "Melengkapi sel kosong pada matriks seperti Raven/CFIT.",
          quiz: { count: 8, time: 480 }, sim: { count: 6, time: 360 }, source: ["gen:fig-matrix"],
          materi: `
<p class="lead">Matriks 3×3 (gaya Raven Progressive Matrices, CFIT, dan tes <i>inductive reasoning</i>) menuntut kamu menemukan aturan <b>per baris dan/atau per kolom</b>, lalu mengisi sel yang hilang.</p>
<h2>Tiga aturan dasar</h2>
<ul>
<li><b>Konstan dalam baris</b>: atribut sama di satu baris, berubah antar baris (misal baris 1 semua lingkaran, baris 2 semua segitiga).</li>
<li><b>Progresi</b>: atribut bertambah dari kiri ke kanan (1 titik, 2 titik, 3 titik) atau berotasi.</li>
<li><b>Distribusi tiga nilai</b> (<i>Latin square</i>): tiap baris dan kolom memuat tiap nilai tepat satu kali — seperti sudoku: jika baris 3 sudah ada ○ dan △, yang hilang pasti □.</li>
</ul>
<h2>Cara menjawab</h2>
${step(1, "Lihat <b>baris 1 dan 2</b> dulu: atribut apa yang tetap? apa yang berubah? bagaimana urutannya?")}
${step(2, "Cek apakah aturan yang sama berlaku <b>per kolom</b>. Pada soal sulit, baris mengatur satu atribut, kolom mengatur atribut lain.")}
${step(3, "Untuk sel kosong, tentukan nilai tiap atribut satu per satu: bentuk dari aturan baris, jumlah dari aturan kolom, arsiran dari distribusi.")}
${step(4, "Cocokkan dengan pilihan. Pengecoh biasanya benar 1–2 atribut saja.")}
<h2>Contoh terbimbing</h2>
${ex("Baris 1: ○ kosong, △ kosong, □ kosong. Baris 2: △ hitam, □ hitam, ○ hitam. Baris 3: □ arsir, ○ arsir, ?", "Bentuk: tiap baris memuat ○, △, □ masing-masing sekali → yang hilang <b>△</b>. Arsiran: konstan per baris → baris 3 <b>arsir</b>. Jawaban: △ arsir.")}
${tip("Pada soal dengan <b>operasi</b> (kolom 3 = kolom 1 + kolom 2, atau kolom 1 − kolom 2), elemen-elemen yang muncul di kedua kolom pertama \"saling meniadakan\" (XOR) atau digabung. Cek dengan baris pertama yang lengkap.")}
`
        },
        {
          id: "pencerminan", title: "Pencerminan & Bayangan", desc: "Menentukan bayangan cermin suatu gambar (dan membedakannya dari rotasi).",
          quiz: { count: 10, time: 360 }, sim: { count: 8, time: 300 }, source: ["gen:fig-mirror"],
          materi: `
<p class="lead">Kamu diminta memilih <b>bayangan cermin</b> dari sebuah gambar terhadap garis vertikal (cermin di samping) atau horizontal (bayangan air). Pengecohnya adalah gambar yang <b>dirotasi</b>, yang sekilas mirip bayangan.</p>
<h2>Aturan pencerminan</h2>
<table><tr><th>Cermin</th><th>Yang berubah</th><th>Yang tetap</th></tr>
<tr><td>Vertikal (kiri–kanan)</td><td>kiri ↔ kanan; panah ke kanan jadi ke kiri</td><td>atas–bawah tetap</td></tr>
<tr><td>Horizontal (bayangan air)</td><td>atas ↔ bawah; elemen di atas jadi di bawah</td><td>kiri–kanan tetap</td></tr></table>
<p><b>Rotasi 180°</b> = cermin vertikal + cermin horizontal sekaligus. Itulah mengapa rotasi 180° adalah pengecoh favorit: ia mengubah atas-bawah <u>dan</u> kiri-kanan.</p>
<h2>Cara menjawab cepat</h2>
${step(1, "Pilih <b>satu elemen penanda</b> yang asimetris (ujung panah, elemen kecil di sudut, huruf F/P/L).")}
${step(2, "Tentukan posisinya: cermin vertikal → tetap di baris yang sama, pindah ke sisi berlawanan. Bayangan air → tetap di kolom yang sama, pindah atas/bawah.")}
${step(3, "Coret pilihan yang penandanya berada di posisi yang hanya mungkin lewat rotasi.")}
${step(4, "Cek elemen kedua untuk konfirmasi (khususnya arah lekukan/huruf: huruf pada bayangan cermin menjadi <b>terbalik</b>, bukan berputar).")}
<h2>Contoh terbimbing</h2>
${ex("Gambar: segitiga di kiri atas, panah menghadap kanan di tengah, titik hitam di kanan bawah. Cermin vertikal?", "Kiri-kanan tertukar, atas-bawah tetap: segitiga pindah ke <b>kanan atas</b>, panah menghadap <b>kiri</b>, titik ke <b>kiri bawah</b>. Pilihan dengan segitiga di kanan <u>bawah</u> adalah rotasi 180° (pengecoh).")}
${tip("Latih 'membaca' gambar dalam koordinat: (kiri/kanan, atas/bawah). Cermin vertikal membalik koordinat pertama saja; bayangan air membalik koordinat kedua saja; rotasi 180° membalik keduanya.")}
`
        },
        {
          id: "klasifikasi", title: "Klasifikasi Gambar (Yang Berbeda)", desc: "Menemukan satu gambar yang tidak mengikuti aturan kelompok.",
          quiz: { count: 10, time: 360 }, sim: { count: 8, time: 300 }, source: ["gen:fig-odd"],
          materi: `
<p class="lead">Lima gambar diberikan; empat mengikuti suatu aturan, satu tidak. Tugasmu menemukan yang \"berbeda sendiri\". Tes ini melatih pengamatan terhadap <b>sifat tersembunyi</b>: jumlah sisi, simetri, arah rotasi, jumlah elemen, dan hubungan antar elemen.</p>
<h2>Daftar periksa</h2>
<ul>
<li><b>Jumlah</b>: banyaknya elemen, sisi, atau titik. Empat gambar punya 3 elemen, satu punya 4.</li>
<li><b>Arsiran</b>: pola terisi/kosong; satu gambar arsirannya terbalik.</li>
<li><b>Hubungan posisi</b>: elemen kecil selalu di dalam elemen besar, kecuali satu.</li>
<li><b>Rotasi vs cermin</b>: empat gambar adalah rotasi dari bentuk yang sama; yang kelima adalah <b>cerminannya</b> (tidak bisa didapat dengan memutar).</li>
<li><b>Bentuk</b>: semua bersudut (poligon) kecuali satu yang melengkung; semua sisi genap kecuali satu.</li>
</ul>
<h2>Cara menjawab</h2>
${step(1, "Cari dulu kesamaan yang <b>paling mencolok</b> pada 4 gambar. Jangan mulai dari mencari perbedaan — otak lebih cepat mengenali pola mayoritas.")}
${step(2, "Jika semua tampak serupa, uji \"rotasi vs cermin\": bayangkan memutar gambar 1 menjadi gambar 2, 3, 4. Yang tidak bisa dicapai dengan rotasi adalah jawabannya.")}
${step(3, "Hitung: elemen, sisi, titik. Soal sulit sering hanya berbeda pada <b>jumlah</b>.")}
${ex("Lima panel masing-masing berisi 1 bentuk besar dan 1 bentuk kecil. Pada 4 panel bentuk kecil berwarna hitam dan besar kosong, pada 1 panel sebaliknya.", "Aturan: \"besar kosong, kecil hitam\". Yang melanggar adalah panel dengan besar hitam dan kecil kosong. Atribut bentuk (lingkaran/segitiga) di sini hanya pengecoh.")}
${warn("Pada tes nyata biasanya hanya <b>satu</b> aturan yang dilanggar. Jika kamu menemukan dua gambar yang \"berbeda\" dengan alasan berbeda, berarti salah satu alasanmu bukan aturan kelompok yang sebenarnya.")}
`
        },
        {
          id: "rotasi", title: "Rotasi & Identifikasi Bentuk Sama", desc: "Menentukan gambar mana yang identik dengan gambar soal setelah diputar.",
          quiz: { count: 10, time: 360 }, sim: { count: 8, time: 300 }, source: ["gen:fig-rot"],
          materi: `
<p class="lead">Diberikan satu gambar acuan; pilih gambar yang <b>sama persis setelah diputar</b> (bukan dicerminkan). Tes ini mengukur kemampuan rotasi mental — penting di posisi teknik, desain, logistik, dan operasional.</p>
<h2>Teknik rotasi mental</h2>
${step(1, "Pilih <b>dua elemen penanda</b> dan ingat hubungan relatifnya (misal: \"panah menunjuk ke arah titik hitam, dan segitiga ada di sebelah kanan panah jika dilihat dari arah panah\").")}
${step(2, "Pada tiap pilihan, orientasikan dirimu mengikuti panah lalu cek: apakah segitiga masih di kanan? Jika pindah ke kiri → itu cermin → salah.")}
${step(3, "Gunakan <b>arah putar jarum jam</b> sebagai acuan: urutan elemen searah jarum jam tidak berubah oleh rotasi, tetapi <b>terbalik</b> oleh pencerminan.")}
${ex("Acuan: urutan searah jarum jam = bintang → panah → titik. Pilihan A: bintang → titik → panah. Pilihan B: panah → titik → bintang.", "Pilihan B mempertahankan urutan siklik (bintang→panah→titik→bintang…), hanya titik awalnya berbeda → <b>rotasi, benar</b>. Pilihan A membalik urutan → cerminan → salah.")}
${tip("Urutan siklik searah jarum jam adalah 'sidik jari' sebuah gambar. Hafalkan trik ini — ia menyelesaikan hampir semua soal rotasi tanpa perlu membayangkan putaran.")}
`
        },
      ],
    },

    /* ===================================================================== KETELITIAN */
    {
      id: "ketelitian", title: "Tes Ketelitian", short: "Ketelitian", icon: "search", kind: "kecepatan",
      color: "linear-gradient(135deg,#d97706,#dc2626)", accent: "#d97706",
      desc: "Membandingkan pasangan teks/angka/simbol dan menghitung simbol dalam waktu singkat.",
      sections: [
        {
          id: "bandingkan", title: "Sama atau Tidak Sama", desc: "Membandingkan dua deretan karakter.",
          quiz: { count: 20, time: 240 }, sim: { count: 20, time: 200 }, source: ["gen:ketelitian"],
          materi: `
<p class="lead">Kamu membandingkan dua deretan (nama, angka, kode, simbol) dan menjawab <b>S</b> (sama) atau <b>T</b> (tidak sama). Dipakai untuk posisi administrasi, keuangan, data entry, QC, dan perbankan. Waktunya sangat ketat: ± 10–20 detik per soal.</p>
<h2>Teknik membaca</h2>
${step(1, "<b>Pecah menjadi blok 3–4 karakter</b> dan bandingkan blok demi blok, bukan karakter demi karakter: 5677|7000|1 vs 5677|7000|01 → beda di blok terakhir.")}
${step(2, "<b>Berhenti saat menemukan satu perbedaan.</b> Satu karakter beda = T. Tidak perlu membaca sisanya.")}
${step(3, "Untuk pasangan yang tampak sama, lakukan <b>pemeriksaan kedua</b> hanya pada titik rawan: huruf kapital/kecil di awal, tanda baca, spasi ganda, akhir deret.")}
${step(4, "Baca <b>kata secara fonetik-visual</b> untuk nama: Suhendarwijayakusumo vs Suhendarwijayakusuma → beda di huruf terakhir, tempat orang paling sering lengah.")}
<h2>Titik rawan yang disengaja pembuat soal</h2>
<table><tr><th>Jenis beda</th><th>Contoh</th></tr>
<tr><td>Huruf mirip</td><td>l / I / 1, O / 0, rn / m, vv / w, S / 5, B / 8, Z / 2</td></tr>
<tr><td>Urutan tertukar</td><td>7653458787 vs 7653548787</td></tr>
<tr><td>Huruf ganda</td><td>Oktober vs Oktoberr; Robien vs Robien</td></tr>
<tr><td>Kapitalisasi</td><td>owiuerjfsdf vs Owiuerjfsdf</td></tr>
<tr><td>Spasi & tanda baca</td><td>Mudah& murah vs Mudah &murah ; RI.D.R. vs RI.DR.</td></tr>
<tr><td>Karakter hilang di akhir</td><td>65765432 vs 6576532</td></tr>
<tr><td>Simbol berulang</td><td>^-^--^-^--^^--^^^-^ vs ^-^--^-^--^^--^^-^</td></tr></table>
<h2>Manajemen waktu</h2>
<p>Semua soal bernilai sama. Jika 75 soal / 45 menit, batas per soal adalah 36 detik — jauh lebih longgar dari yang kamu butuhkan jika teknik blok dipakai. Target: <b>&lt;15 detik per soal</b> agar tersisa waktu memeriksa yang ragu.</p>
${warn("Jangan menjawab \"Sama\" hanya karena <b>awal</b> deret sama. Mayoritas perbedaan diletakkan di <b>tengah atau akhir</b> deret.")}
`
        },
        {
          id: "hitung", title: "Menghitung Simbol", desc: "Menghitung kemunculan karakter tertentu dalam deretan panjang.",
          quiz: { count: 10, time: 240 }, sim: { count: 8, time: 180 }, source: ["gen:ketelitian-count"],
          materi: `
<p class="lead">Variasi tes ketelitian: hitung berapa kali huruf/angka/simbol tertentu muncul dalam satu baris panjang, atau hitung jumlah simbol yang memenuhi syarat (misal \"angka ganjil di dalam lingkaran\").</p>
<h2>Teknik</h2>
${step(1, "<b>Pindai dengan satu target</b> saja. Jika diminta menghitung 'a' dan 'e', lakukan dua kali pindai, jangan sekaligus.")}
${step(2, "Pakai <b>kelompok lima</b>: setiap menemukan 5, mulai hitungan baru (tally). Ini mencegah lupa hitungan saat terganggu.")}
${step(3, "Bedakan karakter mirip secara sadar: <b>a</b> vs <b>o</b>, <b>n</b> vs <b>h</b>, <b>6</b> vs <b>9</b>, <b>i</b> vs <b>j</b>.")}
${step(4, "Di akhir, cek jumlah dengan <b>pindai arah sebaliknya</b> (dari kanan ke kiri) jika waktu tersisa.")}
${tip("Di tes komputer kamu tidak bisa mencoret. Gunakan jari/kursor sebagai penunjuk agar mata tidak melompat baris.")}
`
        },
      ],
    },

    /* ===================================================================== KRAEPELIN */
    {
      id: "kraepelin", title: "Kraepelin & Pauli", short: "Kraepelin", icon: "plus", kind: "kecepatan",
      color: "linear-gradient(135deg,#ea580c,#ca8a04)", accent: "#ea580c",
      desc: "Tes koran: menjumlahkan angka berdekatan dalam lajur dengan waktu per lajur. Simulasi interaktif dengan grafik kerja.",
      special: "kraepelin",
      sections: [
        {
          id: "kraepelin", title: "Latihan Kraepelin / Pauli", desc: "Simulasi penjumlahan lajur dengan timer dan analisis grafik.",
          quiz: null, sim: null, source: [],
          materi: `
<p class="lead">Kraepelin dan Pauli (\"tes koran\") berisi lajur-lajur angka 0–9. Kamu menjumlahkan <b>dua angka berdekatan</b> dan menulis <b>angka satuannya saja</b> di antara keduanya. Setiap beberapa detik ada aba-aba \"pindah\" ke lajur berikutnya. Yang dinilai bukan hanya jumlah hitungan, tetapi <b>pola kerjamu</b>.</p>
<h2>Perbedaan Kraepelin vs Pauli</h2>
<table><tr><th></th><th>Kraepelin</th><th>Pauli</th></tr>
<tr><td>Arah</td><td>Bawah ke atas</td><td>Atas ke bawah</td></tr>
<tr><td>Pindah lajur</td><td>Tiap ± 15–30 detik, pindah ke lajur baru</td><td>Tiap 3 menit diberi <b>garis</b>, lanjut terus di lajur yang sama</td></tr>
<tr><td>Durasi</td><td>± 10–15 menit (40–50 lajur)</td><td>± 60 menit (lembar sebesar koran)</td></tr>
<tr><td>Penulisan</td><td>Di sebelah kanan antara dua angka</td><td>Di sebelah kanan antara dua angka</td></tr></table>
<h2>Apa yang diukur</h2>
<ul>
<li><b>Panker (kecepatan)</b>: rata-rata jumlah hitungan per lajur.</li>
<li><b>Tianker (ketelitian)</b>: jumlah kesalahan dan yang terlewat.</li>
<li><b>Janker (keajegan)</b>: seberapa stabil capaian antar lajur (simpangan).</li>
<li><b>Hanker (ketahanan)</b>: apakah performa turun drastis di lajur-lajur akhir.</li>
</ul>
<p>Grafik yang ideal: <b>relatif rata, sedikit naik</b> di akhir, dengan kesalahan minimal. Grafik yang \"naik tinggi lalu anjlok\" dinilai tidak stabil; grafik rata tapi sangat rendah dinilai kurang produktif.</p>
<h2>Cara mengerjakan</h2>
${step(1, "Jumlahkan dua angka berdekatan; tulis <b>satuannya</b>: 8 + 9 = 17 → tulis <b>7</b>. 0 + 0 = 0 → tulis 0.")}
${step(2, "Saat aba-aba pindah, <b>langsung pindah</b> walau belum selesai. Jangan menoleh ke lajur sebelumnya.")}
${step(3, "Jika salah, cukup coret dan tulis di sampingnya (di kertas). Di versi komputer, biasanya tidak bisa dikoreksi — lanjutkan saja.")}
${step(4, "Tetapkan <b>target ritme</b> yang bisa kamu pertahankan 40 lajur, bukan sprint di awal.")}
<h2>Tips persiapan</h2>
<ul>
<li>Hafalkan <b>pasangan jumlah &gt; 10</b> sampai refleks: 7+8=5, 9+6=5, 8+8=6, 9+9=8, 7+7=4, 6+8=4, 9+7=6, 9+8=7.</li>
<li>Gunakan pulpen/pensil biasa, bukan pensil mekanik (perlu <i>reload</i>).</li>
<li>Tidur cukup dan sarapan. Tes ini sangat menguras energi; penurunan di lajur akhir sering karena fisik, bukan kemampuan.</li>
<li>Latih <b>konsentrasi 15 menit tanpa jeda</b> dengan simulasi di bawah, minimal 3× sebelum hari tes.</li>
</ul>
${warn("Jangan mencuri waktu dengan melanjutkan lajur sebelumnya setelah aba-aba — pola kerjamu akan terlihat tidak alami dan di tes komputer hal itu tidak mungkin.")}
`
        },
      ],
    },

    /* ===================================================================== ARMY ALPHA */
    {
      id: "army", title: "Army Alpha (Instruksi)", short: "Army Alpha", icon: "megaphone", kind: "kecepatan",
      color: "linear-gradient(135deg,#be123c,#9333ea)", accent: "#be123c",
      desc: "Menangkap instruksi bersyarat dengan cepat dan mengeksekusinya tepat pada gambar.",
      sections: [
        {
          id: "instruksi", title: "Instruksi Bersyarat", desc: "Coret gambar yang memenuhi semua syarat instruksi.",
          quiz: { count: 10, time: 300 }, sim: { count: 10, time: 250 }, source: ["gen:army"],
          materi: `
<p class="lead">Army Alpha menguji <b>daya tangkap instruksi</b>: narator membacakan perintah <b>satu kali</b>, lalu kamu menandai gambar yang sesuai dalam beberapa detik. Instruksi menggabungkan beberapa syarat: bentuk, jumlah sisi, isi huruf/angka, ganjil/genap, vokal/konsonan, lebih besar/kecil.</p>
<h2>Cara menjawab</h2>
${step(1, "<b>Dengarkan/baca sampai selesai</b>. Banyak instruksi berbalik di akhir: \"… kecuali yang berisi huruf M\".")}
${step(2, "<b>Pecah instruksi menjadi syarat atomik</b> dan hubungkan dengan DAN/ATAU/BUKAN. \"Coret segitiga yang tidak berisi angka kecil (angka kecil = di bawah 8)\" → syarat: segitiga DAN angka ≥ 8.")}
${step(3, "Periksa setiap gambar terhadap <b>semua</b> syarat. Satu syarat gagal = tidak dicoret.")}
${step(4, "Pada instruksi negatif berantai (\"jangan coret A, jangan coret B, coret selain itu\"), tandai dulu yang <b>tidak</b> boleh dicoret, lalu coret sisanya.")}
<h2>Kosakata kunci</h2>
<table><tr><th>Istilah</th><th>Arti</th></tr>
<tr><td>Vokal</td><td>A, I, U, E, O</td></tr>
<tr><td>Konsonan</td><td>huruf selain vokal</td></tr>
<tr><td>Sisi</td><td>segitiga 3, persegi/belah ketupat 4, segi lima 5, segi enam 6; lingkaran = 0 sisi (bukan 1)</td></tr>
<tr><td>\"Lebih dari 4 sisi\"</td><td>5, 6, … (4 tidak termasuk)</td></tr>
<tr><td>\"Tidak lebih dari 4\"</td><td>≤ 4</td></tr>
<tr><td>\"Angka kecil\"</td><td>biasanya didefinisikan di soal; jika tidak, tanyakan/ikuti definisi umum &lt; 5</td></tr></table>
<h2>Contoh terbimbing</h2>
${ex("Tujuh gambar berisi angka. Instruksi: \"Coret gambar yang berisi angka genap lebih kecil dari 8 dan gambar yang berisi angka ganjil lebih besar dari 5.\"", "Ada dua kelompok yang dicoret (dihubungkan \"dan\" dalam arti \"serta\"): (a) genap &lt; 8 → 2, 4, 6; (b) ganjil &gt; 5 → 7, 9. Angka 8 tidak dicoret (genap tapi tidak &lt; 8); 5 tidak dicoret (ganjil tapi tidak &gt; 5). Cek setiap gambar satu per satu.")}
${ex("\"Jangan coret gambar bersisi 6. Jangan coret yang mengandung konsonan. Jangan coret gambar bersisi 4 atau kurang. Jangan coret yang mengandung angka ganjil. Coret selain semua tersebut.\"", "Yang dicoret harus memenuhi SEMUA: bukan segi enam, tidak ada konsonan, sisi &gt; 4 (jadi segi lima), tidak ada angka ganjil. → segi lima berisi vokal atau angka genap.")}
${tip("Latihan di sini menampilkan instruksi selama beberapa detik lalu <b>menyembunyikannya</b> — persis seperti narator yang tidak mengulang. Biasakan menangkap syarat dalam sekali baca.")}
`
        },
      ],
    },

    /* ===================================================================== KODE & INGATAN */
    {
      id: "kode", title: "Kode & Ingatan", short: "Ingatan", icon: "brain", kind: "kecepatan",
      color: "linear-gradient(135deg,#0d9488,#2563eb)", accent: "#0d9488",
      desc: "Menghafal tabel kode dalam waktu terbatas lalu memanggilnya kembali (seperti subtes ME pada IST).",
      special: "kode",
      sections: [
        {
          id: "hafalan", title: "Hafalan Kode & Kategori", desc: "Hafalkan tabel item–kode, lalu jawab tanpa melihat tabel.",
          quiz: null, sim: null, source: ["gen:kode"],
          materi: `
<p class="lead">Kamu diberi tabel berisi beberapa kategori (misal transportasi, kota, makanan, buah, hewan) dengan <b>kode</b> untuk tiap item. Waktu menghafal terbatas (1–3 menit), lalu tabel ditutup dan kamu menjawab 20–25 pertanyaan. Pada IST, subtes <i>Merkaufgaben</i> (ME) memakai prinsip yang sama: hafalkan kata per kategori, lalu ditanya \"kata yang berawalan huruf X termasuk kategori apa?\".</p>
<h2>Strategi menghafal</h2>
${step(1, "<b>Temukan pola kode per kategori</b> dulu. Contoh: semua kota berkode 2 angka + 1 huruf (99S, 38T), semua buah 2 angka (20, 82), semua hewan 1 huruf + 1 angka (J6, W2). Dengan ini, separuh pilihan jawaban langsung bisa dicoret.")}
${step(2, "<b>Chunking</b>: hafalkan per kategori (5 item), bukan 25 item sekaligus. Ulangi satu kategori sampai lancar, baru pindah.")}
${step(3, "<b>Asosiasi</b>: FERRARI 876 → \"Ferrari turun 8-7-6 (kecepatan turun)\"; KUCING J6 → \"kucing J(alan) 6 kaki?\" Asosiasi yang konyol justru paling lekat.")}
${step(4, "<b>Recall aktif</b>: tutup tabel 20 detik sebelum waktu habis, sebutkan sebanyak mungkin pasangan, lalu buka lagi untuk menambal yang lupa.")}
${step(5, "Untuk versi IST (kata per kategori): hafalkan <b>huruf awal → kategori</b>, bukan kata lengkapnya. Soal hanya menanyakan huruf awal.")}
<h2>Saat menjawab</h2>
<ul><li>Jawab dulu yang yakin, tandai yang ragu.</li>
<li>Untuk yang ragu, pakai <b>eliminasi pola kode</b>: jika ditanya kode MAZDA dan pilihan 178 / H3 / 177, buang H3 (pola hewan). Antara 178 dan 177, ingat \"kode mobil menurun\" → 177.</li></ul>
${tip("Simulasi di platform ini mengacak tabel setiap kali, jadi kamu benar-benar melatih <b>teknik</b> menghafal, bukan menghafal satu tabel.")}
`
        },
      ],
    },

    /* ===================================================================== KEPRIBADIAN */
    {
      id: "kepribadian", title: "Tes Kepribadian", short: "Kepribadian", icon: "mask", kind: "kepribadian",
      color: "linear-gradient(135deg,#db2777,#f59e0b)", accent: "#db2777",
      desc: "EPPS, DISC, PAPI Kostick, MBTI, Big Five. Pahami apa yang diukur agar jawabanmu konsisten dan autentik.",
      special: "personality",
      sections: [
        {
          id: "umum", title: "Prinsip Menjawab Tes Kepribadian", desc: "Konsistensi, skala kebohongan, dan menyesuaikan dengan posisi.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:kepribadian-umum"],
          materi: `
<p class="lead">Tes kepribadian <b>tidak punya jawaban benar-salah</b>, tetapi bukan berarti tidak bisa dipersiapkan. Yang dinilai HRD adalah <b>kecocokan profil dengan posisi</b> dan <b>konsistensi jawaban</b>. Peserta gagal biasanya bukan karena \"kepribadian buruk\", melainkan karena profilnya <b>kontradiktif</b> atau terlalu \"sempurna\" sehingga terdeteksi tidak jujur.</p>
<h2>Tiga prinsip</h2>
${step(1, "<b>Konsisten.</b> Pernyataan yang sama muncul berulang dengan kalimat berbeda (kadang dibalik). Jika kamu memilih \"suka memimpin\" di nomor 5, jangan memilih \"lebih suka mengikuti\" di nomor 60. Cara termudah konsisten: jawab apa adanya.")}
${step(2, "<b>Jujur tetapi sadar konteks.</b> Pilih jawaban yang menggambarkan dirimu <i>di lingkungan kerja</i>, bukan saat liburan. Kamu boleh menonjolkan sisi profesionalmu, tetapi jangan mengarang kepribadian baru.")}
${step(3, "<b>Hindari ekstrem yang tidak realistis.</b> Menjawab \"selalu\" untuk semua hal positif memicu <b>skala kebohongan</b> (<i>lie scale / social desirability</i>). Contoh item pengecek: \"Saya tidak pernah berbohong sekalipun\", \"Saya tidak pernah terlambat\". Orang jujur menjawab \"kadang-kadang\".")}
<h2>Apa yang dicari per posisi</h2>
<table><tr><th>Posisi</th><th>Profil yang umumnya diharapkan</th></tr>
<tr><td>Sales / BD / Marketing</td><td>Dominan–influence tinggi (DISC: D/I), ekstrover, orientasi target, toleransi penolakan</td></tr>
<tr><td>Admin / Finance / Audit</td><td>Conscientiousness tinggi (DISC: C), teliti, patuh prosedur, stabil (S)</td></tr>
<tr><td>Customer Service / HR</td><td>Steadiness (S) & Influence (I), empati tinggi, sabar, kooperatif</td></tr>
<tr><td>Management Trainee / Leader</td><td>Achievement & Dominance (EPPS: ach, dom), inisiatif, tahan tekanan, fleksibel</td></tr>
<tr><td>Engineer / IT / R&D</td><td>Analitis (MBTI: T), Openness, endurance, otonomi (EPPS: aut) moderat</td></tr>
<tr><td>Operator / Produksi</td><td>Steadiness, endurance (EPPS: end), kepatuhan (def), kerja sama</td></tr></table>
<h2>Kesalahan fatal</h2>
${warn("<b>Profil kontradiktif</b>: skor \"ingin memimpin\" tinggi tetapi \"ingin diarahkan\" juga tinggi. <b>Terlalu agresif</b>: skor agresi (EPPS: agg) tinggi hampir selalu menjadi catatan merah. <b>Terlalu sempurna</b>: skala konsistensi (EPPS: con) rendah atau lie scale tinggi → hasil tidak valid → biasanya gugur.")}
${tip("Sebelum tes, tulis 5 kata sifat yang menggambarkan dirimu saat bekerja (misal: teliti, tenang, suka belajar, kooperatif, bertanggung jawab). Gunakan sebagai 'kompas' saat ragu memilih antara dua pernyataan. Ini menjaga konsistensi tanpa harus mengingat jawaban sebelumnya.")}
`
        },
        {
          id: "epps", title: "EPPS (Edwards Personal Preference Schedule)", desc: "225 pasangan pernyataan yang mengukur 15 kebutuhan psikologis.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:epps"], inventory: "epps",
          materi: `
<p class="lead">EPPS berisi 225 pasang pernyataan \"A atau B\". Kamu harus memilih yang <b>lebih menggambarkan dirimu</b>, bahkan jika keduanya kamu suka atau keduanya tidak kamu suka (<i>forced choice</i>). Hasilnya adalah profil <b>15 kebutuhan (needs)</b> menurut Murray.</p>
<h2>15 kebutuhan yang diukur</h2>
<table><tr><th>Kode</th><th>Kebutuhan</th><th>Ciri pernyataan</th></tr>
<tr><td>ach</td><td>Achievement (berprestasi)</td><td>\"melakukan sebaik mungkin\", \"menyelesaikan tugas sulit\"</td></tr>
<tr><td>def</td><td>Deference (patuh/menghormati)</td><td>\"mengikuti petunjuk\", \"meminta saran orang yang dihormati\"</td></tr>
<tr><td>ord</td><td>Order (keteraturan)</td><td>\"barang tersusun rapi\", \"merencanakan detail\"</td></tr>
<tr><td>exh</td><td>Exhibition (menonjol)</td><td>\"pusat perhatian\", \"bercerita lucu di pesta\"</td></tr>
<tr><td>aut</td><td>Autonomy (mandiri)</td><td>\"berbuat sekehendak hati\", \"tidak tergantung orang lain\"</td></tr>
<tr><td>aff</td><td>Affiliation (berteman)</td><td>\"membuat teman baru\", \"loyal pada teman\"</td></tr>
<tr><td>int</td><td>Intraception (memahami orang)</td><td>\"menganalisis perasaan/motif orang lain\"</td></tr>
<tr><td>suc</td><td>Succorance (dibantu/diperhatikan)</td><td>\"teman memberi dorongan saat gagal\", \"dihibur\"</td></tr>
<tr><td>dom</td><td>Dominance (memimpin)</td><td>\"dipilih sebagai ketua\", \"mengarahkan orang lain\"</td></tr>
<tr><td>aba</td><td>Abasement (merasa bersalah/rendah diri)</td><td>\"merasa harus dihukum jika salah\", \"kalah dari orang lain\"</td></tr>
<tr><td>nur</td><td>Nurturance (menolong)</td><td>\"menolong teman yang kesulitan\", \"bermurah hati\"</td></tr>
<tr><td>chg</td><td>Change (variasi)</td><td>\"hal baru\", \"bepergian\", \"mengikuti mode\"</td></tr>
<tr><td>end</td><td>Endurance (ketekunan)</td><td>\"bekerja berjam-jam\", \"bertahan sampai selesai\"</td></tr>
<tr><td>het</td><td>Heterosexuality</td><td>\"menarik bagi lawan jenis\", \"bergaul dengan lawan jenis\"</td></tr>
<tr><td>agg</td><td>Aggression (agresi)</td><td>\"mengecam di depan umum\", \"menyerang pendapat lawan\"</td></tr></table>
<h2>Profil yang umumnya disukai untuk kerja</h2>
<ul><li><b>Tinggi</b>: ach, end, ord (sedang-tinggi), aff, nur, int, dom (sesuai posisi).</li>
<li><b>Sedang</b>: def, chg, aut, exh.</li>
<li><b>Rendah</b>: agg, aba, suc (terlalu bergantung), het (konteks kerja).</li></ul>
<h2>Skor konsistensi</h2>
<p>Ada 15 pasang item yang <b>identik</b> dan diulang. Jika jawabanmu berbeda di lebih dari 4–5 pasang, hasil dianggap <b>tidak konsisten</b>. Karena itu: jawab berdasarkan diri yang sebenarnya; kamu tidak akan ingat 225 jawaban.</p>
<h2>Contoh pasangan dan cara memikirkannya</h2>
${ex("A. Saya suka menolong teman-teman saya bila mereka dalam kesulitan (nur).<br>B. Saya ingin melakukan pekerjaan apa saja sebaik mungkin (ach).", "Keduanya positif. Pilih yang <b>lebih sering muncul</b> dalam perilaku nyatamu di tempat kerja. Untuk posisi target/kompetitif, ach cenderung lebih relevan; untuk posisi layanan, nur. Yang penting: jawab serupa saat pasangan ini muncul lagi dalam kalimat berbeda.")}
${ex("A. Saya menjadi sedemikian marahnya sehingga ingin melempar barang (agg).<br>B. Saya suka mengelakkan tanggung jawab (aba/suc negatif).", "Keduanya negatif (forced choice). Pilih yang <b>paling tidak merugikan konteks kerja</b> dan tetap jujur — bagi kebanyakan orang, pernyataan tentang emosi sesaat (A) lebih manusiawi daripada menghindari tanggung jawab (B), tetapi jika A dipilih berulang, skor agg naik. Seimbangkan.")}
${tip("Kerjakan dengan tempo stabil (± 24 menit untuk 100 soal, 60 menit untuk 225). Terlalu lama di satu nomor menandakan kamu 'mengatur' jawaban.")}
`
        },
        {
          id: "disc", title: "DISC", desc: "Profil perilaku: Dominance, Influence, Steadiness, Compliance.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:disc"], inventory: "disc",
          materi: `
<p class="lead">DISC adalah tes paling sering dipakai perusahaan swasta dan startup karena cepat (24–28 kelompok). Tiap kelompok berisi 4 pernyataan; pilih satu yang <b>paling</b> (Most) dan satu yang <b>paling tidak</b> (Least) menggambarkan dirimu.</p>
<h2>Empat dimensi</h2>
<table><tr><th>Dimensi</th><th>Fokus</th><th>Kata kunci dalam pernyataan</th><th>Posisi cocok</th></tr>
<tr><td><b>D</b> Dominance</td><td>hasil, tantangan, kendali</td><td>tegas, berani, kompetitif, cepat memutuskan, menuntut</td><td>leader, sales, entrepreneur</td></tr>
<tr><td><b>I</b> Influence</td><td>orang, pengaruh, antusiasme</td><td>ramah, persuasif, optimis, ekspresif, suka bergaul</td><td>marketing, PR, trainer, sales</td></tr>
<tr><td><b>S</b> Steadiness</td><td>kerja sama, kestabilan</td><td>sabar, setia, tenang, pendengar, konsisten</td><td>CS, HR, admin, operator</td></tr>
<tr><td><b>C</b> Compliance</td><td>kualitas, akurasi, aturan</td><td>teliti, analitis, sistematis, hati-hati, perfeksionis</td><td>finance, QC, engineer, audit</td></tr></table>
<h2>Tiga grafik</h2>
<p>Hasil DISC terdiri dari grafik <b>Most</b> (topeng/perilaku di tempat kerja), <b>Least</b> (diri inti/saat tertekan), dan <b>Change</b> (selisih). HRD melihat apakah ada <b>kesenjangan besar</b> antara Most dan Least — itu menandakan kamu \"memaksakan diri\" di posisi tersebut.</p>
<h2>Strategi</h2>
${step(1, "Tentukan <b>2 dimensi utama</b> yang paling relevan dengan posisi dan memang kamu miliki (misal S-C untuk admin). Gunakan itu sebagai pegangan saat ragu.")}
${step(2, "Untuk <b>Most</b>, pilih pernyataan yang menggambarkan perilakumu di kantor. Untuk <b>Least</b>, pilih yang paling bukan kamu — jangan memilih Least secara acak; ia sama berpengaruhnya.")}
${step(3, "Jangan memilih Most selalu dari dimensi yang sama dan Least dari dimensi yang sama; profil asli punya variasi. Profil 'D sempurna' tanpa S/C membuat kamu tampak sulit diatur.")}
${ex("Kelompok: (a) Persuasif (I), (b) Lembut (S), (c) Rendah hati (C/S), (d) Orisinal (D).", "Untuk posisi analis data yang memang teliti dan tenang: Most = (b) atau (c), Least = (d) atau (a) sesuai yang paling bukan dirimu. Untuk sales yang ekstrover: Most = (a), Least = (b).")}
${tip("Tidak ada profil DISC yang 'buruk'. Yang buruk adalah profil yang tidak cocok dengan posisi <u>dan</u> tidak konsisten antar kelompok.")}
`
        },
        {
          id: "papi", title: "PAPI Kostick", desc: "90 pasangan pernyataan: 20 aspek peran (role) dan kebutuhan (need) dalam pekerjaan.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:papi"], inventory: "papi",
          materi: `
<p class="lead">PAPI (Personality and Preference Inventory) Kostick sangat populer di perbankan dan BUMN. 90 pasang pernyataan; pilih yang lebih menggambarkanmu. Hasilnya berupa 20 skala yang dibagi menjadi <b>Role</b> (bagaimana kamu bekerja) dan <b>Need</b> (apa yang kamu butuhkan).</p>
<h2>20 skala</h2>
<table><tr><th>Area</th><th>Skala</th></tr>
<tr><td>Arah kerja</td><td><b>N</b> menyelesaikan tugas sendiri, <b>G</b> pekerja keras, <b>A</b> hasrat berprestasi</td></tr>
<tr><td>Kepemimpinan</td><td><b>L</b> peran pemimpin, <b>P</b> mengendalikan orang lain, <b>I</b> membuat keputusan</td></tr>
<tr><td>Aktivitas</td><td><b>T</b> tempo/sibuk, <b>V</b> semangat/energik</td></tr>
<tr><td>Relasi sosial</td><td><b>X</b> ingin diperhatikan, <b>S</b> hubungan sosial, <b>B</b> kebutuhan diterima kelompok, <b>O</b> kedekatan & kasih sayang</td></tr>
<tr><td>Gaya kerja</td><td><b>R</b> tipe teoritis/pemikir, <b>D</b> detail, <b>C</b> keteraturan</td></tr>
<tr><td>Temperamen</td><td><b>Z</b> kebutuhan berubah, <b>E</b> pengendalian emosi, <b>K</b> agresi</td></tr>
<tr><td>Posisi atasan-bawahan</td><td><b>F</b> dukungan dari atasan, <b>W</b> butuh aturan/arahan</td></tr></table>
<h2>Cara membaca skor (0–9)</h2>
<ul><li><b>G, A, N, D, C, E</b> tinggi umumnya positif untuk hampir semua posisi.</li>
<li><b>L, P, I</b> tinggi untuk posisi kepemimpinan; sedang untuk staf.</li>
<li><b>K</b> (agresi) tinggi → catatan merah. <b>W</b> (butuh diarahkan) tinggi untuk calon leader → kurang cocok. <b>F</b> tinggi → dianggap terlalu bergantung pada atasan.</li>
<li><b>Z</b> tinggi: cocok startup/kreatif; rendah: cocok posisi rutin.</li></ul>
${ex("A. Saya bekerja keras. (G)<br>B. Saya tidak mudah marah. (E)", "Keduanya positif. Pegang kompas posisi: untuk produksi/operasional, G lebih dihargai; untuk CS/HR, E. Konsistensi lebih penting daripada pilihan mana pun.")}
${warn("PAPI punya banyak pasangan yang mengadu <b>Need</b> vs <b>Role</b>. Pilih sesuai gaya kerjamu yang nyata; peserta yang menebak-nebak 'jawaban HR' menghasilkan profil datar (semua skor 4–5) yang justru dinilai tidak informatif.")}
`
        },
        {
          id: "mbti", title: "MBTI & Big Five", desc: "Tipe kepribadian 16 huruf dan lima faktor besar.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:mbti"], inventory: "mbti",
          materi: `
<p class="lead">MBTI dan Big Five (OCEAN/BFI) lebih sering dipakai untuk <b>penempatan</b> dan <b>pengembangan</b> daripada seleksi gugur, tetapi tetap dibaca HRD. Pahami dimensinya agar jawabanmu konsisten.</p>
<h2>MBTI: empat dikotomi</h2>
<table><tr><th>Dimensi</th><th>Kutub</th><th>Pertanyaan khas</th></tr>
<tr><td>Sumber energi</td><td><b>E</b>xtraversion – <b>I</b>ntroversion</td><td>\"Saya merasa berenergi setelah bertemu banyak orang\"</td></tr>
<tr><td>Cara menyerap info</td><td><b>S</b>ensing – i<b>N</b>tuition</td><td>\"Saya lebih percaya fakta konkret daripada gambaran besar\"</td></tr>
<tr><td>Cara memutuskan</td><td><b>T</b>hinking – <b>F</b>eeling</td><td>\"Saya memutuskan berdasarkan logika, bukan perasaan orang\"</td></tr>
<tr><td>Gaya hidup</td><td><b>J</b>udging – <b>P</b>erceiving</td><td>\"Saya suka rencana yang pasti daripada spontan\"</td></tr></table>
<h2>Big Five (OCEAN)</h2>
<ul><li><b>O</b>penness: keterbukaan pada ide baru, kreativitas.</li>
<li><b>C</b>onscientiousness: kedisiplinan, keteraturan, tanggung jawab — <b>prediktor kinerja paling kuat</b> di hampir semua pekerjaan.</li>
<li><b>E</b>xtraversion: sosiabilitas, asertivitas.</li>
<li><b>A</b>greeableness: kooperatif, empati.</li>
<li><b>N</b>euroticism: kecenderungan cemas/emosi negatif (skor rendah lebih disukai; disebut juga <i>emotional stability</i>).</li></ul>
<h2>Catatan menjawab</h2>
<ul><li>Big Five memakai skala 1–5 (sangat tidak setuju – sangat setuju). Beberapa item <b>dibalik</b> (\"Saya cenderung malas\" → skor dibalik untuk C). Baca arah pernyataannya.</li>
<li>Tidak ada tipe MBTI yang \"gagal\". Namun untuk posisi tertentu, HRD mencari kecenderungan (misal J untuk project control, E untuk sales).</li></ul>
${tip("Jika hasil MBTI-mu berubah-ubah tiap tes, kemungkinan skormu dekat ke tengah di satu dimensi. Itu normal; saat tes kerja, jawab berdasarkan <b>perilaku kerjamu yang paling sering</b>.")}
`
        },
      ],
    },

    /* ===================================================================== TES GAMBAR */
    {
      id: "gambar", title: "Tes Menggambar", short: "Menggambar", icon: "pencil", kind: "gambar",
      color: "linear-gradient(135deg,#65a30d,#0d9488)", accent: "#65a30d",
      desc: "Wartegg, Baum (pohon), DAP (orang), HTP. Apa yang dinilai, cara mengerjakan, dan latihan Wartegg interaktif.",
      special: "wartegg",
      sections: [
        {
          id: "wartegg", title: "Tes Wartegg", desc: "Melengkapi 8 stimulus menjadi gambar bermakna.",
          quiz: { count: 10, time: 420 }, sim: null, source: ["konsep:wartegg"],
          materi: `
<p class="lead">Wartegg (WZT) terdiri dari <b>8 kotak</b> dengan stimulus kecil. Kamu melengkapinya menjadi gambar bermakna, memberi judul, menulis urutan pengerjaan, serta menandai yang paling disukai, tidak disukai, paling mudah, dan paling sulit. Kemampuan menggambar <b>bukan</b> yang dinilai.</p>
<h2>Makna tiap stimulus & saran gambar</h2>
<table><tr><th>Kotak</th><th>Stimulus</th><th>Aspek yang dilihat</th><th>Saran aman</th></tr>
<tr><td>1</td><td>Titik di tengah</td><td>Konsep diri, cara menempatkan diri</td><td>Jadikan pusat: bunga matahari, jam, sasaran panah, roda. Jangan abaikan titiknya.</td></tr>
<tr><td>2</td><td>Garis lengkung kecil (~)</td><td>Fleksibilitas, hubungan emosional</td><td>Benda hidup/organik: burung terbang, wajah tersenyum, ikan, daun.</td></tr>
<tr><td>3</td><td>Tiga garis vertikal naik</td><td>Ambisi, orientasi prestasi</td><td>Grafik naik, tangga, gedung bertingkat, pagar. Lanjutkan tren <b>naik</b>.</td></tr>
<tr><td>4</td><td>Kotak hitam kanan atas</td><td>Cara menghadapi masalah/kegelisahan</td><td>Jadikan bagian konstruktif: jendela gedung, layar HP, papan catur. Hindari gambar gelap/menakutkan.</td></tr>
<tr><td>5</td><td>Dua garis tegak lurus terpisah</td><td>Energi, dinamika, cara mengatasi hambatan</td><td>Objek dinamis: kapal layar, balap, ketapel, roket. Hubungkan kedua garis.</td></tr>
<tr><td>6</td><td>Garis horizontal & vertikal terpisah</td><td>Integrasi, cara berpikir rasional</td><td>Gabungkan menjadi bangunan: rumah, TV, kotak, jembatan. Gunakan garis lurus.</td></tr>
<tr><td>7</td><td>Titik-titik membentuk lengkung</td><td>Kepekaan, kehalusan perasaan</td><td>Benda lembut: kalung mutiara, ulat, jejak kaki, bunga. Jangan ditinggal.</td></tr>
<tr><td>8</td><td>Lengkung besar</td><td>Hubungan sosial, perlindungan</td><td>Payung, pelangi, kubah, topi, matahari terbit. Sesuatu yang \"melindungi/melingkupi\".</td></tr></table>
<h2>Prinsip pengerjaan</h2>
${step(1, "<b>Garis lengkung → benda hidup/organik; garis lurus → benda mati/teknis.</b> Ini aturan paling dikenal dan paling aman.")}
${step(2, "<b>Jadikan stimulus bagian utama</b>, bukan sekadar ditempel. Kotak hitam yang dijadikan \"jendela\" lebih baik daripada diabaikan di pojok.")}
${step(3, "<b>Urutan</b>: kombinasi urut & acak dianggap paling wajar, misalnya 1-2-3-4 lalu 8-7-6-5, atau mulai dari yang paling mudah bagimu. Urutan 100% berurutan dibaca kaku; 100% acak dibaca sulit diatur. Pria disarankan tidak memulai dari kotak 7/8; wanita tidak memulai dari kotak 5 (konvensi penilaian lama yang masih dipakai sebagian psikolog).")}
${step(4, "<b>Tekanan garis konsisten, hapusan minimal, isi seluruh kotak.</b> Kotak kosong atau gambar sangat kecil di pojok dibaca sebagai penarikan diri.")}
${step(5, "Beri <b>judul konkret</b> (\"Kapal menuju pelabuhan\" lebih baik daripada \"Perjalanan\"). Isi 4 pertanyaan akhir dengan alasan singkat dan positif.")}
<h2>Yang sebaiknya dihindari</h2>
<ul><li>Gambar bertema kekerasan, senjata, darah, kuburan.</li>
<li>Menggambar <b>sama</b> di semua kotak (bunga di semua kotak).</li>
<li>Membuat garis stimulus menjadi coretan abstrak tanpa makna.</li>
<li>Menghabiskan 10 menit di satu kotak; total waktu biasanya 15–30 menit.</li></ul>
${tip("Gunakan <b>Latihan Wartegg</b> di tab berikutnya: kamu bisa menggambar langsung dengan mouse/jari pada 8 kotak, lalu mengisi daftar periksa penilaian diri. Latih 2–3 kali sampai punya 'repertoar' gambar untuk tiap kotak.")}
`
        },
        {
          id: "baum", title: "Baum Test (Menggambar Pohon)", desc: "Pohon berkayu, berbuah, dengan akar, batang, cabang, dan tajuk lengkap.",
          quiz: { count: 8, time: 360 }, sim: null, source: ["konsep:baum"],
          materi: `
<p class="lead">Kamu diminta menggambar <b>pohon berkayu (dikotil)</b>, biasanya dilarang: kelapa, pisang, bambu, cemara, semak, rumput. Waktu ± 10 menit. Dikembangkan oleh Karl Koch; psikolog melihat ± 59 aspek, tetapi kamu hanya perlu memperhatikan beberapa hal utama.</p>
<h2>Bagian yang wajib ada & maknanya</h2>
<table><tr><th>Bagian</th><th>Makna umum</th><th>Saran</th></tr>
<tr><td>Akar</td><td>pijakan realitas, masa lalu</td><td>Tampakkan sedikit akar/pangkal yang melebar; tidak perlu akar terbuka berlebihan.</td></tr>
<tr><td>Batang</td><td>ego, kekuatan diri</td><td>Proporsional (tidak terlalu kurus/gemuk), tekstur kulit secukupnya, tanpa lubang besar/luka.</td></tr>
<tr><td>Cabang & ranting</td><td>cara berhubungan dengan lingkungan</td><td>Bercabang ke segala arah, ujung tidak runcing/terpotong; ranting mengecil secara wajar.</td></tr>
<tr><td>Tajuk/daun</td><td>pikiran, ide, aspirasi</td><td>Rimbun, bentuk jelas, daun individual sebagian terlihat.</td></tr>
<tr><td>Buah</td><td>produktivitas, hasil</td><td>Beberapa buah ukuran wajar (mangga, apel, jambu). Buah yang jatuh berserakan dibaca negatif.</td></tr>
<tr><td>Garis tanah</td><td>penerimaan realitas</td><td>Buat garis tanah sederhana agar pohon tidak \"melayang\".</td></tr></table>
<h2>Ukuran & posisi</h2>
<ul><li>Gambar menempati ± <b>2/3 halaman</b>, agak ke tengah. Terlalu kecil = kurang percaya diri; memenuhi hingga tepi = ekspansif/impulsif.</li>
<li>Tekanan pensil sedang dan konsisten. Hindari hapusan berulang.</li>
<li>Pohon <b>tegak</b>; condong kuat ke satu sisi dibaca tidak stabil.</li></ul>
<h2>Pohon yang disarankan</h2>
<p>Mangga, jambu, rambutan, apel, beringin (tanpa akar gantung berlebihan), jati. Latih <b>satu pohon</b> sampai bisa digambar dalam 7–8 menit dengan semua bagian lengkap, lalu tuliskan namanya saat diminta.</p>
${warn("Jangan menggambar pohon gundul (tanpa daun) atau mati, pohon dalam pot, pohon natal/cemara (bentuk segitiga tanpa cabang), atau menambahkan ayunan/orang/rumah kecuali diminta.")}
`
        },
        {
          id: "dap", title: "Draw A Person (DAP)", desc: "Menggambar manusia lengkap sedang beraktivitas, dengan keterangan.",
          quiz: { count: 8, time: 360 }, sim: null, source: ["konsep:dap"],
          materi: `
<p class="lead">Gambarlah seseorang sedetail mungkin (± 10 menit), lalu tulis: umur, jenis kelamin, pekerjaan, aktivitas, ciri fisik, kelebihan, kelemahan. Penilaian bersifat <b>kuantitatif</b>: <b>proporsi</b>, <b>kelengkapan</b>, dan <b>detail</b>.</p>
<h2>Daftar kelengkapan (jangan ada yang terlewat)</h2>
<div class="grid grid-2">
<ul><li>Kepala + rambut</li><li>Wajah: mata (dengan pupil), alis, hidung, mulut, telinga</li><li>Leher</li><li>Bahu & badan proporsional</li><li>Dua lengan + tangan + <b>lima jari</b></li></ul>
<ul><li>Dua tungkai + kaki + sepatu</li><li>Pakaian lengkap sesuai profesi (kemeja, celana/rok, kerah, kancing, saku)</li><li>Aksesori profesi: stetoskop, helm proyek, laptop, tas</li><li>Garis tanah/konteks sederhana</li><li>Ekspresi wajah positif (senyum wajar)</li></ul></div>
<h2>Prinsip</h2>
${step(1, "<b>Gambar seluruh badan</b> (bukan hanya setengah badan/wajah), menghadap depan atau 3/4, dalam posisi <b>beraktivitas</b> sesuai profesi: dokter memeriksa pasien, insinyur membawa gulungan gambar, pegawai bank melayani nasabah.")}
${step(2, "<b>Proporsi</b>: tinggi total ≈ 7–8 kepala. Kepala tidak terlalu besar, lengan sampai pertengahan paha, kedua kaki panjangnya sama.")}
${step(3, "<b>Jenis kelamin sama dengan dirimu</b> dan usia sepantaran (konvensi penilaian umum). Boleh menggambar diri sendiri dalam kondisi prima.")}
${step(4, "Ukuran ± 2/3 halaman, di tengah. Tekanan garis sedang, tegas, hapusan minimal.")}
${step(5, "Keterangan di belakang kertas: profesi yang jelas dan realistis; kelebihan yang relevan kerja (teliti, tekun, komunikatif); kelemahan yang <b>manusiawi dan ringan</b> (\"kadang terlalu perfeksionis\", \"kurang menyukai pekerjaan yang terlalu rutin\") — jangan yang fatal (\"pemarah\", \"malas\").")}
<h2>Tanda yang dihindari</h2>
<ul><li>Tangan di saku/di belakang punggung (dibaca menyembunyikan sesuatu).</li>
<li>Tanpa kaki/kaki terpotong tepi kertas (dibaca tidak stabil).</li>
<li>Mata kosong tanpa pupil, mulut terbuka lebar, garis berulang/ditebalkan di area tertentu.</li>
<li>Figur stik/kartun; figur melayang tanpa garis tanah.</li></ul>
${tip("Latih satu figur standar: pegawai berkemeja memegang map/laptop berdiri tegak di depan meja. Hafalkan urutannya: kepala → badan → lengan → tungkai → detail wajah → pakaian → aksesori → tanah. 8 menit cukup setelah 3× latihan.")}
`
        },
        {
          id: "htp", title: "House-Tree-Person (HTP)", desc: "Rumah, pohon, dan orang dalam satu komposisi.",
          quiz: { count: 8, time: 360 }, sim: null, source: ["konsep:htp"],
          materi: `
<p class="lead">HTP (John Buck, 1948) meminta kamu menggambar <b>rumah, pohon, dan orang</b> dalam satu kertas (± 15 menit). Tiga objek itu dilihat sebagai satu kesatuan cerita: bagaimana kamu memandang keluarga/lingkungan (rumah), diri (pohon), dan peran sosial (orang).</p>
<h2>Rumah: bagian & makna</h2>
<table><tr><th>Bagian</th><th>Makna</th><th>Saran</th></tr>
<tr><td>Dinding</td><td>kekuatan ego</td><td>garis tegas, tidak putus-putus, tidak terlalu tebal</td></tr>
<tr><td>Atap</td><td>fantasi/pemikiran</td><td>proporsional; jangan atap mendominasi</td></tr>
<tr><td>Pintu & jendela</td><td>keterbukaan sosial</td><td>pintu ukuran wajar dengan gagang, jendela terbuka/berkaca tanpa teralis rapat; gorden tertutup dibaca tertutup</td></tr>
<tr><td>Jalan setapak</td><td>akses interaksi</td><td>buat jalan menuju pintu</td></tr>
<tr><td>Tanah</td><td>penerimaan realitas</td><td>garis tanah yang menyatukan rumah, pohon, orang</td></tr>
<tr><td>Cerobong/asap</td><td>kehangatan (konteks Barat)</td><td>opsional; di Indonesia tidak wajib</td></tr></table>
<h2>Komposisi</h2>
${step(1, "<b>Satu kesatuan</b>: orang berada di antara/dekat rumah dan pohon, dengan skala konsisten (orang lebih pendek dari pintu? tidak — orang sekitar setinggi pintu).")}
${step(2, "<b>Orang sedang beraktivitas</b> yang menghubungkan ketiganya: menyiram pohon, berjalan menuju rumah.")}
${step(3, "Urutan menggambar yang umum: rumah → pohon → orang (mengikuti nama tes). Pohon dan orang mengikuti prinsip Baum & DAP.")}
${step(4, "Tambahkan konteks secukupnya: matahari, awan ringan, pagar rendah. Jangan berlebihan hingga objek utama tenggelam.")}
${warn("Hindari rumah tanpa pintu, jendela tertutup semua, pohon mati, orang membelakangi, atau ketiganya terpisah jauh tanpa garis tanah. Hindari pula detail suram (hujan badai, petir).")}
${tip("Waktu 15 menit: 5 menit rumah, 4 menit pohon, 4 menit orang, 2 menit garis tanah dan pengecekan kelengkapan.")}
`
        },
      ],
    },
  ];

  P.moduleById = (id) => P.MODULES.find((m) => m.id === id);
  P.sectionById = (mid, sid) => { const m = P.moduleById(mid); return m && m.sections.find((s) => s.id === sid); };
})(window.PSI);

/* js/data/bank_verbal.js */
/* Bank soal verbal: sinonim, antonim, analogi, wacana. d = tingkat (1 mudah, 2 sedang, 3 sulit) */
(function (P) {
  P.BANK = P.BANK || {};
  const B = (P.BANK.verbal = {});

  /* ------------------------------------------------------------ SINONIM */
  B.sinonim = [
    { d: 1, q: "BAKU", o: ["Standar", "Perkiraan", "Umum", "Normal", "Asli"], a: 0, e: "<i>Baku</i> = pokok, standar, yang menjadi tolok ukur (bahasa baku, harga baku). <i>Normal</i> dan <i>umum</i> berkaitan tetapi tidak sepadan: sesuatu yang umum belum tentu dijadikan standar." },
    { d: 1, q: "PROTEKSI", o: ["Perlindungan", "Pengawasan", "Bantuan", "Penjagaan", "Pengamanan"], a: 0, e: "<i>Proteksi</i> (protect) = perlindungan. <i>Penjagaan</i> dan <i>pengamanan</i> adalah tindakan untuk melindungi (cara), bukan padanan langsung. Pilih padanan yang paling tepat, bukan yang berkaitan." },
    { d: 1, q: "CITRA", o: ["Gambaran", "Dimensi", "Anggapan", "Imajinasi", "Mutu"], a: 0, e: "<i>Citra</i> = gambaran/kesan (citra perusahaan = gambaran perusahaan di mata publik). <i>Anggapan</i> adalah jebakan karena citra terbentuk dari anggapan, tetapi maknanya berbeda." },
    { d: 1, q: "RABAT", o: ["Potongan harga", "Tambahan gaji", "Keuntungan", "Pembayaran kembali", "Denda"], a: 0, e: "<i>Rabat</i> = potongan harga/diskon. <i>Pembayaran kembali</i> adalah <i>refund/restitusi</i>, berbeda konsep." },
    { d: 1, q: "INSOMNIA", o: ["Tak bisa tidur", "Cemas", "Sedih", "Tidur", "Mengigau"], a: 0, e: "<i>Insomnia</i> = gangguan sulit tidur. <i>Tidur</i> justru kebalikannya — jebakan untuk yang hanya mengenali akar 'somn' (tidur)." },
    { d: 1, q: "ASUMSI", o: ["Anggapan", "Kesimpulan", "Ramalan", "Perbandingan", "Rekaan"], a: 0, e: "<i>Asumsi</i> = anggapan dasar yang dianggap benar sebagai titik tolak. <i>Kesimpulan</i> adalah hasil akhir penalaran (kebalikan posisi); <i>rekaan</i> = karangan." },
    { d: 1, q: "DAUR", o: ["Siklus", "Baur", "Produk", "Tingkatan", "Proses"], a: 0, e: "<i>Daur</i> = siklus, putaran yang berulang (daur ulang, daur hidup). <i>Proses</i> terlalu umum; proses tidak harus berulang." },
    { d: 1, q: "KEDAP", o: ["Rapat", "Tembus", "Lambat", "Ragu", "Lembap"], a: 0, e: "<i>Kedap</i> = rapat sehingga tidak tembus (kedap air, kedap suara). <i>Tembus</i> adalah antonim." },
    { d: 1, q: "CANGGIH", o: ["Mutakhir", "Sukar", "Rapi", "Sulit", "Mahal"], a: 0, e: "<i>Canggih</i> = modern, mutakhir, berteknologi tinggi (KBBI juga: rumit). Padanan yang paling tepat dalam konteks umum adalah <i>mutakhir</i>." },
    { d: 1, q: "NABATI", o: ["Tumbuh-tumbuhan", "Hewani", "Hayati", "Kodrati", "Insani"], a: 0, e: "<i>Nabati</i> = berasal dari tumbuhan (minyak nabati). <i>Hewani</i> lawan katanya; <i>hayati</i> = berkaitan dengan hidup (lebih luas)." },
    { d: 1, q: "SUTRADARA", o: ["Pengarah adegan", "Pemimpin acara", "Penulis naskah", "Pengatur skenario", "Produser"], a: 0, e: "<i>Sutradara</i> = orang yang mengarahkan pemain dan adegan. Penulis naskah/skenario adalah profesi berbeda." },
    { d: 1, q: "KISI-KISI", o: ["Terali", "Alat tangkap ikan", "Tabel", "Alat hitung", "Pola kerja"], a: 0, e: "Makna dasar <i>kisi-kisi</i> = terali (jeruji berjajar). Makna turunan: rangka/garis besar materi ujian. <i>Tabel</i> adalah jebakan dari makna turunan." },
    { d: 1, q: "PEMUGARAN", o: ["Perbaikan", "Pembongkaran", "Pembangunan", "Pemeliharaan", "Pelestarian"], a: 0, e: "<i>Pemugaran</i> = perbaikan/renovasi bangunan lama agar kembali baik. <i>Pelestarian</i> adalah tujuannya, bukan padanannya." },
    { d: 1, q: "RANCU", o: ["Kacau", "Canggung", "Jorok", "Semu", "Aneh"], a: 0, e: "<i>Rancu</i> = kacau, tidak teratur, bercampur aduk (kalimat rancu). <i>Canggung</i> berkaitan dengan sikap, bukan susunan." },
    { d: 2, q: "EVOKASI", o: ["Penggugah rasa", "Penilaian", "Perubahan", "Pengungsian", "Izin menetap"], a: 0, e: "Dari <i>evoke</i> = membangkitkan. <i>Evokasi</i> = daya menggugah rasa (pada karya seni). <i>Pengungsian</i> = <i>evakuasi</i> — jebakan bunyi." },
    { d: 2, q: "DIKOTOMI", o: ["Pembagian dua", "Dua kepala", "Kembar", "Dua kekuatan", "Dwifungsi"], a: 0, e: "<i>Dikotomi</i> = pembagian atas dua kelompok yang saling bertentangan (dikotomi hitam-putih). Awalan <i>di-</i> = dua, <i>-tomi</i> = pemotongan." },
    { d: 2, q: "SINE QUA NON", o: ["Harus ada", "Tiada berair", "Kelengkapan", "Selalu negatif", "Pengecualian"], a: 0, e: "Latin: <i>sine qua non</i> = \"tanpanya tidak\" → syarat mutlak yang harus ada." },
    { d: 2, q: "ANDAL", o: ["Tangguh", "Dampak", "Lingkungan", "Bebal", "Cepat"], a: 0, e: "<i>Andal</i> = dapat dipercaya, tangguh (orang andal). <i>Dampak</i> dan <i>lingkungan</i> adalah jebakan dari singkatan AMDAL." },
    { d: 2, q: "NARATIF", o: ["Bersifat cerita", "Puisi", "Terinci", "Timbal balik", "Bersifat gambar"], a: 0, e: "<i>Naratif</i> = bersifat narasi/menceritakan (prosa). <i>Deskriptif</i> = menggambarkan; keduanya jenis teks berbeda." },
    { d: 2, q: "BOGA", o: ["Makanan", "Pakaian kebesaran", "Dekorasi ruang", "Pakaian pengantin", "Rumah"], a: 0, e: "<i>Boga</i> = makanan/santapan (tata boga = seni mengolah makanan)." },
    { d: 2, q: "BALA", o: ["Bencana", "Rapat sekali", "Bantuan", "Pasukan", "Melawan"], a: 0, e: "<i>Bala</i> = bencana/malapetaka (tolak bala). Homonim: <i>bala tentara</i> = pasukan; dalam konteks tunggal, makna utama adalah bencana." },
    { d: 2, q: "TANUR", o: ["Perapian", "Jamur", "Kotoran hewan", "Pakaian kuda", "Perkakas"], a: 0, e: "<i>Tanur</i> = tungku/perapian besar untuk membakar (tanur tinggi di pabrik baja)." },
    { d: 2, q: "WAHANA", o: ["Sarana", "Kebesaran Tuhan", "Ruang angkasa", "Dunia fana", "Eksistensi"], a: 0, e: "<i>Wahana</i> = kendaraan/sarana/alat untuk mencapai tujuan (wahana pendidikan). Jebakan: \"wahana antariksa\" membuat orang memilih ruang angkasa." },
    { d: 2, q: "KESAHIHAN", o: ["Kebenaran", "Keberlakuan", "Kesalahan", "Kematangan", "Kemantapan"], a: 0, e: "<i>Sahih</i> = benar, valid. <i>Kesahihan</i> = validitas/kebenaran." },
    { d: 2, q: "ITERASI", o: ["Perulangan", "Hubungan", "Interaksi", "Sublimasi", "Identifikasi"], a: 0, e: "<i>Iterasi</i> = perulangan proses (istilah matematika/komputasi). <i>Interaksi</i> jebakan bunyi." },
    { d: 2, q: "MOTILITAS", o: ["Kemampuan bergerak", "Angka kematian", "Dorongan", "Sebangsa hewan", "Pukulan"], a: 0, e: "<i>Motilitas</i> (motile) = kemampuan bergerak. <i>Mortalitas</i> = angka kematian — beda satu huruf." },
    { d: 2, q: "FRIKSI", o: ["Perpecahan", "Frustrasi", "Tidak berdaya", "Sedih", "Putus asa"], a: 0, e: "<i>Friksi</i> = gesekan; dalam konteks sosial = perselisihan/perpecahan." },
    { d: 2, q: "TRANSENDENTAL", o: ["Abstrak", "Bergerak", "Berpindah", "Kesinambungan", "Tembus pandang"], a: 0, e: "<i>Transenden</i> = melampaui pengalaman indrawi, tidak konkret → abstrak. <i>Transparan</i> (tembus pandang) jebakan bunyi." },
    { d: 2, q: "DITENGGAK", o: ["Diminum sekaligus", "Disepak ke atas", "Dipotong melintang", "Ditelan sedikit", "Dibuang"], a: 0, e: "<i>Menenggak</i> = meminum dengan mendongakkan kepala, sekali teguk besar." },
    { d: 2, q: "MENGECOH", o: ["Memperdaya", "Mengadu", "Mengakali diri", "Membuat kacau", "Memotong"], a: 0, e: "<i>Mengecoh</i> = menipu/memperdaya (gerakan mengecoh lawan). <i>Membuat kacau</i> adalah akibat, bukan padanan." },
    { d: 2, q: "IMBASAN", o: ["Embusan/pengaruh", "Imajinasi", "Ikatan", "Ilusi", "Isapan"], a: 0, e: "<i>Imbas</i> = embusan angin; kiasan: pengaruh/dampak ikutan (terkena imbas)." },
    { d: 2, q: "ANJUNG", o: ["Panggung/serambi", "Dayung", "Buyung", "Puji", "Angkat"], a: 0, e: "<i>Anjung</i> = bagian rumah yang menonjol/serambi tinggi; <i>anjungan</i> = panggung. Jangan tertukar dengan <i>menyanjung</i> (memuji)." },
    { d: 2, q: "MUDUN", o: ["Beradab", "Problema", "Referensi", "Setuju", "Mufakat"], a: 0, e: "<i>Mudun</i> (Arab) = beradab, maju peradabannya (serumpun dengan <i>madani</i>, <i>tamadun</i>)." },
    { d: 3, q: "PROTESIS", o: ["Organ buatan", "Hipotesis", "Praduga", "Tesis", "Disertasi"], a: 0, e: "<i>Protesis</i> (prosthesis) = anggota tubuh buatan (kaki palsu). Pilihan lain menjebak lewat akhiran <i>-tesis</i>." },
    { d: 3, q: "BUBUT", o: ["Cabut", "Potong", "Poles", "Serpih", "Urut"], a: 0, e: "Makna dasar <i>membubut</i> = mencabut (membubut bulu ayam). Makna teknik (mesin bubut = mengikis logam berputar) adalah makna turunan; dalam soal psikotes klasik kuncinya <i>cabut</i>." },
    { d: 3, q: "ANOMALI", o: ["Penyimpangan", "Keteraturan", "Kelainan jiwa", "Nama samaran", "Keseragaman"], a: 0, e: "<i>Anomali</i> = ketidaknormalan, penyimpangan dari kaidah umum. <i>Anonim</i> (nama samaran) jebakan bunyi." },
    { d: 3, q: "EKSPANSI", o: ["Perluasan", "Pengeluaran", "Penyusutan", "Penjelasan", "Percobaan"], a: 0, e: "<i>Ekspansi</i> = perluasan (wilayah/usaha). <i>Eksplanasi</i> = penjelasan; <i>eksperimen</i> = percobaan — jebakan awalan <i>eks-</i>." },
    { d: 3, q: "HIBRIDA", o: ["Hasil persilangan", "Tanaman hias", "Benih unggul", "Varietas lokal", "Mesin ganda"], a: 0, e: "<i>Hibrida</i> = hasil persilangan dua jenis berbeda. Benih unggul sering hibrida, tetapi tidak sepadan maknanya." },
    { d: 3, q: "KONTEMPLASI", o: ["Perenungan", "Pertentangan", "Penghinaan", "Perlombaan", "Kesepakatan"], a: 0, e: "<i>Kontemplasi</i> = perenungan mendalam. <i>Kontempt</i> (penghinaan) dan <i>kontes</i> jebakan bunyi." },
    { d: 3, q: "PARADOKS", o: ["Pernyataan yang tampak bertentangan", "Contoh teladan", "Keadaan ideal", "Pola pikir", "Keajaiban"], a: 0, e: "<i>Paradoks</i> = pernyataan yang seolah bertentangan dengan pendapat umum/dirinya sendiri namun mengandung kebenaran. <i>Paradigma</i> = pola pikir; <i>paragon</i> = teladan." },
    { d: 3, q: "ORATOR", o: ["Ahli pidato", "Pemain drama", "Penata rias", "Penulis", "Pendengar"], a: 0, e: "<i>Orator</i> = orang yang mahir berpidato. <i>Aktor</i> = pemain drama." },
    { d: 3, q: "SEREBRUM", o: ["Otak besar", "Tulang belakang", "Sumsum", "Jantung", "Saraf tepi"], a: 0, e: "<i>Serebrum</i> = otak besar; <i>serebelum</i> = otak kecil. Kosakata biologi dasar sering muncul di tes BUMN/farmasi." },
    { d: 3, q: "EMPIRIS", o: ["Berdasarkan pengalaman/pengamatan", "Berdasarkan teori", "Bersifat kerajaan", "Berdasarkan wahyu", "Bersifat sementara"], a: 0, e: "<i>Empiris</i> = berdasarkan pengalaman nyata/eksperimen, lawan dari <i>teoretis/apriori</i>. <i>Imperial</i> (kerajaan) jebakan bunyi." },
    { d: 3, q: "DEGRADASI", o: ["Penurunan mutu", "Pemisahan", "Pengangkatan", "Pembusukan", "Pemindahan"], a: 0, e: "<i>Degradasi</i> = kemunduran/penurunan (mutu, pangkat, lahan). <i>Promosi</i> lawannya." },
    { d: 3, q: "AFIRMASI", o: ["Penegasan", "Penolakan", "Perjanjian", "Pengampunan", "Pemisahan"], a: 0, e: "<i>Afirmasi</i> = penegasan/pengukuhan (jawaban afirmatif = ya). Lawan: negasi." },
    { d: 3, q: "RESIDU", o: ["Sisa/endapan", "Tempat tinggal", "Penduduk", "Hasil utama", "Larutan"], a: 0, e: "<i>Residu</i> = sisa, ampas, endapan. <i>Residen</i> = penduduk; <i>residensi</i> = tempat tinggal — jebakan bunyi." },
    { d: 3, q: "VIRTUAL", o: ["Maya", "Nyata", "Berbudi luhur", "Mematikan", "Berputar"], a: 0, e: "<i>Virtual</i> = (seolah) nyata tetapi tidak berwujud fisik → maya. <i>Virtuous</i> = berbudi; <i>virulen</i> = mematikan." },
    { d: 3, q: "OTONOM", o: ["Mandiri", "Otomatis", "Otoriter", "Bawahan", "Tunggal"], a: 0, e: "<i>Otonom</i> = berdiri sendiri, memerintah sendiri. <i>Otomatis</i> dan <i>otoriter</i> jebakan awalan <i>oto-</i>." },
    { d: 3, q: "INTERVENSI", o: ["Campur tangan", "Pertemuan", "Jeda", "Penemuan", "Wawancara"], a: 0, e: "<i>Intervensi</i> = campur tangan pihak luar. <i>Interval</i> = jeda; <i>invensi</i> = penemuan." },
    { d: 3, q: "KOMPREHENSIF", o: ["Menyeluruh", "Ringkas", "Mudah dipahami", "Rumit", "Terbatas"], a: 0, e: "<i>Komprehensif</i> = luas dan lengkap, mencakup semua aspek. <i>Mudah dipahami</i> adalah makna <i>komprehensibel</i> — sering tertukar." },
    { d: 3, q: "EKUILIBRIUM", o: ["Keseimbangan", "Persamaan", "Kesetaraan hak", "Pemerataan", "Kesejajaran"], a: 0, e: "<i>Ekuilibrium</i> = keadaan seimbang (ekonomi, kimia). <i>Ekuitas</i> = kesetaraan/keadilan; <i>ekuasi</i> = persamaan." },
  ];

  /* ------------------------------------------------------------ ANTONIM */
  B.antonim = [
    { d: 1, q: "NOMADEN", o: ["Menetap", "Berpindah", "Pengembara", "Liar", "Bebas"], a: 0, e: "Nomaden = berpindah-pindah. Pilihan b dan c <b>sinonim</b> (jebakan). Lawan: <b>menetap</b> (sedenter)." },
    { d: 1, q: "PROMINEN", o: ["Biasa", "Terkenal", "Mencolok", "Terhormat", "Penting"], a: 0, e: "Prominen = menonjol/terkemuka. Empat pilihan lain sinonim; satu-satunya lawan: <b>biasa</b>." },
    { d: 1, q: "GASAL", o: ["Genap", "Ganjil", "Tunggal", "Pecahan", "Prima"], a: 0, e: "Gasal = ganjil (semester gasal). Lawannya <b>genap</b>. Pilihan b adalah sinonim." },
    { d: 1, q: "MANDIRI", o: ["Bergantung", "Berdikari", "Swadaya", "Otonom", "Bebas"], a: 0, e: "Semua pilihan selain a adalah sinonim mandiri. Lawan: <b>bergantung</b>." },
    { d: 1, q: "SURPLUS", o: ["Defisit", "Kelebihan", "Laba", "Untung", "Cadangan"], a: 0, e: "Surplus = kelebihan (penerimaan > pengeluaran). Lawan: <b>defisit</b> (kekurangan)." },
    { d: 1, q: "KONVEKS", o: ["Cekung", "Cembung", "Datar", "Bulat", "Lengkung"], a: 0, e: "Konveks = cembung; lawannya konkaf = <b>cekung</b>. <i>Datar</i> bukan lawan, melainkan keadaan netral." },
    { d: 1, q: "EKSPLISIT", o: ["Tersirat", "Tersurat", "Jelas", "Gamblang", "Terang"], a: 0, e: "Eksplisit = tersurat/dinyatakan jelas. Lawan: implisit = <b>tersirat</b>." },
    { d: 1, q: "HULU", o: ["Hilir", "Sumber", "Mata air", "Pangkal", "Atas"], a: 0, e: "Hulu = bagian atas sungai/pangkal. Lawan: <b>hilir</b> (muara)." },
    { d: 1, q: "PROGRESIF", o: ["Regresif", "Maju", "Modern", "Berkembang", "Pesat"], a: 0, e: "Progresif = bersifat maju/meningkat. Lawan: <b>regresif</b> (mundur). <i>Konservatif</i> juga sering dipakai sebagai lawan dalam konteks politik, tetapi tidak ada di pilihan." },
    { d: 1, q: "AMATIR", o: ["Profesional", "Pemula", "Awam", "Penggemar", "Bodoh"], a: 0, e: "Amatir = melakukan karena hobi, bukan profesi. Lawan: <b>profesional</b>. <i>Bodoh</i> terlalu jauh dan beda kelas makna." },
    { d: 2, q: "APRIORI", o: ["Aposteriori", "Prasangka", "Dugaan", "Praduga", "Asumsi"], a: 0, e: "Apriori = sebelum pengalaman/bukti. Lawan: <b>aposteriori</b> (setelah pengalaman). Pilihan lain sinonim longgar dari apriori." },
    { d: 2, q: "NADIR", o: ["Zenit", "Titik terendah", "Dasar", "Langka", "Jarang"], a: 0, e: "Nadir = titik terendah (astronomi). Lawan: <b>zenit</b> (titik tertinggi/puncak). Jangan tertukar dengan <i>nadir</i> dalam arti jarang (serapan lain)." },
    { d: 2, q: "DEDUKSI", o: ["Induksi", "Kesimpulan", "Penalaran", "Pengurangan", "Konklusi"], a: 0, e: "Deduksi = dari umum ke khusus. Lawan: <b>induksi</b> (dari khusus ke umum)." },
    { d: 2, q: "SPORADIS", o: ["Terus-menerus", "Jarang", "Kadang-kadang", "Tersebar", "Sesekali"], a: 0, e: "Sporadis = tidak tentu, kadang-kadang, tersebar. Lawan: <b>terus-menerus/kontinu</b>." },
    { d: 2, q: "HETEROGEN", o: ["Homogen", "Beragam", "Majemuk", "Campuran", "Bervariasi"], a: 0, e: "Heterogen = beraneka ragam. Lawan: <b>homogen</b> (sejenis/seragam)." },
    { d: 2, q: "MUTLAK", o: ["Relatif", "Absolut", "Pasti", "Total", "Penuh"], a: 0, e: "Mutlak = absolut, tidak terikat syarat. Lawan: <b>relatif</b> (nisbi, bergantung)." },
    { d: 2, q: "SEKULER", o: ["Religius", "Duniawi", "Kebendaan", "Modern", "Bebas"], a: 0, e: "Sekuler = bersifat duniawi, terpisah dari agama. Lawan: <b>religius/keagamaan</b>." },
    { d: 2, q: "KONKLUSI", o: ["Premis", "Simpulan", "Hasil", "Akhir", "Keputusan"], a: 0, e: "Konklusi = kesimpulan (akhir penalaran). Lawan posisinya: <b>premis</b> (pernyataan awal)." },
    { d: 2, q: "DEFLASI", o: ["Inflasi", "Penurunan harga", "Resesi", "Depresi", "Stagnasi"], a: 0, e: "Deflasi = penurunan harga umum. Lawan: <b>inflasi</b>. Resesi/depresi adalah kondisi ekonomi lain, bukan lawan langsung." },
    { d: 2, q: "VOKAL", o: ["Pendiam", "Lantang", "Konsonan", "Berani bicara", "Nyaring"], a: 0, e: "Dalam konteks sikap, vokal = berani menyuarakan pendapat. Lawan: <b>pendiam</b>. <i>Konsonan</i> adalah lawan dalam konteks huruf — pilih konteks yang membuat sebagian besar pilihan masuk akal." },
    { d: 2, q: "ELASTIS", o: ["Kaku", "Lentur", "Fleksibel", "Lunak", "Kenyal"], a: 0, e: "Elastis = lentur, mudah kembali ke bentuk semula. Lawan: <b>kaku/rigid</b>." },
    { d: 2, q: "ANTAGONIS", o: ["Protagonis", "Penjahat", "Lawan", "Musuh", "Penentang"], a: 0, e: "Antagonis = tokoh penentang. Lawan: <b>protagonis</b> (tokoh utama)." },
    { d: 2, q: "DINAMIS", o: ["Statis", "Aktif", "Bergerak", "Berubah", "Lincah"], a: 0, e: "Dinamis = penuh gerak/perubahan. Lawan: <b>statis</b> (tetap, diam)." },
    { d: 2, q: "PASCA", o: ["Pra", "Sesudah", "Akhir", "Lewat", "Kemudian"], a: 0, e: "Pasca- = sesudah (pascasarjana). Lawan: <b>pra-</b> (sebelum)." },
    { d: 3, q: "BONGSOR", o: ["Kerdil", "Besar", "Tinggi", "Gemuk", "Subur"], a: 0, e: "Bongsor = tumbuh besar/tinggi melebihi usianya. Lawan: <b>kerdil</b>." },
    { d: 3, q: "SEDENTER", o: ["Nomaden", "Menetap", "Duduk", "Pasif", "Diam"], a: 0, e: "Sedenter = menetap (atau gaya hidup banyak duduk). Lawan: <b>nomaden</b>." },
    { d: 3, q: "KENDALA", o: ["Pendukung", "Hambatan", "Rintangan", "Masalah", "Gangguan"], a: 0, e: "Kendala = faktor penghambat. Lawan: <b>pendukung/penunjang</b>." },
    { d: 3, q: "PERINTIS", o: ["Pewaris", "Pelopor", "Pembuka jalan", "Pendiri", "Pionir"], a: 0, e: "Perintis = yang memulai/membuka jalan. Lawan: <b>pewaris/penerus</b> (yang menerima hasil)." },
    { d: 3, q: "SENTRIFUGAL", o: ["Sentripetal", "Menjauhi pusat", "Terpencar", "Berputar", "Memusat"], a: 0, e: "Sentrifugal = menjauhi pusat. Lawan: <b>sentripetal</b> (menuju pusat). Pilihan e (memusat) mendeskripsikan sentripetal tetapi bukan istilahnya; pilih istilah yang sepadan kelasnya." },
    { d: 3, q: "KONTEMPORER", o: ["Kuno", "Masa kini", "Modern", "Mutakhir", "Sezaman"], a: 0, e: "Kontemporer = sezaman/masa kini. Lawan: <b>kuno/klasik</b>." },
    { d: 3, q: "LIBERAL", o: ["Konservatif", "Bebas", "Terbuka", "Toleran", "Longgar"], a: 0, e: "Liberal = bebas/terbuka pada perubahan. Lawan: <b>konservatif</b> (mempertahankan tradisi)." },
    { d: 3, q: "EKSTRINSIK", o: ["Intrinsik", "Luar", "Eksternal", "Tambahan", "Asing"], a: 0, e: "Ekstrinsik = berasal dari luar (motivasi ekstrinsik). Lawan: <b>intrinsik</b> (dari dalam)." },
    { d: 3, q: "SAHIH", o: ["Palsu", "Benar", "Valid", "Absah", "Resmi"], a: 0, e: "Sahih = benar/valid. Lawan: <b>palsu/batil/tidak valid</b>." },
    { d: 3, q: "KOHESI", o: ["Perpecahan", "Kepaduan", "Persatuan", "Ikatan", "Kerekatan"], a: 0, e: "Kohesi = daya rekat/kepaduan kelompok. Lawan: <b>perpecahan/disintegrasi</b>." },
    { d: 3, q: "PREMATUR", o: ["Terlambat", "Dini", "Awal", "Cepat", "Belum matang"], a: 0, e: "Prematur = sebelum waktunya. Lawan: <b>terlambat/lewat waktu</b>." },
    { d: 3, q: "SINKRON", o: ["Sumbang", "Selaras", "Serempak", "Sesuai", "Seirama"], a: 0, e: "Sinkron = selaras/serempak. Lawan: <b>sumbang/tidak selaras</b>." },
    { d: 3, q: "IMIGRASI", o: ["Emigrasi", "Transmigrasi", "Urbanisasi", "Perpindahan", "Kedatangan"], a: 0, e: "Imigrasi = masuk ke suatu negara. Lawan: <b>emigrasi</b> (keluar dari negara asal)." },
    { d: 3, q: "ALTRUIS", o: ["Egois", "Dermawan", "Penolong", "Peduli", "Sukarelawan"], a: 0, e: "Altruis = mementingkan orang lain. Lawan: <b>egois</b>." },
    { d: 3, q: "PERIFERAL", o: ["Sentral", "Pinggiran", "Tepi", "Luar", "Sekunder"], a: 0, e: "Periferal = berada di pinggir/tidak utama. Lawan: <b>sentral/pusat</b>." },
    { d: 3, q: "TENTATIF", o: ["Pasti", "Sementara", "Belum tetap", "Percobaan", "Ragu"], a: 0, e: "Tentatif = sementara, masih bisa berubah. Lawan: <b>pasti/final/definitif</b>." },
  ];

  /* ------------------------------------------------------------ ANALOGI */
  B.analogi = [
    { d: 1, q: "KEPALA : HELM = …", o: ["Rumah : atap", "Sabut : kelapa", "Jari : cincin", "Album : foto", "Kaki : kaus"], a: 0, e: "Helm <b>melindungi</b> kepala <b>dari atas</b>. Atap melindungi rumah dari atas. Cincin menghias (bukan melindungi); kaus menutupi tetapi bukan pelindung." },
    { d: 1, q: "RAMBUT : GUNDUL = …", o: ["Pakaian : bugil", "Bulu : cabut", "Mobil : mogok", "Botak : kepala", "Lantai : licin"], a: 0, e: "Keadaan <b>tanpa</b> rambut = gundul; tanpa pakaian = <b>bugil</b>. Pilihan d membalik arah hubungan." },
    { d: 1, q: "SENAPAN : BERBURU = …", o: ["Perangkap : menangkap", "Kapal : berlabuh", "Kereta : langsir", "Pancing : ikan", "Parang : mengasah"], a: 0, e: "Alat : tujuan penggunaannya. Perangkap digunakan untuk menangkap. Pancing : ikan adalah alat : objek (bukan kegiatan)." },
    { d: 1, q: "LAPAR : NASI = …", o: ["Haus : air", "Mual : obat", "Mengantuk : melamun", "Bosan : tidur", "Membaca : gambar"], a: 0, e: "Kebutuhan : pemuasnya. Lapar diatasi nasi, haus diatasi air." },
    { d: 1, q: "PEDAS : CABAI = manis : …", o: ["Sakarin", "Gadis", "Manisan", "Teh botol", "Kecap"], a: 0, e: "Cabai adalah <b>sumber rasa</b> pedas; sakarin sumber rasa manis. Manisan/kecap adalah produk yang manis, bukan sumber pemanis." },
    { d: 1, q: "PANAS : API = …", o: ["Terang : matahari", "Hujan : awan", "Abu : arang", "Hangat : listrik", "Dingin : beku"], a: 0, e: "Sifat : sumbernya. Api sumber panas; matahari sumber terang. Hujan : awan adalah hasil : asal (arah terbalik dan bukan sifat)." },
    { d: 1, q: "BATA : TANAH LIAT = …", o: ["Beton : semen", "Batu : pasir", "Tembikar : keramik", "Bunga : buah", "Kertas : buku"], a: 0, e: "Produk : bahan dasar. Beton dibuat dari semen. Kertas : buku terbalik (bahan : produk)." },
    { d: 1, q: "MATA : TELINGA = …", o: ["Lidah : hidung", "Jari : tangan", "Kaki : paha", "Lutut : siku", "Perut : dada"], a: 0, e: "Keduanya <b>alat indra</b> (penglihatan : pendengaran). Lidah : hidung = pengecap : pencium. Lutut : siku adalah sendi, bukan indra." },
    { d: 2, q: "SEMINAR : SARJANA = …", o: ["Perpustakaan : peneliti", "Akademi : taruna", "Rumah sakit : pasien", "Ruang pengadilan : saksi", "Konservatori : seniman"], a: 0, e: "Tempat/kegiatan ilmiah : orang yang <b>aktif memanfaatkannya</b>. Sarjana berseminar; peneliti memanfaatkan perpustakaan. Akademi : taruna adalah tempat pendidikan : peserta didik (hubungan lebih dekat 'mendidik', bukan 'memanfaatkan')." },
    { d: 2, q: "FIKTIF : FAKTA = …", o: ["Dongeng : peristiwa", "Dagelan : sandiwara", "Dugaan : rekaan", "Data : estimasi", "Rencana : proyeksi"], a: 0, e: "Antonim: khayalan : kenyataan. Dongeng (rekaan) : peristiwa (nyata). Dugaan : rekaan keduanya tidak nyata." },
    { d: 2, q: "UANG : PUNDI-PUNDI = …", o: ["Air : tempayan", "Hubungan : jambangan", "Gelas : nampan", "Buku : percetakan", "Rokok : asbak"], a: 0, e: "Isi : wadah penyimpanannya. Air disimpan di tempayan. Rokok : asbak adalah sisa : tempat buang (bukan menyimpan)." },
    { d: 2, q: "POHON : BUAH = …", o: ["Sapi : susu", "Domba : daging", "Telur : ayam", "Jentik : nyamuk", "Ketam : sapit"], a: 0, e: "Penghasil : produk yang dihasilkan <b>tanpa membunuhnya</b>. Sapi menghasilkan susu (pohon tetap hidup menghasilkan buah). Domba : daging mensyaratkan penyembelihan. Telur : ayam terbalik." },
    { d: 2, q: "KULIT : SISIK = …", o: ["Atap : genteng", "Tegel : lantai", "Rumah : kamar", "Keramik : mozaik", "Dinding : cat"], a: 0, e: "Permukaan pelindung : <b>satuan kecil penyusunnya</b> yang bertumpuk. Kulit ikan tersusun dari sisik; atap tersusun dari genteng. Tegel : lantai arahnya terbalik." },
    { d: 2, q: "METEOROLOGI : CUACA = …", o: ["Patologi : penyakit", "Astronomi : fisika", "Gerontologi : keturunan", "Pedagogik : sekolah", "Antropologi : fosil"], a: 0, e: "Ilmu : objek kajiannya. Patologi mempelajari penyakit. Gerontologi = penuaan; antropologi = manusia (fosil = paleontologi)." },
    { d: 2, q: "TUNTUTAN : SANTUNAN = …", o: ["Permintaan : pemberian", "Undian : hadiah", "Persediaan : penawaran", "Rusak : ganti rugi", "Tabungan : pembelanjaan"], a: 0, e: "Tindakan meminta : respons memberi. Tuntutan dijawab dengan santunan; permintaan dijawab dengan pemberian." },
    { d: 2, q: "DIAMETER : LINGKARAN = …", o: ["Diagonal : segi empat", "Luas : panjang", "Tinggi : segitiga", "Sudut : tegak lurus", "Radius : busur"], a: 0, e: "Garis yang <b>menghubungkan dua titik terjauh melalui pusat</b> : bangunnya. Diagonal pada segi empat memiliki peran serupa." },
    { d: 2, q: "ES : AIR = air : …", o: ["Uap", "Mendidih", "Membeku", "Cair", "Kabut"], a: 0, e: "Perubahan wujud ketika dipanaskan: es → air → <b>uap</b>. <i>Mendidih</i> adalah prosesnya, bukan wujudnya." },
    { d: 2, q: "SARUNG TANGAN : PETINJU = …", o: ["Mikroskop : bakteriolog", "Apoteker : obat", "Oftalmolog : mata", "Dokter : pasien", "Analis : data"], a: 0, e: "Perlengkapan kerja : profesinya. Petinju memakai sarung tangan; bakteriolog memakai mikroskop. Pilihan lain berpola profesi : objek (arah terbalik)." },
    { d: 2, q: "PEDATI : KUDA = pesawat terbang : …", o: ["Baling-baling", "Sayap", "Pramugari", "Pilot", "Landasan"], a: 0, e: "Kendaraan : <b>sumber tenaga penggerak</b>. Kuda menggerakkan pedati; baling-baling/mesin menggerakkan pesawat. Pilot mengendalikan, bukan menggerakkan." },
    { d: 2, q: "BERAS : NASI GORENG = kayu : …", o: ["Kursi tamu", "Pasak", "Gelondongan", "Papan", "Tripleks"], a: 0, e: "Bahan mentah : <b>produk akhir yang sudah diolah penuh</b> (nasi goreng = hasil dua tahap pengolahan). Kursi tamu adalah produk jadi dari kayu. Papan/tripleks masih setengah jadi." },
    { d: 2, q: "RAMALAN : ASTROLOGI = bangsa : …", o: ["Etnologi", "Sosiologi", "Antropologi", "Demografi", "Psikologi"], a: 0, e: "Objek : ilmu yang mengkajinya. Etnologi mengkaji bangsa/suku. Demografi mengkaji kependudukan (statistik), bukan bangsa." },
    { d: 2, q: "RAS : NEGRO = bentuk : …", o: ["Oval", "Tinggi", "Hitam", "Keriting", "Kekar"], a: 0, e: "Kategori : salah satu anggotanya. Negro adalah salah satu ras; oval adalah salah satu bentuk. <i>Hitam</i> adalah warna, <i>tinggi</i> adalah ukuran." },
    { d: 2, q: "RUMPUT : LAPANGAN = bintang : …", o: ["Langit", "Nebula", "Angkasa", "Malam", "Antariksa"], a: 0, e: "Yang menutupi/menghiasi : tempatnya tampak. Rumput menghampar di lapangan; bintang bertaburan di langit." },
    { d: 2, q: "LAMPU : GELAP = makanan : …", o: ["Lapar", "Kenyang", "Penuh", "Gizi", "Mulas"], a: 0, e: "Benda : <b>kondisi yang dihilangkannya</b>. Lampu menghilangkan gelap; makanan menghilangkan lapar." },
    { d: 2, q: "ANTISEPTIK : KUMAN = singa : …", o: ["Rusa", "Peluru", "Sirkus", "Menerkam", "Binatang"], a: 0, e: "Pembunuh : yang dibunuhnya. Antiseptik membunuh kuman; singa memangsa rusa." },
    { d: 3, q: "KOMPONIS : SIMFONI = …", o: ["Arsitek : cetak biru", "Pelukis : kuas", "Penyair : rima", "Aktor : panggung", "Penari : musik"], a: 0, e: "Pencipta : <b>karya rancangan</b> yang dihasilkannya. Komponis menulis simfoni; arsitek menghasilkan cetak biru. Kuas, panggung, musik adalah alat/tempat/pengiring." },
    { d: 3, q: "GEMPA : SEISMOGRAF = …", o: ["Suhu : termometer", "Hujan : payung", "Angin : layang-layang", "Cahaya : lampu", "Darah : jarum"], a: 0, e: "Fenomena : <b>alat pengukurnya</b>. Termometer mengukur suhu. Payung melindungi dari hujan (bukan mengukur)." },
    { d: 3, q: "ULAT : KEPOMPONG : KUPU-KUPU = …", o: ["Bayi : remaja : dewasa", "Benih : pohon : buah", "Telur : ayam : daging", "Pagi : siang : malam", "Padi : beras : nasi"], a: 0, e: "Tahapan <b>metamorfosis satu individu</b> yang sama. Bayi → remaja → dewasa adalah tahap hidup satu individu. Padi → beras → nasi adalah pengolahan (bukan pertumbuhan); benih → pohon → buah: buah bukan tahap pohon." },
    { d: 3, q: "SKEPTIS : PERCAYA = …", o: ["Apatis : peduli", "Optimis : harapan", "Kritis : analisis", "Naif : lugu", "Fanatik : taat"], a: 0, e: "Sifat : <b>hal yang tidak dimilikinya</b> (antonim sifat-perilaku). Orang skeptis tidak mudah percaya; orang apatis tidak peduli." },
    { d: 3, q: "TEMBAKAU : ROKOK : KANKER = …", o: ["Gula : permen : diabetes", "Susu : keju : protein", "Tebu : gula : manis", "Kedelai : tempe : gizi", "Anggur : wine : pesta"], a: 0, e: "Bahan : produk : <b>dampak kesehatan negatif</b> dari konsumsi berlebih. Gula → permen → diabetes mengikuti pola yang sama. Pilihan lain berakhir pada manfaat/sifat, bukan penyakit." },
    { d: 3, q: "KAPAL : NAKHODA = …", o: ["Pesawat : pilot", "Mobil : montir", "Kereta : rel", "Sepeda : pedal", "Bus : kondektur"], a: 0, e: "Kendaraan : <b>pengemudi utamanya</b>. Kondektur bukan pengemudi; montir memperbaiki." },
    { d: 3, q: "MOZAIK : KEPING = …", o: ["Novel : kata", "Orkestra : konduktor", "Lukisan : bingkai", "Puisi : penyair", "Film : layar"], a: 0, e: "Karya utuh : <b>unsur kecil penyusunnya</b>. Mozaik tersusun dari keping; novel tersusun dari kata. Konduktor memimpin, bingkai membatasi." },
    { d: 3, q: "HIPERBOLA : BERLEBIHAN = …", o: ["Ironi : sindiran", "Metafora : hewan", "Personifikasi : manusia", "Simile : persamaan", "Litotes : panjang"], a: 0, e: "Majas : <b>ciri khasnya</b>. Hiperbola melebih-lebihkan; ironi menyindir. Simile menggunakan kata pembanding (bukan 'persamaan' sebagai ciri); litotes justru merendahkan." },
    { d: 3, q: "PENSIL : TUMPUL = …", o: ["Pisau : majal", "Baju : kusut", "Sepatu : kotor", "Buku : sobek", "Jam : rusak"], a: 0, e: "Benda : <b>kondisi hilangnya ketajaman</b> akibat pemakaian. Pisau majal = tumpul. Pilihan lain adalah kerusakan jenis lain." },
    { d: 3, q: "ARKEOLOG : ARTEFAK = …", o: ["Detektif : petunjuk", "Dokter : obat", "Guru : murid", "Petani : cangkul", "Akuntan : pajak"], a: 0, e: "Profesi : <b>objek yang dicari dan dianalisis</b> untuk mengungkap sesuatu. Arkeolog mencari artefak; detektif mencari petunjuk. Dokter memberi obat (alat), bukan mencarinya." },
    { d: 3, q: "SUNYI : SUARA = …", o: ["Gelap : cahaya", "Hening : malam", "Sepi : kota", "Diam : bicara", "Kosong : ruang"], a: 0, e: "Keadaan : <b>hal yang ketiadaannya menyebabkan keadaan itu</b>. Sunyi = tiada suara; gelap = tiada cahaya. Diam : bicara adalah tindakan, bukan keadaan ruang." },
    { d: 3, q: "KARBURATOR : MESIN = …", o: ["Jantung : tubuh", "Ban : mobil", "Pintu : rumah", "Kaca : jendela", "Tombol : baju"], a: 0, e: "Komponen <b>vital internal yang mengatur aliran</b> (bahan bakar) : sistemnya. Jantung mengatur aliran darah dalam tubuh. Ban/pintu bukan komponen pengatur internal." },
    { d: 3, q: "BUNGLON : WARNA = …", o: ["Oportunis : pendirian", "Cumi : tinta", "Landak : duri", "Kucing : cakar", "Burung : bulu"], a: 0, e: "Pelaku : <b>hal yang diubahnya untuk menyesuaikan keadaan</b>. Bunglon mengubah warna; oportunis mengubah pendirian. Cumi menyemprotkan tinta (tidak mengubahnya)." },
    { d: 3, q: "KALORI : ENERGI = …", o: ["Desibel : bunyi", "Meter : jarak jauh", "Gram : timbangan", "Liter : air", "Jam : waktu luang"], a: 0, e: "Satuan : <b>besaran yang diukurnya</b>. Kalori mengukur energi; desibel mengukur intensitas bunyi. Gram : timbangan = satuan : alat (salah); liter : air = satuan : contoh zat (terlalu sempit)." },
    { d: 3, q: "DEHIDRASI : AIR = …", o: ["Anemia : zat besi", "Obesitas : lemak", "Insomnia : tidur", "Demam : panas", "Flu : virus"], a: 0, e: "Kondisi medis : <b>zat yang kekurangannya menyebabkan kondisi itu</b>. Dehidrasi = kurang air; anemia = kurang zat besi/hemoglobin. Insomnia : tidur mirip tetapi tidur bukan 'zat'; obesitas justru kelebihan lemak." },
  ];

  /* ------------------------------------------------------------ WACANA (TRUE/FALSE/CANNOT SAY) */
  const TFC = ["Benar", "Salah", "Tidak dapat disimpulkan"];
  const psgAir = "Tim ahli gizi mempublikasikan penelitian yang menunjukkan bahwa minum air sebelum makan dapat mengurangi konsumsi kalori. Peserta yang minum segelas air 30 menit sebelum makan mengonsumsi lebih sedikit kalori secara keseluruhan dan melaporkan merasa kenyang lebih cepat. Studi ini menyarankan bahwa hidrasi dapat membantu mengatur nafsu makan dan mencegah makan berlebihan.";
  const psgKantor = "Sejak menerapkan kebijakan kerja hibrida pada Januari, PT Nusantara mencatat penurunan biaya listrik kantor sebesar 18% dan penurunan tingkat keterlambatan karyawan. Survei internal menunjukkan 72% karyawan merasa lebih produktif, meskipun manajer departemen keuangan melaporkan koordinasi antar tim menjadi lebih lambat. Perusahaan berencana mengevaluasi kebijakan ini pada akhir tahun.";
  const psgKopi = "Harga kopi arabika di pasar dunia naik 30% dalam enam bulan terakhir akibat gagal panen di Brasil, produsen terbesar dunia. Indonesia, yang merupakan produsen terbesar keempat, justru mengalami panen yang baik tahun ini. Namun, sebagian besar petani kecil di Indonesia telah menjual hasil panen mereka ke pengepul dengan harga kontrak sebelum kenaikan terjadi, sehingga keuntungan dari kenaikan harga lebih banyak dinikmati oleh eksportir.";
  const psgMobil = "Penjualan mobil listrik di Indonesia tumbuh 300% pada tahun lalu, meskipun pangsa pasarnya masih di bawah 5% dari total penjualan mobil. Pemerintah memberikan insentif pajak untuk mobil listrik yang dirakit di dalam negeri dengan kandungan lokal minimal 40%. Analis memperkirakan harga baterai akan turun 15% per tahun, yang akan membuat mobil listrik mencapai harga setara mobil konvensional pada 2030.";
  const psgDigital = "Sebuah bank nasional menutup 120 kantor cabang dalam dua tahun terakhir seiring meningkatnya transaksi melalui aplikasi seluler, yang kini mencakup 85% dari seluruh transaksi nasabah. Bank tersebut menyatakan tidak melakukan pemutusan hubungan kerja; karyawan cabang yang ditutup dialihkan ke layanan pelanggan digital dan penjualan. Nasabah berusia di atas 60 tahun tercatat sebagai kelompok yang paling jarang menggunakan aplikasi.";
  B.wacana = [
    { d: 1, p: psgAir, q: "Minum air sebelum makan dapat membantu mengonsumsi lebih sedikit kalori.", o: TFC, a: 0, noShuffle: true, e: "Teks menyatakan langsung: minum air sebelum makan <i>dapat mengurangi konsumsi kalori</i>. Tingkat kepastian pernyataan (\"dapat membantu\") sama dengan teks. <b>Benar</b>." },
    { d: 2, p: psgAir, q: "Peserta penelitian berhasil menurunkan berat badan.", o: TFC, a: 2, noShuffle: true, e: "Teks hanya membahas <b>kalori</b> dan rasa kenyang, tidak menyebut berat badan. Walau masuk akal, informasinya tidak ada → <b>Tidak dapat disimpulkan</b>." },
    { d: 2, p: psgAir, q: "Peserta merasa lebih lapar setelah minum air sebelum makan.", o: TFC, a: 1, noShuffle: true, e: "Teks menyatakan peserta <i>merasa kenyang lebih cepat</i>. Pernyataan bertentangan → <b>Salah</b>." },
    { d: 3, p: psgAir, q: "Hidrasi adalah faktor utama yang mengatur nafsu makan.", o: TFC, a: 2, noShuffle: true, e: "Teks: hidrasi <i>dapat membantu</i> mengatur nafsu makan. Pernyataan memperkuat menjadi <i>faktor utama</i> — klaim lebih kuat daripada teks → <b>Tidak dapat disimpulkan</b>." },
    { d: 1, p: psgKantor, q: "Biaya listrik kantor PT Nusantara turun setelah kebijakan kerja hibrida diterapkan.", o: TFC, a: 0, noShuffle: true, e: "Dinyatakan eksplisit: penurunan biaya listrik 18%. <b>Benar</b>." },
    { d: 2, p: psgKantor, q: "Mayoritas karyawan PT Nusantara merasa kurang produktif dengan kerja hibrida.", o: TFC, a: 1, noShuffle: true, e: "72% merasa <i>lebih</i> produktif → mayoritas merasa lebih produktif. Pernyataan bertentangan → <b>Salah</b>." },
    { d: 2, p: psgKantor, q: "PT Nusantara akan menghentikan kebijakan kerja hibrida pada akhir tahun.", o: TFC, a: 2, noShuffle: true, e: "Teks hanya menyebut rencana <i>mengevaluasi</i>, bukan menghentikan. <b>Tidak dapat disimpulkan</b>." },
    { d: 3, p: psgKantor, q: "Kerja hibrida menyebabkan karyawan lebih jarang terlambat.", o: TFC, a: 2, noShuffle: true, e: "Teks mencatat <i>penurunan tingkat keterlambatan</i> <b>sejak</b> kebijakan diterapkan, tetapi tidak menyatakan hubungan sebab-akibat. Korelasi waktu ≠ penyebab. Pernyataan \"menyebabkan\" adalah klaim kausal yang tidak didukung → <b>Tidak dapat disimpulkan</b>. (Soal tipe ini membedakan peserta tingkat lanjut.)" },
    { d: 3, p: psgKantor, q: "Setidaknya satu manajer menilai ada dampak negatif dari kebijakan hibrida.", o: TFC, a: 0, noShuffle: true, e: "Manajer keuangan melaporkan koordinasi lebih lambat — itu dampak negatif. <b>Benar</b>." },
    { d: 1, p: psgKopi, q: "Brasil adalah produsen kopi arabika terbesar di dunia.", o: TFC, a: 0, noShuffle: true, e: "Teks: \"Brasil, produsen terbesar dunia\". <b>Benar</b>." },
    { d: 2, p: psgKopi, q: "Petani kecil Indonesia menikmati sebagian besar keuntungan dari kenaikan harga kopi.", o: TFC, a: 1, noShuffle: true, e: "Teks: keuntungan <i>lebih banyak dinikmati eksportir</i> karena petani sudah menjual dengan harga kontrak. <b>Salah</b>." },
    { d: 2, p: psgKopi, q: "Indonesia mengekspor kopi ke Brasil.", o: TFC, a: 2, noShuffle: true, e: "Tidak ada informasi tentang tujuan ekspor. <b>Tidak dapat disimpulkan</b>." },
    { d: 3, p: psgKopi, q: "Produksi kopi Indonesia tahun ini lebih besar daripada tahun lalu.", o: TFC, a: 2, noShuffle: true, e: "Teks menyebut \"panen yang baik\", tetapi tidak membandingkan dengan tahun lalu secara eksplisit; \"baik\" tidak sama dengan \"lebih besar\". <b>Tidak dapat disimpulkan</b>." },
    { d: 3, p: psgKopi, q: "Ada paling sedikit tiga negara yang memproduksi kopi lebih banyak daripada Indonesia.", o: TFC, a: 0, noShuffle: true, e: "Indonesia produsen terbesar <b>keempat</b> → tiga negara di atasnya. <b>Benar</b> (diturunkan secara logis)." },
    { d: 1, p: psgMobil, q: "Mobil listrik menyumbang kurang dari 5% penjualan mobil di Indonesia tahun lalu.", o: TFC, a: 0, noShuffle: true, e: "Dinyatakan: pangsa pasar masih di bawah 5%. <b>Benar</b>." },
    { d: 2, p: psgMobil, q: "Semua mobil listrik yang dijual di Indonesia mendapat insentif pajak.", o: TFC, a: 1, noShuffle: true, e: "Insentif hanya untuk yang <i>dirakit dalam negeri dengan kandungan lokal ≥ 40%</i>. Kata \"semua\" membuat pernyataan bertentangan dengan syarat tersebut → <b>Salah</b>." },
    { d: 3, p: psgMobil, q: "Pada 2030 harga mobil listrik akan setara dengan mobil konvensional.", o: TFC, a: 2, noShuffle: true, e: "Itu adalah <i>perkiraan analis</i> dengan asumsi penurunan harga baterai, bukan fakta yang dinyatakan teks. Pernyataan menjadikannya kepastian → <b>Tidak dapat disimpulkan</b>." },
    { d: 3, p: psgMobil, q: "Jumlah mobil listrik yang terjual tahun lalu empat kali lipat tahun sebelumnya.", o: TFC, a: 0, noShuffle: true, e: "Tumbuh 300% berarti bertambah 3× dari nilai awal → total menjadi 4× (100% + 300%). <b>Benar</b>. Banyak peserta keliru mengira 300% = tiga kali lipat." },
    { d: 1, p: psgDigital, q: "Bank tersebut memberhentikan karyawan dari cabang yang ditutup.", o: TFC, a: 1, noShuffle: true, e: "Teks: tidak melakukan PHK; karyawan dialihkan. <b>Salah</b>." },
    { d: 2, p: psgDigital, q: "Nasabah lanjut usia lebih memilih bertransaksi di kantor cabang.", o: TFC, a: 2, noShuffle: true, e: "Teks hanya menyebut mereka <i>paling jarang menggunakan aplikasi</i>; tidak disebut apa yang mereka pilih (bisa ATM, telepon, dll.). <b>Tidak dapat disimpulkan</b>." },
    { d: 3, p: psgDigital, q: "Kurang dari seperlima transaksi nasabah dilakukan di luar aplikasi seluler.", o: TFC, a: 0, noShuffle: true, e: "85% via aplikasi → 15% di luar aplikasi; 15% < 20% (seperlima). <b>Benar</b>." },
    { d: 3, p: psgDigital, q: "Penutupan cabang menyebabkan peningkatan transaksi melalui aplikasi.", o: TFC, a: 2, noShuffle: true, e: "Teks menyatakan penutupan terjadi <i>seiring</i> meningkatnya transaksi digital — arah sebab-akibat yang tersirat justru sebaliknya (transaksi digital naik → cabang ditutup), dan tidak dinyatakan tegas. <b>Tidak dapat disimpulkan</b>." },
    // Kalimat acak & ide pokok
    { d: 2, q: "Susunlah menjadi paragraf padu:<br>(1) Akibatnya, banyak UMKM beralih ke penjualan daring.<br>(2) Pandemi memaksa pusat perbelanjaan tutup selama berbulan-bulan.<br>(3) Peralihan ini ternyata bertahan bahkan setelah pembatasan dicabut.<br>(4) Omzet toko fisik pun turun drastis.", o: ["2-4-1-3", "2-1-4-3", "4-2-1-3", "1-2-4-3", "2-4-3-1"], a: 0, e: "Kalimat pembuka harus berdiri sendiri tanpa kata rujukan: (2). \"Omzet… pun turun\" (4) adalah dampak langsung tutupnya mal. \"Akibatnya\" (1) merujuk pada turunnya omzet. \"Peralihan ini\" (3) merujuk pada peralihan di (1). <b>2-4-1-3</b>." },
    { d: 3, q: "Susunlah menjadi paragraf padu:<br>(1) Namun, tanpa pelatihan yang memadai, alat tersebut justru memperlambat pekerjaan.<br>(2) Oleh karena itu, perusahaan perlu menganggarkan pelatihan bersamaan dengan pembelian alat.<br>(3) Banyak perusahaan berinvestasi pada perangkat lunak baru untuk meningkatkan produktivitas.<br>(4) Karyawan menghabiskan waktu untuk mencari cara memakai fitur dasar.", o: ["3-1-4-2", "3-4-1-2", "1-3-4-2", "3-1-2-4", "4-3-1-2"], a: 0, e: "(3) pembuka umum. (1) \"Namun\" membalikkan harapan di (3) dan menyebut \"alat tersebut\". (4) memerinci bagaimana pekerjaan melambat. (2) \"Oleh karena itu\" menyimpulkan. <b>3-1-4-2</b>. Urutan 3-4-1-2 salah karena (4) belum bisa merujuk \"alat tersebut\" sebelum (1) menyebut masalahnya." },
    { d: 2, q: "<i>Kebiasaan membaca di Indonesia masih rendah. Survei menunjukkan rata-rata orang Indonesia membaca kurang dari satu buku per tahun. Akses ke perpustakaan yang terbatas menjadi salah satu penyebab. Selain itu, harga buku dianggap mahal oleh sebagian masyarakat. Pemerintah mulai menggalakkan perpustakaan keliling untuk menjangkau daerah terpencil.</i><br>Ide pokok paragraf tersebut adalah …", o: ["Rendahnya kebiasaan membaca di Indonesia", "Harga buku yang mahal", "Program perpustakaan keliling pemerintah", "Rata-rata orang Indonesia membaca satu buku per tahun", "Keterbatasan akses perpustakaan"], a: 0, e: "Kalimat pertama adalah kalimat utama; kalimat lain memberi data, penyebab, dan upaya penanganannya. Pilihan b, c, e adalah <b>penjelas</b>; pilihan d salah data (kurang dari satu buku)." },
    { d: 3, q: "<i>Meskipun kecerdasan buatan mampu menyusun laporan keuangan dalam hitungan detik, auditor manusia tetap dibutuhkan. Mesin bekerja berdasarkan data historis sehingga sulit mengenali skema kecurangan yang benar-benar baru. Selain itu, pertanggungjawaban hukum atas opini audit tidak dapat dibebankan kepada perangkat lunak. Dengan demikian, peran auditor bergeser dari pengolah data menjadi penilai risiko dan pengambil keputusan akhir.</i><br>Simpulan yang paling tepat adalah …", o: ["Kecerdasan buatan mengubah peran auditor, bukan menggantikannya", "Kecerdasan buatan tidak berguna dalam audit keuangan", "Auditor manusia lebih cepat daripada mesin dalam menyusun laporan", "Skema kecurangan baru tidak dapat dideteksi siapa pun", "Perangkat lunak akan segera menggantikan auditor"], a: 0, e: "Kalimat terakhir (\"Dengan demikian…\") menyatakan pergeseran peran. Pilihan b terlalu ekstrem (teks mengakui kemampuan AI); c bertentangan (AI lebih cepat); d menggeneralisasi; e bertentangan dengan keseluruhan argumen." },
  ];
})(window.PSI);

/* js/data/bank_numerik.js */
/* Bank soal numerik */
(function (P) {
  P.BANK = P.BANK || {};
  const B = (P.BANK.numerik = {});

  /* ------------------------------------------------------------ DERET ANGKA (tulisan tangan) */
  B["deret-angka"] = [
    { d: 1, q: "2, 4, 6, 8, 10, …", o: ["12", "11", "14", "13", "16"], a: 0, e: "Selisih tetap +2 (deret aritmetika). 10 + 2 = <b>12</b>." },
    { d: 1, q: "5, 7, 10, 12, 15, …", o: ["17", "16", "18", "19", "20"], a: 0, e: "Dua deret berselang: 5, 10, 15 (+5) dan 7, 12, <b>17</b> (+5). Atau pola selisih +2, +3, +2, +3, +2 → 15 + 2 = 17." },
    { d: 1, q: "3, 5, 8, 12, 17, …", o: ["23", "22", "21", "24", "25"], a: 0, e: "Selisih bertingkat: +2, +3, +4, +5, lalu +6 → 17 + 6 = <b>23</b>." },
    { d: 1, q: "1, 4, 8, 11, 15, 18, …", o: ["22", "21", "20", "23", "24"], a: 0, e: "Operasi bergantian +3, +4, +3, +4, +3, lalu +4 → <b>22</b>." },
    { d: 1, q: "81, 27, 9, 3, …", o: ["1", "0", "2", "1/2", "3"], a: 0, e: "Setiap suku dibagi 3 (deret geometri rasio 1/3). 3 ÷ 3 = <b>1</b>." },
    { d: 1, q: "1, 2, 3, 2, 4, 6, 4, 8, …", o: ["12", "10", "8", "6", "16"], a: 0, e: "Kelompok tiga: (1,2,3), (2,4,6), (4,8,<b>12</b>). Tiap blok adalah kelipatan: ×1, ×2, ×4 dari (1,2,3)." },
    { d: 2, q: "50, 40, 31, 23, 16, …", o: ["10", "12", "9", "11", "8"], a: 0, e: "Selisih mengecil: −10, −9, −8, −7, lalu −6 → 16 − 6 = <b>10</b>." },
    { d: 2, q: "2, 4, 2, 4, 6, 4, 6, 8, 6, 8, 10, 8, …", o: ["10", "6", "12", "9", "11"], a: 0, e: "Blok tiga: (2,4,2) (4,6,4) (6,8,6) (8,10,8) → blok berikut (10,12,10). Suku selanjutnya <b>10</b>." },
    { d: 2, q: "2, 5, 7, 3, 6, 8, 4, …, …", o: ["7, 9", "5, 6", "6, 7", "7, 8", "6, 8"], a: 0, e: "Blok tiga: (2,5,7), (3,6,8), (4,<b>7,9</b>) — tiap posisi bertambah 1 antar blok." },
    { d: 2, q: "14, 10, 6, 13, 9, 5, 12, …", o: ["8", "6", "9", "5", "11"], a: 0, e: "Blok tiga dengan selisih −4 di dalam blok: (14,10,6) (13,9,5) (12,<b>8</b>,4). Awal tiap blok turun 1." },
    { d: 2, q: "9, 5, 1, 2, 10, 6, 2, 3, 11, 7, …", o: ["3", "4", "12", "8", "7"], a: 0, e: "Blok empat: (9,5,1,2) (10,6,2,3) (11,7,<b>3</b>,4). Setiap posisi naik 1 antar blok." },
    { d: 2, q: "26, 5, 9, 25, 6, 11, 24, 7, …", o: ["13", "9", "10", "11", "12"], a: 0, e: "Tiga deret berselang: 26, 25, 24 (−1); 5, 6, 7 (+1); 9, 11, <b>13</b> (+2)." },
    { d: 2, q: "11, 19, 10, 20, 9, 21, 8, …, …", o: ["22, 7", "23, 22", "7, 24", "7, 22", "22, 6"], a: 0, e: "Dua deret berselang: 11, 10, 9, 8, 7 (−1) dan 19, 20, 21, 22 (+1). Setelah 8 datang <b>22</b>, lalu <b>7</b>." },
    { d: 2, q: "1, 9, 2, 2, 9, 3, 3, 9, 4, 4, …", o: ["9", "5", "4", "6", "10"], a: 0, e: "Blok (n, 9, n+1): (1,9,2) (2,9,3) (3,9,4) (4,<b>9</b>,5). 9 adalah pemisah tetap." },
    { d: 2, q: "3, 4, 4, 5, 5, 5, 6, 6, 6, …", o: ["6", "7", "5", "8", "9"], a: 0, e: "Angka n muncul (n−2) kali: 3 sekali, 4 dua kali, 5 tiga kali, 6 <b>empat kali</b>. Suku ke-10 masih 6." },
    { d: 2, q: "1, 3, 4, 7, 11, 18, …", o: ["29", "25", "27", "28", "30"], a: 0, e: "Tiap suku = jumlah dua suku sebelumnya (pola Fibonacci/Lucas): 11 + 18 = <b>29</b>." },
    { d: 2, q: "2, 5, 10, 17, 26, …", o: ["37", "35", "36", "38", "40"], a: 0, e: "n² + 1: 1+1, 4+1, 9+1, 16+1, 25+1, lalu 36+1 = <b>37</b>. Atau selisih bertingkat +3,+5,+7,+9,+11." },
    { d: 2, q: "1, 8, 27, 64, …", o: ["125", "81", "100", "128", "216"], a: 0, e: "Bilangan kubik: 1³, 2³, 3³, 4³, 5³ = <b>125</b>." },
    { d: 2, q: "3, 6, 5, 10, 9, 18, 17, …", o: ["34", "16", "35", "36", "19"], a: 0, e: "Operasi bergantian ×2 lalu −1: 3→6→5→10→9→18→17→<b>34</b>." },
    { d: 3, q: "11, 19, 27, 9, 17, 25, 7, …, …", o: ["15, 23", "15, 22", "23, 15", "22, 15", "26, 23"], a: 0, e: "Blok tiga dengan +8 di dalam blok: (11,19,27) (9,17,25) (7,<b>15,23</b>). Awal blok turun 2." },
    { d: 3, q: "13, 14, 13, 14, 11, 12, 11, 12, 15, 16, 15, 16, 13, …, …, …", o: ["14, 13, 14", "11, 15, 13", "12, 16, 14", "14, 15, 13", "13, 14, 13"], a: 0, e: "Blok empat berpola (a, a+1, a, a+1): a = 13, 11, 15, 13, … Blok terakhir dimulai 13 → <b>14, 13, 14</b>." },
    { d: 3, q: "5, 6, 7, 5, 6, 7, 8, 5, 6, 7, 8, 9, …, …", o: ["5, 6", "10, 11", "9, 10", "10, 9", "6, 7"], a: 0, e: "Blok yang memanjang: (5,6,7) (5,6,7,8) (5,6,7,8,9) lalu blok baru (5,6,7,8,9,10) → dimulai <b>5, 6</b>." },
    { d: 3, q: "1, 7, 7, 2, 8, 6, 3, 9, …", o: ["5", "6", "7", "4", "8"], a: 0, e: "Tiga deret berselang: 1,2,3 (+1); 7,8,9 (+1); 7,6,<b>5</b> (−1)." },
    { d: 3, q: "4, 9, 25, 49, 121, …", o: ["169", "144", "125", "143", "196"], a: 0, e: "Kuadrat bilangan prima: 2², 3², 5², 7², 11², lalu 13² = <b>169</b>. Pengecoh 144 = 12² (12 bukan prima)." },
    { d: 3, q: "1, 2, 6, 24, 120, …", o: ["720", "240", "600", "620", "840"], a: 0, e: "Faktorial: ×2, ×3, ×4, ×5, lalu ×6 → <b>720</b>." },
    { d: 3, q: "2, 3, 5, 9, 17, 33, …", o: ["65", "49", "66", "64", "57"], a: 0, e: "Tiap suku = 2× sebelumnya − 1: 33×2−1 = <b>65</b>. Atau selisih 1, 2, 4, 8, 16, 32 (menggandakan)." },
    { d: 3, q: "100, 98, 94, 88, 80, …", o: ["70", "72", "68", "74", "76"], a: 0, e: "Selisih −2, −4, −6, −8, lalu −10 → <b>70</b>." },
    { d: 3, q: "1, 1, 2, 4, 3, 9, 4, 16, 5, …", o: ["25", "6", "20", "24", "36"], a: 0, e: "Dua deret berselang: 1,2,3,4,5 dan kuadratnya 1,4,9,16,<b>25</b>." },
    { d: 3, q: "7, 8, 10, 13, 17, 22, …", o: ["28", "27", "26", "29", "30"], a: 0, e: "Selisih bertingkat +1, +2, +3, +4, +5, lalu +6 → <b>28</b>." },
    { d: 3, q: "6, 11, 21, 41, 81, …", o: ["161", "121", "160", "162", "151"], a: 0, e: "Tiap suku = 2× sebelumnya − 1: 81×2−1 = <b>161</b>. Selisih 5, 10, 20, 40, 80." },
    { d: 3, q: "2, 12, 36, 80, 150, …", o: ["252", "210", "240", "260", "294"], a: 0, e: "n² + n³ = n²(n+1): 1·2, 4·3, 9·4, 16·5, 25·6, lalu 36·7 = <b>252</b>. Alternatif: selisih 10, 24, 44, 70 → selisih kedua 14, 20, 26 → +32 → 102 → 150+102 = 252." },
    { d: 3, q: "0, 3, 8, 15, 24, 35, …", o: ["48", "46", "47", "49", "50"], a: 0, e: "n² − 1: 0, 3, 8, 15, 24, 35, lalu 49 − 1 = <b>48</b>." },
  ];

  /* ------------------------------------------------------------ DERET HURUF */
  B["deret-huruf"] = [
    { d: 1, q: "A, C, E, G, …", o: ["I", "H", "J", "K", "F"], a: 0, e: "Lompat 2 huruf (1, 3, 5, 7 → 9). Huruf ke-9 = <b>I</b>." },
    { d: 1, q: "D, F, H, J, …", o: ["L", "K", "M", "N", "I"], a: 0, e: "4, 6, 8, 10 → 12 = <b>L</b>. Dari acuan J=10, tambah 2." },
    { d: 1, q: "Z, X, V, T, …", o: ["R", "S", "Q", "U", "P"], a: 0, e: "Mundur 2: 26, 24, 22, 20 → 18 = <b>R</b> (T=20, mundur 2)." },
    { d: 2, q: "A, M, N, B, O, P, C, …", o: ["Q", "D", "R", "P", "E"], a: 0, e: "Dua deret: A, B, C (+1) diselingi pasangan berurutan M-N, O-P, lalu <b>Q</b>-R." },
    { d: 2, q: "A, B, C, I, J, D, E, F, I, J, …", o: ["G", "K", "L", "H", "M"], a: 0, e: "\"I, J\" adalah pemisah tetap. Deret utama: A B C | D E F | <b>G</b> H I." },
    { d: 2, q: "D, D, F, F, H, H, J, J, …", o: ["L", "K", "M", "N", "J"], a: 0, e: "Pasangan huruf dengan lompat 2: D, F, H, J, lalu <b>L</b> (10 + 2 = 12)." },
    { d: 2, q: "A, B, D, G, K, …", o: ["P", "O", "N", "Q", "M"], a: 0, e: "Selisih bertingkat +1, +2, +3, +4, lalu +5: K(11) + 5 = 16 = <b>P</b>." },
    { d: 2, q: "A, Z, B, Y, C, X, …", o: ["D", "W", "E", "V", "Y"], a: 0, e: "Dua deret berselang: A, B, C, <b>D</b> (maju) dan Z, Y, X, W (mundur). Suku ke-7 ada di deret maju." },
    { d: 2, q: "B, E, H, K, …", o: ["N", "M", "O", "L", "P"], a: 0, e: "Lompat 3: 2, 5, 8, 11 → 14 = <b>N</b>." },
    { d: 3, q: "A, B, C, C, D, E, F, F, F, G, H, I, I, I, I, …", o: ["J", "I", "K", "H", "L"], a: 0, e: "Blok tiga huruf berurutan, lalu huruf terakhirnya diulang (jumlah pengulangan bertambah: 2, 3, 4). Setelah I×4 datang blok baru <b>J</b>, K, L, L, L, L, L." },
    { d: 3, q: "C, F, I, L, O, …", o: ["R", "Q", "P", "S", "T"], a: 0, e: "Kelipatan 3: 3, 6, 9, 12, 15 → 18 = <b>R</b>." },
    { d: 3, q: "A, C, F, J, O, …", o: ["U", "T", "S", "V", "R"], a: 0, e: "Selisih +2, +3, +4, +5, lalu +6: O(15) + 6 = 21 = <b>U</b>." },
    { d: 3, q: "Z, A, Y, B, X, C, W, …", o: ["D", "V", "E", "U", "X"], a: 0, e: "Dua deret berselang: Z, Y, X, W (mundur) dan A, B, C, <b>D</b> (maju). Suku ke-8 dari deret maju." },
    { d: 3, q: "A1, C3, E5, G7, …", o: ["I9", "H8", "I8", "J9", "H9"], a: 0, e: "Huruf lompat 2 (A, C, E, G, <b>I</b>) dan angka ganjil (1, 3, 5, 7, <b>9</b>) → I9." },
    { d: 3, q: "AZ, BY, CX, DW, …", o: ["EV", "EU", "FV", "EW", "FU"], a: 0, e: "Pasangan dari dua ujung alfabet: huruf ke-n dan huruf ke-(27−n). E(5) berpasangan dengan V(22) → <b>EV</b>." },
    { d: 3, q: "B, C, E, G, K, M, …", o: ["Q", "O", "P", "N", "R"], a: 0, e: "Posisi bilangan prima: 2, 3, 5, 7, 11, 13, lalu 17 = <b>Q</b>." },
  ];

  /* ------------------------------------------------------------ ARITMATIKA */
  B.aritmatika = [
    { d: 1, q: "(55 + 30)² = …", o: ["7225", "7125", "9025", "8025", "6225"], a: 0, e: "85². Trik akhiran 5: 8 × 9 = 72, tulis 25 → <b>7225</b>." },
    { d: 1, q: "28 adalah berapa persen dari 70?", o: ["40%", "50%", "30%", "25%", "20%"], a: 0, e: "28/70 = 4/10 = 0,4 = <b>40%</b>." },
    { d: 1, q: "Berapakah 33% dari 163?", o: ["53,79", "54,33", "543", "5,37", "48,9"], a: 0, e: "Perkirakan: 1/3 × 163 ≈ 54,3; karena 33% sedikit kurang dari 1/3, jawabannya sedikit di bawah 54,3 → <b>53,79</b>. Hitungan: 163 × 0,33 = 53,79." },
    { d: 1, q: "4,036 : 0,04 = …", o: ["100,9", "1,009", "10,09", "10,9", "109"], a: 0, e: "Geser koma dua digit: 403,6 : 4 = <b>100,9</b>. Cek masuk akal: dibagi angka kecil → hasil jauh lebih besar." },
    { d: 1, q: "0,25² = …", o: ["0,0625", "0,0025", "0,625", "6,25", "0,5"], a: 0, e: "25² = 625; dua desimal × 2 = empat desimal → <b>0,0625</b>." },
    { d: 1, q: "15 = 37,5% dari …", o: ["40", "35", "45", "37,5", "42,5"], a: 0, e: "37,5% = 3/8. 3/8 × N = 15 → N = 15 × 8/3 = <b>40</b>." },
    { d: 1, q: "1/16 = berapa persen?", o: ["6,25%", "16,25%", "1,65%", "0,625%", "62,5%"], a: 0, e: "1/16 = 0,0625 = <b>6,25%</b>. Ingat 1/8 = 12,5%, setengahnya 6,25%." },
    { d: 1, q: "√(6² + 8²) = …", o: ["10", "14", "48", "6,93", "100"], a: 0, e: "36 + 64 = 100 → √100 = <b>10</b>. Tripel Pythagoras 6-8-10." },
    { d: 2, q: "√(2 − 0,56) + √(1 − 0,64) = …", o: ["1,80", "1,34", "1,70", "1,96", "2,01"], a: 0, e: "√1,44 + √0,36 = 1,2 + 0,6 = <b>1,8</b>." },
    { d: 2, q: "Jika p = 2 dan q = 3 serta r = p² + 2pq + q², maka pqr = …", o: ["150", "25", "75", "50", "6"], a: 0, e: "r = (p + q)² = 25. pqr = 2 × 3 × 25 = <b>150</b>." },
    { d: 2, q: "0,875 : 1/4 = …", o: ["3,5", "0,75", "0,70", "0,21875", "0,56"], a: 0, e: "Dibagi 1/4 = dikali 4: 0,875 × 4 = <b>3,5</b>." },
    { d: 2, q: "304,09 : 64,7 ≈ …", o: ["4,70", "0,407", "4,07", "0,47", "47"], a: 0, e: "Perkiraan: 300 : 65 ≈ 4,6 → pilihan terdekat <b>4,70</b>. Verifikasi: 64,7 × 4,7 = 304,09 ✔." },
    { d: 2, q: "6,5 adalah berapa persen dari 6?", o: ["108,33%", "92,30%", "83,33%", "8,33%", "38,33%"], a: 0, e: "6,5/6 = 1,0833 → <b>108,33%</b>. Lebih dari 100% karena 6,5 > 6." },
    { d: 2, q: "Berapakah 6/7 dari 87,5%?", o: ["0,75", "75", "7,5", "6,5", "0,65"], a: 0, e: "87,5% = 7/8. (6/7) × (7/8) = 6/8 = <b>0,75</b>." },
    { d: 2, q: "√(1 − 0,51) + √(1 − 0,36) = …", o: ["1,50", "0,92", "0,85", "0,72", "2,85"], a: 0, e: "√0,49 + √0,64 = 0,7 + 0,8 = <b>1,5</b>." },
    { d: 2, q: "Jika p = 4, q = 3, r = (p + 2q)/(pq), maka (p + q)/r = …", o: ["8,4", "2,8", "70/36", "6", "5 10/12"], a: 0, e: "r = (4 + 6)/12 = 10/12 = 5/6. (p+q)/r = 7 ÷ 5/6 = 7 × 6/5 = 42/5 = <b>8,4</b>." },
    { d: 2, q: "2 1/4 : 4/11 = …", o: ["6 3/16", "6 5/8", "8 3/4", "36/44", "7/16"], a: 0, e: "9/4 × 11/4 = 99/16 = <b>6 3/16</b>." },
    { d: 2, q: "Berapakah 66,67% dari 963,7?", o: ["642,5", "635,58", "64,20", "645,2", "321,2"], a: 0, e: "66,67% ≈ 2/3. 963,7 × 2/3 = <b>642,47 ≈ 642,5</b>." },
    { d: 2, q: "3 adalah berapa persen dari 20?", o: ["15%", "0,15%", "6,67%", "0,6%", "60%"], a: 0, e: "3/20 = 0,15 = <b>15%</b>. Kalikan pembilang-penyebut dengan 5: 15/100." },
    { d: 2, q: "1,036 : 0,04 = …", o: ["25,9", "25,09", "259", "2,59", "209,9"], a: 0, e: "103,6 : 4 = <b>25,9</b>." },
    { d: 2, q: "√10 + √25 = …", o: ["≈ 8,16", "√35", "35", "≈ 7,5", "≈ 5,92"], a: 0, e: "√10 ≈ 3,16; √25 = 5 → <b>≈ 8,16</b>. √a + √b ≠ √(a+b) — jebakan klasik." },
    { d: 3, q: "2 × 15 − (2/3)² × 3 1/3 = …", o: ["28 14/27", "29 1/3", "28 8/27", "29 5/9", "27 13/27"], a: 0, e: "(2/3)² = 4/9. 4/9 × 10/3 = 40/27. 30 − 40/27 = (810 − 40)/27 = 770/27 = <b>28 14/27</b>. Kerjakan pangkat dulu, lalu perkalian, baru pengurangan (urutan operasi)." },
    { d: 3, q: "Jika 3ˣ = 81 dan 2ʸ = 32, maka x · y = …", o: ["20", "9", "16", "13", "12"], a: 0, e: "3⁴ = 81 → x = 4. 2⁵ = 32 → y = 5. x·y = <b>20</b>." },
    { d: 3, q: "0,2 × 0,3 × 0,5 : 0,03 = …", o: ["1", "0,1", "10", "0,01", "0,3"], a: 0, e: "0,2 × 0,3 = 0,06; × 0,5 = 0,03; : 0,03 = <b>1</b>." },
    { d: 3, q: "(0,5)³ + (0,5)² = …", o: ["0,375", "0,25", "0,125", "0,5", "0,625"], a: 0, e: "0,125 + 0,25 = <b>0,375</b> (= 3/8)." },
    { d: 3, q: "Jika a = 1/2, b = 1/3, c = 1/4, maka (a − b) : (b − c) = …", o: ["2", "1/2", "1", "3/2", "2/3"], a: 0, e: "a − b = 1/6; b − c = 1/12. (1/6) : (1/12) = <b>2</b>." },
    { d: 3, q: "12,5% dari 12,5% dari 640 = …", o: ["10", "80", "20", "1,25", "100"], a: 0, e: "12,5% = 1/8. 640/8 = 80; 80/8 = <b>10</b>." },
    { d: 3, q: "√0,0144 + √1,44 + √144 = …", o: ["13,32", "14,52", "13,2", "133,2", "12,132"], a: 0, e: "0,12 + 1,2 + 12 = <b>13,32</b>. Jumlah desimal dibagi dua saat diakar." },
    { d: 3, q: "Jika x + 1/x = 3, maka x² + 1/x² = …", o: ["7", "9", "11", "6", "8"], a: 0, e: "Kuadratkan: x² + 2 + 1/x² = 9 → x² + 1/x² = <b>7</b>. Bentuk ini sering muncul di tes BUMN/bank." },
    { d: 3, q: "45% dari 80 + 80% dari 45 = …", o: ["72", "36", "60", "90", "54"], a: 0, e: "Keduanya sama (a% dari b = b% dari a) = 36 masing-masing → <b>72</b>." },
    { d: 3, q: "(999 × 999) + 999 = …", o: ["999.000", "998.001", "1.000.000", "999.999", "998.999"], a: 0, e: "Faktorkan: 999 × (999 + 1) = 999 × 1000 = <b>999.000</b>. Hindari perkalian panjang." },
    { d: 3, q: "2⁵ × 5⁵ : 10³ = …", o: ["100", "10", "1000", "1", "50"], a: 0, e: "2⁵ × 5⁵ = 10⁵. 10⁵ : 10³ = 10² = <b>100</b>." },
    { d: 3, q: "Jika 2x − 3 = 11 dan 3y + 2 = 20, maka x² − y² = …", o: ["13", "11", "−13", "85", "49"], a: 0, e: "x = 7, y = 6. 49 − 36 = <b>13</b>. Atau (x−y)(x+y) = 1 × 13." },
    { d: 3, q: "1/2 + 1/6 + 1/12 + 1/20 = …", o: ["4/5", "3/4", "5/6", "7/10", "1"], a: 0, e: "Teleskopik: 1/(n(n+1)) = 1/n − 1/(n+1). Jumlah = 1 − 1/5 = <b>4/5</b>." },
    { d: 3, q: "Rata-rata lima bilangan adalah 24. Jika satu bilangan dibuang, rata-ratanya menjadi 22. Bilangan yang dibuang adalah …", o: ["32", "28", "30", "26", "34"], a: 0, e: "Jumlah awal 5 × 24 = 120; jumlah akhir 4 × 22 = 88. Dibuang = 120 − 88 = <b>32</b>." },
  ];

  /* ------------------------------------------------------------ SOAL CERITA & NUMERICAL REASONING */
  const tblKue = `<table class="small"><tr><th>Kue</th><th>Tepung (g)</th><th>Gula (g)</th><th>Mentega (g)</th><th>Krim (g)</th><th>Harga jual ($)</th></tr>
<tr><td>A</td><td>400</td><td>10</td><td>30</td><td>100</td><td>5,75</td></tr><tr><td>B</td><td>800</td><td>15</td><td>50</td><td>250</td><td>9,90</td></tr><tr><td>C</td><td>600</td><td>12</td><td>35</td><td>150</td><td>7,50</td></tr><tr><td>D</td><td>750</td><td>14</td><td>40</td><td>200</td><td>8,25</td></tr></table>
<p class="small mt-1">Harga bahan per kg: Tepung $3, Gula $5, Mentega $20, Krim $15, Selai $8, Telur $40.</p>`;
  const tblCabang = `<table class="small"><tr><th>Cabang</th><th>Penjualan 2024 (juta)</th><th>Penjualan 2025 (juta)</th><th>Jumlah karyawan 2025</th></tr>
<tr><td>Jakarta</td><td>1.200</td><td>1.380</td><td>46</td></tr><tr><td>Surabaya</td><td>800</td><td>920</td><td>40</td></tr><tr><td>Medan</td><td>500</td><td>450</td><td>25</td></tr><tr><td>Makassar</td><td>300</td><td>390</td><td>15</td></tr></table>`;
  B.cerita = [
    { d: 1, q: "Sebuah kolam taman berkapasitas 1.200 liter. Selang mengalirkan 0,6 liter per detik. Berapa menit waktu untuk mengisi kolam hingga 80% kapasitas?", o: ["26,7 menit", "24,6 menit", "25,1 menit", "27,8 menit", "29,3 menit"], a: 0, e: "80% × 1.200 = 960 L. 960 ÷ 0,6 = 1.600 detik = 1.600/60 = <b>26,67 menit</b>." },
    { d: 1, q: "Harga sebuah barang Rp250.000. Saat diskon 20%, kemudian diskon tambahan 10% dari harga setelah diskon pertama. Harga akhir?", o: ["Rp180.000", "Rp175.000", "Rp200.000", "Rp172.500", "Rp185.000"], a: 0, e: "250.000 × 0,8 = 200.000; × 0,9 = <b>180.000</b>. Diskon berantai 20% + 10% ≠ 30% (yang akan memberi 175.000)." },
    { d: 1, q: "Mobil menempuh 180 km dalam 2 jam 30 menit. Kecepatan rata-ratanya?", o: ["72 km/jam", "90 km/jam", "60 km/jam", "75 km/jam", "80 km/jam"], a: 0, e: "2 jam 30 menit = 2,5 jam. 180 ÷ 2,5 = <b>72 km/jam</b>." },
    { d: 1, q: "Seorang pedagang membeli 50 kg beras seharga Rp600.000 dan menjualnya Rp14.000/kg. Persentase keuntungannya?", o: ["16,7%", "14,3%", "20%", "12,5%", "15%"], a: 0, e: "Penjualan 50 × 14.000 = 700.000. Untung 100.000. % untung = 100.000/600.000 = <b>16,7%</b> (terhadap modal, bukan harga jual)." },
    { d: 2, q: "Andi menyelesaikan pekerjaan dalam 6 hari, Budi dalam 3 hari. Jika bekerja bersama, pekerjaan selesai dalam …", o: ["2 hari", "4,5 hari", "3 hari", "1,5 hari", "9 hari"], a: 0, e: "Per hari: 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 pekerjaan → <b>2 hari</b>." },
    { d: 2, q: "Umur ayah 3 kali umur anak. Lima tahun lagi, umur ayah 2,5 kali umur anak. Umur anak sekarang?", o: ["15 tahun", "10 tahun", "12 tahun", "20 tahun", "18 tahun"], a: 0, e: "Misal anak = x, ayah = 3x. (3x + 5) = 2,5(x + 5) → 3x + 5 = 2,5x + 12,5 → 0,5x = 7,5 → x = <b>15</b>." },
    { d: 2, q: "Perbandingan uang Ani : Budi = 2 : 3 dan Budi : Cici = 4 : 5. Jika jumlah uang mereka Rp700.000, uang Cici adalah …", o: ["Rp300.000", "Rp240.000", "Rp160.000", "Rp350.000", "Rp280.000"], a: 0, e: "Samakan Budi: A:B:C = 8:12:15 (total 35). Cici = 15/35 × 700.000 = <b>300.000</b>." },
    { d: 2, q: "Dua kereta berangkat dari kota berjarak 300 km saling mendekat, masing-masing 70 km/jam dan 80 km/jam. Setelah berapa jam mereka berpapasan?", o: ["2 jam", "1,5 jam", "2,5 jam", "3 jam", "4 jam"], a: 0, e: "Kecepatan relatif 150 km/jam. 300 ÷ 150 = <b>2 jam</b>." },
    { d: 2, q: "Harga saham naik 25% lalu turun 20%. Dibanding harga awal, harga akhirnya …", o: ["Sama", "Naik 5%", "Turun 5%", "Naik 4%", "Turun 4%"], a: 0, e: "100 → 125 → 125 × 0,8 = 100. <b>Sama</b>. (Naik 20% lalu turun 20% akan turun 4%; kombinasi 25%/20% justru kembali ke awal.)" },
    { d: 2, q: "Rata-rata nilai 20 siswa adalah 70. Rata-rata 10 siswa lainnya 85. Rata-rata keseluruhan 30 siswa?", o: ["75", "77,5", "72,5", "80", "78"], a: 0, e: "(20×70 + 10×85)/30 = (1.400 + 850)/30 = 2.250/30 = <b>75</b>. Bukan (70+85)/2 = 77,5." },
    { d: 2, q: "Sebuah tangki terisi 3/5. Setelah ditambah 12 liter, terisi 4/5. Kapasitas tangki?", o: ["60 liter", "48 liter", "72 liter", "36 liter", "80 liter"], a: 0, e: "Selisih 4/5 − 3/5 = 1/5 = 12 L → kapasitas <b>60 L</b>." },
    { d: 2, q: tblKue + "Berapa biaya bahan untuk membuat Kue A?", o: ["$3,35", "$3,05", "$2,85", "$3,95", "$4,25"], a: 0, e: "0,4×3 + 0,01×5 + 0,03×20 + 0,1×15 = 1,20 + 0,05 + 0,60 + 1,50 = <b>$3,35</b>." },
    { d: 3, q: tblKue + "Berapa gram telur harus ditambahkan ke Kue A agar kue tersebut tidak lagi menghasilkan keuntungan?", o: ["60 g", "65 g", "125 g", "160 g", "240 g"], a: 0, e: "Laba A = 5,75 − 3,35 = $2,40. Telur $40/kg = $0,04/g. 2,40 ÷ 0,04 = <b>60 g</b>." },
    { d: 3, q: tblKue + "Kue manakah yang memiliki margin keuntungan (laba ÷ harga jual) tertinggi?", o: ["A", "B", "C", "D", "Semua sama"], a: 0, e: "Biaya: A $3,35 (margin 2,40/5,75 = 41,7%); B = 2,4+0,075+1,0+3,75 = $7,225 (margin 2,675/9,90 = 27,0%); C = 1,8+0,06+0,7+2,25 = $4,81 (margin 2,69/7,50 = 35,9%); D = 2,25+0,07+0,8+3,0 = $6,12 (margin 2,13/8,25 = 25,8%). Tertinggi <b>A</b>." },
    { d: 2, q: tblCabang + "Cabang mana yang mengalami pertumbuhan penjualan tertinggi (dalam persen) dari 2024 ke 2025?", o: ["Makassar", "Jakarta", "Surabaya", "Medan", "Jakarta dan Surabaya sama"], a: 0, e: "Jakarta +15%, Surabaya +15%, Medan −10%, Makassar +30%. Tertinggi <b>Makassar</b>. Jangan tertipu nilai absolut (Jakarta +180 juta terbesar secara nominal)." },
    { d: 3, q: tblCabang + "Berapa penjualan per karyawan tahun 2025 untuk cabang Surabaya, dan berapa selisihnya dengan Jakarta?", o: ["23 juta; lebih rendah 7 juta", "23 juta; lebih tinggi 7 juta", "20 juta; lebih rendah 10 juta", "30 juta; sama", "18 juta; lebih rendah 12 juta"], a: 0, e: "Surabaya 920/40 = 23 juta. Jakarta 1.380/46 = 30 juta. Selisih <b>7 juta lebih rendah</b>." },
    { d: 3, q: tblCabang + "Jika total penjualan 2026 ditargetkan naik 10% dari 2025 dan Medan ditargetkan kembali ke angka 2024, berapa kenaikan yang harus dicapai gabungan tiga cabang lainnya?", o: ["264 juta", "314 juta", "214 juta", "364 juta", "180 juta"], a: 0, e: "Total 2025 = 3.140 juta; target 2026 = 3.454 (naik 314). Medan naik 450→500 (+50). Sisa kenaikan = 314 − 50 = <b>264 juta</b>." },
    { d: 3, q: "Staf layanan pelanggan menghabiskan rata-rata 3,4 jam/hari menelepon. (1) Staf melayani 25–45 pelanggan per hari. Berapa rata-rata waktu per pelanggan? Mana yang benar?", o: ["Data tidak cukup untuk nilai pasti; hanya diperoleh rentang 4,5–8,2 menit", "Tepat 6,8 menit", "Tepat 4,53 menit", "Tepat 8,16 menit", "Data cukup: 5 menit"], a: 0, e: "204 menit ÷ 45 = 4,53; ÷ 25 = 8,16. Karena jumlah pelanggan hanya rentang, waktu per pelanggan juga hanya rentang. Pada format <i>data sufficiency</i> jawabannya: \"kedua pernyataan digabung pun tidak cukup\" untuk nilai pasti." },
    { d: 3, q: "Seorang pekerja dibayar Rp120.000 untuk 8 jam kerja normal dan 1,5 kali tarif per jam untuk lembur. Jika ia menerima Rp187.500 dalam sehari, berapa jam lemburnya?", o: ["3 jam", "2 jam", "4 jam", "2,5 jam", "5 jam"], a: 0, e: "Tarif normal 15.000/jam; lembur 22.500/jam. Lembur = (187.500 − 120.000)/22.500 = 67.500/22.500 = <b>3 jam</b>." },
    { d: 3, q: "Campuran 40 liter larutan garam 10% dicampur dengan larutan garam 25% sehingga konsentrasi akhir 20%. Berapa liter larutan 25% yang ditambahkan?", o: ["80 liter", "40 liter", "60 liter", "100 liter", "20 liter"], a: 0, e: "4 + 0,25x = 0,2(40 + x) → 4 + 0,25x = 8 + 0,2x → 0,05x = 4 → x = <b>80</b>." },
    { d: 3, q: "Sebuah proyek direncanakan 30 pekerja selesai 24 hari. Setelah 6 hari, 6 pekerja berhenti. Berapa hari lagi proyek selesai?", o: ["22,5 hari", "18 hari", "20 hari", "24 hari", "21 hari"], a: 0, e: "Total kerja 30×24 = 720 orang-hari. Terpakai 6×30 = 180; sisa 540. Dengan 24 pekerja: 540/24 = <b>22,5 hari</b>." },
    { d: 3, q: "Harga sebuah laptop setelah pajak 11% adalah Rp13.320.000. Harga sebelum pajak?", o: ["Rp12.000.000", "Rp11.854.800", "Rp12.500.000", "Rp11.900.000", "Rp12.200.000"], a: 0, e: "13.320.000 ÷ 1,11 = <b>12.000.000</b>. Kesalahan umum: 13.320.000 × 0,89 (mengurangi 11% dari harga akhir)." },
    { d: 3, q: "Populasi kota bertambah 10% per tahun. Jika sekarang 200.000 jiwa, berapa populasi dua tahun lagi?", o: ["242.000", "240.000", "220.000", "244.000", "250.000"], a: 0, e: "200.000 × 1,1 × 1,1 = <b>242.000</b>. Bunga majemuk: bukan +20%." },
    { d: 3, q: "Sebuah bak diisi keran A dalam 4 jam dan dikosongkan saluran B dalam 6 jam. Jika keduanya dibuka bersamaan dari kosong, bak penuh dalam …", o: ["12 jam", "10 jam", "2,4 jam", "24 jam", "5 jam"], a: 0, e: "Per jam: 1/4 − 1/6 = 3/12 − 2/12 = 1/12 → <b>12 jam</b>." },
    { d: 3, q: "Jarak dua kota 240 km. Motor berangkat pukul 07.00 dengan 40 km/jam. Mobil menyusul pukul 08.00 dengan 60 km/jam dari kota yang sama. Pukul berapa mobil menyusul motor?", o: ["10.00", "09.30", "10.30", "11.00", "09.00"], a: 0, e: "Pukul 08.00 motor sudah 40 km di depan. Selisih kecepatan 20 km/jam → 2 jam → pukul <b>10.00</b> (pada km 120, sebelum tiba)." },
    { d: 3, q: "Toko memberi diskon 30% dan masih untung 5% dari harga modal. Jika harga label Rp300.000, berapa modalnya?", o: ["Rp200.000", "Rp210.000", "Rp220.500", "Rp189.000", "Rp195.000"], a: 0, e: "Harga jual = 300.000 × 0,7 = 210.000 = 1,05 × modal → modal = <b>200.000</b>." },
  ];

  /* ------------------------------------------------------------ PERBANDINGAN KUANTITATIF */
  const K = ["x > y", "x < y", "x = y", "Hubungan x dan y tidak dapat ditentukan"];
  B.kuantitatif = [
    { d: 1, q: "x = 1/16 dan y = 16%", o: K, a: 1, noShuffle: true, e: "1/16 = 0,0625; 16% = 0,16. <b>x < y</b>." },
    { d: 1, q: "2ˣ = 64 dan 3ʸ = 81", o: K, a: 0, noShuffle: true, e: "x = 6, y = 4 → <b>x > y</b>." },
    { d: 1, q: "x = 0,178 + 6,017 + 5,278925 dan y = 12", o: K, a: 1, noShuffle: true, e: "Jumlahkan kasar: 0,18 + 6,02 + 5,28 = 11,48 < 12 → <b>x < y</b>." },
    { d: 1, q: "x = berat total p kotak yang masing-masing q kg; y = berat total q kotak yang masing-masing p kg", o: K, a: 2, noShuffle: true, e: "x = pq, y = qp → <b>x = y</b> (perkalian komutatif)." },
    { d: 2, q: "x = −(3)⁶ dan y = (−3)⁶", o: K, a: 1, noShuffle: true, e: "x = −729 (negatif); y = +729 (pangkat genap dari negatif → positif). <b>x < y</b>." },
    { d: 2, q: "a = 2, b = −2; x = (a − b)² dan y = (a + b)²", o: K, a: 0, noShuffle: true, e: "x = 4² = 16; y = 0² = 0. <b>x > y</b>." },
    { d: 2, q: "p sembarang bilangan; x = −3p² + 5 dan y = −2p² + 7", o: K, a: 1, noShuffle: true, e: "x − y = −p² − 2 < 0 untuk setiap p. <b>x < y</b> selalu." },
    { d: 2, q: "p sembarang bilangan; x = 3p² + 4 dan y = 2p + 10", o: K, a: 3, noShuffle: true, e: "p = 0: x=4 < y=10. p = 3: x=31 > y=16. Berubah → <b>tidak dapat ditentukan</b>." },
    { d: 2, q: "x = 1/4 berbanding 3/5 (dalam bentuk paling sederhana) dan y = 5 : 12", o: K, a: 2, noShuffle: true, e: "(1/4) : (3/5) = (1/4) × (5/3) = 5/12 → <b>x = y</b>." },
    { d: 2, q: "x = 25% dari 80 dan y = 80% dari 25", o: K, a: 2, noShuffle: true, e: "Keduanya 20 → <b>x = y</b>." },
    { d: 2, q: "x = √0,09 dan y = 0,09", o: K, a: 0, noShuffle: true, e: "√0,09 = 0,3 > 0,09. Akar bilangan antara 0 dan 1 lebih besar dari bilangan itu. <b>x > y</b>." },
    { d: 2, q: "x = (0,5)³ dan y = (0,5)²", o: K, a: 1, noShuffle: true, e: "0,125 < 0,25. Pangkat lebih tinggi dari pecahan <1 justru lebih kecil. <b>x < y</b>." },
    { d: 3, q: "a > 0; x = a + 1/a dan y = 2", o: K, a: 3, noShuffle: true, e: "Untuk a = 1: x = 2 = y. Untuk a = 2: x = 2,5 > y. Secara umum a + 1/a ≥ 2 dengan kesamaan di a = 1. Karena bisa sama atau lebih besar → <b>tidak dapat ditentukan</b>." },
    { d: 3, q: "x = 2¹⁰⁰ dan y = 3⁶⁰", o: K, a: 0, noShuffle: true, e: "Samakan pangkat menjadi 20: x = (2⁵)²⁰ = 32²⁰ dan y = (3³)²⁰ = 27²⁰. Karena 32 > 27, <b>x > y</b>. Trik: cari KPK pangkat lalu bandingkan basisnya." },
    { d: 3, q: "x = 0,999…(berulang) dan y = 1", o: K, a: 2, noShuffle: true, e: "0,999… = 1 secara matematis (1/3 = 0,333…; ×3 → 0,999… = 1). <b>x = y</b>." },
    { d: 3, q: "x dan y bilangan bulat positif dengan x·y = 12 dan x + y = 7", o: K, a: 3, noShuffle: true, e: "Pasangan (3,4) atau (4,3). x bisa lebih kecil atau lebih besar → <b>tidak dapat ditentukan</b>." },
    { d: 3, q: "x = luas persegi berkeliling 20; y = luas persegi panjang berkeliling 20 dengan panjang 6", o: K, a: 0, noShuffle: true, e: "x = 5² = 25; y = 6 × 4 = 24. <b>x > y</b>. Dengan keliling sama, persegi selalu memiliki luas terbesar." },
    { d: 3, q: "x = 15% dari 15% dari 400 dan y = 9", o: K, a: 2, noShuffle: true, e: "400 × 0,15 = 60; 60 × 0,15 = 9 → <b>x = y</b>." },
    { d: 3, q: "x = −1/2 dan y = x²", o: K, a: 1, noShuffle: true, e: "y = 1/4 > −1/2 → <b>x < y</b>." },
    { d: 3, q: "x = jumlah sudut dalam segi enam; y = 2 × jumlah sudut dalam segitiga + 360°", o: K, a: 2, noShuffle: true, e: "x = (6−2) × 180 = 720°. y = 2 × 180 + 360 = 720°. <b>x = y</b>." },
    { d: 3, q: "x = 1/3 + 1/4 dan y = 2/7", o: K, a: 0, noShuffle: true, e: "x = 7/12 ≈ 0,583; y ≈ 0,286. <b>x > y</b>. Jebakan: menjumlahkan pembilang dan penyebut (1+1)/(3+4) = 2/7." },
    { d: 3, q: "n bilangan bulat; x = n² dan y = n", o: K, a: 3, noShuffle: true, e: "n = 0 atau 1: sama. n = 2: x > y. n = −1: x = 1 > y = −1. Bisa sama atau lebih besar → <b>tidak dapat ditentukan</b>." },
  ];
})(window.PSI);

/* js/data/bank_logika.js */
/* Bank soal penalaran logis */
(function (P) {
  P.BANK = P.BANK || {};
  const B = (P.BANK.logika = {});

  /* ------------------------------------------------------------ SILOGISME */
  B.silogisme = [
    { d: 1, q: "Semua pekerja harus mengenakan topi pengaman. Sebagian pekerja mengenakan sarung tangan.", o: ["Sebagian pekerja mengenakan topi pengaman dan sarung tangan", "Sebagian pekerja tidak mengenakan topi pengaman", "Semua pekerja tidak mengenakan sarung tangan", "Sebagian pekerja tidak bertopi dan bersarung tangan", "Sebagian pekerja tidak bertopi dan tidak bersarung tangan"], a: 0, e: "Semua pekerja bertopi; yang bersarung tangan adalah pekerja juga → pasti bertopi. Maka ada pekerja yang bertopi <b>dan</b> bersarung tangan. Pilihan lain bertentangan dengan premis 1." },
    { d: 1, q: "Semua anggota asosiasi profesi harus hadir dalam rapat. Sebagian dokter adalah anggota asosiasi.", o: ["Sebagian peserta rapat adalah dokter", "Semua yang hadir dalam rapat adalah dokter", "Semua dokter hadir dalam rapat", "Semua anggota rapat bukan anggota asosiasi", "Semua yang hadir bukan dokter"], a: 0, e: "Dokter yang anggota asosiasi pasti hadir → <b>sebagian peserta rapat adalah dokter</b>. \"Semua dokter hadir\" salah karena hanya sebagian dokter yang anggota." },
    { d: 1, q: "Semua jenis ikan bernapas dengan insang. Paus bernapas dengan paru-paru.", o: ["Paus bukan termasuk jenis ikan", "Sebagian ikan bernapas dengan paru-paru", "Semua paus bernapas dengan insang", "Sebagian paus bernapas dengan insang", "Semua paus termasuk ikan"], a: 0, e: "Kontraposisi: yang tidak bernapas dengan insang bukan ikan. <b>Paus bukan ikan.</b>" },
    { d: 1, q: "Semua manusia tidak bertanduk. Semua kucing tidak memamah biak.", o: ["Tidak dapat ditarik kesimpulan", "Manusia tidak memamah biak", "Kucing tidak bertanduk", "Manusia dan kucing tidak memamah biak dan tak bertanduk", "Manusia sama dengan kucing"], a: 0, e: "Kedua premis tidak punya istilah penghubung (manusia–tanduk vs kucing–memamah biak). <b>Tidak ada kesimpulan.</b>" },
    { d: 1, q: "Semua penyelam adalah perenang. Sebagian penyelam adalah pelaut.", o: ["Sebagian pelaut adalah perenang", "Sebagian perenang bukan penyelam", "Semua pelaut adalah perenang", "Sebagian penyelam bukan pelaut", "Sebagian penyelam bukan perenang"], a: 0, e: "Pelaut yang penyelam pasti perenang → <b>sebagian pelaut adalah perenang</b>. \"Semua pelaut perenang\" tidak didukung; \"sebagian penyelam bukan pelaut\" mungkin benar tapi tidak pasti (sebagian ≠ tidak semua)." },
    { d: 2, q: "Semua seniman kreatif. Sebagian ilmuwan tidak kreatif.", o: ["Sebagian ilmuwan bukan seniman", "Tidak ada seniman yang ilmuwan", "Sebagian individu yang kreatif bukan seniman", "Sebagian ilmuwan kreatif", "Semua ilmuwan kreatif"], a: 0, e: "Ilmuwan yang tidak kreatif tidak mungkin seniman (semua seniman kreatif). → <b>Sebagian ilmuwan bukan seniman.</b> Pilihan d mungkin benar tetapi tidak pasti." },
    { d: 2, q: "Tidak semua hipotesis penelitian terbukti benar. Semua penelitian disertasi menguji hipotesis.", o: ["Sebagian hipotesis disertasi mungkin tidak terbukti", "Semua hipotesis disertasi terbukti benar", "Semua hipotesis penelitian terbukti benar", "Sebagian doktor tidak menulis disertasi", "Semua hipotesis disertasi tidak terbukti"], a: 0, e: "Hipotesis disertasi adalah hipotesis penelitian; karena tidak semua hipotesis penelitian terbukti, hipotesis disertasi <b>mungkin</b> tidak terbukti. Kesimpulan pasti lain tidak ada." },
    { d: 2, q: "Pengendara motor yang lewat jalan protokol harus mengenakan helm. Sebagian murid bersepeda motor tidak mempunyai helm.", o: ["Sebagian murid bersepeda motor tidak boleh lewat jalan protokol", "Semua murid tidak boleh lewat jalan protokol", "Semua murid bersepeda motor boleh lewat jalan protokol", "Semua murid bersepeda motor harus mengenakan helm", "Sebagian murid bersepeda motor boleh lewat jalan protokol"], a: 0, e: "Yang tanpa helm tidak boleh lewat protokol → murid tanpa helm (sebagian) tidak boleh lewat. Pilihan e tidak pasti karena murid berhelm belum tentu ada." },
    { d: 2, q: "Sebagian sarjana adalah dosen. Semua dosen harus meneliti.", o: ["Sebagian sarjana harus meneliti", "Sebagian sarjana bukan dosen", "Sebagian peneliti bukan dosen", "Sebagian dosen tidak meneliti", "Semua sarjana harus meneliti"], a: 0, e: "Sarjana yang dosen (sebagian) harus meneliti → <b>sebagian sarjana harus meneliti</b>. \"Sebagian sarjana bukan dosen\" tidak pasti dari \"sebagian\"." },
    { d: 2, q: "Sebagian penyanyi berada pada kedudukan utama. Semua yang ada pada kedudukan utama mendatangkan uang.", o: ["Sebagian penyanyi mendatangkan uang", "Sebagian penyanyi tidak pada kedudukan utama", "Semua penyanyi ada pada kedudukan utama", "Sebagian penyanyi tidak mendatangkan uang", "Semua yang mendatangkan uang adalah penyanyi"], a: 0, e: "Penyanyi di kedudukan utama → mendatangkan uang. <b>Sebagian penyanyi mendatangkan uang.</b>" },
    { d: 2, q: "Semua karyawan tetap mendapat tunjangan. Rina tidak mendapat tunjangan.", o: ["Rina bukan karyawan tetap", "Rina karyawan kontrak", "Rina bukan karyawan", "Sebagian karyawan tetap tidak mendapat tunjangan", "Rina akan mendapat tunjangan"], a: 0, e: "Kontraposisi: tidak bertunjangan → bukan karyawan tetap. Kita <b>tidak</b> tahu apakah Rina karyawan kontrak atau bukan karyawan sama sekali." },
    { d: 2, q: "Jika hujan deras, jalan Sudirman banjir. Jalan Sudirman tidak banjir hari ini.", o: ["Hari ini tidak hujan deras", "Hari ini hujan ringan", "Hari ini cerah", "Jalan lain banjir", "Besok banjir"], a: 0, e: "Modus tollens: tidak banjir → tidak hujan deras. Bisa saja hujan ringan atau cerah, tetapi yang <b>pasti</b> hanya \"tidak hujan deras\"." },
    { d: 2, q: "Semua mahasiswa teknik wajib praktikum. Sebagian mahasiswa teknik mengikuti organisasi.", o: ["Sebagian yang mengikuti organisasi wajib praktikum", "Semua yang mengikuti organisasi wajib praktikum", "Sebagian mahasiswa teknik tidak wajib praktikum", "Semua yang wajib praktikum mengikuti organisasi", "Tidak dapat disimpulkan"], a: 0, e: "Mahasiswa teknik yang berorganisasi wajib praktikum → <b>sebagian yang berorganisasi wajib praktikum</b>. \"Semua yang berorganisasi\" terlalu luas (ada anggota organisasi non-teknik)." },
    { d: 3, q: "Tidak ada politikus yang jujur sepenuhnya. Sebagian pengusaha adalah politikus.", o: ["Sebagian pengusaha tidak jujur sepenuhnya", "Semua pengusaha tidak jujur", "Sebagian pengusaha jujur sepenuhnya", "Tidak ada pengusaha yang jujur", "Semua politikus adalah pengusaha"], a: 0, e: "Pengusaha yang politikus tidak jujur sepenuhnya → <b>sebagian pengusaha tidak jujur sepenuhnya</b>. Pilihan c tidak pasti (pengusaha non-politikus tidak dibahas)." },
    { d: 3, q: "Semua yang lulus tes tertulis mengikuti wawancara. Sebagian yang mengikuti wawancara tidak diterima.", o: ["Tidak dapat disimpulkan apakah yang lulus tes tertulis diterima", "Sebagian yang lulus tes tertulis tidak diterima", "Semua yang lulus tes tertulis diterima", "Yang tidak diterima pasti tidak lulus tes tertulis", "Semua yang diwawancara lulus tes tertulis"], a: 0, e: "Yang tidak diterima adalah sebagian peserta wawancara — mereka bisa saja peserta yang masuk wawancara lewat jalur lain, bukan dari tes tertulis. Jadi tentang yang lulus tes tertulis, <b>tidak dapat disimpulkan</b>. Ini jebakan rantai \"sebagian\"." },
    { d: 3, q: "Jika A, maka B. Jika B, maka C. Tidak C.", o: ["Tidak A", "A", "B", "Tidak B tetapi A", "Tidak dapat disimpulkan"], a: 0, e: "Silogisme hipotetis: A → C. Modus tollens: tidak C → <b>tidak A</b> (dan juga tidak B)." },
    { d: 3, q: "Semua anggota tim harus hadir rapat atau mengirim laporan tertulis. Doni anggota tim dan tidak hadir rapat.", o: ["Doni mengirim laporan tertulis", "Doni bukan anggota tim", "Doni melanggar aturan", "Doni akan hadir rapat berikutnya", "Tidak dapat disimpulkan"], a: 0, e: "Disjungsi: hadir ATAU mengirim laporan. Tidak hadir → <b>harus mengirim laporan</b> (silogisme disjungtif)." },
    { d: 3, q: "Hanya karyawan yang sudah 2 tahun bekerja yang boleh mengajukan cuti panjang. Sari mengajukan cuti panjang dan disetujui.", o: ["Sari sudah bekerja minimal 2 tahun", "Sari bekerja tepat 2 tahun", "Semua karyawan 2 tahun mengajukan cuti panjang", "Sari karyawan terbaik", "Tidak dapat disimpulkan"], a: 0, e: "\"Hanya X yang boleh Y\" = jika Y maka X (X syarat perlu). Cuti disetujui → <b>Sari sudah ≥ 2 tahun</b>. Bukan \"tepat 2 tahun\"." },
    { d: 3, q: "Setiap kali produksi melebihi target, karyawan mendapat bonus. Bulan ini karyawan mendapat bonus.", o: ["Tidak dapat disimpulkan bahwa produksi melebihi target", "Produksi bulan ini melebihi target", "Produksi bulan ini tidak melebihi target", "Bulan depan karyawan mendapat bonus", "Target bulan ini rendah"], a: 0, e: "Afirmasi konsekuen tidak sah: bonus bisa diberikan karena alasan lain. <b>Tidak dapat disimpulkan</b> bahwa produksi melebihi target." },
    { d: 3, q: "Semua bunga di taman itu berwarna merah atau putih. Tidak ada bunga putih yang berduri. Sebagian bunga di taman berduri.", o: ["Sebagian bunga di taman berwarna merah", "Semua bunga merah berduri", "Tidak ada bunga merah yang berduri", "Semua bunga di taman berwarna merah", "Sebagian bunga putih berduri"], a: 0, e: "Bunga berduri bukan putih → pasti merah (karena hanya merah/putih). Jadi <b>sebagian bunga berwarna merah</b> (yang berduri). Bunga merah lain mungkin tidak berduri." },
    { d: 3, q: "Jika gaji naik, daya beli meningkat. Jika daya beli meningkat, penjualan naik. Penjualan tidak naik.", o: ["Gaji tidak naik", "Gaji naik tetapi daya beli tidak meningkat", "Daya beli meningkat", "Gaji naik", "Tidak dapat disimpulkan"], a: 0, e: "Rantai: gaji naik → penjualan naik. Penjualan tidak naik → <b>gaji tidak naik</b>." },
    { d: 3, q: "Semua lulusan program ini mahir Excel. Sebagian yang mahir Excel bekerja sebagai analis. Budi lulusan program ini.", o: ["Budi mahir Excel", "Budi bekerja sebagai analis", "Budi tidak bekerja sebagai analis", "Sebagian lulusan program bekerja sebagai analis", "Semua analis lulusan program ini"], a: 0, e: "Hanya <b>Budi mahir Excel</b> yang pasti. Tentang analis: hanya sebagian pemahir Excel yang analis — Budi belum tentu termasuk. Pilihan d juga tidak pasti (irisan tidak dijamin)." },
    { d: 3, q: "Tidak ada produk cacat yang lolos QC. Semua produk yang dikirim telah lolos QC. Produk X cacat.", o: ["Produk X tidak dikirim", "Produk X dikirim", "Produk X lolos QC", "Sebagian produk cacat dikirim", "QC gagal"], a: 0, e: "X cacat → tidak lolos QC → (karena semua yang dikirim lolos QC) <b>X tidak dikirim</b>." },
    { d: 2, q: "Sebagian karyawan menguasai bahasa Inggris. Semua yang menguasai bahasa Inggris ditempatkan di divisi ekspor.", o: ["Sebagian karyawan ditempatkan di divisi ekspor", "Semua karyawan ditempatkan di divisi ekspor", "Semua di divisi ekspor adalah karyawan", "Sebagian karyawan tidak menguasai bahasa Inggris", "Divisi ekspor hanya berisi karyawan berbahasa Inggris"], a: 0, e: "Karyawan berbahasa Inggris (sebagian) → di divisi ekspor. <b>Sebagian karyawan di divisi ekspor.</b> Pilihan d tidak pasti; pilihan e membalik \"semua\"." },
    { d: 1, q: "Semua burung bertelur. Merpati adalah burung.", o: ["Merpati bertelur", "Semua yang bertelur adalah burung", "Sebagian merpati bertelur", "Merpati bukan burung", "Merpati tidak bertelur"], a: 0, e: "Modus ponens sederhana: <b>merpati bertelur</b>. Pilihan b membalik \"semua\"." },
    { d: 2, q: "Setiap atlet nasional menjalani tes doping. Beberapa atlet nasional adalah mahasiswa.", o: ["Beberapa mahasiswa menjalani tes doping", "Semua mahasiswa menjalani tes doping", "Beberapa atlet nasional bukan mahasiswa", "Semua yang menjalani tes doping adalah atlet", "Tidak ada mahasiswa yang atlet"], a: 0, e: "Atlet yang mahasiswa pasti dites doping → <b>beberapa mahasiswa dites doping</b>." },
    { d: 3, q: "Jika dan hanya jika suhu di bawah 0°C, air membeku. Air di danau itu membeku.", o: ["Suhu di bawah 0°C", "Suhu tepat 0°C", "Tidak dapat disimpulkan", "Suhu di atas 0°C", "Danau itu dangkal"], a: 0, e: "\"Jika dan hanya jika\" (biimplikasi) berlaku dua arah, sehingga dari \"air membeku\" sah menyimpulkan <b>suhu di bawah 0°C</b>. Bedakan dengan \"jika… maka…\" biasa yang tidak boleh dibalik." },
    { d: 3, q: "Semua A adalah B. Semua C adalah B. Maka …", o: ["Tidak dapat disimpulkan hubungan A dan C", "Semua A adalah C", "Semua C adalah A", "Sebagian A adalah C", "Tidak ada A yang C"], a: 0, e: "A dan C sama-sama di dalam B, tetapi bisa beririsan, terpisah, atau bersarang. <b>Tidak dapat disimpulkan.</b> Kesalahan klasik: menyimpulkan \"sebagian A adalah C\"." },
    { d: 2, q: "Tidak ada mamalia yang bernapas dengan insang. Lumba-lumba adalah mamalia.", o: ["Lumba-lumba tidak bernapas dengan insang", "Lumba-lumba bernapas dengan insang", "Sebagian mamalia hidup di air", "Lumba-lumba bukan mamalia", "Semua yang hidup di air bernapas dengan insang"], a: 0, e: "Langsung: <b>lumba-lumba tidak bernapas dengan insang</b>. Pilihan c benar secara fakta tetapi tidak disimpulkan dari premis." },
    { d: 3, q: "Jika proyek selesai tepat waktu, tim mendapat insentif. Jika tim mendapat insentif, tingkat kepuasan naik. Tingkat kepuasan naik.", o: ["Tidak dapat disimpulkan bahwa proyek selesai tepat waktu", "Proyek selesai tepat waktu", "Tim mendapat insentif", "Proyek terlambat", "Tim tidak mendapat insentif"], a: 0, e: "Dari konsekuen (kepuasan naik) tidak bisa mundur ke sebabnya. <b>Tidak dapat disimpulkan.</b>" },
  ];

  /* ------------------------------------------------------------ PENALARAN ANALITIS */
  const kursi = "Enam karyawan — P, Q, R, S, T, U — duduk berjajar menghadap utara di kursi 1 sampai 6 dari kiri ke kanan. (1) P duduk di kursi 3. (2) Q tepat di sebelah kanan S. (3) T tidak duduk di ujung. (4) U duduk di sebelah kiri P (tidak harus tepat). (5) R duduk di kursi 6.";
  const jadwal = "Lima pelatihan — Akuntansi, Bahasa, Coding, Desain, Etika — dijadwalkan Senin sampai Jumat, satu pelatihan per hari. (1) Coding dua hari setelah Akuntansi. (2) Etika tidak di hari Senin atau Jumat. (3) Bahasa tepat sebelum Desain. (4) Desain tidak di hari Jumat.";
  const tim = "Tujuh pelamar — A, B, C, D, E, F, G — akan dibagi ke tim Merah (3 orang) dan tim Biru (4 orang). (1) A dan B harus satu tim. (2) C dan D tidak boleh satu tim. (3) E di tim Biru. (4) Jika F di tim Merah, G di tim Merah.";
  const lantai = "Gedung lima lantai (1 paling bawah) ditempati lima divisi: HR, IT, Keuangan, Legal, Marketing, masing-masing satu lantai. (1) IT tepat di atas Keuangan. (2) HR di lantai lebih tinggi dari Legal. (3) Marketing di lantai 2. (4) HR tidak di lantai 5.";
  B.analitis = [
    { d: 1, q: kursi + "<br><br>Siapa yang duduk di kursi 1?", o: ["U", "S", "Q", "T", "Tidak dapat ditentukan"], a: 0, e: "P=3, R=6. Blok [S Q] butuh dua kursi berdekatan dari {1,2,4,5}: bisa (1,2) atau (4,5). U di kiri P → U ∈ {1,2}. T bukan ujung → T ∈ {2,4,5}. Jika [S Q] di (1,2), U tidak ada tempat. Jadi [S Q] di (4,5), lalu U dan T di {1,2} dengan T bukan ujung → T=2, <b>U=1</b>." },
    { d: 2, q: kursi + "<br><br>Pernyataan mana yang PASTI benar?", o: ["T duduk tepat di sebelah kiri P", "S duduk di kursi 5", "U duduk di sebelah Q", "T duduk di kursi 4", "Q duduk di kursi 2"], a: 0, e: "Susunan unik dari syarat: U(1) T(2) P(3) S(4) Q(5) R(6). Maka <b>T tepat di kiri P</b> pasti benar. S di kursi 4 (bukan 5), U tidak bersebelahan dengan Q, T di kursi 2, Q di kursi 5." },
    { d: 2, q: jadwal + "<br><br>Pelatihan apa yang dijadwalkan hari Rabu?", o: ["Akuntansi", "Coding", "Bahasa", "Desain", "Etika"], a: 0, e: "Blok [Bahasa, Desain] harus berurutan dan Desain bukan Jumat. Akuntansi–Coding berjarak dua hari. Uji: Akuntansi Senin → Coding Rabu → sisa Sel, Kam, Jum tidak memuat blok berurutan ✘. Akuntansi Selasa → Coding Kamis → sisa Sen, Rab, Jum ✘. Akuntansi Rabu → Coding Jumat → sisa Sen, Sel, Kam: Bahasa Senin, Desain Selasa, Etika Kamis ✔ (Etika bukan Senin/Jumat). Rabu = <b>Akuntansi</b>." },
    { d: 2, q: jadwal + "<br><br>Pelatihan apa yang dijadwalkan hari Kamis?", o: ["Etika", "Coding", "Desain", "Bahasa", "Akuntansi"], a: 0, e: "Satu-satunya susunan sah: Senin Bahasa, Selasa Desain, Rabu Akuntansi, Kamis <b>Etika</b>, Jumat Coding." },
    { d: 3, q: tim + "<br><br>Jika C di tim Merah, pernyataan mana yang PASTI benar?", o: ["D di tim Biru", "F di tim Merah", "A di tim Merah", "G di tim Biru", "B di tim Biru"], a: 0, e: "C dan D tidak boleh satu tim → jika C Merah, <b>D Biru</b> (pasti). Yang lain bergantung pada susunan: Merah = C + (A,B) atau C + (F,G); keduanya mungkin." },
    { d: 3, q: tim + "<br><br>Jika F di tim Merah, siapa saja anggota tim Merah?", o: ["F, G, dan salah satu dari C/D", "F, G, A", "F, A, B", "F, G, E", "F, C, D"], a: 0, e: "F Merah → G Merah (syarat 4). Tinggal 1 kursi Merah. A–B harus bersama (butuh 2 kursi) → A,B Biru. E Biru. Sisa C dan D: satu Merah satu Biru. Jadi Merah = <b>F, G, dan C atau D</b>." },
    { d: 3, q: tim + "<br><br>Berapa banyak susunan tim yang mungkin?", o: ["4", "2", "3", "6", "8"], a: 0, e: "Kasus 1: A,B Merah + satu dari {C,D} → 2 cara (F,G otomatis Biru; syarat 4 terpenuhi karena F tidak Merah). Kasus 2: A,B Biru → Merah dari {C,D,F,G} dengan C/D tidak bersama dan F→G: {F,G,C}, {F,G,D} (2 cara); tanpa F: {G,C,?} butuh 3 orang dari {C,D,G} tanpa C&D bersama → tidak mungkin. Total <b>4</b>." },
    { d: 2, q: lantai + "<br><br>Divisi apa yang menempati lantai 1?", o: ["Legal", "Keuangan", "HR", "IT", "Tidak dapat ditentukan"], a: 0, e: "Marketing = 2. Blok [Keuangan, IT] (IT tepat di atas Keuangan) butuh dua lantai berurutan dari {1, 3, 4, 5} → (3,4) atau (4,5). Jika (3,4): sisa {1,5} untuk Legal & HR dengan HR lebih tinggi → HR 5, tetapi HR tidak boleh di lantai 5 ✘. Jika (4,5): sisa {1,3} → Legal 1, HR 3 ✔. Susunan unik: Legal 1, Marketing 2, HR 3, Keuangan 4, IT 5 → <b>Legal</b>." },
    { d: 2, q: "Lima pelari — A, B, C, D, E — finis tanpa seri. A finis sebelum B tetapi setelah C. D finis setelah B. E finis sebelum C. Siapa yang finis ketiga?", o: ["A", "B", "C", "D", "E"], a: 0, e: "Urutan: E < C < A < B < D. Ketiga = <b>A</b>." },
    { d: 2, q: "Dalam sebuah rapat meja bundar, enam orang (Ali, Bima, Citra, Dedi, Eka, Fajar) duduk berjarak sama menghadap pusat meja. Ali berhadapan dengan Bima. Citra tepat di sebelah kanan Ali. Dedi berhadapan dengan Citra. Eka tepat di sebelah kiri Bima. Siapa yang duduk tepat di sebelah kanan Dedi?", o: ["Fajar", "Bima", "Ali", "Eka", "Citra"], a: 0, e: "Nomori kursi 1–6 searah jarum jam dan pakai satu konvensi konsisten: karena semua menghadap pusat, \"kanan\" seseorang adalah kursi berikutnya berlawanan arah jarum jam, \"kiri\" adalah kursi berikutnya searah jarum jam. Ali = 1, Bima = 4 (berhadapan). Kanan Ali → Citra = 6. Dedi berhadapan Citra → Dedi = 3. Kiri Bima → Eka = 5. Sisa Fajar = 2. Kanan Dedi (3) = kursi 2 = <b>Fajar</b>. Kunci soal melingkar: tetapkan konvensi arah sekali dan pakai konsisten — apa pun konvensinya, jawabannya sama." },
    { d: 3, q: "Empat kotak berisi masing-masing: apel, jeruk, mangga, dan campuran. Semua label (APEL, JERUK, MANGGA, CAMPURAN) tertukar sehingga TIDAK ADA kotak yang labelnya benar. Kamu boleh mengambil satu buah dari satu kotak. Apakah satu pengambilan cukup untuk menentukan isi semua kotak?", o: ["Tidak; setelah mengambil dari kotak CAMPURAN masih tersisa lebih dari satu kemungkinan", "Ya, ambil dari kotak berlabel CAMPURAN", "Ya, ambil dari kotak berlabel APEL", "Ya, ambil dari kotak berlabel JERUK", "Ya, ambil dari kotak mana pun"], a: 0, e: "Ambil dari kotak berlabel CAMPURAN (pasti berisi satu jenis, misal apel) — ini langkah terbaik. Tetapi tersisa tiga kotak berlabel APEL, JERUK, MANGGA yang berisi jeruk, mangga, campuran dengan label JERUK ≠ jeruk dan MANGGA ≠ mangga: masih ada <b>tiga</b> susunan yang mungkin. Jadi satu pengambilan <b>tidak cukup</b>. Versi klasik dengan <i>tiga</i> kotak bisa diselesaikan dengan satu pengambilan; versi empat kotak adalah jebakan bagi yang menghafal jawaban." },
    { d: 3, q: "Ade, Berti, dan Citra. (1) 2 orang sangat cerdas, 2 sangat cantik, 2 sangat artistik, 2 sangat kaya. (2) Tiap orang paling banyak punya 3 sifat. (3) Jika Ade cantik, maka ia kaya. (4) Untuk Berti dan Citra: jika cantik, maka tidak artistik. (5) Untuk Ade dan Citra: jika kaya, maka artistik. (6) Untuk Ade dan Berti: jika cantik, maka tidak cerdas. (7) Berti dan Citra sangat cerdas. Siapa yang TIDAK kaya?", o: ["Citra", "Ade", "Berti", "Ade dan Berti", "Tidak dapat ditentukan"], a: 0, e: "Cerdas: Berti, Citra (Ade tidak, karena hanya 2). Dari (6): Berti cerdas → Berti tidak cantik. Jadi cantik = Ade & Citra. Dari (3): Ade cantik → Ade kaya → (5) Ade artistik. Dari (4): Citra cantik → Citra tidak artistik → (5 kontraposisi) Citra tidak kaya. Artistik kedua = Berti; kaya kedua = Berti. Cek Berti: cerdas, artistik, kaya = 3 sifat ✔. <b>Citra tidak kaya.</b>" },
    { d: 3, q: "Adrian, Badu, dan Citra ke kafetaria; tiap orang memesan bakso atau bakmi (tepat satu). (1) Jika Adrian memesan bakso, Badu memesan bakmi. (2) Tepat satu dari Adrian atau Citra memesan bakso. (3) Badu dan Citra tidak sama-sama memesan bakmi. Siapa yang memesan bakso?", o: ["Hanya Citra", "Hanya Adrian", "Adrian dan Badu", "Badu dan Citra", "Citra dan Adrian"], a: 0, e: "Kasus Adrian bakso: (1) Badu bakmi; (2) Citra bakmi; (3) Badu & Citra sama-sama bakmi → melanggar. Jadi Adrian bakmi → (2) Citra bakso. Badu? (3) terpenuhi karena Citra bakso; (1) tidak berlaku. Badu bisa bakso atau bakmi → yang <b>pasti</b> memesan bakso hanya Citra; Adrian pasti bakmi. Jawaban: <b>hanya Citra (yang pasti)</b>." },
    { d: 3, q: "Staf rumah sakit 16 orang termasuk si A, terdiri dari dokter dan perawat. Baik menghitung maupun tidak menghitung A, pernyataan berikut benar: (1) perawat lebih banyak dari dokter; (2) dokter pria lebih banyak dari perawat pria; (3) perawat pria lebih banyak dari perawat wanita; (4) paling sedikit ada satu dokter wanita. Apakah A?", o: ["Perawat wanita", "Dokter wanita", "Perawat pria", "Dokter pria", "Tidak dapat ditentukan"], a: 0, e: "Uji dengan menghapus A. Jika A dokter wanita, menghapusnya bisa melanggar (4). Jika A dokter pria, menghapusnya bisa melanggar (2). Jika A perawat pria, menghapusnya bisa melanggar (3) atau (1). Hanya <b>perawat wanita</b> yang jika dihapus tidak mungkin melanggar satu pun pernyataan (perawat tetap lebih banyak selisihnya hanya turun 1: cek (1) perawat ≥ dokter+2 awalnya karena 16 genap dan tak boleh sama)." },
    { d: 2, q: "Lima toko berjajar: Apotek, Bakery, Cafe, Dealer, Elektronik. Bakery tepat di antara Apotek dan Cafe. Dealer di ujung kanan. Elektronik tidak bersebelahan dengan Dealer. Toko apa yang berada di urutan keempat dari kiri?", o: ["Cafe atau Apotek", "Elektronik", "Bakery", "Dealer", "Apotek"], a: 0, e: "Dealer=5. Elektronik≠4 → Elektronik ∈ {1,2,3}. Blok [A B C] atau [C B A] butuh 3 kursi berurutan dari {1,2,3,4} → (1,2,3) atau (2,3,4). Jika blok di (1,2,3), Elektronik=4 ✘. Jadi blok di (2,3,4), Elektronik=1. Urutan ke-4 = ujung blok = <b>Cafe atau Apotek</b> (keduanya mungkin)." },
    { d: 3, q: "Tiga kotak masing-masing berlabel: \"Emas di sini\", \"Emas tidak di sini\", \"Emas tidak di kotak 1\". Tepat satu label benar dan emas ada di tepat satu kotak. Di kotak mana emas berada?", o: ["Kotak 2", "Kotak 1", "Kotak 3", "Tidak dapat ditentukan", "Kotak 1 atau 3"], a: 0, e: "Emas di 1: label 1 benar, label 2 benar (emas memang tidak di 2) → dua benar ✘. Emas di 2: label 1 salah, label 2 salah, label 3 benar → tepat satu ✔. Emas di 3: label 2 benar, label 3 benar ✘. <b>Kotak 2.</b>" },
    { d: 2, q: "Dalam sebuah keluarga, Ani lebih tua dari Budi. Cici lebih muda dari Budi tetapi lebih tua dari Dedi. Eko lebih tua dari Ani. Siapa yang termuda kedua?", o: ["Cici", "Budi", "Dedi", "Ani", "Eko"], a: 0, e: "Eko > Ani > Budi > Cici > Dedi. Termuda kedua = <b>Cici</b>." },
    { d: 3, q: "Empat orang (W, X, Y, Z) masing-masing selalu jujur atau selalu bohong. W: \"X bohong.\" X: \"Y bohong.\" Y: \"Z bohong.\" Z: \"W dan X keduanya bohong.\" Berapa orang yang jujur?", o: ["2", "1", "3", "0", "4"], a: 0, e: "Pola rantai W→X→Y→Z bergantian. Misal W jujur: X bohong → Y jujur → Z bohong → Z bohong berarti \"W dan X keduanya bohong\" salah ✔ (W jujur). Konsisten: W, Y jujur = <b>2</b>. Misal W bohong: X jujur → Y bohong → Z jujur → \"W dan X bohong\" harus benar, tapi X jujur ✘. Jadi tepat 2." },
    { d: 3, q: "Sebuah perusahaan mewawancarai 5 kandidat berurutan: K, L, M, N, O. L diwawancara sebelum N tetapi tidak tepat sebelumnya. M diwawancara terakhir. K diwawancara tepat setelah O. Siapa yang diwawancara ketiga?", o: ["K", "L", "O", "N", "M"], a: 0, e: "M=5. Blok [O K] berurutan. L < N dengan jarak ≥ 2. Posisi 1–4 untuk L, N, O, K. Pilihan blok: (1,2), (2,3), (3,4). Blok (1,2): L,N di 3,4 → berdekatan ✘. Blok (2,3): L=1, N=4 ✔ (jarak 3). Blok (3,4): L,N di 1,2 → berdekatan ✘. Susunan: L, O, K, N, M → ketiga = <b>K</b>." },
    { d: 2, q: "Nilai ujian: Rina lebih tinggi dari Sinta. Toni lebih rendah dari Sinta tetapi lebih tinggi dari Umar. Vera lebih tinggi dari Rina. Jika hanya tiga nilai tertinggi yang lulus, siapa yang TIDAK lulus?", o: ["Toni dan Umar", "Sinta dan Toni", "Umar saja", "Rina dan Sinta", "Toni saja"], a: 0, e: "Vera > Rina > Sinta > Toni > Umar. Lulus: Vera, Rina, Sinta. Tidak lulus: <b>Toni dan Umar</b>." },
    { d: 3, q: "Di sebuah pulau, ksatria selalu jujur dan penipu selalu berbohong. Kamu bertemu A dan B. A berkata: \"Setidaknya satu dari kami penipu.\" Apakah A dan B?", o: ["A ksatria, B penipu", "A penipu, B ksatria", "Keduanya ksatria", "Keduanya penipu", "Tidak dapat ditentukan"], a: 0, e: "Jika A penipu, pernyataannya salah → tidak ada penipu → kontradiksi (A sendiri penipu). Jadi A ksatria dan pernyataannya benar → ada penipu → pasti <b>B penipu</b>." },
  ];

  /* ------------------------------------------------------------ LOGIKA PERNYATAAN */
  B.pernyataan = [
    { d: 1, q: "Jika seorang karyawan rajin, ia mendapat bonus. Andi tidak mendapat bonus. Kesimpulan yang sah?", o: ["Andi tidak rajin", "Andi rajin", "Andi malas tetapi beruntung", "Andi akan mendapat bonus", "Tidak dapat disimpulkan"], a: 0, e: "Modus tollens: ~q → ~p. <b>Andi tidak rajin.</b>" },
    { d: 1, q: "Jika listrik padam, mesin berhenti. Mesin berhenti. Kesimpulan yang sah?", o: ["Tidak dapat disimpulkan bahwa listrik padam", "Listrik padam", "Listrik tidak padam", "Mesin rusak", "Listrik akan padam"], a: 0, e: "Afirmasi konsekuen tidak sah. Mesin bisa berhenti karena sebab lain." },
    { d: 1, q: "Negasi dari \"Semua peserta lulus\" adalah …", o: ["Ada peserta yang tidak lulus", "Semua peserta tidak lulus", "Tidak ada peserta yang lulus", "Sebagian peserta lulus", "Semua peserta gagal"], a: 0, e: "Negasi \"semua A adalah B\" = \"ada A yang bukan B\"." },
    { d: 1, q: "Kontraposisi dari \"Jika hujan, maka jalan basah\" adalah …", o: ["Jika jalan tidak basah, maka tidak hujan", "Jika jalan basah, maka hujan", "Jika tidak hujan, maka jalan tidak basah", "Hujan dan jalan tidak basah", "Jalan basah atau hujan"], a: 0, e: "Kontraposisi p→q adalah ~q→~p." },
    { d: 2, q: "Negasi dari \"Semua peserta lulus dan mendapat sertifikat\" adalah …", o: ["Ada peserta yang tidak lulus atau tidak mendapat sertifikat", "Semua peserta tidak lulus dan tidak mendapat sertifikat", "Ada peserta yang tidak lulus dan tidak mendapat sertifikat", "Semua peserta lulus tetapi tidak mendapat sertifikat", "Tidak ada peserta yang lulus"], a: 0, e: "Negasi (semua: p dan q) = ada yang (~p atau ~q)." },
    { d: 2, q: "Negasi dari \"Beberapa siswa hadir\" adalah …", o: ["Semua siswa tidak hadir", "Beberapa siswa tidak hadir", "Semua siswa hadir", "Tidak semua siswa hadir", "Seorang siswa tidak hadir"], a: 0, e: "Negasi \"beberapa A adalah B\" = \"tidak ada A yang B\" = <b>semua siswa tidak hadir</b>. \"Beberapa tidak hadir\" bisa benar bersamaan dengan pernyataan asli." },
    { d: 2, q: "Pernyataan yang ekuivalen dengan \"Jika nilai ≥ 75, maka lulus\" adalah …", o: ["Nilai < 75 atau lulus", "Nilai ≥ 75 dan lulus", "Jika lulus, maka nilai ≥ 75", "Nilai < 75 dan tidak lulus", "Jika nilai < 75, maka tidak lulus"], a: 0, e: "p → q ≡ ~p ∨ q. <b>Nilai < 75 atau lulus.</b> Pilihan c konvers, e invers (tidak ekuivalen)." },
    { d: 2, q: "Negasi dari \"Jika harga naik, maka permintaan turun\" adalah …", o: ["Harga naik dan permintaan tidak turun", "Jika harga tidak naik, maka permintaan tidak turun", "Harga tidak naik atau permintaan turun", "Jika permintaan tidak turun, maka harga tidak naik", "Harga naik atau permintaan turun"], a: 0, e: "Negasi (p → q) = p ∧ ~q." },
    { d: 2, q: "Premis: (1) Jika Ani lembur, ia pulang malam. (2) Jika Ani pulang malam, ia tidak sarapan. (3) Ani sarapan. Kesimpulan?", o: ["Ani tidak lembur", "Ani lembur", "Ani pulang malam", "Ani tidak lembur tetapi pulang malam", "Tidak dapat disimpulkan"], a: 0, e: "Rantai: lembur → pulang malam → tidak sarapan. Ani sarapan → tidak pulang malam → <b>tidak lembur</b>." },
    { d: 2, q: "\"Hanya jika lulus tes kesehatan, pelamar diterima.\" Pernyataan ini setara dengan …", o: ["Jika pelamar diterima, maka ia lulus tes kesehatan", "Jika lulus tes kesehatan, maka pelamar diterima", "Pelamar yang lulus tes kesehatan pasti diterima", "Tes kesehatan adalah syarat cukup untuk diterima", "Pelamar yang tidak diterima tidak lulus tes kesehatan"], a: 0, e: "\"p hanya jika q\" = p → q = \"jika diterima maka lulus tes kesehatan\" (lulus = syarat perlu, bukan cukup)." },
    { d: 3, q: "Diketahui: \"Tidak benar bahwa semua karyawan setuju atau direktur mengundurkan diri.\" Pernyataan yang pasti benar adalah …", o: ["Ada karyawan yang tidak setuju dan direktur tidak mengundurkan diri", "Semua karyawan tidak setuju", "Direktur mengundurkan diri", "Ada karyawan yang setuju", "Semua karyawan setuju dan direktur tidak mundur"], a: 0, e: "~(p ∨ q) = ~p ∧ ~q. ~p = ada karyawan yang tidak setuju; ~q = direktur tidak mundur." },
    { d: 3, q: "Jika dan hanya jika mesin dirawat rutin, mesin awet. Mesin itu tidak awet. Kesimpulan?", o: ["Mesin tidak dirawat rutin", "Mesin dirawat rutin", "Mesin rusak pabrik", "Tidak dapat disimpulkan", "Mesin dirawat tetapi tidak rutin"], a: 0, e: "Biimplikasi berlaku dua arah: tidak awet ↔ tidak dirawat rutin. <b>Mesin tidak dirawat rutin.</b>" },
    { d: 3, q: "Pernyataan: \"Setiap proposal yang disetujui telah melalui review, dan beberapa proposal yang melalui review ditolak.\" Mana yang PASTI benar?", o: ["Ada proposal yang melalui review tetapi tidak disetujui", "Ada proposal yang disetujui tanpa review", "Semua proposal yang melalui review disetujui", "Beberapa proposal yang disetujui ditolak", "Tidak ada proposal yang ditolak"], a: 0, e: "\"Beberapa yang melalui review ditolak\" = ada yang melalui review dan tidak disetujui. Pilihan a adalah pernyataan ulangnya." },
    { d: 3, q: "Jika p → q benar dan q → r benar, maka pernyataan yang PASTI benar adalah …", o: ["~r → ~p", "r → p", "~p → ~r", "q → p", "p ↔ r"], a: 0, e: "Silogisme hipotetis memberi p → r; kontraposisinya <b>~r → ~p</b>. Pilihan lain adalah konvers/invers yang tidak sah." },
    { d: 3, q: "Seorang manajer berkata: \"Jika tim tidak mencapai target, maka tidak ada bonus dan tidak ada liburan.\" Tim ternyata mendapat liburan. Kesimpulan?", o: ["Tim mencapai target", "Tim tidak mencapai target", "Tim mendapat bonus", "Tim tidak mendapat bonus", "Tidak dapat disimpulkan"], a: 0, e: "p → (~b ∧ ~l). Ada liburan → (~b ∧ ~l) salah → ~p salah → <b>tim mencapai target</b> (modus tollens). Tentang bonus tidak bisa disimpulkan." },
    { d: 3, q: "Negasi dari \"Ada karyawan yang terlambat setiap hari\" adalah …", o: ["Setiap karyawan pernah tidak terlambat pada suatu hari", "Tidak ada karyawan yang pernah terlambat", "Semua karyawan terlambat setiap hari", "Ada karyawan yang tidak pernah terlambat", "Semua karyawan tidak terlambat setiap hari"], a: 0, e: "~∃x ∀h T(x,h) = ∀x ∃h ~T(x,h): setiap karyawan ada hari ketika ia tidak terlambat. Pilihan e ambigu dalam bahasa sehari-hari; pilihan a yang paling tepat secara logis." },
    { d: 2, q: "Invers dari \"Jika x bilangan genap, maka x habis dibagi 2\" adalah …", o: ["Jika x bukan bilangan genap, maka x tidak habis dibagi 2", "Jika x habis dibagi 2, maka x bilangan genap", "Jika x tidak habis dibagi 2, maka x bukan bilangan genap", "x genap dan tidak habis dibagi 2", "x bukan genap atau habis dibagi 2"], a: 0, e: "Invers p → q adalah ~p → ~q. (Kebetulan di sini invers juga benar secara matematika, tetapi secara logika formal invers tidak otomatis ekuivalen.)" },
    { d: 2, q: "Semua yang hadir mengisi daftar. Dina mengisi daftar. Maka …", o: ["Tidak dapat disimpulkan apakah Dina hadir", "Dina hadir", "Dina tidak hadir", "Dina panitia", "Semua yang mengisi daftar hadir"], a: 0, e: "Mengisi daftar adalah akibat kehadiran, tetapi bisa juga dilakukan tanpa hadir (misal titip). Afirmasi konsekuen → <b>tidak dapat disimpulkan</b>." },
    { d: 3, q: "Diketahui tiga pernyataan benar: (1) p atau q. (2) Jika p maka r. (3) Tidak r. Kesimpulan?", o: ["q", "p", "p dan q", "Tidak q", "Tidak dapat disimpulkan"], a: 0, e: "(2)+(3): tidak r → tidak p. (1): p atau q, dan tidak p → <b>q</b>." },
    { d: 3, q: "Manakah yang BUKAN ekuivalen dengan \"Jika A maka B\"?", o: ["Jika B maka A", "Jika tidak B maka tidak A", "Tidak A atau B", "A hanya jika B", "B jika A"], a: 0, e: "\"Jika B maka A\" adalah konvers — tidak ekuivalen. Yang lain: kontraposisi, bentuk disjungsi, dan dua parafrasa bahasa yang sama-sama berarti A → B." },
  ];
})(window.PSI);

/* js/data/bank_konsep.js */
/* Kuis pemahaman konsep untuk modul kepribadian & tes menggambar */
(function (P) {
  P.BANK = P.BANK || {};
  const K = (P.BANK.konsep = {});

  K["kepribadian-umum"] = [
    { d: 1, q: "Apa yang paling sering menyebabkan hasil tes kepribadian dinilai \"tidak valid\"?", o: ["Jawaban tidak konsisten antar item yang serupa", "Terlalu banyak memilih jawaban netral", "Mengerjakan terlalu cepat", "Memilih jawaban yang jujur", "Tidak menjawab satu nomor"], a: 0, e: "Inventori kepribadian menyisipkan item serupa/berulang untuk mengecek konsistensi. Jawaban yang berubah-ubah menandakan asal menjawab atau berusaha memanipulasi." },
    { d: 1, q: "Item \"Saya tidak pernah berbohong sekalipun dalam hidup saya\" biasanya berfungsi sebagai …", o: ["Pengecek kejujuran (lie scale / social desirability)", "Pengukur integritas tinggi", "Pengukur kepatuhan", "Item pengisi tanpa skor", "Pengukur agresivitas"], a: 0, e: "Hampir tidak ada orang yang benar-benar tidak pernah berbohong. Menjawab \"sangat setuju\" pada item seperti ini menaikkan skor <i>lie scale</i> → profil dicurigai terlalu dibagus-baguskan." },
    { d: 1, q: "Untuk posisi auditor internal, profil kepribadian yang umumnya paling diharapkan adalah …", o: ["Teliti, patuh prosedur, stabil emosi", "Sangat ekstrover dan spontan", "Dominan dan kompetitif", "Kreatif dan suka perubahan cepat", "Mudah dipengaruhi"], a: 0, e: "Audit menuntut ketelitian, kepatuhan pada standar, dan ketenangan menghadapi tekanan (DISC: C–S tinggi; Big Five: conscientiousness tinggi)." },
    { d: 2, q: "Seorang pelamar menjawab \"sangat setuju\" pada \"Saya suka memimpin kelompok\" dan juga \"sangat setuju\" pada \"Saya lebih nyaman mengikuti arahan orang lain\". Risiko utama dari pola ini adalah …", o: ["Profil dinilai kontradiktif/tidak konsisten", "Dianggap terlalu dominan", "Dianggap terlalu pasif", "Skor kepemimpinan menjadi maksimal", "Tidak ada risiko, keduanya positif"], a: 0, e: "Dua item mengukur kutub yang berlawanan (dominance vs deference). Menyetujui keduanya secara kuat menghasilkan profil tidak konsisten." },
    { d: 2, q: "Prinsip \"jawab sesuai perilaku kerja yang paling sering muncul\" bertujuan untuk …", o: ["Menjaga konsistensi tanpa harus menghafal jawaban", "Membuat skor semua dimensi tinggi", "Menghindari item negatif", "Mempercepat pengerjaan", "Menyenangkan pewawancara"], a: 0, e: "Dengan satu acuan nyata (perilaku kerja sehari-hari), jawaban otomatis konsisten walau item diulang dengan kalimat berbeda." },
    { d: 2, q: "Dalam format <i>forced choice</i> (memilih A atau B), apa yang harus dilakukan jika kedua pernyataan sama-sama tidak menggambarkan diri Anda?", o: ["Tetap pilih yang relatif lebih mendekati diri Anda", "Kosongkan nomor tersebut", "Pilih keduanya", "Pilih secara acak", "Pilih pernyataan yang lebih pendek"], a: 0, e: "Forced choice mewajibkan satu pilihan. Mengosongkan atau menjawab acak merusak skor konsistensi; pilihlah yang <i>relatif</i> lebih sesuai." },
    { d: 2, q: "Skor agresi (EPPS: agg, PAPI: K) yang sangat tinggi pada pelamar umumnya dibaca HRD sebagai …", o: ["Catatan merah: potensi konflik di tempat kerja", "Tanda kepemimpinan yang kuat", "Tanda semangat kompetitif yang baik", "Netral, tidak berpengaruh", "Tanda kejujuran"], a: 0, e: "Agresi dalam inventori ini berarti kecenderungan menyerang/mengecam/menyalahkan orang lain — berisiko bagi kerja tim." },
    { d: 3, q: "Pelamar X memiliki semua skor dimensi di rentang tengah (4–5 dari 9) pada PAPI Kostick. Interpretasi yang paling mungkin dari HRD adalah …", o: ["Profil datar/kurang informatif, mungkin menjawab secara 'aman'", "Kandidat sangat seimbang dan ideal", "Kandidat berkepribadian ganda", "Kandidat sangat jujur", "Hasil tidak dapat dibaca"], a: 0, e: "Profil datar biasanya muncul ketika peserta memilih yang \"terdengar netral\" di setiap pasangan. HRD tidak mendapat gambaran kekuatan nyata, sehingga kandidat sulit direkomendasikan." },
    { d: 3, q: "Manakah pendekatan yang paling tepat saat menjawab item \"Saya kadang merasa kesal pada rekan kerja\"?", o: ["Menjawab jujur (misal \"kadang-kadang\"), karena ini wajar dan menjaga validitas", "Menjawab \"tidak pernah\" agar tampak profesional", "Menjawab \"selalu\" untuk menunjukkan keterbukaan", "Melewati item tersebut", "Menjawab berlawanan dengan item sebelumnya"], a: 0, e: "Item ini bersifat normatif (hampir semua orang mengalaminya). Jawaban \"tidak pernah\" justru menaikkan skala kebohongan." },
    { d: 3, q: "Perusahaan A mencari <i>management trainee</i>. Kombinasi profil yang paling sesuai adalah …", o: ["Achievement & dominance tinggi, endurance tinggi, agresi rendah, fleksibel", "Deference & succorance tinggi, change rendah", "Abasement tinggi, autonomy sangat tinggi", "Exhibition sangat tinggi, order rendah, endurance rendah", "Semua dimensi rendah"], a: 0, e: "MT disiapkan menjadi pemimpin: orientasi prestasi, kesediaan memimpin, tahan tekanan, adaptif, namun bukan agresif." },
    { d: 2, q: "Grafik \"Most\" pada DISC menggambarkan …", o: ["Perilaku yang ditampilkan di lingkungan kerja (topeng publik)", "Kepribadian masa kecil", "Perilaku saat tertekan", "Kecerdasan", "Minat karier"], a: 0, e: "Most = perilaku yang dipilih untuk ditampilkan (adaptasi terhadap lingkungan); Least = perilaku inti/alami yang muncul saat tertekan." },
    { d: 1, q: "Berapa lama idealnya Anda berpikir untuk satu item tes kepribadian?", o: ["Beberapa detik; jawab spontan tetapi jujur", "Minimal satu menit untuk menimbang", "Selama mungkin agar tepat", "Tidak perlu membaca, langsung pilih", "Lima menit untuk item sulit"], a: 0, e: "Jawaban spontan lebih merefleksikan diri yang sebenarnya dan menjaga konsistensi. Berpikir terlalu lama menandakan upaya 'mengatur' jawaban." },
  ];

  K.epps = [
    { d: 1, q: "Pernyataan \"Saya ingin dapat mengerjakan segala sesuatu lebih baik daripada orang lain\" mengukur kebutuhan …", o: ["Achievement (ach)", "Dominance (dom)", "Exhibition (exh)", "Autonomy (aut)", "Aggression (agg)"], a: 0, e: "Ciri ach: berprestasi, melakukan sebaik mungkin, melampaui orang lain dalam hasil kerja (bukan dalam memerintah, yang merupakan dom)." },
    { d: 1, q: "\"Saya suka mengikuti petunjuk dan melakukan apa yang diharapkan orang dari saya\" mengukur …", o: ["Deference (def)", "Order (ord)", "Abasement (aba)", "Affiliation (aff)", "Endurance (end)"], a: 0, e: "Deference = patuh, menghormati, mengikuti arahan orang yang dihormati." },
    { d: 1, q: "\"Saya ingin barang-barang saya tersusun rapi dan teratur di meja kerja\" mengukur …", o: ["Order (ord)", "Deference (def)", "Endurance (end)", "Achievement (ach)", "Change (chg)"], a: 0, e: "Order = kebutuhan akan keteraturan, kerapian, perencanaan detail." },
    { d: 1, q: "\"Saya suka menjadi pusat perhatian dalam suatu kelompok\" mengukur …", o: ["Exhibition (exh)", "Dominance (dom)", "Affiliation (aff)", "Heterosexuality (het)", "Succorance (suc)"], a: 0, e: "Exhibition = ingin diperhatikan, menonjol, bercerita lucu di depan orang." },
    { d: 2, q: "\"Saya ingin teman-teman memberi dorongan kepada saya bila saya menghadapi kegagalan\" mengukur …", o: ["Succorance (suc)", "Nurturance (nur)", "Affiliation (aff)", "Abasement (aba)", "Intraception (int)"], a: 0, e: "Succorance = kebutuhan <b>menerima</b> bantuan/simpati. Kebalikannya nurturance = <b>memberi</b> bantuan." },
    { d: 2, q: "\"Saya suka menganalisis perasaan dan motif orang lain\" mengukur …", o: ["Intraception (int)", "Nurturance (nur)", "Affiliation (aff)", "Dominance (dom)", "Order (ord)"], a: 0, e: "Intraception = memahami, menganalisis, menempatkan diri pada posisi orang lain." },
    { d: 2, q: "\"Bila keadaan kurang menguntungkan, saya merasa harus lebih disalahkan daripada orang lain\" mengukur …", o: ["Abasement (aba)", "Deference (def)", "Succorance (suc)", "Endurance (end)", "Aggression (agg)"], a: 0, e: "Abasement = merasa bersalah, rendah diri, merasa pantas dihukum. Skor tinggi dibaca negatif untuk posisi yang butuh kepercayaan diri." },
    { d: 2, q: "\"Saya suka makan di restoran baru, bepergian, dan mengikuti mode\" mengukur …", o: ["Change (chg)", "Exhibition (exh)", "Autonomy (aut)", "Affiliation (aff)", "Heterosexuality (het)"], a: 0, e: "Change = kebutuhan akan variasi, hal baru, pengalaman berbeda." },
    { d: 2, q: "Di EPPS, 15 pasang pernyataan identik yang diulang berfungsi untuk …", o: ["Menghitung skor konsistensi (con)", "Mengukur kebutuhan ke-16", "Mengecek kecepatan membaca", "Mengurangi kebosanan", "Mengukur kejujuran seksual"], a: 0, e: "Skor konsistensi dihitung dari kesamaan jawaban pada 15 pasang item berulang. Nilai rendah (< 10 dari 15) membuat profil tidak valid." },
    { d: 3, q: "Untuk posisi staf administrasi, profil EPPS yang paling diharapkan di antara berikut adalah …", o: ["ord tinggi, end tinggi, def sedang, agg rendah", "dom sangat tinggi, def rendah, chg tinggi", "exh tinggi, aut tinggi, ord rendah", "aba tinggi, suc tinggi", "agg tinggi, aut tinggi"], a: 0, e: "Administrasi menuntut keteraturan (ord), ketekunan (end), kesediaan mengikuti prosedur (def), dan rendahnya konflik (agg rendah)." },
    { d: 3, q: "Pasangan: A. \"Saya ingin diminta menyelesaikan perselisihan antar orang lain\" (dom) vs B. \"Saya suka mengelakkan tanggung jawab\" (negatif). Untuk pelamar supervisor, pilihan yang konsisten dengan profil kepemimpinan adalah …", o: ["A, karena mencerminkan kesediaan mengambil peran", "B, karena menunjukkan kerendahan hati", "Keduanya sama baiknya", "Kosongkan", "B, agar tidak tampak ambisius"], a: 0, e: "Supervisor diharapkan bersedia memimpin dan menyelesaikan konflik. Memilih B menurunkan dom dan menaikkan kesan menghindar." },
    { d: 3, q: "\"Saya suka bekerja berjam-jam tanpa diganggu dan bertahan pada masalah walau tampaknya tidak akan berhasil\" mengukur …", o: ["Endurance (end)", "Achievement (ach)", "Autonomy (aut)", "Order (ord)", "Abasement (aba)"], a: 0, e: "Endurance = ketekunan, daya tahan menyelesaikan tugas hingga tuntas. Berbeda dari ach yang menekankan <i>kualitas hasil</i>." },
  ];

  K.disc = [
    { d: 1, q: "Kata sifat \"tegas, berani mengambil risiko, berorientasi hasil\" termasuk dimensi …", o: ["D (Dominance)", "I (Influence)", "S (Steadiness)", "C (Compliance)", "Tidak ada"], a: 0, e: "Dominance berfokus pada hasil, tantangan, kendali, dan kecepatan memutuskan." },
    { d: 1, q: "\"Ramah, persuasif, optimis, suka bergaul\" termasuk dimensi …", o: ["I (Influence)", "D (Dominance)", "S (Steadiness)", "C (Compliance)", "Tidak ada"], a: 0, e: "Influence berfokus pada orang, antusiasme, dan kemampuan memengaruhi." },
    { d: 1, q: "\"Sabar, setia, pendengar yang baik, konsisten\" termasuk dimensi …", o: ["S (Steadiness)", "I (Influence)", "D (Dominance)", "C (Compliance)", "Tidak ada"], a: 0, e: "Steadiness menekankan kestabilan, kerja sama, dan kesabaran." },
    { d: 1, q: "\"Teliti, analitis, sistematis, mengikuti standar\" termasuk dimensi …", o: ["C (Compliance)", "S (Steadiness)", "D (Dominance)", "I (Influence)", "Tidak ada"], a: 0, e: "Compliance (Conscientiousness) menekankan akurasi, kualitas, dan kepatuhan pada aturan." },
    { d: 2, q: "Dalam satu kelompok DISC Anda memilih satu pernyataan \"Most\" dan satu \"Least\". Jika \"Least\" dipilih asal-asalan, dampaknya …", o: ["Grafik Least (perilaku inti) menjadi tidak akurat dan kesenjangan Most–Least tampak besar", "Tidak ada dampak; hanya Most yang dinilai", "Skor D otomatis naik", "Tes dianggap selesai lebih cepat", "Skor C otomatis turun"], a: 0, e: "Least sama pentingnya: ia membentuk grafik perilaku inti. Kesenjangan besar antara Most dan Least dibaca sebagai 'memaksakan diri' atau stres." },
    { d: 2, q: "Profil DISC yang paling sesuai untuk posisi <i>customer service</i> adalah …", o: ["S–I tinggi", "D–C tinggi", "D sangat tinggi, S rendah", "C tinggi, I sangat rendah", "Semua dimensi rendah"], a: 0, e: "CS membutuhkan kesabaran dan empati (S) serta keramahan komunikatif (I)." },
    { d: 2, q: "Profil DISC untuk posisi <i>quality control</i> yang paling sesuai adalah …", o: ["C tinggi dengan S", "I tinggi dengan D", "D tinggi tanpa C", "I sangat tinggi", "S rendah, C rendah"], a: 0, e: "QC menuntut ketelitian dan kepatuhan standar (C) serta konsistensi (S)." },
    { d: 2, q: "Seorang kandidat sales memiliki Most: I tinggi, D tinggi; Least: S tinggi. Interpretasi yang paling tepat?", o: ["Cocok untuk sales: komunikatif dan berorientasi hasil, kurang menyukai rutinitas lambat", "Tidak cocok karena S tinggi di Least", "Kandidat tidak jujur", "Kandidat terlalu teliti", "Tidak dapat ditafsirkan"], a: 0, e: "S tinggi pada grafik Least berarti S <b>rendah</b> pada perilaku (banyak memilih S sebagai 'paling tidak'); kandidat dinamis dan tidak sabar dengan rutinitas — umum pada profil sales." },
    { d: 3, q: "Kelompok DISC: (a) Suka berkompetisi (D), (b) Mudah bergaul (I), (c) Tenang dan sabar (S), (d) Teliti terhadap detail (C). Pelamar staf akuntansi yang tenang dan teliti sebaiknya memilih …", o: ["Most: (d) atau (c); Least: (a)", "Most: (a); Least: (d)", "Most: (b); Least: (c)", "Most: (a); Least: (b)", "Most: (c); Least: (d)"], a: 0, e: "Pilih Most yang mencerminkan C/S dan Least yang paling bukan dirinya (D, kompetisi agresif). Memilih Least pada (d) akan menurunkan C — bertentangan dengan posisi." },
    { d: 3, q: "Jika grafik Most dan Least seorang kandidat sangat berbeda (misal Most D tinggi, Least menunjukkan S tinggi), HRD mungkin menyimpulkan …", o: ["Kandidat sedang beradaptasi/menekan sifat aslinya untuk memenuhi tuntutan lingkungan", "Kandidat memiliki dua kepribadian", "Tes rusak", "Kandidat sangat jujur", "Kandidat ideal untuk semua posisi"], a: 0, e: "Kesenjangan menunjukkan perbedaan antara perilaku yang ditampilkan dan perilaku alami; HRD akan menggali lewat wawancara apakah ini berkelanjutan." },
    { d: 2, q: "Berapa jumlah kelompok pernyataan pada DISC klasik?", o: ["24", "15", "50", "90", "100"], a: 0, e: "DISC klasik (Personal Profile System) terdiri dari 24 kelompok × 4 pernyataan; beberapa versi memakai 28." },
    { d: 1, q: "Apakah ada profil DISC yang dianggap 'gagal' secara universal?", o: ["Tidak; yang dinilai adalah kecocokan dengan posisi dan konsistensi", "Ya, profil C selalu gagal", "Ya, profil S selalu gagal", "Ya, profil tanpa D gagal", "Ya, profil I gagal"], a: 0, e: "DISC bersifat deskriptif, bukan evaluatif. Setiap gaya punya kekuatan; kecocokan dengan peranlah yang dinilai." },
  ];

  K.papi = [
    { d: 1, q: "Skala PAPI yang mengukur \"peran pemimpin\" adalah …", o: ["L", "A", "N", "W", "F"], a: 0, e: "L = leadership role. A = hasrat berprestasi, N = menyelesaikan tugas sendiri, W = butuh aturan/arahan, F = dukungan atasan." },
    { d: 1, q: "Pernyataan \"Saya bekerja keras\" paling berkaitan dengan skala …", o: ["G (pekerja keras)", "T (tempo)", "A (prestasi)", "N (menyelesaikan tugas)", "V (semangat)"], a: 0, e: "G = hard intense worker. T = kesibukan/tempo; V = vigor/energi; A = dorongan prestasi (target); N = menuntaskan tugas sendiri." },
    { d: 1, q: "Skala K pada PAPI mengukur …", o: ["Agresi", "Keteraturan", "Kedekatan emosional", "Kebutuhan berubah", "Pengendalian emosi"], a: 0, e: "K = need to be forceful (agresi). Skor tinggi umumnya dinilai negatif." },
    { d: 2, q: "Skala W tinggi pada calon manajer biasanya dibaca …", o: ["Kurang cocok: terlalu membutuhkan aturan dan arahan", "Sangat cocok: disiplin tinggi", "Netral", "Menunjukkan kreativitas", "Menunjukkan kepemimpinan"], a: 0, e: "W = need for rules and supervision. Manajer diharapkan mandiri dalam mengambil keputusan (I tinggi), bukan bergantung pada arahan." },
    { d: 2, q: "Skala D dan C pada PAPI berturut-turut mengukur …", o: ["Perhatian pada detail dan keteraturan", "Dominasi dan kreativitas", "Disiplin dan komunikasi", "Kedekatan dan konsistensi", "Dinamika dan kontrol"], a: 0, e: "D = interest in working with details; C = organized type (keteraturan)." },
    { d: 2, q: "Skala Z (need for change) tinggi paling sesuai untuk …", o: ["Lingkungan startup/kreatif yang dinamis", "Pekerjaan rutin dan berulang", "Posisi arsip", "Operator mesin", "Petugas keamanan"], a: 0, e: "Z tinggi = menyukai variasi dan perubahan; kurang cocok untuk pekerjaan monoton." },
    { d: 2, q: "Skala F tinggi (kebutuhan dukungan atasan) umumnya diinterpretasikan …", o: ["Terlalu bergantung pada atasan, kurang mandiri", "Loyal dan ideal", "Pemimpin alami", "Sangat teliti", "Sangat energik"], a: 0, e: "F = need to support authority. Skor tinggi menandakan ketergantungan pada persetujuan atasan." },
    { d: 2, q: "Skala E (pengendalian emosi) rendah menandakan …", o: ["Emosi mudah terlihat/kurang terkendali", "Sangat tenang", "Tidak punya emosi", "Sangat rasional", "Pekerja keras"], a: 0, e: "E rendah = ekspresif/impulsif secara emosi; untuk posisi yang menghadapi tekanan pelanggan, E sedang–tinggi lebih disukai." },
    { d: 3, q: "Kandidat memiliki P (mengendalikan orang) = 8, L = 2, I = 7. Interpretasi yang paling tepat?", o: ["Ingin mengendalikan dan cepat memutuskan, tetapi tidak nyaman mengambil peran pemimpin formal — berpotensi 'bossy' tanpa tanggung jawab", "Pemimpin ideal", "Sangat patuh", "Tidak bisa memutuskan", "Kandidat pasif"], a: 0, e: "P tinggi tanpa L menunjukkan dorongan mengontrol orang lain tanpa keinginan memikul peran pemimpin; HRD akan menggali gaya kerja ini di wawancara." },
    { d: 3, q: "Untuk posisi teller bank, kombinasi PAPI yang paling diharapkan adalah …", o: ["D, C, E tinggi; K rendah; W sedang", "K tinggi; D rendah", "Z tinggi; C rendah", "P sangat tinggi; S rendah", "X sangat tinggi; D rendah"], a: 0, e: "Teller: detail (D), teratur (C), tenang (E), tidak agresif (K rendah), mau mengikuti SOP (W sedang)." },
    { d: 3, q: "Pasangan PAPI: A. \"Saya senang menjadi pusat perhatian\" (X) vs B. \"Saya menyukai pekerjaan yang terperinci\" (D). Untuk pelamar analis data yang teliti dan tidak suka tampil, pilihan konsisten adalah …", o: ["B", "A", "Keduanya", "Kosongkan", "A, agar tampak percaya diri"], a: 0, e: "Sesuai diri (teliti, tidak suka tampil) dan sesuai posisi: D lebih relevan daripada X untuk analis data." },
    { d: 2, q: "Berapa jumlah pasangan pernyataan pada PAPI Kostick?", o: ["90", "225", "24", "50", "100"], a: 0, e: "PAPI Kostick terdiri dari 90 pasang pernyataan untuk 20 skala." },
  ];

  K.mbti = [
    { d: 1, q: "Dimensi MBTI E–I membedakan …", o: ["Sumber energi: dari interaksi luar atau dari dalam diri", "Cara memutuskan", "Cara menyerap informasi", "Gaya hidup terencana/spontan", "Tingkat kecerdasan"], a: 0, e: "Extraversion mendapat energi dari dunia luar; Introversion dari refleksi dalam diri. Bukan soal pemalu/tidaknya." },
    { d: 1, q: "\"Saya lebih percaya pada fakta konkret dan pengalaman nyata daripada kemungkinan dan gambaran besar.\" Pernyataan ini condong ke …", o: ["S (Sensing)", "N (Intuition)", "T (Thinking)", "F (Feeling)", "J (Judging)"], a: 0, e: "Sensing fokus pada data indrawi, detail, dan yang nyata; Intuition pada pola, makna, dan kemungkinan." },
    { d: 1, q: "\"Saat memutuskan, saya mengutamakan logika dan konsistensi daripada dampak pada perasaan orang.\" Pernyataan ini condong ke …", o: ["T (Thinking)", "F (Feeling)", "J (Judging)", "P (Perceiving)", "I (Introversion)"], a: 0, e: "Thinking = keputusan berdasarkan analisis objektif; Feeling = berdasarkan nilai dan harmoni." },
    { d: 1, q: "\"Saya suka rencana yang pasti dan merasa tidak nyaman dengan perubahan mendadak.\" Pernyataan ini condong ke …", o: ["J (Judging)", "P (Perceiving)", "S (Sensing)", "N (Intuition)", "E (Extraversion)"], a: 0, e: "Judging = menyukai struktur, keputusan, dan kepastian; Perceiving = fleksibel dan terbuka pada opsi." },
    { d: 2, q: "Faktor Big Five yang paling kuat memprediksi kinerja kerja di hampir semua jenis pekerjaan adalah …", o: ["Conscientiousness", "Extraversion", "Openness", "Agreeableness", "Neuroticism"], a: 0, e: "Meta-analisis psikologi industri secara konsisten menempatkan conscientiousness (kedisiplinan, tanggung jawab) sebagai prediktor kinerja paling umum." },
    { d: 2, q: "Item BFI \"Saya cenderung malas\" adalah item …", o: ["Terbalik (reverse-scored) untuk Conscientiousness", "Langsung untuk Neuroticism", "Langsung untuk Agreeableness", "Terbalik untuk Openness", "Pengisi tanpa skor"], a: 0, e: "Setuju pada item ini <b>menurunkan</b> skor conscientiousness. Baca arah pernyataan sebelum memilih skala." },
    { d: 2, q: "Skor Neuroticism yang rendah menunjukkan …", o: ["Stabilitas emosi tinggi, tidak mudah cemas", "Kurang peduli", "Kurang kreatif", "Pemalu", "Tidak disiplin"], a: 0, e: "Neuroticism = kecenderungan emosi negatif; skor rendah berarti tenang dan stabil (emotional stability)." },
    { d: 2, q: "Posisi <i>project controller</i> yang menuntut kepatuhan jadwal cenderung cocok untuk preferensi …", o: ["J (Judging)", "P (Perceiving)", "N (Intuition)", "F (Feeling)", "E (Extraversion)"], a: 0, e: "Judging menyukai struktur, tenggat, dan penyelesaian — selaras dengan pengendalian proyek." },
    { d: 3, q: "Jika skor seseorang pada dimensi T–F sangat dekat ke tengah, maka …", o: ["Tipe pada dimensi itu bisa berubah antar tes; itu normal, bukan tanda ketidakjujuran", "Tes tidak valid", "Orang tersebut tidak punya kepribadian", "Ia pasti tipe F", "Ia pasti tipe T"], a: 0, e: "MBTI membagi kontinum menjadi dua; skor dekat garis tengah membuat huruf mudah berubah. Saat tes kerja, acuannya perilaku kerja yang paling sering." },
    { d: 3, q: "Openness tinggi paling relevan untuk posisi …", o: ["R&D / desain produk", "Petugas arsip", "Kasir", "Satpam", "Operator mesin"], a: 0, e: "Openness = keterbukaan pada ide baru, imajinasi, rasa ingin tahu — inti pekerjaan riset dan desain." },
    { d: 2, q: "Berapa jumlah tipe kepribadian dalam MBTI?", o: ["16", "4", "8", "5", "32"], a: 0, e: "4 dimensi × 2 kutub = 2⁴ = 16 tipe (misal ISTJ, ENFP)." },
    { d: 3, q: "Seorang pelamar menjawab \"sangat setuju\" pada \"Saya mudah bergaul\" dan juga pada \"Saya lebih suka menghabiskan akhir pekan sendirian\". Dimensi mana yang berpotensi tampak tidak konsisten?", o: ["E–I", "S–N", "T–F", "J–P", "Tidak ada"], a: 0, e: "Keduanya item E–I dengan arah berlawanan. Meski manusia nyata bisa keduanya, jawaban ekstrem pada dua kutub menurunkan konsistensi." },
  ];

  K.wartegg = [
    { d: 1, q: "Aturan umum yang paling dikenal dalam Wartegg: stimulus garis lengkung sebaiknya dikembangkan menjadi …", o: ["Benda hidup/organik", "Bangunan", "Alat teknik", "Huruf dan angka", "Pola geometris"], a: 0, e: "Garis lengkung (kotak 1, 2, 7, 8) → benda hidup/alami; garis lurus (kotak 3, 4, 5, 6) → benda mati/teknis." },
    { d: 1, q: "Kotak 1 (titik di tengah) umumnya dibaca sebagai aspek …", o: ["Konsep diri / cara menempatkan diri", "Ambisi", "Hubungan sosial", "Cara mengatasi hambatan", "Kepekaan perasaan"], a: 0, e: "Titik kecil di tengah mencerminkan 'diri' di lingkungan; sebaiknya dijadikan pusat gambar." },
    { d: 1, q: "Kotak 3 (tiga garis vertikal yang makin tinggi) sebaiknya dikembangkan menjadi …", o: ["Sesuatu yang melanjutkan tren naik: tangga, grafik, gedung bertingkat", "Garis menurun", "Bunga", "Wajah", "Lingkaran"], a: 0, e: "Kotak 3 mencerminkan ambisi/orientasi prestasi; melanjutkan pola naik dibaca positif." },
    { d: 2, q: "Stimulus kotak 4 (kotak hitam kecil di kanan atas) paling aman dijadikan …", o: ["Bagian konstruktif seperti jendela gedung atau layar", "Lubang gelap", "Batu nisan", "Awan hitam", "Diabaikan di pojok"], a: 0, e: "Kotak 4 berkaitan dengan cara menghadapi masalah. Mengintegrasikannya secara konstruktif dibaca sebagai kemampuan mengelola masalah." },
    { d: 2, q: "Urutan pengerjaan yang paling umum dianggap wajar adalah …", o: ["Kombinasi urut dan acak, misalnya 1-2-3-4 lalu 8-7-6-5", "Sepenuhnya acak", "Selalu 1 sampai 8 berurutan", "Mulai dari 8 ke 1", "Hanya kotak yang disukai"], a: 0, e: "Urutan 100% berurutan dibaca kaku; 100% acak dibaca sulit diatur. Kombinasi menunjukkan keseimbangan." },
    { d: 2, q: "Kotak 5 (dua garis tegak lurus terpisah) sebaiknya dikembangkan menjadi …", o: ["Objek dinamis yang menghubungkan kedua garis: kapal layar, roket, ketapel", "Dua benda terpisah", "Bunga", "Titik-titik", "Wajah"], a: 0, e: "Kotak 5 mencerminkan energi dan cara mengatasi hambatan; menghubungkan garis menjadi objek dinamis dibaca positif." },
    { d: 2, q: "Apa yang dinilai dari tes Wartegg?", o: ["Cara mengembangkan stimulus, konsistensi garis, pemilihan objek, dan urutan — bukan kualitas seni", "Kualitas seni dan keindahan", "Kecepatan menggambar", "Kemampuan menyalin", "Kemampuan mewarnai"], a: 0, e: "Wartegg adalah tes proyektif kepribadian; kemampuan menggambar bukan kriteria." },
    { d: 3, q: "Pada kotak 7 (titik-titik melengkung), peserta menggambar kalung mutiara. Pada kotak 8 (lengkung besar), ia menggambar payung. Penilaian umum terhadap pilihan ini …", o: ["Sesuai: kotak 7 ↔ kehalusan/kepekaan, kotak 8 ↔ perlindungan/sosial", "Tidak sesuai karena keduanya benda mati", "Tidak sesuai karena terlalu umum", "Hanya kotak 7 yang sesuai", "Hanya kotak 8 yang sesuai"], a: 0, e: "Kalung mutiara mengikuti titik-titik halus; payung melingkupi/melindungi — keduanya padanan klasik yang dinilai wajar. Keunikan adalah nilai tambah, tetapi kesesuaian makna lebih penting." },
    { d: 3, q: "Peserta meninggalkan kotak 4 kosong karena kehabisan waktu dan membuat gambar sangat kecil di pojok kotak 8. Interpretasi yang mungkin dari psikolog?", o: ["Kesulitan menghadapi masalah (kotak 4) dan penarikan diri dalam relasi sosial (kotak 8)", "Efisien waktu", "Kreatif", "Teliti", "Tidak ada interpretasi"], a: 0, e: "Kotak kosong dan gambar sangat kecil di pojok biasanya dibaca negatif. Selalu isi semua kotak dengan ukuran memadai." },
    { d: 2, q: "Manakah tema yang sebaiknya dihindari dalam Wartegg?", o: ["Senjata, darah, kuburan", "Bunga dan buah", "Rumah dan jembatan", "Kapal dan roket", "Hewan dan tumbuhan"], a: 0, e: "Tema agresif/suram memicu interpretasi negatif tentang kondisi emosi." },
  ];

  K.baum = [
    { d: 1, q: "Jenis pohon yang biasanya DILARANG dalam Baum Test adalah …", o: ["Kelapa, pisang, bambu, cemara", "Mangga", "Jambu", "Apel", "Rambutan"], a: 0, e: "Pohon monokotil/tanpa cabang (kelapa, pisang, bambu) dan cemara (bentuk segitiga tanpa cabang jelas) tidak memperlihatkan struktur batang-cabang yang dinilai." },
    { d: 1, q: "Bagian pohon yang mencerminkan 'ego/kekuatan diri' dalam penilaian Baum adalah …", o: ["Batang", "Daun", "Buah", "Akar", "Tanah"], a: 0, e: "Batang = ego; proporsional dan utuh tanpa lubang besar dibaca sebagai kepribadian yang kokoh." },
    { d: 1, q: "Ukuran gambar pohon yang disarankan adalah …", o: ["Sekitar 2/3 halaman, agak di tengah", "Sekecil mungkin agar rapi", "Memenuhi seluruh kertas hingga tepi", "Di pojok kiri atas", "Setengah halaman bawah saja"], a: 0, e: "Terlalu kecil dibaca kurang percaya diri; memenuhi hingga tepi dibaca ekspansif/impulsif." },
    { d: 2, q: "Buah yang digambar berjatuhan di tanah umumnya ditafsirkan …", o: ["Negatif: kehilangan/kegagalan produktivitas", "Positif: sangat produktif", "Netral", "Kreatif", "Teliti"], a: 0, e: "Buah di pohon = produktivitas; buah jatuh berserakan dibaca sebagai hasil yang hilang." },
    { d: 2, q: "Ujung cabang yang digambar runcing atau terpotong sering dibaca sebagai …", o: ["Agresivitas atau trauma/penghambat perkembangan", "Kreativitas", "Ketelitian", "Kepemimpinan", "Keseimbangan"], a: 0, e: "Ranting runcing dikaitkan dengan agresi; cabang terpotong dengan pengalaman yang menghambat. Gambarlah ujung cabang mengecil secara wajar." },
    { d: 2, q: "Waktu pengerjaan yang disarankan untuk menggambar pohon dalam alokasi 10 menit adalah …", o: ["Sekitar 7–8 menit menggambar, sisanya memeriksa kelengkapan", "Kurang dari 2 menit", "Tepat 10 menit tanpa pemeriksaan", "Lebih dari 10 menit, minta tambahan", "3 menit"], a: 0, e: "Terlalu cepat → kurang detail; terlalu lama → dinilai lambat. Sisakan waktu untuk mengecek akar, batang, cabang, daun, buah, tanah." },
    { d: 3, q: "Peserta menggambar pohon mangga lengkap namun condong kuat ke kiri tanpa garis tanah. Catatan psikolog yang mungkin …", o: ["Ketidakstabilan dan kurangnya pijakan realitas", "Sangat kreatif", "Sangat teliti", "Pemimpin", "Tidak ada catatan"], a: 0, e: "Kemiringan ekstrem dan ketiadaan garis tanah dibaca sebagai kurang stabil/'melayang'." },
    { d: 3, q: "Manakah kombinasi yang paling disarankan untuk Baum Test seleksi kerja?", o: ["Pohon berbuah seperti mangga/jambu, tegak, akar tampak sedikit, tajuk rimbun, garis tanah, nama pohon ditulis", "Pohon cemara tinggi dengan salju", "Pohon kelapa di pantai", "Pohon tanpa daun di musim gugur", "Pohon dalam pot di ruang tamu"], a: 0, e: "Kombinasi tersebut memenuhi kriteria dikotil, lengkap, stabil, dan produktif." },
    { d: 2, q: "Apa yang dinilai dari tekanan pensil saat menggambar pohon?", o: ["Energi dan kestabilan emosi: tekanan sedang dan konsisten paling disukai", "Kualitas pensil", "Tidak dinilai", "Semakin tebal semakin baik", "Semakin tipis semakin baik"], a: 0, e: "Garis sangat tipis/putus dibaca ragu; sangat tebal/berulang dibaca tegang atau cemas." },
    { d: 1, q: "Setelah selesai menggambar pohon, peserta biasanya diminta …", o: ["Menulis nama/jenis pohon", "Mewarnai pohon", "Menggambar pohon kedua", "Menulis puisi", "Menghapus akar"], a: 0, e: "Instruksi standar: tuliskan nama pohon di belakang kertas. Pilih pohon yang mudah dikenali." },
  ];

  K.dap = [
    { d: 1, q: "Tiga kriteria utama penilaian kuantitatif DAP adalah …", o: ["Proporsi, kelengkapan, detail", "Warna, ukuran, kecepatan", "Keindahan, bayangan, perspektif", "Ekspresi, latar, judul", "Pakaian, sepatu, rambut"], a: 0, e: "Sistem penilaian kuantitatif (mis. Goodenough-Harris) menghitung kelengkapan anggota tubuh, proporsi, dan detail." },
    { d: 1, q: "Figur yang digambar sebaiknya …", o: ["Seluruh badan, berpakaian, sedang beraktivitas sesuai profesi", "Hanya wajah close-up", "Figur stik sederhana", "Tokoh kartun", "Membelakangi penonton"], a: 0, e: "Figur utuh dengan aktivitas memberi informasi kelengkapan, proporsi, dan konteks peran." },
    { d: 1, q: "Tangan yang digambar tersembunyi di saku atau di belakang punggung umumnya dibaca …", o: ["Ketertutupan/menghindari atau menyembunyikan sesuatu", "Santai dan percaya diri", "Rapi", "Formal", "Netral"], a: 0, e: "Tangan terlihat dengan jari lengkap lebih aman. Tangan memegang alat kerja dibaca aktif." },
    { d: 2, q: "Proporsi tubuh yang wajar: tinggi total sekitar … kali tinggi kepala.", o: ["7–8", "3–4", "10–12", "5", "2"], a: 0, e: "Proporsi dewasa realistis ± 7–8 kepala. Kepala terlalu besar dibaca kekanakan; terlalu kecil dibaca kurang percaya diri." },
    { d: 2, q: "Kelemahan yang sebaiknya ditulis pada keterangan DAP adalah …", o: ["Yang manusiawi dan ringan, misalnya \"kadang terlalu perfeksionis\"", "\"Pemarah dan sulit bekerja sama\"", "\"Tidak punya kelemahan\"", "\"Malas\"", "Dikosongkan"], a: 0, e: "Kelemahan fatal menurunkan penilaian; mengaku tanpa kelemahan dibaca tidak jujur. Pilih kelemahan ringan yang masih bisa dikelola." },
    { d: 2, q: "Figur tanpa kaki atau kaki terpotong di tepi kertas umumnya dibaca …", o: ["Kurang stabil/kurang pijakan", "Dinamis", "Tinggi", "Kuat", "Teliti"], a: 0, e: "Kaki = kestabilan dan mobilitas. Pastikan kaki lengkap dengan sepatu dan ada garis tanah." },
    { d: 3, q: "Pelamar posisi insinyur lapangan menggambar dirinya berkemeja rapi memegang laptop di ruang ber-AC. Secara teknis gambar lengkap. Masukan yang paling tepat?", o: ["Lebih baik menggambar aktivitas yang sesuai posisi yang dilamar (helm proyek, gulungan gambar di lapangan) agar konsisten dengan profil", "Gambar sudah ideal", "Ganti menjadi figur kartun", "Hilangkan wajah", "Gambar setengah badan saja"], a: 0, e: "Kesesuaian aktivitas dengan posisi menunjukkan pemahaman peran dan konsistensi minat; bukan syarat mutlak, tetapi nilai tambah." },
    { d: 3, q: "Mata yang digambar kosong tanpa pupil dan mulut terbuka lebar sering ditafsirkan …", o: ["Kurang kontak dengan lingkungan/kecemasan", "Ramah", "Ceria", "Fokus", "Tegas"], a: 0, e: "Detail wajah normal (pupil, senyum wajar) adalah pilihan aman." },
    { d: 2, q: "Keterangan yang biasanya diminta setelah menggambar orang meliputi …", o: ["Umur, jenis kelamin, pekerjaan, aktivitas, kelebihan, kelemahan", "Nama lengkap tokoh terkenal", "Alamat", "Hobi saja", "Tidak ada"], a: 0, e: "Konsistensi antara gambar dan keterangan (misal profesi vs pakaian/aksesori) ikut dinilai." },
    { d: 1, q: "Dalam DAP, kemampuan melukis yang indah …", o: ["Bukan kriteria; yang dinilai proporsi, kelengkapan, detail", "Adalah kriteria utama", "Menentukan kelulusan", "Menggantikan wawancara", "Menambah skor IQ"], a: 0, e: "DAP adalah tes proyektif dan kuantitatif, bukan tes seni." },
  ];

  K.htp = [
    { d: 1, q: "Tiga objek dalam HTP adalah …", o: ["Rumah, pohon, orang", "Rumah, taman, mobil", "Hutan, sungai, orang", "Rumah, pohon, hewan", "Gedung, jalan, orang"], a: 0, e: "House-Tree-Person, dikembangkan John Buck (1948)." },
    { d: 1, q: "Pintu dan jendela pada gambar rumah mencerminkan …", o: ["Keterbukaan berinteraksi dengan lingkungan", "Fantasi", "Ego", "Realitas", "Ambisi"], a: 0, e: "Pintu dengan gagang dan jendela terbuka/berkaca tanpa gorden rapat dibaca terbuka secara sosial." },
    { d: 1, q: "Atap rumah mewakili …", o: ["Fantasi/pemikiran", "Ego", "Hubungan sosial", "Realitas", "Energi"], a: 0, e: "Atap yang terlalu dominan dibaca terlalu banyak berfantasi." },
    { d: 2, q: "Garis tanah yang menyatukan rumah, pohon, dan orang menunjukkan …", o: ["Penerimaan realitas dan kesatuan komposisi", "Kreativitas", "Kecepatan", "Kekakuan", "Tidak bermakna"], a: 0, e: "Tanpa garis tanah, objek tampak 'melayang' — dibaca kurang berpijak pada realitas." },
    { d: 2, q: "Komposisi yang disarankan untuk HTP adalah …", o: ["Ketiga objek dalam satu cerita dengan skala konsisten, orang beraktivitas dekat rumah/pohon", "Tiga objek terpisah jauh di tiga sudut", "Rumah sangat besar, orang sangat kecil", "Orang membelakangi rumah", "Pohon menutupi rumah"], a: 0, e: "Kesatuan komposisi dan skala wajar menggambarkan integrasi diri–keluarga–lingkungan." },
    { d: 2, q: "Alokasi waktu yang wajar untuk HTP dalam 15 menit adalah …", o: ["±5 menit rumah, 4 pohon, 4 orang, 2 pengecekan", "15 menit untuk rumah saja", "1 menit per objek", "10 menit untuk orang", "Tidak perlu dibagi"], a: 0, e: "Pembagian memastikan ketiga objek lengkap; kelengkapan lebih penting daripada detail berlebihan pada satu objek." },
    { d: 3, q: "Peserta menggambar rumah tanpa pintu dengan semua jendela bergorden tertutup, pohon mati, dan orang membelakangi. Interpretasi umum psikolog?", o: ["Kecenderungan menutup diri/menarik diri dan suasana emosi suram", "Sangat kreatif", "Teliti", "Pemimpin", "Tidak ada"], a: 0, e: "Kombinasi tanda tertutup dan tema suram memicu catatan negatif. Pilih elemen terbuka dan positif." },
    { d: 3, q: "Manakah detail tambahan yang aman dan positif untuk HTP?", o: ["Jalan setapak menuju pintu, matahari, pagar rendah, orang menyiram pohon", "Petir dan hujan badai", "Kuburan di halaman", "Pagar tinggi berkawat duri", "Rumah terbakar"], a: 0, e: "Jalan setapak = akses interaksi; aktivitas menyiram menghubungkan ketiga objek; cuaca cerah = suasana emosi positif." },
    { d: 2, q: "Dinding rumah yang digambar sangat samar/putus-putus dibaca sebagai …", o: ["Ego yang lemah", "Kreativitas", "Kecermatan", "Kekuatan", "Kehangatan"], a: 0, e: "Dinding = ego. Garis tegas (tidak berlebihan) menandakan ego yang sehat." },
    { d: 1, q: "Apakah cerobong asap wajib dalam HTP di konteks Indonesia?", o: ["Tidak wajib; itu konvensi budaya Barat", "Wajib, tanpa cerobong gugur", "Wajib dengan asap tebal", "Wajib dua cerobong", "Wajib dengan api"], a: 0, e: "Elemen yang wajib adalah dinding, atap, pintu, jendela, dan garis tanah." },
  ];
})(window.PSI);

/* js/data/kepribadian.js */
/* Inventori kepribadian (simulasi): EPPS, DISC, PAPI, MBTI */
(function (P) {
  const INV = (P.INVENTORY = {});

  /* ---------------- EPPS: pasangan A/B dengan kode need ---------------- */
  const NEED = { ach: "Achievement (berprestasi)", def: "Deference (patuh/menghormati)", ord: "Order (keteraturan)", exh: "Exhibition (menonjol)", aut: "Autonomy (mandiri)", aff: "Affiliation (berteman)", int: "Intraception (memahami orang)", suc: "Succorance (ingin dibantu)", dom: "Dominance (memimpin)", aba: "Abasement (merasa bersalah)", nur: "Nurturance (menolong)", chg: "Change (variasi)", end: "Endurance (ketekunan)", het: "Heterosexuality", agg: "Aggression (agresi)" };
  const S = {
    ach: ["Saya ingin melakukan pekerjaan apa saja sebaik mungkin.", "Saya ingin menyelesaikan tugas yang dianggap orang sulit.", "Saya ingin berhasil dalam apa yang saya lakukan.", "Saya ingin bisa mengerjakan sesuatu lebih baik daripada orang lain."],
    def: ["Saya suka mengikuti petunjuk dan melakukan apa yang diharapkan dari saya.", "Dalam merencanakan sesuatu, saya ingin mendapat saran dari orang yang saya hormati.", "Saya suka menerima pimpinan dari orang yang saya kagumi.", "Saya suka memuji orang yang saya kagumi."],
    ord: ["Saya ingin barang-barang saya tersusun rapi di meja kerja.", "Saya suka merencanakan detail pekerjaan sebelum memulainya.", "Saya ingin pekerjaan tulisan saya teliti, rapi, dan tersusun baik.", "Saya suka menyimpan dokumen secara tersusun menurut sistem tertentu."],
    exh: ["Saya suka menjadi pusat perhatian dalam kelompok.", "Saya suka menceritakan lelucon di acara kumpul-kumpul.", "Saya ingin orang memperhatikan penampilan saya di depan umum.", "Saya suka bercerita tentang petualangan dan pengalaman unik saya."],
    aut: ["Saya ingin dapat berbuat sekehendak hati saya.", "Saya ingin tidak bergantung pada orang lain dalam menentukan apa yang saya lakukan.", "Saya ingin merasa bebas melakukan apa yang saya kehendaki.", "Saya suka melakukan hal dengan cara saya sendiri tanpa memikirkan pendapat orang."],
    aff: ["Saya suka membuat teman-teman baru.", "Saya ingin loyal terhadap teman-teman saya.", "Saya lebih suka mengerjakan sesuatu bersama teman daripada sendirian.", "Saya ingin mempunyai ikatan perasaan yang kuat dengan teman-teman."],
    int: ["Saya suka mempelajari dan menganalisis tingkah laku orang lain.", "Saya suka menempatkan diri pada posisi orang lain dan membayangkan perasaannya.", "Saya ingin memahami bagaimana perasaan teman-teman saat menghadapi masalah.", "Saya suka merenungkan kepribadian teman-teman saya."],
    suc: ["Saya ingin teman-teman memberi dorongan bila saya menghadapi kegagalan.", "Saya ingin diperlakukan dengan ramah oleh teman-teman.", "Saya ingin teman-teman bersimpati dan menghibur bila saya bersusah hati.", "Saya ingin teman-teman memperhatikan saya bila saya sakit."],
    dom: ["Bila dalam kepanitiaan, saya ingin dipilih sebagai ketua.", "Saya ingin mengawasi dan mengarahkan tindakan orang lain bila mungkin.", "Saya ingin dianggap sebagai pemimpin oleh orang lain.", "Saya ingin diminta menyelesaikan perselisihan antar orang lain."],
    aba: ["Saya merasa bersalah bila melakukan sesuatu yang saya tahu tidak baik.", "Bila keadaan kurang menguntungkan, saya merasa harus lebih disalahkan daripada orang lain.", "Saya merasa canggung di tengah orang yang saya anggap atasan saya.", "Saya merasa dalam banyak hal saya kalah dibandingkan orang lain."],
    nur: ["Saya suka menolong teman yang sedang kesulitan.", "Saya suka bermurah hati terhadap teman-teman.", "Saya suka memaafkan teman yang kadang menyakiti hati saya.", "Saya suka menolong orang yang tidak seberuntung saya."],
    chg: ["Saya suka mengalami hal-hal baru dan perubahan dalam keseharian.", "Saya suka makan di restoran yang baru atau asing.", "Saya suka bepergian dan tinggal di berbagai tempat.", "Saya suka mengikuti mode-mode baru."],
    end: ["Saya ingin mengerjakan sampai selesai setiap tugas yang telah saya mulai.", "Saya suka bekerja berjam-jam tanpa diganggu.", "Saya suka bertahan menghadapi masalah sekalipun tampaknya tak akan berhasil.", "Saya suka bekerja keras pada setiap pekerjaan yang saya hadapi."],
    het: ["Saya suka bergaul dengan orang dari lawan jenis.", "Saya ingin dianggap menarik oleh lawan jenis.", "Saya suka berkencan dengan lawan jenis.", "Saya suka membaca cerita yang berkisar tentang hubungan percintaan."],
    agg: ["Saya suka menyerang pendirian yang bertentangan dengan pendapat saya.", "Saya ingin mengecam seseorang di muka umum bila ia memang pantas.", "Saya kadang begitu marah sehingga ingin melempar barang.", "Saya suka memperolok orang yang melakukan hal yang saya anggap bodoh."],
  };
  // bangun 45 pasangan: tiap need dipasangkan dengan need lain secara merata (round-robin)
  const needs = Object.keys(S);
  const pairs = [];
  let idx = 0;
  for (let round = 0; round < 3; round++) {
    const rot = needs.slice(round + 1).concat(needs.slice(0, round + 1));
    for (let i = 0; i < needs.length; i += 2) {
      const a = needs[i], b = rot[i];
      if (a === b) continue;
      pairs.push({ A: { need: a, text: S[a][idx % 4] }, B: { need: b, text: S[b][(idx + 1) % 4] } });
      idx++;
    }
  }
  INV.epps = {
    id: "epps", title: "Simulasi EPPS (45 pasang)", instr: "Pilih pernyataan yang <b>lebih menggambarkan diri Anda</b>. Jika keduanya Anda sukai atau tidak sukai, tetap pilih satu yang paling mendekati. Jawab spontan dan jujur; waktu ± 10 menit.",
    type: "pair", items: pairs.slice(0, 45), scales: NEED,
    interpret(scores) {
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 3).map(([k]) => NEED[k]), low = sorted.slice(-3).map(([k]) => NEED[k]);
      const notes = [];
      if ((scores.agg || 0) >= 4) notes.push("Skor <b>agresi</b> relatif tinggi. Dalam seleksi kerja ini sering menjadi catatan. Periksa apakah pilihanmu benar-benar mencerminkan perilaku kerja sehari-hari.");
      if ((scores.aba || 0) >= 4) notes.push("Skor <b>abasement</b> (merasa bersalah/rendah diri) relatif tinggi; untuk posisi yang butuh kepercayaan diri, HRD mungkin menggali hal ini di wawancara.");
      if ((scores.suc || 0) >= 4) notes.push("Skor <b>succorance</b> tinggi dibaca sebagai kebutuhan dukungan yang besar; seimbangkan dengan kemandirian.");
      if ((scores.ach || 0) >= 4 && (scores.end || 0) >= 3) notes.push("Kombinasi <b>achievement + endurance</b> yang tinggi adalah profil yang umumnya disukai untuk hampir semua posisi.");
      if ((scores.dom || 0) >= 4 && (scores.def || 0) >= 4) notes.push("Dominance dan deference sama-sama tinggi — di tes nyata pola ini dapat dibaca kontradiktif. Tentukan gaya kerjamu yang sebenarnya.");
      return { top, low, notes };
    },
  };

  /* ---------------- DISC: kelompok 4 kata, pilih Most & Least ---------------- */
  const DISC_LABEL = { D: "Dominance", I: "Influence", S: "Steadiness", C: "Compliance" };
  INV.disc = {
    id: "disc", title: "Simulasi DISC (16 kelompok)", instr: "Pada setiap kelompok, pilih satu kata yang <b>PALING</b> menggambarkan diri Anda di tempat kerja (Most) dan satu kata yang <b>PALING TIDAK</b> menggambarkan Anda (Least). Keduanya tidak boleh sama.",
    type: "mostleast", scales: DISC_LABEL,
    items: [
      [["Tegas", "D"], ["Persuasif", "I"], ["Sabar", "S"], ["Teliti", "C"]],
      [["Berani mengambil risiko", "D"], ["Antusias", "I"], ["Setia", "S"], ["Sistematis", "C"]],
      [["Kompetitif", "D"], ["Ramah", "I"], ["Tenang", "S"], ["Hati-hati", "C"]],
      [["Cepat memutuskan", "D"], ["Optimis", "I"], ["Pendengar yang baik", "S"], ["Akurat", "C"]],
      [["Menuntut", "D"], ["Ekspresif", "I"], ["Konsisten", "S"], ["Analitis", "C"]],
      [["Mandiri", "D"], ["Suka bergaul", "I"], ["Kooperatif", "S"], ["Patuh prosedur", "C"]],
      [["Berorientasi hasil", "D"], ["Menginspirasi", "I"], ["Dapat diandalkan", "S"], ["Perfeksionis", "C"]],
      [["Blak-blakan", "D"], ["Spontan", "I"], ["Rendah hati", "S"], ["Logis", "C"]],
      [["Percaya diri", "D"], ["Mudah bergaul", "I"], ["Stabil", "S"], ["Disiplin", "C"]],
      [["Suka tantangan", "D"], ["Komunikatif", "I"], ["Pemaaf", "S"], ["Berstandar tinggi", "C"]],
      [["Pemberani", "D"], ["Ceria", "I"], ["Penolong", "S"], ["Tertib", "C"]],
      [["Pengendali", "D"], ["Populer", "I"], ["Lembut", "S"], ["Objektif", "C"]],
      [["Pelopor", "D"], ["Meyakinkan", "I"], ["Setia kawan", "S"], ["Cermat", "C"]],
      [["Tidak sabar", "D"], ["Banyak bicara", "I"], ["Pasif", "S"], ["Kritis", "C"]],
      [["Dominan", "D"], ["Hangat", "I"], ["Penyabar", "S"], ["Berhati-hati", "C"]],
      [["Berinisiatif", "D"], ["Menghibur", "I"], ["Harmonis", "S"], ["Faktual", "C"]],
    ],
    interpret(most, least) {
      const desc = {
        D: "Berorientasi hasil, tegas, suka tantangan. Cocok: kepemimpinan, sales, entrepreneur. Perhatikan: kesabaran dan mendengarkan.",
        I: "Komunikatif, antusias, persuasif. Cocok: marketing, PR, trainer. Perhatikan: detail dan tindak lanjut.",
        S: "Stabil, sabar, kooperatif. Cocok: CS, HR, admin, operasional. Perhatikan: asertivitas saat perubahan.",
        C: "Teliti, analitis, patuh standar. Cocok: finance, QC, engineering, audit. Perhatikan: kecepatan memutuskan.",
      };
      const m = Object.entries(most).sort((a, b) => b[1] - a[1]);
      const l = Object.entries(least).sort((a, b) => b[1] - a[1]);
      const primary = m[0][0], secondary = m[1][0];
      const gap = Object.keys(DISC_LABEL).map((k) => Math.abs((most[k] || 0) - (16 - (least[k] || 0)) / 4)).reduce((a, b) => a + b, 0);
      return { primary, secondary, desc: desc[primary], desc2: desc[secondary], leastTop: l[0][0], gapNote: l[0][0] === primary ? "Dimensi yang paling sering kamu pilih sebagai Most juga sering kamu pilih sebagai Least — ini menunjukkan ketidakkonsistenan. Tentukan gaya kerjamu yang sebenarnya." : null };
    },
  };

  /* ---------------- PAPI: 30 pasang ---------------- */
  const PAPI_LABEL = { N: "Menyelesaikan tugas sendiri", G: "Pekerja keras", A: "Hasrat berprestasi", L: "Peran pemimpin", P: "Mengendalikan orang lain", I: "Membuat keputusan", T: "Tempo/kesibukan", V: "Semangat/energi", X: "Ingin diperhatikan", S: "Hubungan sosial", B: "Diterima kelompok", O: "Kedekatan emosional", R: "Tipe pemikir/teoritis", D: "Perhatian pada detail", C: "Keteraturan", Z: "Kebutuhan perubahan", E: "Pengendalian emosi", K: "Agresi", F: "Dukungan atasan", W: "Butuh aturan/arahan" };
  const PAPI_S = {
    N: "Saya menyelesaikan sendiri tugas yang saya mulai.", G: "Saya bekerja keras.", A: "Saya ingin menjadi yang terbaik di bidang saya.", L: "Saya senang memimpin kelompok.", P: "Saya suka mengatur apa yang harus dilakukan orang lain.", I: "Saya mudah mengambil keputusan.", T: "Saya suka selalu sibuk.", V: "Saya penuh semangat.", X: "Saya senang menjadi pusat perhatian.", S: "Saya senang bergaul dengan banyak orang.", B: "Saya ingin diterima oleh kelompok saya.", O: "Saya membutuhkan kedekatan emosional dengan rekan kerja.", R: "Saya suka berpikir tentang teori dan konsep.", D: "Saya menyukai pekerjaan yang terperinci.", C: "Saya menyukai keteraturan dan rencana yang jelas.", Z: "Saya cepat bosan dengan rutinitas.", E: "Saya tidak mudah marah.", K: "Saya tidak segan berdebat keras untuk membela pendapat saya.", F: "Saya membutuhkan dukungan dari atasan.", W: "Saya lebih nyaman bila ada aturan dan petunjuk yang jelas.",
  };
  const papiKeys = Object.keys(PAPI_S);
  const papiPairs = [];
  for (let r = 1; r <= 3; r++) for (let i = 0; i < papiKeys.length; i += 2) { const a = papiKeys[i], b = papiKeys[(i + r) % papiKeys.length]; if (a !== b) papiPairs.push({ A: { need: a, text: PAPI_S[a] }, B: { need: b, text: PAPI_S[b] } }); }
  INV.papi = {
    id: "papi", title: "Simulasi PAPI Kostick (30 pasang)", instr: "Pilih pernyataan yang <b>lebih menggambarkan</b> cara kerja Anda. Jawab berdasarkan perilaku kerja nyata, bukan yang ideal.",
    type: "pair", items: papiPairs.slice(0, 30), scales: PAPI_LABEL,
    interpret(scores) {
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const top = sorted.slice(0, 4).map(([k]) => `${k} – ${PAPI_LABEL[k]}`), low = sorted.slice(-3).map(([k]) => `${k} – ${PAPI_LABEL[k]}`);
      const notes = [];
      if ((scores.K || 0) >= 2) notes.push("Skor <b>K (agresi)</b> relatif menonjol. Pertimbangkan apakah 'berdebat keras' benar-benar gaya kerjamu; di seleksi, K tinggi sering jadi catatan.");
      if ((scores.W || 0) >= 2 && (scores.L || 0) >= 2) notes.push("<b>W</b> (butuh arahan) dan <b>L</b> (peran pemimpin) sama-sama tinggi — pola yang dapat dibaca kontradiktif.");
      if ((scores.F || 0) >= 2) notes.push("Skor <b>F</b> (dukungan atasan) menonjol: dapat dibaca sebagai ketergantungan pada persetujuan atasan.");
      if ((scores.G || 0) >= 2 && (scores.A || 0) >= 2) notes.push("<b>G + A</b> tinggi: profil pekerja keras berorientasi prestasi — disukai hampir semua posisi.");
      return { top, low, notes };
    },
  };

  /* ---------------- MBTI: 24 item skala 1-5 ---------------- */
  INV.mbti = {
    id: "mbti", title: "Simulasi MBTI (24 pernyataan)", instr: "Nilai seberapa setuju Anda dengan tiap pernyataan (1 = sangat tidak setuju, 5 = sangat setuju). Jawab berdasarkan perilaku kerja yang paling sering.",
    type: "likert", scales: { E: "Extraversion", I: "Introversion", S: "Sensing", N: "Intuition", T: "Thinking", F: "Feeling", J: "Judging", P: "Perceiving" },
    items: [
      ["Saya merasa berenergi setelah bertemu dan berdiskusi dengan banyak orang.", "E"], ["Saya butuh waktu sendiri untuk mengisi ulang energi setelah hari yang sibuk.", "I"],
      ["Saya lebih suka berbicara langsung daripada menulis pesan panjang.", "E"], ["Saya berpikir dulu dengan matang sebelum berbicara di rapat.", "I"],
      ["Saya mudah memulai percakapan dengan orang baru.", "E"], ["Saya lebih nyaman bekerja dalam kelompok kecil atau sendiri.", "I"],
      ["Saya lebih percaya pada fakta dan data konkret daripada firasat.", "S"], ["Saya suka memikirkan kemungkinan dan gambaran besar daripada detail saat ini.", "N"],
      ["Saya memperhatikan detail yang sering terlewat orang lain.", "S"], ["Saya sering melihat pola dan hubungan tersembunyi antar hal.", "N"],
      ["Saya lebih suka instruksi langkah demi langkah yang jelas.", "S"], ["Saya suka mencoba cara baru meskipun cara lama masih berjalan.", "N"],
      ["Saat memutuskan, saya mengutamakan logika dan konsistensi.", "T"], ["Saat memutuskan, saya mempertimbangkan dampaknya pada perasaan orang.", "F"],
      ["Saya bisa memberi kritik tegas jika itu benar, walau tidak menyenangkan.", "T"], ["Saya berusaha menjaga keharmonisan tim meski harus mengalah.", "F"],
      ["Saya lebih dihargai karena kompetensi daripada karena keramahan.", "T"], ["Saya mudah merasakan suasana hati orang di sekitar saya.", "F"],
      ["Saya suka rencana yang pasti dan tenggat yang jelas.", "J"], ["Saya suka menjaga opsi tetap terbuka sampai saat terakhir.", "P"],
      ["Saya menyelesaikan tugas jauh sebelum tenggat.", "J"], ["Saya bekerja paling baik di bawah tekanan menjelang tenggat.", "P"],
      ["Meja kerja dan berkas saya tertata rapi.", "J"], ["Saya mudah beradaptasi bila rencana berubah mendadak.", "P"],
    ],
    interpret(scores) {
      const pick = (a, b) => ((scores[a] || 0) >= (scores[b] || 0) ? a : b);
      const type = pick("E", "I") + pick("S", "N") + pick("T", "F") + pick("J", "P");
      const close = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]].filter(([a, b]) => Math.abs((scores[a] || 0) - (scores[b] || 0)) <= 1).map(([a, b]) => `${a}–${b}`);
      const desc = {
        ISTJ: "Teliti, bertanggung jawab, logis. Cocok: akuntansi, audit, administrasi, operasional.", ISFJ: "Setia, teliti, peduli. Cocok: HR, administrasi, layanan kesehatan.", INFJ: "Idealis, insightful, terorganisir. Cocok: HR, konseling, penulisan.", INTJ: "Strategis, mandiri, analitis. Cocok: perencanaan, IT, riset.",
        ISTP: "Praktis, pemecah masalah teknis. Cocok: teknik, IT support, lapangan.", ISFP: "Lembut, estetis, fleksibel. Cocok: desain, layanan, kesehatan.", INFP: "Idealis, kreatif, empatik. Cocok: penulisan, HR, konten.", INTP: "Analitis, konseptual, ingin tahu. Cocok: riset, data, pengembangan.",
        ESTP: "Energik, pragmatis, suka aksi. Cocok: sales, operasional, lapangan.", ESFP: "Spontan, ramah, antusias. Cocok: event, sales, hospitality.", ENFP: "Antusias, kreatif, komunikatif. Cocok: marketing, kreatif, HR.", ENTP: "Inovatif, argumentatif, cepat. Cocok: strategi, bisnis, produk.",
        ESTJ: "Terorganisir, tegas, praktis. Cocok: manajemen, operasional, keuangan.", ESFJ: "Kooperatif, peduli, teratur. Cocok: HR, CS, administrasi.", ENFJ: "Karismatik, pembimbing, terorganisir. Cocok: trainer, HR, kepemimpinan.", ENTJ: "Pemimpin alami, strategis, tegas. Cocok: manajemen, konsultan, bisnis.",
      };
      return { type, desc: desc[type], close };
    },
  };
})(window.PSI);

/* js/data/bank_tpa.js */
/* Pengayaan soal (Nov 2026): gaya aplikasi seleksi online TPA (subtes matematika 20 soal),
   tabel integrated reasoning, dan wacana Benar/Salah/Tidak dapat disimpulkan tambahan.
   Dimuat setelah modules.js dan bank_*.js; menambah bagian & soal tanpa mengubah file asal. */
(function (P) {
  const step = (n, t) => `<div class="step"><span class="n">${n}</span><div>${t}</div></div>`;
  const ex = (q, a) => `<div class="example"><div class="ex-q">${q}</div><div class="ex-a">${a}</div></div>`;
  const tip = (t) => `<div class="callout callout-tip"><span class="co-ico">${P.icon("bulb", 22)}</span><div>${t}</div></div>`;
  const warn = (t) => `<div class="callout callout-danger"><span class="co-ico">${P.icon("alert", 22)}</span><div>${t}</div></div>`;
  const info = (t) => `<div class="callout callout-info"><span class="co-ico">${P.icon("info", 22)}</span><div>${t}</div></div>`;

  /* ------------------------------------------------------------ FIGUR: lingkaran dalam persegi panjang */
  const circlesFig = (() => {
    const d = 40, cols = 3, rows = 2, pad = 10, W = cols * d, H = rows * d;
    let c = "";
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) c += `<circle cx="${pad + d / 2 + k * d}" cy="${pad + d / 2 + r * d}" r="${d / 2}" fill="var(--fig-bg)" stroke="var(--fig-stroke)" stroke-width="2"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + 2 * pad} ${H + 2 * pad}" style="max-width:220px;width:100%;height:auto" role="img"><defs><pattern id="hatchTpa" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--fig-stroke)" stroke-width="1.6"/></pattern></defs><rect x="${pad}" y="${pad}" width="${W}" height="${H}" fill="url(#hatchTpa)" stroke="var(--fig-stroke)" stroke-width="2"/>${c}</svg>`;
  })();

  /* ------------------------------------------------------------ BANK: MATEMATIKA TPA */
  const I3 = ["I saja", "I dan II", "I dan III", "II dan III", "I, II, dan III"];
  const tpa = [
    // Bilangan & aljabar dasar
    { d: 1, q: "Jika n/4 + n/6 = 5/12, maka n² sama dengan …", o: ["1", "5", "25", "1/4", "12"], a: 0, e: "Samakan penyebut 12: 3n/12 + 2n/12 = 5n/12 = 5/12 → n = 1 → n² = <b>1</b>. Jebakan: menjawab 5 (pembilang) atau 25 (5²)." },
    { d: 1, q: "Besar sudut ∠A = 76°. Besar sudut suplemen ∠A adalah …", o: ["104°", "14°", "76°", "38°", "284°"], a: 0, e: "Suplemen = pasangan yang jumlahnya 180°: 180° − 76° = <b>104°</b>. 14° adalah komplemen (jumlah 90°) — dua istilah ini paling sering tertukar." },
    { d: 1, q: "Besar sudut ∠B = 37°. Besar sudut komplemen ∠B adalah …", o: ["53°", "143°", "37°", "63°", "127°"], a: 0, e: "Komplemen berjumlah 90°: 90° − 37° = <b>53°</b>. 143° adalah suplemen (jumlah 180°)." },
    { d: 1, q: "25% dari 3/5 dari 400 adalah …", o: ["60", "100", "240", "150", "75"], a: 0, e: "3/5 × 400 = 240; 25% × 240 = <b>60</b>. Kerjakan dari belakang (\"dari\" = kali)." },
    { d: 1, q: "Nilai dari 0,25 × 48 + 3/4 × 16 adalah …", o: ["24", "28", "20", "36", "16"], a: 0, e: "0,25 × 48 = 12; 3/4 × 16 = 12; jumlah <b>24</b>. Ubah 0,25 menjadi 1/4 agar cepat." },
    { d: 1, q: "Luas lingkaran yang kelilingnya 10π cm adalah …", o: ["25π cm²", "10π cm²", "100π cm²", "5π cm²", "50π cm²"], a: 0, e: "Keliling 2πr = 10π → r = 5. Luas πr² = <b>25π cm²</b>." },
    { d: 2, q: "Bilangan kelipatan 3 yang bukan kelipatan 4 di antara 20 dan 40 adalah …", o: ["21, 27, 30, 33, 39", "21, 24, 27, 30, 33, 36, 39", "24, 36", "21, 27, 33, 39", "27, 30, 33"], a: 0, e: "Kelipatan 3 antara 20–40: 21, 24, 27, 30, 33, 36, 39. Buang yang juga kelipatan 4 (24 dan 36) → <b>21, 27, 30, 33, 39</b>. Opsi tanpa 30 adalah jebakan bagi yang membuang semua bilangan genap." },
    { d: 2, q: "Hasil kali dua bilangan ganjil positif berurutan sama dengan tujuh kali jumlah keduanya dikurangi satu. Bilangan yang lebih kecil adalah …", o: ["13", "15", "11", "17", "9"], a: 0, e: "Misal x dan x + 2: x(x + 2) = 7(2x + 2) − 1 → x² + 2x = 14x + 13 → x² − 12x − 13 = 0 → (x − 13)(x + 1) = 0 → x = <b>13</b>. Cek: 13 × 15 = 195 dan 7 × 28 − 1 = 195. Lebih cepat lagi: uji opsi dari tengah." },
    { d: 2, q: "Manakah yang <b>bukan</b> faktorisasi dari 27x² − 75y²?", o: ["3(3x − 5y)²", "3(3x + 5y)(3x − 5y)", "(9x + 15y)(3x − 5y)", "(3x + 5y)(9x − 15y)", "Semua merupakan faktorisasi"], a: 0, noShuffle: false, e: "27x² − 75y² = 3(9x² − 25y²) = 3(3x + 5y)(3x − 5y). Opsi (9x + 15y)(3x − 5y) dan (3x + 5y)(9x − 15y) hanya memindahkan faktor 3, jadi tetap benar. <b>3(3x − 5y)²</b> = 27x² − 90xy + 75y² — bukan bentuk selisih kuadrat. Kunci: uraikan opsi yang mencurigakan." },
    { d: 2, q: "Jika 3x − 2y = 12 dan x + y = 9, maka x − y = …", o: ["3", "9", "6", "−3", "1"], a: 0, e: "Dari x = 9 − y: 3(9 − y) − 2y = 12 → 27 − 5y = 12 → y = 3, x = 6. x − y = <b>3</b>." },
    { d: 2, q: "√0,0081 + √1,44 = …", o: ["1,29", "1,209", "0,129", "12,9", "1,92"], a: 0, e: "√0,0081 = 0,09 (karena 0,09² = 0,0081) dan √1,44 = 1,2. Jumlah <b>1,29</b>. Hitung jumlah angka desimal: akar membagi dua banyaknya angka di belakang koma." },
    { d: 2, q: "1/4, 1, 4, 16, 64, …", o: ["256", "128", "264", "252", "244"], a: 0, e: "Setiap suku dikali 4: 64 × 4 = <b>256</b>. Deret geometri sering diawali pecahan agar polanya tersamar." },
    { d: 2, q: "2/3, 2, 6, 18, 54, …", o: ["162", "108", "156", "72", "216"], a: 0, e: "Rasio 3: 2/3 × 3 = 2, 2 × 3 = 6, …, 54 × 3 = <b>162</b>." },
    { d: 2, q: "Rata-rata lima bilangan adalah 18. Jika satu bilangan dibuang, rata-ratanya menjadi 16. Bilangan yang dibuang adalah …", o: ["26", "2", "18", "34", "22"], a: 0, e: "Jumlah awal 5 × 18 = 90; sisa 4 × 16 = 64. Yang dibuang 90 − 64 = <b>26</b>." },
    { d: 2, q: "Keliling sebuah persegi panjang 54 cm dan panjangnya dua kali lebarnya. Luasnya adalah …", o: ["162 cm²", "182 cm²", "81 cm²", "144 cm²", "216 cm²"], a: 0, e: "2(2l + l) = 54 → 6l = 54 → l = 9, p = 18. Luas 18 × 9 = <b>162 cm²</b>." },
    { d: 2, q: "Diagonal sebuah persegi 8√2 cm. Luas persegi tersebut adalah …", o: ["64 cm²", "128 cm²", "32 cm²", "16√2 cm²", "256 cm²"], a: 0, e: "Diagonal persegi = s√2 → s = 8 cm. Luas = <b>64 cm²</b>. Cara cepat lain: luas = d²/2 = 128/2." },
    { d: 2, q: "Sudut-sudut sebuah segitiga berbanding 2 : 3 : 4. Besar sudut terbesarnya adalah …", o: ["80°", "60°", "90°", "40°", "100°"], a: 0, e: "2 + 3 + 4 = 9 bagian = 180° → 1 bagian 20°. Terbesar 4 × 20° = <b>80°</b>." },
    { d: 2, q: "Sebuah trapesium sama kaki memiliki garis tengah (median) 15 cm dan panjang masing-masing kaki 7 cm. Keliling trapesium tersebut adalah …", o: ["44 cm", "37 cm", "29 cm", "52 cm", "105 cm"], a: 0, e: "Median trapesium = (a + b)/2 → a + b = 2 × 15 = 30 cm. Keliling = 30 + 7 + 7 = <b>44 cm</b>. Kamu tidak perlu tahu panjang masing-masing sisi sejajar." },
    { d: 2, q: "Tiga bersaudara membagi rata sekantong kue. Kakak tertua memberikan sepertiga bagiannya kepada si bungsu, dan anak kedua memberikan setengah bagiannya kepada si bungsu. Berapa bagian dari seluruh kue yang kini dimiliki si bungsu?", o: ["11/18", "1/2", "5/9", "7/18", "2/3"], a: 0, e: "Masing-masing awalnya 1/3. Dari kakak: 1/3 × 1/3 = 1/9. Dari anak kedua: 1/2 × 1/3 = 1/6. Total bungsu = 1/3 + 1/9 + 1/6 = 6/18 + 2/18 + 3/18 = <b>11/18</b>. Jangan lupa bagian awal si bungsu sendiri." },
    { d: 2, q: "Sebuah toko selalu menjual barang 40% di atas harga belinya. Saat obral, sisa barang dijual 20% <b>di bawah harga beli</b>. Jika harga normal sebuah tas Rp210.000, berapa harga obralnya?", o: ["Rp120.000", "Rp168.000", "Rp126.000", "Rp150.000", "Rp84.000"], a: 0, e: "Harga beli = 210.000 ÷ 1,4 = 150.000. Harga obral = 150.000 × 0,8 = <b>Rp120.000</b>. Jebakan: 210.000 × 0,8 = 168.000 (diskon dihitung dari harga normal, bukan harga beli)." },
    { d: 2, q: "Berapa banyak bilangan bulat dari 1 sampai 100 yang habis dibagi 6 atau 9?", o: ["22", "27", "16", "11", "33"], a: 0, e: "Habis dibagi 6: ⌊100/6⌋ = 16. Habis dibagi 9: ⌊100/9⌋ = 11. Keduanya (habis dibagi KPK 18): ⌊100/18⌋ = 5. Total 16 + 11 − 5 = <b>22</b>." },
    { d: 2, q: "Benda dijatuhkan dari puncak menara setinggi 144 kaki. Ketinggiannya setelah t detik adalah h = −16t² + 144. Setelah berapa detik benda menyentuh tanah?", o: ["3 detik", "9 detik", "4,5 detik", "2 detik", "12 detik"], a: 0, e: "Menyentuh tanah berarti h = 0: 16t² = 144 → t² = 9 → t = <b>3 detik</b> (waktu tidak negatif)." },
    { d: 2, q: "Kendaraan pergi dengan kecepatan 60 km/jam dan pulang melalui jalan yang sama dengan 40 km/jam. Kecepatan rata-rata pulang-pergi adalah …", o: ["48 km/jam", "50 km/jam", "45 km/jam", "52 km/jam", "100 km/jam"], a: 0, e: "Misal jarak 120 km: pergi 2 jam, pulang 3 jam. Rata-rata = 240 ÷ 5 = <b>48 km/jam</b>. Bukan (60 + 40)/2 = 50, karena waktu tempuhnya tidak sama." },
    { d: 2, q: "Lingkaran-lingkaran pada gambar kongruen, saling bersinggungan, dan menyinggung sisi persegi panjang. Jika diameter tiap lingkaran 6 cm, berapakah luas daerah yang diarsir?", fig: circlesFig, o: ["216 − 54π cm²", "216 − 216π cm²", "108 − 54π cm²", "216 − 36π cm²", "54π cm²"], a: 0, e: "Persegi panjang: 3 diameter × 2 diameter = 18 × 12 = 216 cm². Enam lingkaran berjari-jari 3: 6 × 9π = 54π. Arsiran = <b>216 − 54π cm²</b>." },
    // Sulit
    { d: 3, q: "ΔPQR siku-siku di Q dengan PQ = QR. Sisi QR diperpanjang melalui R sampai titik S sehingga terbentuk sudut luar ∠PRS. Pernyataan yang tepat:<br>I. m∠PRS &gt; m∠QPR<br>II. ∠PRS dan ∠PRQ saling suplemen<br>III. ∠PQR dan ∠PRQ kongruen", o: I3, a: 1, noShuffle: true, e: "Segitiga siku-siku sama kaki: ∠Q = 90°, ∠P = ∠R = 45°. ∠PRS = 180° − 45° = 135° &gt; 45° → I benar. ∠PRS + ∠PRQ = 180° → II benar. ∠PQR = 90° ≠ ∠PRQ = 45° → III salah. Jawaban <b>I dan II</b>." },
    { d: 3, q: "Sebuah mobil menempuh 15 km per liter bensin pada kecepatan 60 km/jam. Jika kecepatan dinaikkan menjadi 90 km/jam, jarak yang dapat ditempuh per liter berkurang 20%. Berapa jarak yang ditempuh dengan 25 liter bensin pada kecepatan 90 km/jam?", o: ["300 km", "375 km", "360 km", "315 km", "280 km"], a: 0, e: "Efisiensi baru 15 × 0,8 = 12 km/liter. 12 × 25 = <b>300 km</b>. Opsi 375 km adalah hasil jika lupa menerapkan pengurangan 20%." },
    { d: 3, q: "Bola dilempar ke atas dengan ketinggian h = −5t² + 20t meter setelah t detik. Berapa lama bola berada di atas ketinggian 15 meter?", o: ["2 detik", "1 detik", "3 detik", "4 detik", "1,5 detik"], a: 0, e: "−5t² + 20t &gt; 15 → t² − 4t + 3 &lt; 0 → (t − 1)(t − 3) &lt; 0 → 1 &lt; t &lt; 3. Lamanya 3 − 1 = <b>2 detik</b>." },
    { d: 3, q: "Jika a/b = 3/4 dan b/c = 2/5, maka (a + c)/b = …", o: ["13/4", "23/20", "7/4", "13/20", "3/10"], a: 0, e: "a = 3b/4 dan c = 5b/2. (a + c)/b = 3/4 + 5/2 = 3/4 + 10/4 = <b>13/4</b>." },
    { d: 3, q: "Jumlah tiga bilangan genap berurutan adalah 78. Hasil kali bilangan terkecil dan terbesar adalah …", o: ["672", "676", "624", "728", "650"], a: 0, e: "Bilangan tengah = 78 ÷ 3 = 26 → 24, 26, 28. 24 × 28 = <b>672</b>. (676 = 26², jebakan bagi yang mengalikan bilangan tengah.)" },
    { d: 3, q: "Jika 2^(x + 1) = 4^(x − 1), maka nilai x adalah …", o: ["3", "1", "2", "−3", "5"], a: 0, e: "4^(x − 1) = 2^(2x − 2). Samakan pangkat: x + 1 = 2x − 2 → x = <b>3</b>." },
    { d: 3, q: "Harga 3 pensil dan 2 buku Rp19.000, sedangkan 2 pensil dan 3 buku Rp21.000. Harga 1 pensil dan 1 buku adalah …", o: ["Rp8.000", "Rp7.500", "Rp9.000", "Rp10.000", "Rp8.500"], a: 0, e: "Jumlahkan kedua persamaan: 5 pensil + 5 buku = 40.000 → 1 pensil + 1 buku = <b>Rp8.000</b>. Tidak perlu mencari harga masing-masing." },
    { d: 3, q: "Tangga sepanjang 13 m bersandar pada dinding tegak dengan kaki tangga 5 m dari dinding. Jika ujung atas tangga merosot 7 m, kaki tangga bergeser menjauhi dinding sejauh …", o: ["7 m", "5 m", "12 m", "2 m", "9 m"], a: 0, e: "Tinggi awal √(13² − 5²) = 12 m. Setelah merosot 7 m, tinggi 5 m → jarak kaki √(13² − 5²) = 12 m. Pergeseran 12 − 5 = <b>7 m</b> (tripel 5-12-13 tertukar posisinya)." },
  ];

  /* ------------------------------------------------------------ TABEL INTEGRATED REASONING (ongkos kirim) */
  const tblKurir = `<div class="table-wrap"><table><tr><th>Layanan</th><th>Tarif dasar</th><th>Tambahan per kg berikutnya</th><th>Estimasi</th></tr>
<tr><td>Kilat</td><td>Rp18.000 (≤ 1 kg)</td><td>Rp9.000</td><td>1 hari</td></tr>
<tr><td>Reguler</td><td>Rp11.000 (≤ 1 kg)</td><td>Rp6.000</td><td>3 hari</td></tr>
<tr><td>Hemat</td><td>Rp8.000 (≤ 1 kg)</td><td>Rp5.000</td><td>5 hari</td></tr>
<tr><td>Kargo (min. 5 kg)</td><td>Rp30.000 (≤ 5 kg)</td><td>Rp3.500</td><td>6 hari</td></tr></table></div>
<p class="small muted">Berat dibulatkan ke atas per kg.</p>`;
  const cerita = [
    { d: 2, q: tblKurir + "Berapa ongkos mengirim paket 4 kg dengan layanan Reguler?", o: ["Rp29.000", "Rp35.000", "Rp24.000", "Rp33.000", "Rp26.000"], a: 0, e: "1 kg pertama Rp11.000 + 3 kg berikutnya × Rp6.000 = 11.000 + 18.000 = <b>Rp29.000</b>. Jebakan Rp35.000: mengalikan tambahan dengan 4 kg." },
    { d: 3, q: tblKurir + "Untuk paket 8 kg, layanan mana yang paling murah dan berapa ongkosnya?", o: ["Kargo, Rp40.500", "Hemat, Rp43.000", "Reguler, Rp53.000", "Kargo, Rp58.000", "Hemat, Rp40.000"], a: 0, e: "Kilat 18.000 + 7 × 9.000 = 81.000; Reguler 11.000 + 7 × 6.000 = 53.000; Hemat 8.000 + 7 × 5.000 = 43.000; Kargo 30.000 + 3 × 3.500 = 40.500. Termurah <b>Kargo, Rp40.500</b>. Ingat tarif dasar Kargo sudah mencakup 5 kg." },
    { d: 3, q: tblKurir + "Untuk paket 5 kg ke atas, mulai berat berapa layanan Kargo lebih murah daripada Hemat?", o: ["7 kg", "6 kg", "5 kg", "8 kg", "10 kg"], a: 0, e: "Hemat = 8.000 + 5.000(w − 1); Kargo = 30.000 + 3.500(w − 5). 5 kg: 28.000 vs 30.000; 6 kg: 33.000 vs 33.500 (Hemat masih lebih murah); 7 kg: 38.000 vs 37.000 → Kargo lebih murah mulai <b>7 kg</b>." },
  ];

  /* ------------------------------------------------------------ WACANA TAMBAHAN */
  const TFC = ["Benar", "Salah", "Tidak dapat disimpulkan"];
  const psgSurvei = "Survei sebuah lembaga riset terhadap 2.000 karyawan kantor di lima kota besar menemukan bahwa 62% responden yang bekerja dengan pola hibrida melaporkan tingkat stres yang lebih rendah dibandingkan saat bekerja penuh dari kantor. Namun, 41% dari kelompok yang sama mengaku lebih sulit memisahkan jam kerja dari waktu pribadi. Peneliti menyarankan perusahaan menetapkan batas jam komunikasi kerja agar manfaat pola hibrida tidak tergerus.";
  const psgPlastik = "Sejak kebijakan kantong plastik berbayar diterapkan di seluruh gerai sebuah jaringan minimarket di Kota X pada awal 2024, penggunaan kantong plastik sekali pakai di jaringan tersebut turun 48% dalam setahun. Pengelola mencatat penjualan tas belanja kain meningkat, tetapi belum mengukur apakah tas tersebut dipakai berulang kali. Kebijakan serupa belum diterapkan di pasar tradisional kota itu.";
  const wacana = [
    { d: 1, p: psgSurvei, q: "Sebagian besar responden yang bekerja hibrida melaporkan tingkat stres yang lebih rendah.", o: TFC, a: 0, noShuffle: true, e: "62% berarti lebih dari separuh → \"sebagian besar\" sesuai teks. <b>Benar</b>." },
    { d: 2, p: psgSurvei, q: "Pola kerja hibrida meningkatkan produktivitas karyawan.", o: TFC, a: 2, noShuffle: true, e: "Teks membahas stres dan batas waktu pribadi, bukan produktivitas. Masuk akal, tetapi tidak ada di teks → <b>Tidak dapat disimpulkan</b>." },
    { d: 2, p: psgSurvei, q: "Survei hanya dilakukan di satu kota.", o: TFC, a: 1, noShuffle: true, e: "Teks menyebut <i>lima kota besar</i>. Bertentangan → <b>Salah</b>." },
    { d: 3, p: psgSurvei, q: "Menurut survei, pola kerja hibrida tidak memiliki dampak negatif bagi karyawan.", o: TFC, a: 1, noShuffle: true, e: "41% responden hibrida sulit memisahkan jam kerja dan waktu pribadi — itu dampak negatif yang disebut teks. Pernyataan bertentangan → <b>Salah</b>." },
    { d: 1, p: psgPlastik, q: "Penggunaan kantong plastik sekali pakai di jaringan minimarket tersebut menurun setelah kebijakan diterapkan.", o: TFC, a: 0, noShuffle: true, e: "Teks: turun 48% dalam setahun. <b>Benar</b>." },
    { d: 2, p: psgPlastik, q: "Volume sampah plastik di Kota X turun 48% sejak 2024.", o: TFC, a: 2, noShuffle: true, e: "Angka 48% hanya untuk kantong plastik di <b>jaringan minimarket itu</b>, bukan seluruh sampah plastik kota. Teks tidak memberi data sampah kota → <b>Tidak dapat disimpulkan</b>. Jebakan klasik: memperluas cakupan angka." },
    { d: 2, p: psgPlastik, q: "Pasar tradisional di Kota X sudah mengenakan biaya untuk kantong plastik.", o: TFC, a: 1, noShuffle: true, e: "Teks: kebijakan serupa <i>belum</i> diterapkan di pasar tradisional. <b>Salah</b>." },
    { d: 3, p: psgPlastik, q: "Tas belanja kain yang terjual dipakai berulang kali oleh pembelinya.", o: TFC, a: 2, noShuffle: true, e: "Teks menyatakan pengelola <i>belum mengukur</i> pemakaian ulang. Kita tidak tahu benar atau salahnya → <b>Tidak dapat disimpulkan</b>." },
  ];

  P.BANK.numerik.tpa = tpa;
  P.BANK.numerik.cerita = P.BANK.numerik.cerita.concat(cerita);
  P.BANK.verbal.wacana = P.BANK.verbal.wacana.concat(wacana);

  /* ------------------------------------------------------------ BAGIAN BARU: MATEMATIKA TPA */
  const num = P.MODULES.find((m) => m.id === "numerik");
  if (num && !num.sections.some((s) => s.id === "tpa")) {
    num.sections.push({
      id: "tpa", title: "Matematika TPA (Aljabar, Geometri, Bilangan)", desc: "Gaya subtes matematika di aplikasi seleksi online: 20 soal, 5 opsi, sekitar 30 detik per soal.",
      quiz: { count: 12, time: 480 }, sim: { count: 10, time: 360 }, source: ["bank"],
      materi: `
<p class="lead">Banyak perusahaan kini memakai <b>aplikasi seleksi online</b> dengan subtes TPA (misalnya TPA 3A, 3B, 3C) berisi <b>20 soal per halaman bernomor</b>, satu timer untuk seluruh subtes (sekitar 10 menit), dan lima opsi A–E. Subtes matematikanya bukan sekadar deret: ada <b>aljabar, geometri sudut dan bidang, pecahan, persen berantai, dan rumus fisika sederhana</b>.</p>
<h2>Pola yang paling sering muncul</h2>
<table><tr><th>Topik</th><th>Yang harus hafal</th></tr>
<tr><td>Sudut</td><td><b>Komplemen</b> berjumlah 90°, <b>suplemen</b> berjumlah 180°. Sudut luar segitiga = 180° − sudut dalam di sebelahnya = jumlah dua sudut dalam lainnya.</td></tr>
<tr><td>Trapesium</td><td>Garis tengah (median) = (sisi sejajar atas + bawah) ÷ 2. Keliling = 2 × median + kedua kaki.</td></tr>
<tr><td>Lingkaran</td><td>Keliling 2πr, luas πr². Soal \"daerah diarsir\" = luas bangun luar − luas lingkaran.</td></tr>
<tr><td>Faktorisasi</td><td>a² − b² = (a + b)(a − b). Faktor konstanta boleh dipindah ke kurung mana saja.</td></tr>
<tr><td>Kelipatan</td><td>\"Habis dibagi a atau b\" = n(a) + n(b) − n(KPK).</td></tr>
<tr><td>Persen berantai</td><td>Harga jual = beli × (1 + markup). Diskon \"di bawah harga asli/beli\" dihitung dari harga beli, bukan harga label.</td></tr>
<tr><td>Rumus gerak</td><td>h = −16t² + h₀ (kaki) atau −5t² + v₀t (meter): \"menyentuh tanah\" berarti h = 0; \"di atas ketinggian k\" berarti selesaikan h &gt; k.</td></tr></table>
<h2>Cara mengerjakan 20 soal dalam 10 menit</h2>
${step(1, "<b>Sapu cepat dulu.</b> Kerjakan soal yang langsung terlihat caranya (sudut, persen, deret). Soal panjang ditandai dan dilewati — navigasi nomor di bawah layar memungkinkan kembali kapan saja.")}
${step(2, "<b>Uji opsi.</b> Untuk persamaan (bilangan berurutan, pangkat), memasukkan opsi C (tengah) sering lebih cepat daripada menyusun persamaan kuadrat.")}
${step(3, "<b>Gabungkan persamaan, jangan pecahkan semuanya.</b> \"3p + 2b = 19.000 dan 2p + 3b = 21.000, berapa p + b?\" → jumlahkan: 5(p + b) = 40.000.")}
${step(4, "<b>Jangan kosongkan jawaban</b> bila tidak ada pengurangan nilai untuk jawaban salah: tebak terarah dengan membuang opsi yang mustahil.")}
<h2>Contoh terbimbing</h2>
${ex("Tiga bersaudara membagi rata kue. Kakak tertua memberi 1/3 bagiannya ke si bungsu, anak kedua memberi 1/2 bagiannya. Berapa bagian si bungsu sekarang?", "Masing-masing 1/3. Tambahan: 1/3 × 1/3 = 1/9 dan 1/2 × 1/3 = 1/6. Total = 1/3 + 1/9 + 1/6 = <b>11/18</b>. Kesalahan umum: lupa bagian awal si bungsu.")}
${ex("Toko menjual barang 40% di atas harga beli. Saat obral dijual 20% di bawah harga beli. Harga normal Rp210.000 — berapa harga obral?", "Harga beli 210.000 ÷ 1,4 = 150.000 → obral 150.000 × 0,8 = <b>Rp120.000</b>.")}
${ex("Benda jatuh dari menara: h = −16t² + 144. Kapan menyentuh tanah?", "h = 0 → t² = 9 → <b>t = 3 detik</b>.")}
${warn("Komplemen vs suplemen adalah jebakan paling sering: kedua jawabannya <b>selalu</b> ada di opsi. Ingat: <b>K</b>omplemen = <b>K</b>ecil (90°), <b>S</b>uplemen = <b>S</b>atu garis lurus (180°).")}
${tip("Kalkulator biasanya <b>tidak</b> tersedia di subtes TPA. Latih hitung pecahan dan akar desimal (√0,0081 = 0,09) tanpa alat.")}
`,
    });
  }

  /* ------------------------------------------------------------ Materi tambahan: deret gambar garis & bangun bersarang */
  const fig = P.MODULES.find((m) => m.id === "figural");
  const dg = fig && fig.sections.find((s) => s.id === "deret-gambar");
  if (dg && !dg.source.includes("gen:fig-glyph")) {
    dg.source = dg.source.concat(["gen:fig-glyph"]);
    dg.materi += `
<h2>Gaya TPA online: simbol garis dan bangun bersarang</h2>
<p>Di subtes gambar aplikasi seleksi online (sering disebut TPA 3C), deret biasanya berupa <b>simbol garis sederhana</b> — tongkat dengan bulatan kosong, bulatan hitam, palang, atau mata panah di ujungnya — atau <b>bangun di dalam bangun</b>. Opsinya hanya empat (A–D).</p>
${step(1, "<b>Tentukan arah ujung</b> pada tiap gambar (atas, kanan atas, kanan, …). Hitung besar putarannya: 45° (seperdelapan putaran) atau 90° (seperempat).")}
${step(2, "<b>Cek ujung yang berganti</b>: bulatan kosong ↔ hitam, atau palang muncul-hilang setiap dua langkah.")}
${step(3, "Untuk bangun bersarang, perhatikan <b>bangun luar</b> (sering berganti tiap dua gambar) dan <b>isi di dalamnya</b> (muncul-hilang bergantian).")}
${ex("○ → ◎(persegi di dalam lingkaran) → □ → ▣(lingkaran di dalam persegi) → ?", "Bangun luar berganti tiap dua langkah: lingkaran, lingkaran, persegi, persegi, lalu kembali <b>lingkaran</b>. Isi muncul pada langkah genap saja, jadi gambar ke-5 adalah <b>lingkaran kosong</b>.")}
`;
  }

  /* ------------------------------------------------------------ Materi tambahan: wacana */
  const vb = P.MODULES.find((m) => m.id === "verbal");
  const wc = vb && vb.sections.find((s) => s.id === "wacana");
  if (wc) wc.materi += `
<h2>Jebakan cakupan angka</h2>
${info("Jika teks memberi angka untuk <b>satu kelompok</b> (\"penggunaan kantong plastik di jaringan minimarket turun 48%\"), pernyataan yang memperluasnya ke kelompok lebih besar (\"sampah plastik kota turun 48%\") hampir selalu <b>Tidak dapat disimpulkan</b>. Cocokkan subjek, waktu, dan tempat sebelum memilih Benar.")}
`;
})(window.PSI);

/* js/gen/deret.js */
/* Generator deret angka & huruf dengan penjelasan otomatis */
(function (P) {
  P.GEN = P.GEN || {};
  const fmt = (arr) => arr.join(", ");
  const L = (n) => String.fromCharCode(64 + ((((n - 1) % 26) + 26) % 26) + 1);

  function distractors(rng, ans, spread) {
    const set = new Set([ans]);
    const cands = [ans + 1, ans - 1, ans + 2, ans - 2, ans + spread, ans - spread, ans * 2, Math.round(ans / 2), ans + 3, ans - 3, ans + 5, ans + 10];
    const sh = rng.shuffle(cands.filter((v) => v !== ans && Number.isFinite(v)));
    for (const v of sh) { if (set.size >= 5) break; if (!set.has(v)) set.add(v); }
    let k = 4; while (set.size < 5 && k < 40) { set.add(ans + k * 7); k++; }
    const opts = rng.shuffle([...set]);
    return { options: opts.map(String), answer: opts.indexOf(ans) };
  }

  const TYPES = {
    // 1: aritmetika
    arit: (rng, d) => {
      const a = rng.int(1, d >= 2 ? 40 : 15), s = rng.int(2, d >= 2 ? 13 : 7) * (rng.chance(0.3) ? -1 : 1);
      const seq = Array.from({ length: 6 }, (_, i) => a + i * s);
      return { seq, ans: a + 6 * s, exp: `Deret aritmetika: selisih antar suku tetap ${s > 0 ? "+" : ""}${s}. Suku berikutnya ${seq[5]} ${s >= 0 ? "+" : "−"} ${Math.abs(s)} = <b>${a + 6 * s}</b>.`, diff: 1 };
    },
    // geometri
    geo: (rng, d) => {
      const a = rng.int(1, 5), r = rng.pick(d >= 2 ? [2, 3, 4] : [2, 3]);
      const seq = Array.from({ length: 5 }, (_, i) => a * r ** i);
      return { seq, ans: a * r ** 5, exp: `Deret geometri: tiap suku dikali ${r}. ${seq[4]} × ${r} = <b>${a * r ** 5}</b>.`, diff: 1 };
    },
    // bertingkat
    tingkat: (rng, d) => {
      const a = rng.int(1, 20), s0 = rng.int(1, 5), inc = rng.int(1, d >= 2 ? 4 : 2);
      const seq = [a]; let s = s0;
      for (let i = 0; i < 5; i++) { seq.push(seq[seq.length - 1] + s); s += inc; }
      const ans = seq.pop(); const diffs = []; let t = s0; for (let i = 0; i < 5; i++) { diffs.push("+" + t); t += inc; }
      return { seq, ans, exp: `Deret bertingkat: selisihnya ${diffs.join(", ")} (bertambah ${inc} tiap langkah). ${seq[4]} + ${t - inc} = <b>${ans}</b>.`, diff: 2 };
    },
    // dua operasi bergantian
    gantian: (rng, d) => {
      const a = rng.int(2, 9), k = rng.int(2, 3), m = rng.int(1, d >= 2 ? 5 : 3);
      const seq = [a];
      for (let i = 0; i < 6; i++) seq.push(i % 2 === 0 ? seq[seq.length - 1] * k : seq[seq.length - 1] - m);
      const ans = seq.pop();
      return { seq, ans, exp: `Dua operasi bergantian: ×${k} lalu −${m}, berulang. Langkah terakhir: ${seq[5]} ${seq.length % 2 === 0 ? "×" + k : "− " + m} = <b>${ans}</b>.`, diff: 2 };
    },
    // dua deret berselang
    selang: (rng, d) => {
      const a = rng.int(1, 15), s1 = rng.int(1, 6), b = rng.int(20, 60), s2 = -rng.int(1, 6);
      const seq = []; for (let i = 0; i < 5; i++) { seq.push(a + i * s1); seq.push(b + i * s2); }
      const n = d >= 3 ? 7 : 8; const shown = seq.slice(0, n); const ans = seq[n];
      return { seq: shown, ans, exp: `Dua deret berselang: suku ganjil ${fmt(shown.filter((_, i) => i % 2 === 0))} (+${s1}) dan suku genap ${fmt(shown.filter((_, i) => i % 2 === 1))} (${s2}). Suku berikutnya dari deret ${n % 2 === 0 ? "ganjil" : "genap"}: <b>${ans}</b>.`, diff: 2 };
    },
    // kelompok tiga
    blok: (rng, d) => {
      const a = rng.int(1, 9), p = rng.int(1, 4), q = rng.int(1, 4), step = rng.int(1, 3);
      const seq = []; for (let b = 0; b < 4; b++) { const s = a + b * step; seq.push(s, s + p, s + p + q); }
      const n = d >= 3 ? 10 : 11; const shown = seq.slice(0, n); const ans = seq[n];
      return { seq: shown, ans, exp: `Pola kelompok tiga: (${a}, ${a + p}, ${a + p + q}) (${a + step}, …) — dalam blok +${p} lalu +${q}; awal tiap blok naik ${step}. Suku berikutnya: <b>${ans}</b>.`, diff: 3 };
    },
    // kuadrat +/- k
    kuadrat: (rng, d) => {
      const k = rng.int(-3, 3), start = rng.int(1, 3);
      const seq = Array.from({ length: 5 }, (_, i) => (start + i) ** 2 + k);
      const ans = (start + 5) ** 2 + k;
      return { seq, ans, exp: `Pola n² ${k >= 0 ? "+ " + k : "− " + Math.abs(k)} untuk n = ${start}, ${start + 1}, … Suku berikutnya: ${start + 5}² ${k >= 0 ? "+ " + k : "− " + Math.abs(k)} = <b>${ans}</b>. Selisihnya ganjil berurutan: ${Array.from({ length: 4 }, (_, i) => seq[i + 1] - seq[i]).join(", ")}.`, diff: 2 };
    },
    // fibonacci-like
    fibo: (rng, d) => {
      const a = rng.int(1, 5), b = rng.int(a, 9);
      const seq = [a, b]; for (let i = 0; i < 4; i++) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
      const ans = seq[4] + seq[5];
      return { seq, ans, exp: `Tiap suku = jumlah dua suku sebelumnya (pola Fibonacci): ${seq[4]} + ${seq[5]} = <b>${ans}</b>.`, diff: 2 };
    },
    // 2x ± c
    dobel: (rng, d) => {
      const a = rng.int(2, 7), c = rng.int(1, 3) * (rng.chance(0.5) ? 1 : -1);
      const seq = [a]; for (let i = 0; i < 5; i++) seq.push(seq[seq.length - 1] * 2 + c);
      const ans = seq.pop();
      return { seq, ans, exp: `Tiap suku = 2 × suku sebelumnya ${c > 0 ? "+ " + c : "− " + Math.abs(c)}: ${seq[4]} × 2 ${c > 0 ? "+ " + c : "− " + Math.abs(c)} = <b>${ans}</b>. Ciri: selisih antar suku menggandakan diri.`, diff: 3 };
    },
    // tiga deret berselang
    tiga: (rng, d) => {
      const a = rng.int(20, 40), b = rng.int(1, 9), c = rng.int(2, 12), sb = rng.int(1, 3), sc = rng.int(2, 4);
      const seq = []; for (let i = 0; i < 3; i++) seq.push(a - i, b + i * sb, c + i * sc);
      const shown = seq.slice(0, 8); const ans = seq[8];
      return { seq: shown, ans, exp: `Tiga deret berselang: ${a}, ${a - 1}, ${a - 2} (−1); ${b}, ${b + sb}, ${b + 2 * sb} (+${sb}); ${c}, ${c + sc}, … (+${sc}). Suku ke-9 milik deret ketiga: <b>${ans}</b>.`, diff: 3 };
    },
    // turun bertingkat
    turun: (rng, d) => {
      const a = rng.int(60, 120), s0 = rng.int(8, 15);
      const seq = [a]; let s = s0; for (let i = 0; i < 5; i++) { seq.push(seq[seq.length - 1] - s); s--; }
      const ans = seq.pop();
      return { seq, ans, exp: `Selisih mengecil: −${s0}, −${s0 - 1}, −${s0 - 2}, −${s0 - 3}, lalu −${s0 - 4}. ${seq[4]} − ${s0 - 4} = <b>${ans}</b>.`, diff: 2 };
    },
  };

  P.GEN.deret = function (rng, d = 2) {
    rng = rng || P.R;
    const pool = Object.values(TYPES).filter((t) => true);
    let gen = rng.pick(pool), r = gen(rng, d), tries = 0;
    while (Math.abs(r.diff - d) > 1 && tries++ < 10) { gen = rng.pick(pool); r = gen(rng, d); }
    const o = distractors(rng, r.ans, Math.max(2, Math.abs(r.seq[1] - r.seq[0])));
    return { d: Math.min(3, Math.max(1, r.diff)), q: `${fmt(r.seq)}, …`, o: o.options, a: o.answer, e: r.exp, gen: "deret" };
  };

  /* Deret huruf */
  const HT = {
    lompat: (rng, d) => { const a = rng.int(1, 6), s = rng.int(2, d >= 2 ? 5 : 3); const seq = Array.from({ length: 5 }, (_, i) => a + i * s); return { seq: seq.map(L), ans: L(a + 5 * s), exp: `Lompat ${s} huruf: posisi ${seq.join(", ")} → berikutnya ${a + 5 * s} = <b>${L(a + 5 * s)}</b>. (A=1, E=5, J=10, O=15, T=20, Z=26)`, diff: 1 }; },
    mundur: (rng, d) => { const a = rng.int(20, 26), s = rng.int(1, 3); const seq = Array.from({ length: 5 }, (_, i) => a - i * s); return { seq: seq.map(L), ans: L(a - 5 * s), exp: `Mundur ${s} huruf: posisi ${seq.join(", ")} → ${a - 5 * s} = <b>${L(a - 5 * s)}</b>.`, diff: 1 }; },
    tingkat: (rng, d) => { const a = rng.int(1, 4); const seq = [a]; for (let i = 1; i <= 5; i++) seq.push(seq[i - 1] + i); const ans = seq.pop(); return { seq: seq.map(L), ans: L(ans), exp: `Selisih bertingkat +1, +2, +3, +4, lalu +5: posisi ${seq.join(", ")} → ${ans} = <b>${L(ans)}</b>.`, diff: 2 }; },
    selang: (rng, d) => { const a = rng.int(1, 5), b = rng.int(20, 26); const seq = []; for (let i = 0; i < 4; i++) { seq.push(a + i); seq.push(b - i); } const n = 7; const ans = seq[n]; return { seq: seq.slice(0, n).map(L), ans: L(ans), exp: `Dua deret berselang: ${seq.filter((_, i) => i % 2 === 0).slice(0, 4).map(L).join(", ")} (maju) dan ${seq.filter((_, i) => i % 2 === 1).slice(0, 3).map(L).join(", ")} (mundur). Berikutnya dari deret mundur: <b>${L(ans)}</b>.`, diff: 2 }; },
    pasangan: (rng, d) => { const a = rng.int(1, 6), s = rng.int(1, 3); const seq = []; for (let i = 0; i < 4; i++) seq.push(a + i * s, a + i * s); const ans = a + 4 * s; return { seq: seq.map(L), ans: L(ans), exp: `Tiap huruf muncul dua kali, lalu lompat ${s}: berikutnya posisi ${ans} = <b>${L(ans)}</b>.`, diff: 2 }; },
    pemisah: (rng, d) => { const sep = rng.pick(["Z", "X", "M"]); const a = rng.int(1, 4); const seq = []; for (let i = 0; i < 3; i++) { seq.push(L(a + 2 * i), L(a + 2 * i + 1), sep); } seq.pop(); const ans = sep; return { seq, ans, exp: `Huruf <b>${sep}</b> adalah pemisah tetap setelah setiap dua huruf berurutan (${L(a)}${L(a + 1)}, ${L(a + 2)}${L(a + 3)}, …). Berikutnya: <b>${sep}</b>.`, diff: 2 }; },
    angka: (rng, d) => { const a = rng.int(1, 5), s = rng.int(1, 3), n0 = rng.int(1, 5), ns = rng.int(1, 4); const seq = Array.from({ length: 4 }, (_, i) => L(a + i * s) + (n0 + i * ns)); const ans = L(a + 4 * s) + (n0 + 4 * ns); return { seq, ans, exp: `Huruf lompat ${s} (${Array.from({ length: 5 }, (_, i) => L(a + i * s)).join(", ")}) dan angka +${ns} (${Array.from({ length: 5 }, (_, i) => n0 + i * ns).join(", ")}) → <b>${ans}</b>.`, diff: 3 }; },
    ujung: (rng, d) => { const a = rng.int(1, 6); const seq = Array.from({ length: 4 }, (_, i) => L(a + i) + L(27 - (a + i))); const ans = L(a + 4) + L(27 - (a + 4)); return { seq, ans, exp: `Pasangan huruf ke-n dengan huruf ke-(27−n) dari ujung belakang: ${L(a + 4)}(${a + 4}) berpasangan dengan ${L(27 - a - 4)}(${27 - a - 4}) → <b>${ans}</b>.`, diff: 3 }; },
  };
  P.GEN["deret-huruf"] = function (rng, d = 2) {
    rng = rng || P.R;
    const pool = Object.values(HT);
    let r = rng.pick(pool)(rng, d), tries = 0;
    while (Math.abs(r.diff - d) > 1 && tries++ < 10) r = rng.pick(pool)(rng, d);
    // distraktor huruf: ubah huruf pertama ±1..3, pertahankan sisa (angka / huruf kedua)
    const set = new Set([r.ans]);
    const first = r.ans[0], rest = r.ans.slice(1);
    const code = first.charCodeAt(0) - 64;
    const cands = [code + 1, code - 1, code + 2, code - 2, code + 3, code - 3].filter((c) => c >= 1 && c <= 26).map(L);
    rng.shuffle(cands).forEach((c) => { if (set.size < 5) set.add(c + rest); });
    let guard = 0; while (set.size < 5 && guard++ < 50) set.add(L(rng.int(1, 26)) + rest);
    const opts = rng.shuffle([...set]);
    return { d: r.diff, q: `${r.seq.join(", ")}, …`, o: opts, a: opts.indexOf(r.ans), e: r.exp, gen: "deret-huruf" };
  };
})(window.PSI);

/* js/gen/figural.js */
/* Generator soal figural: deret gambar, matriks, pencerminan, klasifikasi, rotasi */
(function (P) {
  P.GEN = P.GEN || {};
  const S = P.SVG;
  const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "star"];
  const FILLS = ["none", "solid", "hatch"];
  const FILL_LABEL = { none: "kosong", solid: "hitam", hatch: "arsir" };
  const CORNERS = [[-28, -28], [28, -28], [28, 28], [-28, 28]];
  const CORNER_LABEL = ["kiri atas", "kanan atas", "kanan bawah", "kiri bawah"];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function panelOpts(rng, correctItems, makeWrong, n = 5) {
    const opts = [{ items: correctItems, key: JSON.stringify(correctItems) }];
    let tries = 0;
    while (opts.length < n && tries++ < 60) {
      const w = makeWrong();
      const k = JSON.stringify(w);
      if (!opts.some((o) => o.key === k)) opts.push({ items: w, key: k });
    }
    const sh = rng.shuffle(opts);
    return { options: sh.map((o) => ({ svg: S.panel(o.items.map((it) => Object.assign({}, it, { x: (it.x || 0) + 50, y: (it.y || 0) + 50 })), 100) })), answer: sh.findIndex((o) => o.key === opts[0].key) };
  }

  /* ---------------- DERET GAMBAR ---------------- */
  P.GEN["fig-seq"] = function (rng, d = 2) {
    rng = rng || P.R;
    // atribut: shape cycle, fill cycle, rotation step, count, corner position of a small dot
    const nAttr = d === 1 ? 1 : d === 2 ? 2 : 3;
    const attrs = rng.sample(["shape", "fill", "rot", "count", "pos"], nAttr);
    const shapeCycle = rng.sample(SHAPES, attrs.includes("shape") ? rng.int(2, 3) : 1);
    const fillCycle = attrs.includes("fill") ? rng.sample(FILLS, rng.int(2, 3)) : [rng.pick(FILLS)];
    const rotStep = attrs.includes("rot") ? rng.pick([45, 90, -45, -90]) : 0;
    const countBase = attrs.includes("count") ? rng.int(1, 2) : 0;
    const posStep = attrs.includes("pos") ? rng.pick([1, -1]) : 0;
    const posStart = rng.int(0, 3);
    const useArrow = attrs.includes("rot");
    const build = (i) => {
      const items = [];
      const shape = useArrow ? "arrow" : shapeCycle[i % shapeCycle.length];
      const fill = fillCycle[i % fillCycle.length];
      items.push({ shape, r: 22, fill, rotate: rotStep * i });
      if (attrs.includes("shape") && useArrow) items.push({ shape: shapeCycle[i % shapeCycle.length], r: 7, x: 0, y: 30, fill: "solid" });
      if (attrs.includes("count")) { const n = countBase + i; for (let k = 0; k < n; k++) items.push({ shape: "dot", r: 9, x: -36 + (k % 5) * 18, y: -36 + Math.floor(k / 5) * 14 }); }
      if (attrs.includes("pos")) { const c = CORNERS[(((posStart + posStep * i) % 4) + 4) % 4]; items.push({ shape: "square", r: 7, x: c[0], y: c[1], fill: "solid" }); }
      return items;
    };
    const panels = [0, 1, 2, 3].map(build);
    const correct = build(4);
    let wrongTries = 0;
    const makeWrong = () => {
      const w = JSON.parse(JSON.stringify(correct));
      // setelah beberapa percobaan, izinkan pengecoh dari atribut lain agar opsi selalu cukup (≥ 5)
      const pool = wrongTries++ < 8 ? (attrs.length ? attrs : ["fill"]) : ["shape", "fill", "count", "pos"].concat(w[0].shape !== "circle" ? ["rot"] : []);
      const which = rng.pick(pool);
      if (which === "shape") { if (useArrow && w[1] && w[1].r === 7) w[1].shape = rng.pick(SHAPES.filter((s) => s !== w[1].shape)); else if (!useArrow) w[0].shape = rng.pick(SHAPES.filter((s) => s !== w[0].shape)); else w[0].fill = rng.pick(FILLS.filter((f) => f !== w[0].fill)); }
      else if (which === "fill") w[0].fill = rng.pick(FILLS.filter((f) => f !== w[0].fill));
      else if (which === "rot") w[0].rotate = (w[0].rotate || 0) + rng.pick([45, 90, 180, -45]);
      else if (which === "count") { const dots = w.filter((it) => it.shape === "dot"); if (dots.length && rng.chance(0.5)) w.splice(w.indexOf(dots[dots.length - 1]), 1); else w.push({ shape: "dot", r: 9, x: -36 + (dots.length % 5) * 18, y: -36 + Math.floor(dots.length / 5) * 14 }); }
      else if (which === "pos") { const sq = w.find((it) => it.shape === "square" && it.r === 7); const c = rng.pick(CORNERS.filter((cc) => !sq || cc[0] !== sq.x || cc[1] !== sq.y)); if (sq) { sq.x = c[0]; sq.y = c[1]; } }
      return w;
    };
    const o = panelOpts(rng, correct, makeWrong);
    const expParts = [];
    if (attrs.includes("shape")) expParts.push(`<b>Bentuk</b> ${useArrow ? "kecil di bawah panah" : ""} bersiklus ${shapeCycle.map((s) => S.shapeLabel[s]).join(" → ")}, sehingga gambar ke-5 adalah ${S.shapeLabel[shapeCycle[4 % shapeCycle.length]]}.`);
    if (attrs.includes("fill")) expParts.push(`<b>Arsiran</b> bersiklus ${fillCycle.map((f) => FILL_LABEL[f]).join(" → ")}, sehingga gambar ke-5 ${FILL_LABEL[fillCycle[4 % fillCycle.length]]}.`);
    if (attrs.includes("rot")) expParts.push(`<b>Panah berputar</b> ${Math.abs(rotStep)}° ${rotStep > 0 ? "searah" : "berlawanan"} jarum jam tiap langkah (total ${rotStep * 4}° dari awal).`);
    if (attrs.includes("count")) expParts.push(`<b>Jumlah titik</b> bertambah satu tiap gambar: ${countBase}, ${countBase + 1}, ${countBase + 2}, ${countBase + 3} → ${countBase + 4}.`);
    if (attrs.includes("pos")) expParts.push(`<b>Kotak kecil</b> berpindah ${posStep > 0 ? "searah" : "berlawanan"} jarum jam mengelilingi sudut: ${[0, 1, 2, 3, 4].map((i) => CORNER_LABEL[(((posStart + posStep * i) % 4) + 4) % 4]).join(" → ")}.`);
    if (!expParts.length) expParts.push("Semua atribut tetap; pilih gambar yang identik.");
    return { d, q: "Gambar manakah yang melanjutkan deret berikut?", fig: S.sequence(panels, { question: true }), o: o.options, a: o.answer, e: expParts.join(" ") + " Pilihan lain hanya memenuhi sebagian atribut.", gen: "fig-seq" };
  };

  /* ---------------- MATRIKS 3x3 ---------------- */
  P.GEN["fig-matrix"] = function (rng, d = 2) {
    rng = rng || P.R;
    const shapes = rng.sample(SHAPES, 3), fills = rng.shuffle(FILLS.slice());
    // Mode: latin square untuk bentuk; arsiran: konstan per baris (d1), latin (d2), kolom-count (d3)
    const perm = rng.shuffle([0, 1, 2]);
    const cellShape = (r, c) => shapes[(perm[r] + c) % 3];
    const fillMode = d === 1 ? "row" : d === 2 ? "latin" : "col";
    const cellFill = (r, c) => (fillMode === "row" ? fills[r] : fillMode === "col" ? fills[c] : fills[(r + 2 * c) % 3]);
    const useCount = d === 3;
    const cellItems = (r, c) => {
      const items = [{ shape: cellShape(r, c), r: 20, fill: cellFill(r, c) }];
      if (useCount) for (let k = 0; k <= c; k++) items.push({ shape: "dot", r: 8, x: -22 + k * 22, y: 32 });
      return items;
    };
    const cells = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push(r === 2 && c === 2 ? null : cellItems(r, c));
    const correct = cellItems(2, 2);
    const makeWrong = () => {
      const w = JSON.parse(JSON.stringify(correct)); const k = rng.int(0, useCount ? 2 : 1);
      if (k === 0) w[0].shape = rng.pick(shapes.filter((s) => s !== w[0].shape));
      else if (k === 1) w[0].fill = rng.pick(FILLS.filter((f) => f !== w[0].fill));
      else w.pop();
      return w;
    };
    const o = panelOpts(rng, correct, makeWrong);
    const fillExp = fillMode === "row" ? "arsiran <b>konstan per baris</b> (baris 3 semuanya " + FILL_LABEL[fills[2]] + ")" : fillMode === "col" ? "arsiran <b>konstan per kolom</b> (kolom 3 semuanya " + FILL_LABEL[fills[2]] + ")" : "arsiran mengikuti <b>distribusi tiga nilai</b>: tiap baris dan kolom memuat kosong, hitam, arsir masing-masing sekali — yang belum ada di baris 3 dan kolom 3 adalah " + FILL_LABEL[cellFill(2, 2)];
    return { d, q: "Gambar manakah yang tepat mengisi sel kosong?", fig: S.matrix(cells), o: o.options, a: o.answer, e: `Bentuk mengikuti pola <b>distribusi</b> (tiap baris memuat ${shapes.map((s) => S.shapeLabel[s]).join(", ")} masing-masing sekali) → sel kosong harus ${S.shapeLabel[cellShape(2, 2)]}. Lalu ${fillExp}.${useCount ? " Jumlah titik bertambah per kolom (1, 2, 3) → sel kosong punya 3 titik." : ""}`, gen: "fig-matrix" };
  };

  /* ---------------- PENCERMINAN ---------------- */
  function asymFigure(rng, d) {
    const items = [];
    const n = d === 1 ? 2 : 3;
    const pos = rng.sample([[-24, -24], [24, -24], [-24, 24], [24, 24], [0, -26], [0, 26], [-26, 0], [26, 0]], n);
    const shp = rng.sample(["triangle", "arrow", "L", "F", "P", "semicircle", "star"], n);
    pos.forEach((p, i) => items.push({ shape: shp[i], r: 13, x: p[0], y: p[1], fill: shp[i] === "star" || shp[i] === "triangle" ? "solid" : "none", rotate: rng.pick([0, 90, 180, 270]) }));
    return items;
  }
  P.GEN["fig-mirror"] = function (rng, d = 2) {
    rng = rng || P.R;
    const base = asymFigure(rng, d);
    const kind = d >= 2 && rng.chance(0.4) ? "mirrorV" : "mirrorH";
    const correct = S.transformItems(base, kind);
    const wrongKinds = ["rot90", "rot180", "rot270", kind === "mirrorH" ? "mirrorV" : "mirrorH"];
    let i = 0;
    const makeWrong = () => { const k = wrongKinds[i++ % wrongKinds.length]; return i > 4 ? S.transformItems(S.transformItems(base, k), "rot90") : S.transformItems(base, k); };
    const o = panelOpts(rng, correct, makeWrong);
    const figInner = base.map((it, k) => S.shape(Object.assign({ cid: "mq" + k }, it, { x: it.x + 50, y: it.y + 50 }))).join("");
    const line = kind === "mirrorH" ? `<line x1="118" y1="6" x2="118" y2="94" stroke="var(--primary)" stroke-width="3" stroke-dasharray="6 4"/>` : `<line x1="6" y1="118" x2="94" y2="118" stroke="var(--primary)" stroke-width="3" stroke-dasharray="6 4"/>`;
    const w = kind === "mirrorH" ? 130 : 100, h = kind === "mirrorH" ? 100 : 130;
    const fig = S.svg(`<rect x="1" y="1" width="98" height="98" rx="8" fill="var(--fig-bg)" stroke="var(--line-strong)" stroke-width="1.5"/>${figInner}${line}`, w, h, { width: w * 1.3, height: h * 1.3 });
    return { d, q: kind === "mirrorH" ? "Manakah bayangan cermin gambar berikut terhadap garis vertikal di sebelah kanannya?" : "Manakah bayangan gambar berikut pada permukaan air (garis horizontal di bawahnya)?", fig, o: o.options, a: o.answer, e: kind === "mirrorH" ? "Cermin vertikal menukar <b>kiri ↔ kanan</b>, atas–bawah tetap. Periksa satu elemen penanda: elemen yang di kiri harus pindah ke kanan pada <b>baris yang sama</b>, dan arah huruf/panah terbalik (bukan berputar). Pilihan lain adalah hasil rotasi 90°/180°/270° atau cermin horizontal — pengecoh klasik." : "Bayangan air menukar <b>atas ↔ bawah</b>, kiri–kanan tetap. Elemen di atas harus pindah ke bawah pada <b>kolom yang sama</b>. Rotasi 180° juga menukar kiri-kanan sehingga salah.", gen: "fig-mirror" };
  };

  /* ---------------- KLASIFIKASI (yang berbeda) ---------------- */
  P.GEN["fig-odd"] = function (rng, d = 2) {
    rng = rng || P.R;
    const rule = rng.pick(d === 1 ? ["fill", "count"] : d === 2 ? ["fill", "count", "inside"] : ["mirror", "count", "inside", "sides"]);
    const panels = []; let exp = "";
    if (rule === "fill") {
      const big = rng.pick(SHAPES), small = rng.pick(SHAPES);
      for (let i = 0; i < 5; i++) panels.push([{ shape: SHAPES[(i * 2 + 1) % SHAPES.length], r: 26, fill: "none", rotate: i * 12 }, { shape: SHAPES[(i * 3) % SHAPES.length], r: 9, fill: "solid", x: 0, y: 0 }]);
      panels[0] = [{ shape: big, r: 26, fill: "solid" }, { shape: small, r: 9, fill: "none", x: 0, y: 0, color: "var(--fig-bg)" }];
      exp = "Aturan kelompok: <b>bentuk besar kosong, bentuk kecil hitam</b>. Satu gambar membalik arsirannya (besar hitam, kecil kosong). Jenis bentuk hanya pengecoh.";
    } else if (rule === "count") {
      const n = rng.int(2, 4);
      const place = (k, rot) => Array.from({ length: k }, (_, i) => ({ shape: rng.pick(["circle", "square", "triangle", "diamond", "star"]), r: 8, fill: rng.pick(["none", "solid", "hatch"]), x: -24 + (i % 3) * 24, y: -16 + Math.floor(i / 3) * 28, rotate: rot }));
      for (let i = 0; i < 5; i++) panels.push(place(n, i * 15));
      panels[0] = place(n + 1, 60);
      exp = `Aturan kelompok: setiap gambar berisi <b>${n} elemen</b>. Satu gambar berisi ${n + 1} elemen. Bentuk dan arsiran sengaja diacak sebagai pengecoh — hitung jumlahnya.`;
    } else if (rule === "inside") {
      for (let i = 0; i < 5; i++) panels.push([{ shape: ["circle", "square", "hexagon", "pentagon", "diamond"][i], r: 28, fill: "none", rotate: i * 10 }, { shape: ["triangle", "star", "diamond", "circle", "square"][(i + 2) % 5], r: 9, fill: "solid", x: rng.int(-8, 8), y: rng.int(-8, 8) }]);
      panels[0] = [{ shape: rng.pick(["circle", "square", "hexagon"]), r: 20, fill: "none", x: -14, y: 4 }, { shape: rng.pick(["triangle", "star", "diamond"]), r: 9, fill: "solid", x: 30, y: -26 }];
      exp = "Aturan kelompok: elemen kecil berada <b>di dalam</b> elemen besar. Pada satu gambar, elemen kecil berada di luar.";
    } else if (rule === "sides") {
      const even = ["square", "diamond", "hexagon"], odd = ["triangle", "pentagon"];
      for (let i = 0; i < 5; i++) panels.push([{ shape: even[i % even.length], r: 24, fill: FILLS[i % 3], rotate: i * 20 }]);
      panels[0] = [{ shape: rng.pick(odd), r: 24, fill: rng.pick(FILLS), rotate: rng.int(0, 3) * 30 }];
      exp = "Aturan kelompok: semua bangun memiliki <b>jumlah sisi genap</b> (4 atau 6). Satu bangun bersisi ganjil (3 atau 5). Arsiran dan rotasi adalah pengecoh.";
    } else {
      const base = asymFigure(rng, 2);
      const rots = ["rot90", "rot180", "rot270"];
      panels.push(S.transformItems(base, "mirrorH"));
      panels.push(base);
      rots.forEach((k) => panels.push(S.transformItems(base, k)));
      exp = "Empat gambar adalah <b>rotasi</b> dari gambar yang sama (0°, 90°, 180°, 270°). Satu gambar adalah <b>bayangan cermin</b>: tidak bisa didapat dengan memutar. Trik: cek urutan elemen searah jarum jam — pada cermin urutannya terbalik.";
    }
    const order = rng.shuffle([0, 1, 2, 3, 4]);
    const shown = order.map((i) => panels[i]);
    const ans = order.indexOf(0);
    return { d, q: "Manakah gambar yang TIDAK sekelompok dengan yang lain?", o: shown.map((items) => ({ svg: S.panel(items.map((it) => Object.assign({}, it, { x: (it.x || 0) + 50, y: (it.y || 0) + 50 })), 100) })), a: ans, e: exp, noShuffle: true, gen: "fig-odd" };
  };

  /* ---------------- ROTASI (gambar yang sama) ---------------- */
  P.GEN["fig-rot"] = function (rng, d = 2) {
    rng = rng || P.R;
    const base = asymFigure(rng, d);
    const rot = rng.pick(["rot90", "rot180", "rot270"]);
    const correct = S.transformItems(base, rot);
    const wrongs = [S.transformItems(base, "mirrorH"), S.transformItems(base, "mirrorV"), S.transformItems(S.transformItems(base, "mirrorH"), "rot90"), S.transformItems(S.transformItems(base, "mirrorV"), "rot90")];
    // tambahan pengecoh: tukar dua elemen
    const sw = JSON.parse(JSON.stringify(correct)); if (sw.length > 1) { const t = sw[0].shape; sw[0].shape = sw[1].shape; sw[1].shape = t; } wrongs.push(sw);
    let i = 0; const makeWrong = () => wrongs[i++ % wrongs.length];
    const o = panelOpts(rng, correct, makeWrong);
    const fig = S.panel(base.map((it) => Object.assign({}, it, { x: it.x + 50, y: it.y + 50 })), 100, { width: 130, height: 130 });
    return { d, q: "Manakah gambar yang SAMA dengan gambar berikut setelah diputar (bukan dicerminkan)?", fig, o: o.options, a: o.answer, e: `Jawaban adalah gambar asli yang diputar ${rot === "rot90" ? "90° searah jarum jam" : rot === "rot180" ? "180°" : "90° berlawanan jarum jam"}. Trik 'sidik jari': urutan elemen <b>searah jarum jam</b> tidak berubah oleh rotasi, tetapi <b>terbalik</b> oleh pencerminan. Pengecoh lain menukar posisi dua elemen.`, gen: "fig-rot" };
  };
})(window.PSI);

/* js/gen/glyph.js */
/* Generator deret gambar gaya TPA online: simbol garis berputar & bangun bersarang (4 opsi) */
(function (P) {
  P.GEN = P.GEN || {};
  const S = P.SVG;

  /* bentuk "pin": tongkat dengan ujung kepala & ekor; rotate 0 = kepala menghadap atas */
  const baseShape = S.shape;
  S.shape = function (o) {
    if (o.shape !== "pin") return baseShape(o);
    const r = o.r || 30, st = "var(--fig-stroke)", sw = 2.4, x = o.x || 0, y = o.y || 0;
    const end = (kind, yy, dir) => {
      if (kind === "o") return `<circle cx="0" cy="${yy + dir * 5}" r="5" fill="var(--fig-bg)" stroke="${st}" stroke-width="${sw}"/>`;
      if (kind === "dot") return `<circle cx="0" cy="${yy + dir * 4}" r="5.5" fill="${st}"/>`;
      if (kind === "bar") return `<line x1="-8" y1="${yy}" x2="8" y2="${yy}" stroke="${st}" stroke-width="${sw}" stroke-linecap="round"/>`;
      if (kind === "arrow") return `<polygon points="0,${yy + dir * 10} -7,${yy - dir * 2} 7,${yy - dir * 2}" fill="${kind === "arrow" ? st : "none"}"/>`;
      if (kind === "harrow") return `<polygon points="0,${yy + dir * 10} -7,${yy - dir * 2} 7,${yy - dir * 2}" fill="var(--fig-bg)" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      return "";
    };
    const body = `<line x1="0" y1="${r}" x2="0" y2="${-r}" stroke="${st}" stroke-width="${sw}" stroke-linecap="round"/>` + end(o.head, -r, -1) + end(o.tail || "none", r, 1);
    return `<g transform="translate(${x} ${y}) rotate(${o.rotate || 0})">${body}</g>`;
  };

  const HEAD_LABEL = { o: "bulatan kosong", dot: "bulatan hitam", bar: "palang", arrow: "mata panah hitam", harrow: "mata panah kosong", none: "tanpa ujung" };
  const DIR = (deg) => ["atas", "kanan atas", "kanan", "kanan bawah", "bawah", "kiri bawah", "kiri", "kiri atas"][(((Math.round(deg / 45) % 8) + 8) % 8)];
  const norm = (d) => ((d % 360) + 360) % 360;
  const keyOf = (items) => JSON.stringify(items.map((it) => Object.assign({}, it, it.rotate !== undefined ? { rotate: norm(it.rotate) } : {})));

  function opts4(rng, correct, makeWrong) {
    const list = [{ items: correct, key: keyOf(correct) }];
    let t = 0;
    while (list.length < 4 && t++ < 80) { const w = makeWrong(); const k = keyOf(w); if (!list.some((o) => o.key === k)) list.push({ items: w, key: k }); }
    const sh = rng.shuffle(list);
    return { options: sh.map((o) => ({ svg: S.panel(o.items.map((it) => Object.assign({}, it, { x: (it.x || 0) + 50, y: (it.y || 0) + 50 })), 100) })), answer: sh.findIndex((o) => o.key === list[0].key) };
  }

  function pinSeries(rng, d) {
    const step = rng.pick(d === 1 ? [90, -90] : [45, -45, 90, -90, 135]);
    const start = rng.int(0, 7) * 45;
    const heads = d === 1 ? [rng.pick(["o", "dot", "arrow", "bar"])] : d === 2 ? rng.sample(["o", "dot", "arrow", "bar"], 2) : rng.sample(["o", "dot", "arrow", "harrow", "bar"], 3);
    const tailMode = d === 3 ? rng.pick(["alt", "fixed"]) : "none";
    const tailKind = rng.pick(["bar", "dot", "o"].filter((k) => !heads.includes(k)).concat(["bar"]));
    const build = (i) => {
      const tail = tailMode === "alt" ? (i % 2 === 0 ? tailKind : "none") : tailMode === "fixed" ? tailKind : "none";
      return [{ shape: "pin", r: 28, head: heads[i % heads.length], tail, rotate: start + step * i }];
    };
    const panels = [0, 1, 2, 3].map(build);
    const correct = build(4);
    const c = correct[0];
    const makeWrong = () => {
      const w = Object.assign({}, c);
      const k = rng.int(0, 3);
      if (k === 0) w.rotate = c.rotate + rng.pick([45, 90, 180, -45, -90]);
      else if (k === 1) w.head = rng.pick(["o", "dot", "arrow", "bar"].filter((h) => h !== c.head));
      else if (k === 2) w.rotate = c.rotate + 180; // terbalik
      else { w.tail = c.tail === "none" ? tailKind : "none"; if (rng.chance(0.5)) w.rotate = c.rotate - step; }
      if (w.tail === w.head) w.tail = "none";
      return [w];
    };
    const o = opts4(rng, correct, makeWrong);
    const parts = [`<b>Arah ujung</b> berputar ${Math.abs(step)}° ${step > 0 ? "searah" : "berlawanan arah"} jarum jam setiap langkah: ${[0, 1, 2, 3, 4].map((i) => DIR(start + step * i)).join(" → ")}.`];
    if (heads.length > 1) parts.push(`<b>Ujung</b> bergantian ${heads.map((h) => HEAD_LABEL[h]).join(" → ")}, sehingga gambar ke-5 ber-${HEAD_LABEL[heads[4 % heads.length]]}.`);
    else parts.push(`Ujungnya tetap ${HEAD_LABEL[heads[0]]}.`);
    if (tailMode === "alt") parts.push(`<b>${HEAD_LABEL[tailKind][0].toUpperCase() + HEAD_LABEL[tailKind].slice(1)} di pangkal</b> muncul pada gambar ke-1, 3, 5 dan hilang pada ke-2, 4.`);
    if (tailMode === "fixed") parts.push(`Pangkal selalu ber-${HEAD_LABEL[tailKind]}.`);
    return { d, q: "Manakah gambar yang merupakan kelanjutan dari pola gambar sebelumnya?", fig: S.sequence(panels, { question: true }), o: o.options, a: o.answer, e: parts.join(" ") + " Opsi lain salah arah atau salah ujung.", gen: "fig-glyph" };
  }

  function nestSeries(rng, d) {
    const pool = ["circle", "square", "triangle", "diamond", "hexagon"];
    const cyc = rng.sample(pool, d === 3 ? 3 : 2);
    const innerFill = d === 1 ? "none" : rng.pick(["none", "solid"]);
    // gambar ke-i: luar = cyc[floor(i/2)], isi muncul di i ganjil = bangun luar berikutnya
    const build = (i) => {
      const outer = cyc[Math.floor(i / 2) % cyc.length];
      const items = [{ shape: outer, r: 30, fill: "none" }];
      if (i % 2 === 1) items.push({ shape: cyc[(Math.floor(i / 2) + 1) % cyc.length], r: 13, fill: innerFill });
      return items;
    };
    const panels = [0, 1, 2, 3].map(build);
    const correct = build(4);
    const makeWrong = () => {
      const k = rng.int(0, 3);
      if (k === 0) return build(3); // mengulang gambar sebelumnya
      if (k === 1) return [{ shape: rng.pick(cyc.filter((s) => s !== correct[0].shape)), r: 30, fill: "none" }];
      if (k === 2) return [correct[0], { shape: rng.pick(pool), r: 13, fill: innerFill }];
      return [{ shape: rng.pick(pool.filter((s) => s !== correct[0].shape)), r: 30, fill: "none" }, { shape: correct[0].shape, r: 13, fill: innerFill }];
    };
    const o = opts4(rng, correct, makeWrong);
    const L = S.shapeLabel;
    const e = `<b>Bangun luar</b> berganti setiap dua gambar: ${[0, 1, 2, 3, 4].map((i) => L[cyc[Math.floor(i / 2) % cyc.length]]).join(" → ")}. <b>Isi</b> muncul hanya pada gambar ke-2 dan ke-4 (berupa bangun luar berikutnya), jadi gambar ke-5 adalah <b>${L[correct[0].shape]} kosong</b>.`;
    return { d, q: "Manakah gambar yang merupakan kelanjutan dari pola gambar sebelumnya?", fig: S.sequence(panels, { question: true }), o: o.options, a: o.answer, e, gen: "fig-glyph" };
  }

  P.GEN["fig-glyph"] = function (rng, d = 2) {
    rng = rng || P.R;
    return rng.chance(0.65) ? pinSeries(rng, d) : nestSeries(rng, d);
  };
})(window.PSI);

/* js/gen/ketelitian.js */
/* Generator tes ketelitian: bandingkan pasangan & hitung simbol */
(function (P) {
  P.GEN = P.GEN || {};
  const NAMES = ["Ahmad Suhendarwijayakusuma", "Prof. Dr. Setiyawan Rejo, M.Pd.", "Raden Mas Ontowiryo", "Kereta Api Jurusan Yogyakarta", "Abdullah bin Abdul Muthalib", "Menara Sa'idah", "PT Nusantara Sejahtera Abadi", "Jl. Jend. Sudirman Kav. 52-53", "Bank Rakyat Indonesia (Persero) Tbk", "Dr. Ir. H. Bambang Prasetyo, M.T.", "Universitas Gadjah Mada Yogyakarta", "Kementerian Ketenagakerjaan RI", "Registrasi Transportasi Umum", "Siti Nurhaliza binti Tarudin", "Perum Bumi Serpong Damai Blok C-7", "Laporan Keuangan Triwulan III 2025", "Angkatan Bersenjata Republik Indonesia", "Hiroshima Nagasaki Monbukagakusho", "Schaplel Champcvanmdogre", "Rassmussens Ssenmrassumelse"];
  const SYMS = "^-_~*#@!$%&|<>{}[]().:;,'\"+=?/\\";
  const LOW = "abcdefghijklmnopqrstuvwxyz", UP = LOW.toUpperCase(), DIG = "0123456789";
  const CONFUSE = { l: "I", I: "l", "1": "l", O: "0", "0": "O", m: "rn", w: "vv", S: "5", "5": "S", B: "8", "8": "B", Z: "2", "2": "Z", g: "q", q: "g", u: "v", v: "u", n: "h", a: "o", o: "a", e: "c", c: "e", i: "j", ":": ";", ";": ":", ".": ",", ",": ".", "-": "_", "_": "-", "(": "[", "[": "(" };

  function randStr(rng, alphabet, n) { let s = ""; for (let i = 0; i < n; i++) s += alphabet[rng.int(0, alphabet.length - 1)]; return s; }
  function genBase(rng, d) {
    const kind = rng.pick(d === 1 ? ["num", "name", "mixed"] : d === 2 ? ["num", "name", "mixed", "sym", "repeat"] : ["num", "mixed", "sym", "repeat", "name", "spaced"]);
    const len = d === 1 ? rng.int(8, 12) : d === 2 ? rng.int(12, 18) : rng.int(16, 26);
    switch (kind) {
      case "num": return randStr(rng, DIG, len);
      case "name": return rng.pick(NAMES);
      case "mixed": return randStr(rng, LOW + UP + DIG, len);
      case "sym": return randStr(rng, SYMS.slice(0, 8), len);
      case "repeat": { const a = rng.pick(["Yy", "Ll", "Kk", "Jj", "Hh", "0O", "1l"]); return randStr(rng, a, len); }
      case "spaced": { const ch = rng.pick(["1", "7", "0", "6", "5"]); let s = ""; for (let i = 0; i < 9; i++) s += ch.repeat(rng.int(1, 4)) + " "; return s.trim(); }
    }
    return randStr(rng, LOW, len);
  }
  function mutate(rng, s, d) {
    const arr = s.split("");
    // posisi perbedaan: untuk level sulit cenderung di tengah/akhir
    const lo = d >= 2 ? Math.floor(arr.length * 0.3) : 0;
    let i = rng.int(lo, arr.length - 1), tries = 0;
    while (arr[i] === " " && tries++ < 10) i = rng.int(lo, arr.length - 1);
    const kind = rng.pick(d === 1 ? ["swapcase", "replace", "delete"] : d === 2 ? ["swapcase", "replace", "delete", "swap", "confuse", "double"] : ["confuse", "swap", "delete", "double", "confuse", "swapcase", "space"]);
    const c = arr[i];
    if (kind === "swapcase" && /[a-zA-Z]/.test(c)) arr[i] = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
    else if (kind === "confuse" && CONFUSE[c]) arr[i] = CONFUSE[c];
    else if (kind === "delete" && arr.length > 4) arr.splice(i, 1);
    else if (kind === "double") arr.splice(i, 0, c);
    else if (kind === "swap" && i < arr.length - 1 && arr[i] !== arr[i + 1]) { const t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t; }
    else if (kind === "space") { if (c === " ") arr.splice(i, 1); else arr.splice(i, 0, " "); }
    else { const pool = /\d/.test(c) ? DIG : /[a-z]/.test(c) ? LOW : /[A-Z]/.test(c) ? UP : SYMS; let r = pool[rng.int(0, pool.length - 1)]; let t = 0; while (r === c && t++ < 5) r = pool[rng.int(0, pool.length - 1)]; arr[i] = r; }
    const out = arr.join("");
    return out === s ? mutate(rng, s, d) : out;
  }
  function diffDesc(a, b) {
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const ctxA = a.slice(Math.max(0, i - 3), i + 4), ctxB = b.slice(Math.max(0, i - 3), i + 4);
    return `Perbedaan pertama pada karakter ke-${i + 1}: <code>${P.esc(ctxA)}</code> vs <code>${P.esc(ctxB)}</code>${a.length !== b.length ? ` (panjang berbeda: ${a.length} vs ${b.length} karakter)` : ""}.`;
  }

  P.GEN.ketelitian = function (rng, d = 2) {
    rng = rng || P.R;
    const a = genBase(rng, d);
    const isSame = rng.chance(0.45);
    const b = isSame ? a : mutate(rng, a, d);
    const mono = (s) => `<span class="mono">${P.esc(s)}</span>`;
    return {
      d, q: `<table class="pair-table"><tr><td>${P.esc(a)}</td><td>${P.esc(b)}</td></tr></table><div class="small muted mt-1">Apakah kedua deretan di atas SAMA persis?</div>`,
      o: ["S — Sama", "T — Tidak sama"], a: isSame ? 0 : 1, noShuffle: true, gen: "ketelitian",
      e: isSame ? `Kedua deretan identik karakter demi karakter: ${mono(a)}. Pada pasangan yang tampak sama, lakukan pemeriksaan kedua di awal, tengah, dan akhir — lalu putuskan dengan yakin.` : `${diffDesc(a, b)} Begitu satu perbedaan ditemukan, langsung jawab T tanpa membaca sisanya.`,
    };
  };

  P.GEN["ketelitian-count"] = function (rng, d = 2) {
    rng = rng || P.R;
    const len = d === 1 ? 30 : d === 2 ? 45 : 60;
    const alphabet = d === 1 ? "aeoc" : d === 2 ? "aeocdgqp" : "aeocdgqpbhnu69";
    const s = randStr(rng, alphabet, len);
    const target = rng.pick(alphabet.split(""));
    const count = s.split("").filter((c) => c === target).length;
    const set = new Set([count]); [count - 1, count + 1, count - 2, count + 2, count + 3].forEach((v) => { if (v >= 0 && set.size < 5) set.add(v); });
    const opts = rng.shuffle([...set]);
    const marked = s.split("").map((c) => (c === target ? `<mark>${c}</mark>` : c)).join("");
    return {
      d, q: `Berapa kali karakter <b class="mono" style="font-size:1.2em">${target}</b> muncul pada deretan berikut?<div class="mono mt-1" style="font-size:1.15rem;letter-spacing:.08em;word-break:break-all;background:var(--bg-sub);padding:.6rem .8rem;border-radius:10px">${s}</div>`,
      o: opts.map(String), a: opts.indexOf(count), noShuffle: true, gen: "ketelitian-count",
      e: `Karakter <b>${target}</b> muncul <b>${count}</b> kali: <span class="mono" style="letter-spacing:.06em;word-break:break-all">${marked}</span>. Pindai dengan satu target dan hitung per kelompok lima (tally) agar tidak lupa hitungan.`,
    };
  };
})(window.PSI);

/* js/gen/army.js */
/* Generator Army Alpha: instruksi bersyarat pada deretan bangun berlabel */
(function (P) {
  P.GEN = P.GEN || {};
  const S = P.SVG;
  const SH = [["triangle", 3], ["square", 4], ["diamond", 4], ["pentagon", 5], ["hexagon", 6], ["circle", 0]];
  const VOK = "AIUEO", KON = "BCDFGHJKLMNPRSTVWXYZ";
  const isVowel = (c) => VOK.includes(c);
  const isOdd = (n) => n % 2 === 1;

  // predikat: {text, fn}
  function buildConds(rng, d) {
    const P1 = [
      { t: "berisi angka genap", f: (g) => g.num !== null && !isOdd(g.num), needs: "num" },
      { t: "berisi angka ganjil", f: (g) => g.num !== null && isOdd(g.num), needs: "num" },
      { t: "berisi angka lebih besar dari 5", f: (g) => g.num !== null && g.num > 5, needs: "num" },
      { t: "berisi angka lebih kecil dari 5", f: (g) => g.num !== null && g.num < 5, needs: "num" },
      { t: "berisi huruf vokal", f: (g) => g.ch !== null && isVowel(g.ch), needs: "ch" },
      { t: "berisi huruf konsonan", f: (g) => g.ch !== null && !isVowel(g.ch), needs: "ch" },
      { t: "memiliki lebih dari 4 sisi", f: (g) => g.sides > 4 },
      { t: "memiliki tepat 4 sisi", f: (g) => g.sides === 4 },
      { t: "memiliki kurang dari 4 sisi", f: (g) => g.sides < 4 },
      { t: "berbentuk segitiga", f: (g) => g.shape === "triangle" },
      { t: "berbentuk lingkaran", f: (g) => g.shape === "circle" },
      { t: "berwarna hitam", f: (g) => g.fill === "solid" },
      { t: "tidak berwarna hitam", f: (g) => g.fill !== "solid" },
    ];
    const n = d === 1 ? 1 : d === 2 ? 2 : 3;
    return rng.sample(P1, n);
  }

  P.GEN.army = function (rng, d = 2) {
    rng = rng || P.R;
    const n = d === 1 ? 6 : d === 2 ? 7 : 8;
    const glyphs = Array.from({ length: n }, () => {
      const [shape, sides] = rng.pick(SH);
      const useNum = rng.chance(0.55);
      return { shape, sides, fill: rng.chance(0.3) ? "solid" : "none", num: useNum ? rng.int(1, 9) : null, ch: useNum ? null : rng.pick(VOK + KON + VOK) };
    });
    let conds = buildConds(rng, d);
    const connector = d === 3 ? rng.pick(["dan", "tetapi tidak"]) : "dan";
    const negate = d >= 2 && rng.chance(0.3);
    const test = (g) => {
      if (conds.length === 1) return conds[0].f(g);
      if (connector === "dan") return conds.every((c) => c.f(g));
      // "A tetapi tidak B (dan C)"
      return conds[0].f(g) && !conds[1].f(g) && (conds.length < 3 || conds[2].f(g));
    };
    let answer = glyphs.map((g, i) => (negate ? !test(g) : test(g)) ? i : -1).filter((i) => i >= 0);
    // pastikan jawaban tidak kosong dan tidak semua
    let tries = 0;
    while ((answer.length === 0 || answer.length === n) && tries++ < 60) {
      conds = buildConds(rng, d);
      answer = glyphs.map((g, i) => (negate ? !test(g) : test(g)) ? i : -1).filter((i) => i >= 0);
    }
    if (answer.length === 0 || answer.length === n) { // fallback: syarat tunggal yang pasti membelah
      const target = glyphs[0]; conds = [{ t: `berbentuk ${S.shapeLabel[target.shape]}`, f: (g) => g.shape === target.shape }];
      if (glyphs.every((g) => g.shape === target.shape)) glyphs[n - 1].shape = target.shape === "circle" ? "square" : "circle";
      answer = glyphs.map((g, i) => (negate ? !conds[0].f(g) : conds[0].f(g)) ? i : -1).filter((i) => i >= 0);
    }
    let text;
    if (conds.length === 1) text = `Coretlah gambar yang ${conds[0].t}.`;
    else if (connector === "dan") text = `Coretlah gambar yang ${conds.map((c) => c.t).join(" dan ")}.`;
    else text = `Coretlah gambar yang ${conds[0].t} tetapi tidak ${conds[1].t}${conds[2] ? ", dan " + conds[2].t : ""}.`;
    if (negate) text = text.replace("Coretlah gambar yang", "Jangan coret gambar yang") + " Coret semua gambar lainnya.";
    const size = 64, gap = 10;
    const inner = glyphs.map((g, i) => `<g transform="translate(${i * (size + gap) + size / 2} ${size / 2})">${S.shape({ shape: g.shape, r: 24, fill: g.fill, label: g.num !== null ? g.num : g.ch, labelSize: 18 })}<text x="0" y="${size / 2 + 12}" text-anchor="middle" font-size="11" fill="var(--text-3)" font-family="var(--font)">${i + 1}</text></g>`).join("");
    const fig = S.svg(inner, n * (size + gap) - gap, size + 18).replace(/width="\d+" height="\d+"/, `style="width:100%;max-width:${n * (size + gap)}px;height:auto"`);
    const ordinal = ["pertama", "kedua", "ketiga", "keempat", "kelima", "keenam", "ketujuh", "kedelapan"];
    const descG = (g) => `${S.shapeLabel[g.shape]}${g.fill === "solid" ? " hitam" : ""} berisi ${g.num !== null ? "angka " + g.num : "huruf " + g.ch}`;
    const exp = `Pecah instruksi menjadi syarat: ${conds.map((c, i) => `<b>(${i + 1}) ${c.t}</b>`).join(connector === "dan" ? " DAN " : " TETAPI TIDAK ")}${negate ? " — lalu <b>dibalik</b> (yang dicoret justru yang TIDAK memenuhi)" : ""}. Periksa tiap gambar: ${glyphs.map((g, i) => `${i + 1}. ${descG(g)} → ${answer.includes(i) ? "<b>dicoret</b>" : "tidak"}`).join("; ")}. Ingat: lingkaran bersisi 0, belah ketupat 4 sisi, vokal = A I U E O.`;
    return { d, type: "multi", q: `<div class="callout callout-info"><span class="co-ico">📢</span><div><b>Instruksi:</b> ${text}</div></div><div class="small muted">Klik gambar yang harus dicoret (bisa lebih dari satu), lalu tekan <b>Kunci Jawaban</b>.</div>`, instr: text, fig, items: glyphs.map((g, i) => ({ svg: S.svg(S.shape({ shape: g.shape, r: 24, fill: g.fill, label: g.num !== null ? g.num : g.ch, labelSize: 18, x: 32, y: 32 }), 64, 64), label: String(i + 1) })), answerSet: answer, e: exp, gen: "army", o: [], a: -1 };
  };
})(window.PSI);

/* js/gen/kode.js */
/* Generator tes Kode & Ingatan: tabel kategori → kode berpola, lalu soal */
(function (P) {
  P.GEN = P.GEN || {};
  const CATS = {
    TRANSPORT: ["FERRARI", "TOYOTA", "HONDA", "SUZUKI", "MAZDA", "NISSAN", "VOLVO", "KIA"],
    KOTA: ["MAKKAH", "DUBAI", "TOKYO", "JAKARTA", "SYDNEY", "PARIS", "KAIRO", "SEOUL"],
    PANGAN: ["GANDUM", "BERAS", "JAGUNG", "KEDELAI", "KACANG", "SAGU", "UBI", "TERIGU"],
    BUAH: ["APEL", "JERUK", "MANGGA", "SRIKAYA", "SAWO", "DUKU", "SALAK", "NANAS"],
    HEWAN: ["KUCING", "KERA", "KUDA", "KIJANG", "KOMODO", "RUSA", "GAJAH", "ZEBRA"],
    PROFESI: ["DOKTER", "PILOT", "GURU", "NELAYAN", "PETANI", "HAKIM", "KOKI", "SOPIR"],
    WARNA: ["MERAH", "BIRU", "HIJAU", "KUNING", "UNGU", "COKLAT", "PUTIH", "HITAM"],
  };
  const PATTERNS = [
    { name: "3 angka", gen: (r) => String(r.int(100, 999)) },
    { name: "2 angka + 1 huruf", gen: (r) => String(r.int(10, 99)) + r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) },
    { name: "2 huruf", gen: (r) => r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) + r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) },
    { name: "2 angka", gen: (r) => String(r.int(10, 99)) },
    { name: "1 huruf + 1 angka", gen: (r) => r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) + r.int(1, 9) },
    { name: "1 angka + 2 huruf", gen: (r) => r.int(1, 9) + r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) + r.pick("ABCDEFGHJKLMNPRSTUVWXYZ".split("")) },
  ];

  /** Membuat satu set tes kode. d menentukan jumlah kategori/item. */
  P.GEN.kode = function (rng, d = 2) {
    rng = rng || P.R;
    const nCat = d === 1 ? 4 : 5, perCat = d === 1 ? 3 : d === 2 ? 4 : 5;
    const cats = rng.sample(Object.keys(CATS), nCat);
    const pats = rng.sample(PATTERNS, nCat);
    const used = new Set();
    const table = cats.map((c, i) => ({
      cat: c, pattern: pats[i].name,
      items: rng.sample(CATS[c], perCat).map((name) => { let code; do { code = pats[i].gen(rng); } while (used.has(code)); used.add(code); return { name, code }; }),
    }));
    const all = table.flatMap((t) => t.items.map((it) => Object.assign({ cat: t.cat, pattern: t.pattern }, it)));
    const nQ = Math.min(all.length, d === 1 ? 10 : d === 2 ? 15 : 20);
    const qs = rng.sample(all, nQ).map((it) => {
      // distraktor: 1 kode dari kategori sama, 1 kode dari kategori lain, 1 kode mirip (ubah 1 karakter)
      const sameCat = all.filter((x) => x.cat === it.cat && x.code !== it.code).map((x) => x.code);
      const otherCat = all.filter((x) => x.cat !== it.cat).map((x) => x.code);
      const arr = it.code.split(""); const k = rng.int(0, arr.length - 1); arr[k] = /\d/.test(arr[k]) ? String((+arr[k] + rng.int(1, 8)) % 10) : rng.pick("ABCDEFGHJKLMNPRSTUVWXYZ".replace(arr[k], "").split("")); const similar = arr.join("");
      const opts = P.uniqueBy([it.code, rng.pick(sameCat) || similar, rng.pick(otherCat), similar], (x) => x).slice(0, 4);
      while (opts.length < 4) opts.push(PATTERNS[rng.int(0, PATTERNS.length - 1)].gen(rng));
      const sh = rng.shuffle(opts);
      return { d, q: `Kode untuk <b>${it.name}</b> adalah …`, o: sh, a: sh.indexOf(it.code), noShuffle: true, gen: "kode", e: `${it.name} termasuk kategori <b>${it.cat}</b> yang kodenya berpola <b>${it.pattern}</b> → kodenya <b>${it.code}</b>. Pilihan dengan pola berbeda bisa langsung dicoret; sisanya dibedakan lewat asosiasi yang kamu buat saat menghafal.` };
    });
    return { table, questions: qs, memorizeTime: d === 1 ? 60 : d === 2 ? 90 : 120, answerTime: nQ * 12 };
  };
})(window.PSI);

/* js/core/bank.js */
/* Perakit soal: menggabungkan bank tulisan tangan + generator, normalisasi, pengacakan */
(function (P) {
  const Bank = {};

  function sourcesFor(mod, sec) {
    const out = [];
    (sec.source || []).forEach((s) => {
      if (s === "bank") { const arr = (P.BANK[mod.id] || {})[sec.id]; if (arr && arr.length) out.push({ kind: "bank", arr }); }
      else if (s.startsWith("konsep:")) { const arr = (P.BANK.konsep || {})[s.slice(7)]; if (arr && arr.length) out.push({ kind: "bank", arr }); }
      else if (s.startsWith("gen:")) { const fn = P.GEN[s.slice(4)]; if (fn) out.push({ kind: "gen", fn, name: s.slice(4) }); }
    });
    return out;
  }

  function normalize(raw, mod, sec, rng, idx) {
    const q = {
      id: `${mod.id}.${sec.id}.${idx}.${rng.int(1000, 9999)}`,
      moduleId: mod.id, sectionId: sec.id, sectionTitle: sec.title, moduleTitle: mod.short || mod.title,
      d: raw.d || 2, type: raw.type || "mc", q: raw.q, p: raw.p || null, fig: raw.fig || null, e: raw.e || "", gen: raw.gen || null,
    };
    if (q.type === "multi") { q.items = raw.items; q.answerSet = raw.answerSet.slice(); q.o = []; q.a = -1; return q; }
    const sh = P.shuffleOptions(raw, rng);
    q.o = sh.options; q.a = sh.answer;
    return q;
  }

  /** Bangun daftar soal untuk satu bagian */
  Bank.build = function (moduleId, sectionId, count, opts = {}) {
    const mod = P.moduleById(moduleId), sec = P.sectionById(moduleId, sectionId);
    if (!mod || !sec) return [];
    const rng = opts.rng || P.rng();
    const mix = opts.mix || { 1: 0.3, 2: 0.4, 3: 0.3 };
    const srcs = sourcesFor(mod, sec);
    const banks = srcs.filter((s) => s.kind === "bank").flatMap((s) => s.arr);
    const gens = srcs.filter((s) => s.kind === "gen");
    const want = { 1: Math.round(count * mix[1]), 2: Math.round(count * mix[2]) };
    want[3] = count - want[1] - want[2];
    const picked = [];
    const used = new Set();
    // ambil dari bank per tingkat
    [1, 2, 3].forEach((d) => {
      const pool = rng.shuffle(banks.filter((q) => (q.d || 2) === d));
      let n = want[d];
      // jika ada generator, bagi porsi: separuh bank separuh generator (bila bank cukup)
      const fromBank = gens.length ? Math.ceil(n / 2) : n;
      pool.slice(0, fromBank).forEach((q) => { picked.push(q); used.add(q); n--; });
      for (let i = 0; i < n && gens.length; i++) picked.push(rng.pick(gens).fn(rng, d));
      want[d] = n > 0 && !gens.length ? n : 0; // sisa yang belum terpenuhi
    });
    // isi kekurangan dari bank tingkat lain
    let short = count - picked.length;
    if (short > 0) {
      const rest = rng.shuffle(banks.filter((q) => !used.has(q)));
      rest.slice(0, short).forEach((q) => { picked.push(q); used.add(q); });
      short = count - picked.length;
      for (let i = 0; i < short && gens.length; i++) picked.push(rng.pick(gens).fn(rng, rng.int(1, 3)));
    }
    const list = rng.shuffle(picked).slice(0, count);
    return list.map((raw, i) => normalize(raw, mod, sec, rng, i));
  };

  /** Statistik bank untuk tampilan */
  Bank.stats = function () {
    let hand = 0, gens = 0;
    P.MODULES.forEach((m) => m.sections.forEach((s) => sourcesFor(m, s).forEach((src) => { if (src.kind === "bank") hand += src.arr.length; else gens++; })));
    return { hand, gens, modules: P.MODULES.length, sections: P.MODULES.reduce((n, m) => n + m.sections.length, 0) };
  };

  /** Daftar bagian yang bisa dipakai di simulasi standar (punya sim config) */
  Bank.simSections = function () {
    const out = [];
    P.MODULES.forEach((m) => m.sections.forEach((s) => { if (s.sim && s.sim.count) out.push({ mod: m, sec: s }); }));
    return out;
  };

  P.Bank = Bank;
})(window.PSI);

/* js/core/report.js */
/* Analisis hasil simulasi → laporan & rekomendasi */
(function (P) {
  const R = {};

  R.analyze = function (attempt) {
    const items = attempt.items || [];
    const bySec = {};
    items.forEach((it) => {
      const k = `${it.q.moduleId}/${it.q.sectionId}`;
      const s = (bySec[k] = bySec[k] || { key: k, moduleId: it.q.moduleId, sectionId: it.q.sectionId, title: it.q.sectionTitle, moduleTitle: it.q.moduleTitle, total: 0, correct: 0, blank: 0, time: 0, wrongNums: [], byDiff: { 1: [0, 0], 2: [0, 0], 3: [0, 0] } });
      s.total++; s.time += it.time || 0;
      if (it.correct) s.correct++; else if (it.chosen === null || it.chosen === undefined || (Array.isArray(it.chosen) && !it.chosen.length)) s.blank++;
      if (!it.correct) s.wrongNums.push(it.num);
      s.byDiff[it.q.d || 2][1]++; if (it.correct) s.byDiff[it.q.d || 2][0]++;
    });
    const sections = Object.values(bySec).map((s) => Object.assign(s, { pct: P.pct(s.correct, s.total), avgTime: s.total ? s.time / s.total : 0 }));
    const byDiff = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
    items.forEach((it) => { const d = it.q.d || 2; byDiff[d][1]++; if (it.correct) byDiff[d][0]++; });
    const wrong = items.filter((it) => !it.correct);
    const blank = items.filter((it) => it.chosen === null || it.chosen === undefined || (Array.isArray(it.chosen) && !it.chosen.length));
    const avgTime = items.length ? P.avg(items.map((it) => it.time || 0)) : 0;
    // kesalahan cepat (terburu-buru): salah dengan waktu < 40% rata-rata
    const rushed = wrong.filter((it) => it.chosen !== null && it.chosen !== undefined && (it.time || 0) < avgTime * 0.4 && items.length > 5);
    const slowCorrect = items.filter((it) => it.correct && (it.time || 0) > avgTime * 2);

    // rekomendasi
    const recos = [];
    const weak = sections.filter((s) => s.total >= 3).sort((a, b) => a.pct - b.pct);
    weak.slice(0, 3).forEach((s) => {
      if (s.pct < 70) recos.push({ icon: "📚", title: `Perkuat ${s.title}`, text: `Akurasi ${s.pct}% (${s.correct}/${s.total}). ${s.wrongNums.length ? "Salah di nomor " + s.wrongNums.join(", ") + "." : ""} Baca ulang materi, perhatikan bagian "Cara menjawab" dan "Kesalahan umum", lalu ulangi kuis bagian ini sampai ≥ 80%.`, link: `#/modul/${s.moduleId}/materi/${s.sectionId}`, link2: `#/kuis/${s.moduleId}/${s.sectionId}`, pct: s.pct });
    });
    if (byDiff[3][1] >= 3 && P.pct(byDiff[3][0], byDiff[3][1]) < 50 && P.pct(byDiff[1][0], byDiff[1][1]) >= 70) recos.push({ icon: "🧗", title: "Dasar kuat, soal sulit masih goyah", text: `Soal mudah ${P.pct(byDiff[1][0], byDiff[1][1])}% benar, tetapi soal sulit hanya ${P.pct(byDiff[3][0], byDiff[3][1])}%. Soal sulit biasanya menggabungkan 2–3 pola sekaligus. Saat latihan, biasakan membaca penjelasan soal sulit sampai tuntas walau sudah benar.` });
    if (byDiff[1][1] >= 3 && P.pct(byDiff[1][0], byDiff[1][1]) < 60) recos.push({ icon: "🧱", title: "Kuasai dasar dulu", text: `Soal tingkat mudah baru ${P.pct(byDiff[1][0], byDiff[1][1])}% benar. Fokus ke materi dasar tiap bagian sebelum menambah porsi simulasi.` });
    if (rushed.length >= 2) recos.push({ icon: "⏱️", title: "Terlalu terburu-buru", text: `${rushed.length} soal salah dijawab jauh lebih cepat dari rata-rata (nomor ${rushed.map((i) => i.num).join(", ")}). Baca soal sampai selesai, terutama kata kunci seperti <i>bukan, kecuali, paling, tidak</i>.` });
    if (blank.length >= Math.max(2, items.length * 0.15)) recos.push({ icon: "⌛", title: "Manajemen waktu", text: `${blank.length} soal tidak terjawab. Tetapkan batas waktu per soal (misal 45 detik); jika lewat, tebak terbaik lalu lanjut. Di kebanyakan psikotes tidak ada pengurangan nilai untuk jawaban salah.` });
    if (slowCorrect.length >= 3) recos.push({ icon: "🐢", title: "Benar tapi lambat", text: `${slowCorrect.length} soal benar tetapi memakan waktu > 2× rata-rata (nomor ${slowCorrect.map((i) => i.num).join(", ")}). Pelajari trik cepat di materi untuk jenis soal tersebut agar sisa waktu bisa dipakai memeriksa jawaban lain.` });
    const strong = sections.filter((s) => s.total >= 3 && s.pct >= 85);
    if (strong.length) recos.push({ icon: "🏆", title: "Sudah kuat", text: `${strong.map((s) => s.title).join(", ")} ≥ 85%. Pertahankan dengan simulasi berkala; alihkan waktu belajar ke bagian yang lebih lemah.` });
    if (!recos.length) recos.push({ icon: "✅", title: "Hasil merata", text: "Tidak ada kelemahan mencolok. Tingkatkan tantangan dengan simulasi lengkap dan perhatikan kecepatan." });
    const pct = P.pct(attempt.score, attempt.total);
    const grade = pct >= 90 ? { label: "Sangat baik", cls: "success" } : pct >= 75 ? { label: "Baik", cls: "success" } : pct >= 60 ? { label: "Cukup", cls: "warn" } : { label: "Perlu latihan", cls: "danger" };
    return { sections, byDiff, wrong, blank, avgTime, rushed, slowCorrect, recos, grade, pct };
  };

  /** Ringkasan singkat untuk hasil kuis bagian */
  R.quizFeedback = function (pct) {
    if (pct >= 90) return "Luar biasa! Kamu menguasai bagian ini. Lanjut ke bagian berikutnya atau coba simulasi.";
    if (pct >= 75) return "Bagus. Baca penjelasan soal yang salah, lalu ulangi sekali lagi untuk memantapkan.";
    if (pct >= 60) return "Cukup. Kembali ke materi, fokus pada pola yang membuatmu salah, lalu ulangi kuis.";
    return "Masih perlu latihan. Baca materi dengan saksama, kerjakan contoh terbimbing, lalu ulangi kuis ini.";
  };

  P.Report = R;
})(window.PSI);

/* js/views/home.js */
/* Beranda: headline, spesimen soal hidup, indeks modul */
(function (P) {
  P.Views = P.Views || {};

  // Satu kartu spesimen: soal nyata dari generator, dirender ringkas
  function specimenCard(kind) {
    const rng = P.rng();
    if (kind === "fig") {
      const q = P.GEN["fig-seq"](rng, 2);
      return `<div class="sp-card"><div class="sp-head"><span>Deret gambar</span><span>figural</span></div><div class="sp-q">${q.fig}</div><div class="sp-opts">${["A", "B", "C", "D", "E"].map((l, i) => `<span class="${i === q.a ? "on" : ""}">${l}</span>`).join("")}</div></div>`;
    }
    if (kind === "deret") {
      const q = P.GEN.deret(rng, 2);
      return `<div class="sp-card"><div class="sp-head"><span>Deret angka</span><span>numerik</span></div><div class="sp-q">${q.q}</div><div class="sp-opts">${q.o.map((o, i) => `<span class="${i === q.a ? "on" : ""}">${o}</span>`).join("")}</div></div>`;
    }
    const bank = P.BANK.verbal.analogi; const q = bank[rng.int(0, bank.length - 1)];
    return `<div class="sp-card"><div class="sp-head"><span>Analogi</span><span>verbal</span></div><div class="sp-q">${q.q.replace(/<br>/g, " ")}</div><div class="sp-opts">${q.o.slice(0, 3).map((o, i) => `<span class="${i === q.a ? "on" : ""}">${o}</span>`).join("")}</div></div>`;
  }
  const specimenHtml = () => specimenCard("verbal") + specimenCard("deret") + specimenCard("fig");

  P.Views.home = function (container) {
    const st = P.Bank.stats();
    const attempts = P.Store.attempts();
    const sims = attempts.filter((a) => a.kind === "simulasi");
    const last = attempts[0];
    const streak = P.Store.streak();
    const started = attempts.length || Object.keys(P.Store.get().materiRead).length;
    let next = null;
    for (const m of P.MODULES) { for (const s of m.sections) { const read = P.Store.isMateriRead(m.id, s.id); const b = P.Store.quizBest(m.id, s.id); if (!read || (s.quiz && (!b || b.pct < 60))) { next = { m, s, read }; break; } } if (next) break; }
    const nextHref = next ? (next.read ? `#/kuis/${next.m.id}/${next.s.id}` : `#/modul/${next.m.id}/materi/${next.s.id}`) : "#/simulasi";
    const modNames = P.MODULES.map((m) => m.title);
    container.innerHTML = `
<div class="view-enter">
  <section class="hero">
    <div>
      <h1>Kuasai <span class="hl">polanya</span>, <span class="lt">bukan hafal soalnya.</span></h1>
      <p class="lead">Materi per jenis tes, kuis dengan pembahasan seketika, lalu simulasi dengan soal yang selalu diacak dan laporan yang menunjuk nomor mana yang salah dan kenapa.</p>
      <div class="cta">
        <a class="btn btn-primary btn-lg" href="${nextHref}">${next ? `${started ? "Lanjutkan" : "Mulai"}: ${next.s.title}` : "Mulai simulasi"} ${P.icon("arrowRight", 18)}</a>
        <a class="btn btn-lg" href="#/simulasi">${P.icon("target", 18)} Mode simulasi</a>
      </div>
      <p class="hero-meta"><b>${st.hand}+ soal</b> berpembahasan, <b>${st.gens} generator</b> soal acak, <b>${st.modules} modul</b>.${sims.length ? ` Kamu sudah menyelesaikan <b>${sims.length} simulasi</b>.` : ""}</p>
    </div>
    <div class="specimen" id="specimen" title="Klik untuk mengganti contoh soal" aria-label="Contoh soal yang dibangkitkan acak; klik untuk mengganti">
      <span class="tag sticker">Soal diacak · klik untuk ganti</span>
      ${specimenHtml()}
    </div>
  </section>
  <div class="marquee" aria-hidden="true"><div class="track">${[...modNames, ...modNames].map((n) => `<span><span class="dot">•</span> ${n}</span>`).join("")}</div></div>

  ${next ? `<div class="next-step"><div><h3><em>Berikutnya:</em> ${next.read ? "kerjakan kuis" : "baca materi"} ${next.s.title}</h3><p class="small muted" style="margin:0">${next.m.title} · ${next.s.desc}</p></div><a class="btn btn-ink" href="${nextHref}">${next.read ? "Mulai kuis" : "Buka materi"} ${P.icon("arrowRight", 16)}</a></div>` : ""}
  ${last ? `<div class="row-between mt-2 small muted"><span>Terakhir: <b style="color:var(--ink)">${last.title}</b> — ${last.score}/${last.total} benar (${last.pct}%) · ${P.fmtDate(last.ts)}</span><span class="row"><a class="btn btn-sm" href="#/hasil/${last.id}">Lihat laporan</a><a class="btn btn-sm btn-ghost" href="#/riwayat">Riwayat</a></span></div>` : ""}

  <h2 class="mt-4" style="margin-bottom:.9rem">Modul belajar</h2>
  <div class="index">${P.MODULES.map((m) => { const prog = P.Store.moduleProgress(m); return `<a class="index-row" href="#/modul/${m.id}"><span class="ir-ico">${P.icon(m.icon, 20)}</span><div><h3>${m.title}</h3><p>${m.desc}</p></div><div class="ir-prog"><span>${m.sections.length} bagian · ${prog}% selesai</span><div class="progress thin"><span style="width:${prog}%"></span></div></div><span class="ir-arrow">${P.icon("arrowRight", 20)}</span></a>`; }).join("")}</div>

  <h2 class="mt-4">Cara belajar yang efektif</h2>
  <div class="howto">
    <div><div class="hw-n">1</div><h3>Pahami polanya</h3><p>Baca materi: fokus pada cara menjawab dan contoh terbimbing. Psikotes mengulang pola yang sama dengan angka dan kata yang berbeda.</p></div>
    <div><div class="hw-n">2</div><h3>Kuis sampai 80%</h3><p>Kerjakan kuis bagian. Baca pembahasannya walau jawabanmu benar, di situ trik cepatnya. Ulangi sampai stabil di atas 80%.</p></div>
    <div><div class="hw-n">3</div><h3>Simulasi, lalu evaluasi</h3><p>Jalankan simulasi dengan timer. Laporan menunjuk nomor yang salah dan bagian yang lemah; kembali ke materinya, lalu simulasi lagi.</p></div>
  </div>
</div>`;
    const sp = P.$("#specimen", container);
    const reroll = () => { sp.classList.remove("swap"); void sp.offsetWidth; sp.classList.add("swap"); P.$$(".sp-card", sp).forEach((c) => c.remove()); sp.insertAdjacentHTML("beforeend", specimenHtml()); };
    sp.onclick = reroll;
    const t = setInterval(() => { if (!document.body.contains(sp)) return clearInterval(t); if (document.hidden) return; reroll(); }, 9000);
    P.cleanupView = () => clearInterval(t);
  };
})(window.PSI);

/* js/views/module.js */
/* Halaman modul: daftar bagian + aksi */
(function (P) {
  P.Views = P.Views || {};
  P.Views.module = function (container, { moduleId }) {
    const m = P.moduleById(moduleId);
    if (!m) { container.innerHTML = `<div class="empty">Modul tidak ditemukan.</div>`; return; }
    const prog = P.Store.moduleProgress(m);
    const special = m.special;
    const kindLabel = m.kind === "kognitif" ? "Tes kemampuan kognitif" : m.kind === "kecepatan" ? "Tes kecepatan & ketelitian" : m.kind === "kepribadian" ? "Tes kepribadian" : "Tes proyektif / menggambar";
    const primary = special === "kraepelin" ? `<a class="btn btn-primary" href="#/kraepelin">${P.icon("play", 18)} Mulai simulasi Kraepelin</a>` : special === "kode" ? `<a class="btn btn-primary" href="#/kode">${P.icon("play", 18)} Mulai latihan Kode & Ingatan</a>` : special === "wartegg" ? `<a class="btn btn-primary" href="#/wartegg">${P.icon("pencil", 18)} Latihan Wartegg interaktif</a>` : m.sections.some((s) => s.sim) ? `<a class="btn btn-primary" href="#/simulasi/modul/${m.id}">${P.icon("target", 18)} Simulasi modul ini</a>` : "";
    const done = m.sections.filter((s) => P.Store.isMateriRead(m.id, s.id)).length;
    container.innerHTML = `
<div class="view-enter">
  <div class="module-head">
    <div><div class="mh-ico">${P.icon(m.icon, 26)}</div><h1>${m.title}</h1><p class="sub">${kindLabel} · ${m.sections.length} bagian</p><p class="lead">${m.desc}</p>
      <div class="row">${primary}<a class="btn" href="#/modul/${m.id}/materi/${m.sections[0].id}">${P.icon("book", 18)} Mulai dari materi pertama</a></div></div>
    <div class="mh-prog"><div class="big num">${prog}<span style="font-size:.45em;color:var(--ink-3)">%</span></div><div class="small muted" style="margin:.2rem 0 .5rem">${done} dari ${m.sections.length} materi dibaca</div><div class="progress"><span class="accent" style="width:${prog}%"></span></div></div>
  </div>

  <div class="section-list">${m.sections.map((s, i) => {
      const read = P.Store.isMateriRead(m.id, s.id); const b = P.Store.quizBest(m.id, s.id);
      return `<div class="section-item"><span class="num">${String(i + 1).padStart(2, "0")}</span><div><h3>${s.title}</h3><div class="small muted">${s.desc}</div><div class="meta"><span class="${read ? "done" : ""}">${read ? "Materi dibaca" : "Materi belum dibaca"}</span>${s.quiz ? `<span class="${b && b.pct >= 80 ? "done" : ""}">${b ? `Kuis terbaik ${b.pct}%` : "Kuis belum dicoba"}</span>` : ""}${s.sim ? `<span>${s.sim.count} soal di simulasi</span>` : ""}</div></div>
        <div class="acts"><a class="btn btn-sm" href="#/modul/${m.id}/materi/${s.id}">Materi</a>${s.quiz ? `<a class="btn btn-sm btn-ink" href="#/kuis/${m.id}/${s.id}">Kuis</a>` : ""}${s.inventory ? `<a class="btn btn-sm" href="#/kepribadian/${s.inventory}">Simulasi ${s.inventory.toUpperCase()}</a>` : ""}${m.special === "kraepelin" ? `<a class="btn btn-sm btn-ink" href="#/kraepelin">Latihan</a>` : ""}${m.special === "kode" ? `<a class="btn btn-sm btn-ink" href="#/kode">Latihan</a>` : ""}${s.id === "wartegg" ? `<a class="btn btn-sm" href="#/wartegg">Latihan menggambar</a>` : ""}</div></div>`;
    }).join("")}</div>

  ${m.kind === "kognitif" || m.kind === "kecepatan" ? `<div class="callout callout-tip mt-3"><span class="co-ico">${P.icon("bulb", 22)}</span><div><b>Alur yang disarankan:</b> baca materi bagian, kerjakan kuisnya sampai minimal 80%, lanjut bagian berikutnya. Setelah semua bagian, jalankan simulasi modul untuk mengukur kecepatanmu dengan timer.</div></div>` : ""}
</div>`;
  };
})(window.PSI);

/* js/views/materi.js */
/* Halaman materi bagian */
(function (P) {
  P.Views = P.Views || {};
  P.Views.materi = function (container, { moduleId, sectionId }) {
    const m = P.moduleById(moduleId), s = P.sectionById(moduleId, sectionId);
    if (!m || !s) { container.innerHTML = `<div class="empty">Materi tidak ditemukan.</div>`; return; }
    const i = m.sections.indexOf(s), prev = m.sections[i - 1], next = m.sections[i + 1];
    const body = P.h(`<div class="materi">${s.materi}</div>`);
    const heads = P.$$("h2", body).map((h, k) => { h.id = "h" + k; return { id: h.id, t: h.textContent }; });
    const actions = `${s.quiz ? `<a class="btn btn-primary btn-sm btn-block" href="#/kuis/${m.id}/${s.id}">Kerjakan kuis ${P.icon("arrowRight", 16)}</a>` : ""}${s.inventory ? `<a class="btn btn-sm btn-block" href="#/kepribadian/${s.inventory}">Simulasi ${s.inventory.toUpperCase()}</a>` : ""}${m.special === "kraepelin" ? `<a class="btn btn-primary btn-sm btn-block" href="#/kraepelin">Latihan Kraepelin</a>` : ""}${m.special === "kode" ? `<a class="btn btn-primary btn-sm btn-block" href="#/kode">Latihan Kode</a>` : ""}${s.id === "wartegg" ? `<a class="btn btn-sm btn-block" href="#/wartegg">Latihan Wartegg</a>` : ""}`;
    container.innerHTML = `
<div class="view-enter">
  <h1>${s.title}</h1>
  <p class="sub">${m.title} · bagian ${i + 1} dari ${m.sections.length}</p>
  <div class="materi-layout">
    <div id="materiBody"></div>
    <aside><div class="toc"><div class="toc-title">Di halaman ini</div>${heads.map((h) => `<a href="#${h.id}" data-toc="${h.id}">${h.t}</a>`).join("")}<div class="mt-2 stack">${actions}</div></div></aside>
  </div>
  <div class="materi-nav">
    ${prev ? `<a class="btn" href="#/modul/${m.id}/materi/${prev.id}">${P.icon("arrowLeft", 16)} ${prev.title}</a>` : `<a class="btn" href="#/modul/${m.id}">${P.icon("arrowLeft", 16)} Kembali ke modul</a>`}
    <div class="row">${s.quiz ? `<a class="btn btn-primary" href="#/kuis/${m.id}/${s.id}">Kerjakan kuis bagian ini ${P.icon("arrowRight", 16)}</a>` : ""}${next ? `<a class="btn" href="#/modul/${m.id}/materi/${next.id}">${next.title} ${P.icon("arrowRight", 16)}</a>` : ""}</div>
  </div>
</div>`;
    P.$("#materiBody", container).appendChild(body);
    const tocLinks = P.$$("[data-toc]", container);
    tocLinks.forEach((a) => a.onclick = (e) => { e.preventDefault(); const el = document.getElementById(a.dataset.toc); el && el.scrollIntoView({ behavior: "smooth", block: "start" }); });
    // sorot bagian aktif di daftar isi
    const headEls = heads.map((h) => document.getElementById(h.id));
    const onScroll = () => {
      let cur = 0; headEls.forEach((el, k) => { if (el && el.getBoundingClientRect().top < 120) cur = k; });
      tocLinks.forEach((a, k) => a.classList.toggle("on", k === cur));
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 200) mark();
    };
    let marked = false; const mark = () => { if (marked) return; marked = true; P.Store.markMateri(moduleId, sectionId); P.renderNav && P.renderNav(); };
    const t = setTimeout(mark, 20000);
    window.addEventListener("scroll", onScroll, { passive: true });
    P.cleanupView = () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
    window.scrollTo(0, 0);
  };
})(window.PSI);

/* js/views/quiz.js */
/* Runner soal (kuis latihan & simulasi) + halaman kuis bagian */
(function (P) {
  P.Views = P.Views || {};

  function renderOption(opt, i, cls, extra = "") {
    const isFig = typeof opt === "object" && opt.svg;
    return `<button class="opt ${isFig ? "fig" : ""} ${cls}" data-i="${i}" ${extra}><span class="letter">${P.letter(i)}</span>${isFig ? opt.svg : `<span class="opt-text">${opt}</span>`}</button>`;
  }

  /**
   * Runner.create({container, questions, mode:'latihan'|'sim', timeLimit(sec)|null, title, subtitle, onFinish(result), onExit})
   */
  const Runner = {};
  Runner.create = function (cfg) {
    const { container, questions, mode } = cfg;
    const n = questions.length;
    const state = { cur: 0, chosen: Array(n).fill(null), locked: Array(n).fill(false), flag: Array(n).fill(false), time: Array(n).fill(0), enter: Date.now(), start: Date.now(), finished: false, timer: null };
    const limit = cfg.timeLimit || null;

    function tick() {
      const now = Date.now();
      const el = P.$("#rTimer", container); if (!el) return;
      const elapsed = (now - state.start) / 1000;
      if (limit) {
        const left = limit - elapsed;
        el.lastChild.textContent = P.fmtTime(left);
        el.classList.toggle("low", left <= 30);
        const bar = P.$("#rBar", container); if (bar) { bar.firstElementChild.style.width = Math.max(0, (left / limit) * 100) + "%"; bar.classList.toggle("low", left <= 30); }
        if (left <= 0) finish(true);
      } else el.lastChild.textContent = P.fmtTime(elapsed);
    }
    function leaveQ() { state.time[state.cur] += (Date.now() - state.enter) / 1000; state.enter = Date.now(); }
    function goto(i) { leaveQ(); state.cur = P.clamp(i, 0, n - 1); render(); }
    function isCorrect(q, chosen) {
      if (q.type === "multi") { if (!Array.isArray(chosen)) return false; return chosen.slice().sort().join(",") === q.answerSet.slice().sort().join(","); }
      return chosen === q.a;
    }
    function finish(auto) {
      if (state.finished) return; state.finished = true; leaveQ(); clearInterval(state.timer); document.removeEventListener("keydown", onKey);
      const items = questions.map((q, i) => ({ num: i + 1, q, chosen: state.chosen[i], correct: isCorrect(q, state.chosen[i]), time: Math.round(state.time[i]), flagged: state.flag[i] }));
      const score = items.filter((it) => it.correct).length;
      cfg.onFinish({ items, score, total: n, duration: Math.round((Date.now() - state.start) / 1000), timeLimit: limit, auto: !!auto });
    }
    function choose(i) {
      const q = questions[state.cur];
      if (q.type === "multi") { if (state.locked[state.cur]) return; const sel = Array.isArray(state.chosen[state.cur]) ? state.chosen[state.cur].slice() : []; const k = sel.indexOf(i); if (k >= 0) sel.splice(k, 1); else sel.push(i); state.chosen[state.cur] = sel; render(); return; }
      if (i >= q.o.length) return;
      if (mode === "latihan") { if (state.locked[state.cur]) return; state.chosen[state.cur] = i; state.locked[state.cur] = true; render(); }
      else { state.chosen[state.cur] = i; render(); }
    }
    function onKey(e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const k = e.key;
      if (/^[1-8]$/.test(k)) { e.preventDefault(); choose(+k - 1); return; }
      if (/^[a-hA-H]$/.test(k) && !e.ctrlKey && !e.metaKey) { const idx = k.toUpperCase().charCodeAt(0) - 65; if (k.toLowerCase() === "f" && mode === "sim") { state.flag[state.cur] = !state.flag[state.cur]; render(); return; } e.preventDefault(); choose(idx); return; }
      if (k === "Enter" || k === "ArrowRight") { e.preventDefault(); const lock = P.$("#rLock", container); if (lock) return lock.click(); if (state.cur < n - 1) goto(state.cur + 1); else { const d = P.$("#rDone", container); d && d.click(); } return; }
      if (k === "ArrowLeft") { e.preventDefault(); goto(state.cur - 1); }
    }

    function render() {
      const q = questions[state.cur];
      const chosen = state.chosen[state.cur], locked = state.locked[state.cur];
      const showFeedback = mode === "latihan" && locked;
      let optsHtml = "";
      if (q.type === "multi") {
        const sel = Array.isArray(chosen) ? chosen : [];
        optsHtml = `<div class="options cols-4">${q.items.map((it, i) => { let cls = sel.includes(i) ? "selected" : ""; if (showFeedback) { if (q.answerSet.includes(i)) cls = "correct"; else if (sel.includes(i)) cls = "wrong"; } return `<button class="opt fig ${cls}" data-i="${i}" ${locked ? "disabled" : ""}>${it.svg}<span class="small muted mono">${it.label}</span></button>`; }).join("")}</div>`;
      } else {
        const isFig = q.o.some((o) => typeof o === "object");
        const cols = isFig ? (q.o.length === 5 ? "cols-5" : "cols-4") : (q.o.length === 2 ? "cols-2" : "");
        optsHtml = `<div class="options ${cols}">${q.o.map((o, i) => { let cls = chosen === i ? "selected" : ""; if (showFeedback) { if (i === q.a) cls = "correct"; else if (chosen === i) cls = "wrong"; } return renderOption(o, i, cls, locked && mode === "latihan" ? "disabled" : ""); }).join("")}</div>`;
      }
      let fb = "";
      if (showFeedback) {
        const ok = isCorrect(q, chosen);
        const blank = chosen === null || (Array.isArray(chosen) && !chosen.length);
        fb = `<div class="explain ${ok ? "ok" : "bad"}"><div class="verdict ${ok ? "ok" : "bad"}">${ok ? "Benar." : blank ? "Tidak dijawab." : "Kurang tepat."} ${q.type !== "multi" ? `Jawaban: ${P.letter(q.a)}` : `Yang dicoret: ${q.answerSet.map((i) => i + 1).join(", ")}`}</div><h4>Pembahasan</h4><div>${q.e}</div></div>`;
      }
      const answered = state.chosen.filter((c) => c !== null && !(Array.isArray(c) && !c.length)).length;
      container.innerHTML = `
<div class="runner fade-in">
  <div class="runner-top">
    <div><h2>${cfg.title || ""}</h2><div class="small muted">${cfg.subtitle || ""}</div></div>
    <div class="row"><span class="counter">${String(state.cur + 1).padStart(2, "0")}<small> / ${String(n).padStart(2, "0")}</small></span><span class="timer" id="rTimer">${P.icon("clock", 16)}<span>--:--</span></span><button class="btn btn-ghost btn-sm" id="rExit">Keluar</button></div>
  </div>
  ${limit ? `<div class="timebar" id="rBar"><span style="width:100%"></span></div>` : `<div class="progress thin mb-2"><span class="accent" style="width:${((state.cur + 1) / n) * 100}%"></span></div>`}
  <div class="q-card">
    <div class="q-meta"><span class="tag tag-soft">${q.moduleTitle} · ${q.sectionTitle}</span><span class="tag diff-${q.d}">${["", "Mudah", "Sedang", "Sulit"][q.d]}</span>${mode === "sim" ? `<button class="btn btn-ghost btn-sm" id="rFlag" style="margin-left:auto">${P.icon("flag", 15)} ${state.flag[state.cur] ? "Ditandai" : "Tandai ragu"}</button>` : ""}</div>
    <div class="q-text">${q.p ? `<div class="passage"><p>${q.p}</p></div>` : ""}${q.q}</div>
    ${q.fig ? `<div class="q-fig">${q.fig}</div>` : ""}
    ${optsHtml}
    ${q.type === "multi" && !locked && mode === "latihan" ? `<div class="mt-2"><button class="btn btn-primary" id="rLock">Kunci jawaban</button></div>` : ""}
    ${fb}
  </div>
  <div class="runner-foot">
    <button class="btn" id="rPrev" ${state.cur === 0 ? "disabled" : ""}>${P.icon("arrowLeft", 16)} Sebelumnya</button>
    <div class="small muted">${answered} terjawab</div>
    ${state.cur < n - 1 ? `<button class="btn btn-ink" id="rNext">${mode === "latihan" && !locked ? "Lewati" : "Berikutnya"} ${P.icon("arrowRight", 16)}</button>` : `<button class="btn btn-success" id="rDone">Selesai ${P.icon("check", 16)}</button>`}
  </div>
  <div class="keys"><span><span class="kbd">1</span>–<span class="kbd">${Math.min(q.type === "multi" ? q.items.length : q.o.length, 8)}</span> atau <span class="kbd">A</span>–<span class="kbd">${P.letter(Math.min(q.type === "multi" ? q.items.length : q.o.length, 8) - 1)}</span> pilih</span><span><span class="kbd">Enter</span> lanjut</span>${mode === "sim" ? `<span><span class="kbd">F</span> tandai ragu</span>` : ""}</div>
  <div class="qnav">${questions.map((qq, i) => { let c = i === state.cur ? "current " : ""; const ch = state.chosen[i]; const has = ch !== null && !(Array.isArray(ch) && !ch.length); if (mode === "latihan" && state.locked[i]) c += isCorrect(qq, ch) ? "ok" : "bad"; else if (has) c += "answered"; if (state.flag[i]) c += " flag"; return `<button class="${c}" data-nav="${i}" aria-label="Soal ${i + 1}">${i + 1}</button>`; }).join("")}</div>
</div>`;
      tick();
      P.$$(".opt", container).forEach((b) => b.addEventListener("click", () => choose(+b.dataset.i)));
      const lock = P.$("#rLock", container); if (lock) lock.onclick = () => { state.locked[state.cur] = true; render(); };
      P.$("#rPrev", container).onclick = () => goto(state.cur - 1);
      const nx = P.$("#rNext", container); if (nx) nx.onclick = () => goto(state.cur + 1);
      const dn = P.$("#rDone", container); if (dn) dn.onclick = async () => {
        const left = n - answered;
        if (mode === "sim" && left > 0 && !(await P.confirm("Selesaikan sekarang?", `Masih ada <b>${left}</b> soal belum dijawab. Jawaban kosong dihitung salah.`, "Ya, selesaikan"))) return;
        finish(false);
      };
      const fl = P.$("#rFlag", container); if (fl) fl.onclick = () => { state.flag[state.cur] = !state.flag[state.cur]; render(); };
      P.$("#rExit", container).onclick = async () => { if (await P.confirm("Keluar dari sesi?", "Progres sesi ini tidak akan disimpan.", "Keluar", "Lanjutkan")) { clearInterval(state.timer); document.removeEventListener("keydown", onKey); cfg.onExit && cfg.onExit(); } };
      P.$$("[data-nav]", container).forEach((b) => b.addEventListener("click", () => goto(+b.dataset.nav)));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    state.timer = setInterval(tick, 500);
    document.addEventListener("keydown", onKey);
    P.cleanupView = () => { clearInterval(state.timer); document.removeEventListener("keydown", onKey); };
    render();
    return { destroy: () => { clearInterval(state.timer); document.removeEventListener("keydown", onKey); }, finish: () => finish(false) };
  };
  P.Runner = Runner;

  /* Skor besar (dipakai hasil kuis & latihan khusus) */
  P.scoreBlock = function (pct, label = "skor") {
    const cls = pct >= 75 ? "c-ok" : pct >= 60 ? "c-warn" : "c-bad";
    return `<div class="score-hero ${cls}" style="border:0;padding:0;grid-template-columns:1fr;justify-items:center"><div class="score">${pct}<small>%</small></div><div class="small muted" style="margin-top:-.2rem">${label}</div></div>`;
  };

  /* ---------------- Halaman kuis bagian ---------------- */
  P.Views.quiz = function (container, { moduleId, sectionId }) {
    const mod = P.moduleById(moduleId), sec = P.sectionById(moduleId, sectionId);
    if (!mod || !sec || !sec.quiz) { container.innerHTML = `<div class="empty">Bagian ini tidak memiliki kuis.</div>`; return; }
    const best = P.Store.quizBest(moduleId, sectionId);
    container.innerHTML = `
<div class="runner fade-in"><div class="q-card section-intro">
  <div class="big">${P.icon(mod.icon, 28)}</div>
  <h1>Kuis: ${sec.title}</h1>
  <p class="sub" style="text-align:center">${mod.title}</p>
  <p class="muted">${sec.desc}</p>
  <ul class="muted small">
    <li><b>${sec.quiz.count} soal</b> campuran tingkat mudah–sulit, diacak setiap kali.</li>
    <li>Mode latihan: pembahasan muncul langsung setelah kamu menjawab.</li>
    <li>Perkiraan waktu ${P.fmtDur(sec.quiz.time)}; timer berjalan naik, tidak memaksa.</li>
    ${best ? `<li>Skor terbaikmu <b>${best.pct}%</b> (${best.score}/${best.total}) dari ${best.tries || 1} percobaan.</li>` : ""}
  </ul>
  <div class="row" style="justify-content:center;margin-top:1rem">
    <a class="btn" href="#/modul/${moduleId}/materi/${sectionId}">${P.icon("book", 18)} Baca materi dulu</a>
    <button class="btn btn-primary btn-lg" id="startQuiz">Mulai kuis ${P.icon("arrowRight", 18)}</button>
  </div>
</div></div>`;
    P.$("#startQuiz", container).onclick = () => {
      const qs = P.Bank.build(moduleId, sectionId, sec.quiz.count);
      P.Runner.create({
        container, questions: qs, mode: "latihan", title: `Kuis: ${sec.title}`, subtitle: mod.title, onExit: () => location.hash = `#/modul/${moduleId}`,
        onFinish: (res) => {
          P.Store.recordQuiz(moduleId, sectionId, res.score, res.total);
          const pct = P.pct(res.score, res.total);
          const attemptId = P.Store.addAttempt({ kind: "kuis", title: `Kuis ${sec.title}`, moduleId, ts: Date.now(), score: res.score, total: res.total, pct, duration: res.duration, items: res.items });
          const nextIdx = mod.sections.indexOf(sec) + 1; const next = mod.sections[nextIdx];
          container.innerHTML = `<div class="runner fade-in"><div class="q-card section-intro">
            ${P.scoreBlock(pct)}
            <h1 class="mt-2" style="font-size:1.6rem">${res.score} dari ${res.total} benar</h1>
            <p class="muted">${P.Report.quizFeedback(pct)}</p>
            <div class="row" style="justify-content:center;margin-top:1rem">
              <a class="btn" href="#/hasil/${attemptId}">${P.icon("list", 16)} Lihat pembahasan</a>
              <button class="btn" id="again">${P.icon("refresh", 16)} Ulangi (soal baru)</button>
              ${next ? `<a class="btn btn-primary" href="#/modul/${moduleId}/materi/${next.id}">Lanjut: ${next.title} ${P.icon("arrowRight", 16)}</a>` : `<a class="btn btn-primary" href="#/simulasi/modul/${moduleId}">Simulasi modul ${P.icon("arrowRight", 16)}</a>`}
            </div></div></div>`;
          if (pct >= 80) P.confetti();
          P.renderNav && P.renderNav();
          P.$("#again", container).onclick = () => P.Views.quiz(container, { moduleId, sectionId });
        },
      });
    };
  };
})(window.PSI);

/* js/views/kraepelin.js */
/* Simulasi Kraepelin / Pauli interaktif */
(function (P) {
  P.Views = P.Views || {};
  P.Views.kraepelin = function (container) {
    const prev = P.Store.get().kraepelin;
    container.innerHTML = `
<div class="runner view-enter"><div class="q-card">
  <div class="row" style="gap:.9rem"><span class="section-intro big" style="margin:0;padding:0;width:48px;height:48px">${P.icon("plus", 24)}</span><div><h1 style="margin:0">Simulasi tes koran</h1><div class="small muted">Kraepelin & Pauli</div></div></div>
  <p class="muted mt-2">Jumlahkan dua angka yang berdekatan dan ketik <b>angka satuannya</b> (8 + 9 = 17, ketik <b>7</b>). Gunakan keyboard angka atau tombol di layar. Saat waktu lajur habis, otomatis pindah ke lajur berikutnya, persis seperti aba-aba "pindah".</p>
  <div class="grid grid-3">
    <label class="stack" style="gap:.3rem"><span class="small muted">Jumlah lajur</span><select id="kCols" class="btn"><option value="5">5 (pemanasan, ±1,5 mnt)</option><option value="10" selected>10 (±3 mnt)</option><option value="20">20 (±6 mnt)</option><option value="30">30 (±9 mnt)</option><option value="45">45 (ujian penuh, ±13 mnt)</option></select></label>
    <label class="stack" style="gap:.3rem"><span class="small muted">Waktu per lajur</span><select id="kSec" class="btn"><option value="15">15 detik (cepat)</option><option value="20" selected>20 detik (standar)</option><option value="30">30 detik (santai)</option></select></label>
    <label class="stack" style="gap:.3rem"><span class="small muted">Arah</span><select id="kDir" class="btn"><option value="up" selected>Bawah ke atas (Kraepelin)</option><option value="down">Atas ke bawah (Pauli)</option></select></label>
  </div>
  <div class="row mt-2"><a class="btn" href="#/modul/kraepelin/materi/kraepelin">${P.icon("book", 16)} Materi & tips</a><button class="btn btn-primary btn-lg" id="kStart">Mulai ${P.icon("arrowRight", 18)}</button></div>
  ${prev.length ? `<h3 class="mt-3">Riwayat latihan</h3><table class="small"><tr><th>Waktu</th><th>Lajur</th><th>Rata-rata/lajur</th><th>Salah</th><th>Keajegan</th></tr>${prev.slice(0, 8).map((r) => `<tr><td>${P.fmtDate(r.ts)}</td><td class="mono">${r.cols}×${r.sec}s</td><td class="mono">${r.avg.toFixed(1)}</td><td class="mono">${r.errors}</td><td>${r.stabil}</td></tr>`).join("")}</table>` : ""}
</div></div>`;
    P.$("#kStart", container).onclick = () => run(container, { cols: +P.$("#kCols", container).value, sec: +P.$("#kSec", container).value, dir: P.$("#kDir", container).value });
  };

  function run(container, cfg) {
    const ROWS = 22;
    const rng = P.rng();
    const cols = Array.from({ length: cfg.cols }, () => Array.from({ length: ROWS }, () => rng.int(0, 9)));
    const answers = cols.map(() => []);
    let c = 0, pos = 0, left = cfg.sec, timer = null, done = false;
    const keyHandler = (e) => { if (/^[0-9]$/.test(e.key)) { e.preventDefault(); input(+e.key); } };
    document.addEventListener("keydown", keyHandler);
    P.cleanupView = () => stop();

    function pairAt(ci, pi) { const col = cols[ci]; return cfg.dir === "up" ? [col[ROWS - 1 - pi], col[ROWS - 2 - pi]] : [col[pi], col[pi + 1]]; }
    function input(v) {
      if (done || pos >= ROWS - 1) return;
      const [a, b] = pairAt(c, pos); const ok = (a + b) % 10 === v;
      answers[c].push({ pos, val: v, ok }); pos++;
      renderCol();
    }
    function nextCol() { c++; pos = 0; left = cfg.sec; if (c >= cfg.cols) return finish(); renderCol(); }
    function tick() { left--; const el = P.$("#kLeft", container); if (el) { el.textContent = left; el.parentElement.classList.toggle("low", left <= 3); } if (left <= 0) nextCol(); }
    function renderCol() {
      const col = cols[c]; const ans = answers[c];
      const cells = [];
      for (let i = 0; i < ROWS; i++) {
        const idx = cfg.dir === "up" ? ROWS - 1 - i : i;
        const n = col[idx];
        let slot = "";
        const p = cfg.dir === "up" ? ROWS - 2 - i : i;
        if (i <= ROWS - 2) { const a = ans.find((x) => x.pos === p); const cls = a ? "filled" : p === pos ? "active" : ""; slot = `<span class="${cls}">${a ? a.val : ""}</span>`; }
        cells.push(`<div class="kr-cell"><div class="n">${n}</div><div class="a" style="transform:translateY(22px)">${slot}</div></div>`);
      }
      container.innerHTML = `
<div class="runner fade-in">
  <div class="runner-top"><div><h2>Lajur <span class="num">${c + 1}</span> <span class="muted-3">/ ${cfg.cols}</span></h2><div class="small muted">Kraepelin · ${cfg.dir === "up" ? "bawah ke atas" : "atas ke bawah"}</div></div><div class="row"><span class="timer">${P.icon("clock", 16)}<span id="kLeft">${left}</span> dtk</span><button class="btn btn-ghost btn-sm" id="kExit">Keluar</button></div></div>
  <div class="progress thin mb-2"><span class="accent" style="width:${(c / cfg.cols) * 100}%"></span></div>
  <div class="q-card kr-wrap">
    <div class="small muted">Kerjakan dari ${cfg.dir === "up" ? "<b>bawah ke atas</b>" : "<b>atas ke bawah</b>"}. Kotak bergaris merah muda adalah pasangan yang sedang dijumlahkan. Terisi <span class="mono">${ans.length} / ${ROWS - 1}</span></div>
    <div style="display:flex;flex-direction:column;max-height:62vh;overflow:auto;padding:0 1rem" id="kScroll">${cells.join("")}</div>
    <div class="numpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((k) => `<button data-k="${k}">${k}</button>`).join("")}</div>
  </div>
</div>`;
      P.$$("[data-k]", container).forEach((b) => b.onclick = () => input(+b.dataset.k));
      P.$("#kExit", container).onclick = () => { stop(); location.hash = "#/modul/kraepelin"; };
      const sc = P.$("#kScroll", container); const act = P.$(".kr-cell .a span.active", container); if (act) act.scrollIntoView({ block: "center" }); else if (cfg.dir === "up") sc.scrollTop = sc.scrollHeight;
    }
    function stop() { done = true; clearInterval(timer); document.removeEventListener("keydown", keyHandler); }
    function finish() {
      stop();
      const perCol = answers.map((a) => a.length), errs = answers.map((a) => a.filter((x) => !x.ok).length);
      const avg = P.avg(perCol), errors = P.sum(errs), total = P.sum(perCol);
      const sd = Math.sqrt(P.avg(perCol.map((v) => (v - avg) ** 2)));
      const stabil = sd <= 1.5 ? "Sangat stabil" : sd <= 2.5 ? "Stabil" : sd <= 4 ? "Kurang stabil" : "Tidak stabil";
      const half = Math.floor(perCol.length / 2);
      const first = P.avg(perCol.slice(0, half)), second = P.avg(perCol.slice(half));
      const trend = second - first;
      const maxV = Math.max(...perCol, 1);
      const notes = [];
      if (avg < 8) notes.push("Kecepatan (panker) masih rendah, di bawah 8 hitungan per lajur. Hafalkan pasangan jumlah di atas 10 sampai refleks dan latih ritme 15 menit tanpa jeda.");
      else if (avg >= 14) notes.push("Kecepatan sangat baik. Pastikan ketelitian tetap terjaga.");
      else notes.push("Kecepatan cukup baik. Target berikutnya: 14 hitungan per lajur atau lebih dengan kesalahan di bawah 1%.");
      if (total && errors / total > 0.05) notes.push(`Ketelitian (tianker) perlu diperbaiki: ${(100 * errors / total).toFixed(1)}% salah. Lebih baik sedikit lebih lambat tetapi akurat; kesalahan dihitung lebih berat daripada hitungan yang sedikit.`);
      else notes.push(`Ketelitian baik (${(100 * errors / Math.max(total, 1)).toFixed(1)}% salah).`);
      if (sd > 2.5) notes.push(`Keajegan (janker) kurang: capaian antar lajur naik-turun (simpangan ${sd.toFixed(1)}). Tetapkan tempo yang bisa dipertahankan, jangan sprint di awal.`);
      if (trend < -1.5) notes.push("Ketahanan (hanker): performa turun di paruh kedua. Biasanya faktor fisik atau konsentrasi; latih durasi lebih panjang dan jaga kondisi sebelum tes.");
      else if (trend > 1) notes.push("Performa meningkat di paruh kedua, pola yang dinilai positif.");
      P.Store.addKraepelin({ ts: Date.now(), cols: cfg.cols, sec: cfg.sec, avg, errors, stabil, perCol });
      container.innerHTML = `
<div class="runner fade-in"><div class="q-card">
  <h1>Hasil Kraepelin</h1>
  <div class="stats-row panel"><div><b>${avg.toFixed(1)}</b><span>Rata-rata / lajur</span></div><div><b>${total}</b><span>Total hitungan</span></div><div><b style="color:var(--bad)">${errors}</b><span>Salah</span></div><div><b style="font-size:1.1rem;line-height:1.4">${stabil}</b><span>Keajegan (σ ${sd.toFixed(1)})</span></div></div>
  <h3 class="mt-3">Grafik kerja per lajur</h3>
  <div class="kr-graph">${perCol.map((v, i) => `<div class="bar ${errs[i] ? "err" : ""}" style="height:${(v / maxV) * 100}%" title="Lajur ${i + 1}: ${v} hitungan, ${errs[i]} salah"><b>${v}</b></div>`).join("")}</div>
  <div class="small muted mt-1">Batang merah berarti ada kesalahan di lajur itu. Grafik ideal: relatif rata, sedikit naik, tanpa anjlok.</div>
  <h3 class="mt-3">Evaluasi</h3>${notes.map((n) => `<div class="reco"><span class="r-ico">${P.icon("sparkle", 20)}</span><p class="small">${n}</p></div>`).join("")}
  <div class="row mt-2"><button class="btn btn-primary" id="kAgain">${P.icon("refresh", 16)} Ulangi</button><a class="btn" href="#/modul/kraepelin/materi/kraepelin">${P.icon("book", 16)} Materi</a><a class="btn btn-ghost" href="#/">Beranda</a></div>
</div></div>`;
      P.$("#kAgain", container).onclick = () => P.Views.kraepelin(container);
    }
    let cd = 3;
    container.innerHTML = `<div class="runner"><div class="q-card section-intro"><div class="score-hero c-ok" style="border:0;padding:0;grid-template-columns:1fr;justify-items:center"><div class="score" id="cd">3</div></div><p class="muted">Bersiap: kerjakan dari ${cfg.dir === "up" ? "bawah ke atas" : "atas ke bawah"}, ketik satuannya saja.</p></div></div>`;
    const cdt = setInterval(() => { cd--; if (cd <= 0) { clearInterval(cdt); renderCol(); timer = setInterval(tick, 1000); } else P.$("#cd", container).textContent = cd; }, 1000);
  }
})(window.PSI);

/* js/views/kode.js */
/* Tes Kode & Ingatan: fase hafalan, lalu fase menjawab */
(function (P) {
  P.Views = P.Views || {};

  P.Views.kodeFlow = function (container, opts) {
    const d = opts.d || 2;
    const set = P.GEN.kode(P.rng(), d);
    const mod = P.moduleById("kode"), sec = P.sectionById("kode", "hafalan");
    const qs = set.questions.map((raw, i) => Object.assign({ id: "kode." + i, moduleId: "kode", sectionId: "hafalan", sectionTitle: sec.title, moduleTitle: mod.short, type: "mc", p: null, fig: null }, raw));
    let left = set.memorizeTime, timer = null;
    const renderTable = () => `<div class="kode-table">${set.table.map((t) => `<div class="kt-col"><h4>${t.cat} <span style="text-transform:none;letter-spacing:0;font-weight:500">(${t.pattern})</span></h4>${t.items.map((it) => `<div class="kt-row"><span>${it.name}</span><b>${it.code}</b></div>`).join("")}</div>`).join("")}</div>`;
    container.innerHTML = `
<div class="runner fade-in">
  <div class="runner-top"><div><h2>Fase 1: hafalkan tabel kode</h2><div class="small muted">${opts.label || "Kode & Ingatan"}</div></div><div class="row"><span class="timer" id="kdTimer">${P.icon("clock", 16)}<span>${P.fmtTime(left)}</span></span>${opts.embedded ? "" : `<button class="btn btn-ghost btn-sm" id="kdExit">Keluar</button>`}</div></div>
  <div class="timebar" id="kdBar"><span style="width:100%"></span></div>
  <div class="q-card">
    <div class="callout callout-info" style="margin-top:0"><span class="co-ico">${P.icon("brain", 22)}</span><div>Kamu punya <b>${P.fmtDur(set.memorizeTime)}</b> untuk menghafal ${set.table.reduce((n, t) => n + t.items.length, 0)} pasangan. Setelah itu tabel ditutup dan kamu menjawab ${qs.length} soal. Perhatikan pola kode tiap kategori (tertulis dalam kurung), hafalkan per kategori, buat asosiasi yang konyol.</div></div>
    ${renderTable()}
    <div class="row mt-2" style="justify-content:flex-end"><button class="btn btn-primary" id="kdReady">Saya sudah hafal, mulai soal ${P.icon("arrowRight", 16)}</button></div>
  </div>
</div>`;
    const start = () => {
      clearInterval(timer);
      P.Runner.create({ container, questions: qs, mode: "sim", timeLimit: set.answerTime, title: "Fase 2: jawab tanpa melihat tabel", subtitle: opts.label || "Kode & Ingatan", onExit: opts.onExit, onFinish: (res) => { res.table = set.table; opts.onFinish(res); } });
    };
    timer = setInterval(() => { left--; const el = P.$("#kdTimer", container); if (el) { el.lastChild.textContent = P.fmtTime(left); el.classList.toggle("low", left <= 10); const b = P.$("#kdBar", container); if (b) { b.firstElementChild.style.width = (left / set.memorizeTime) * 100 + "%"; b.classList.toggle("low", left <= 10); } } if (left <= 0) start(); }, 1000);
    P.cleanupView = () => clearInterval(timer);
    P.$("#kdReady", container).onclick = start;
    const ex = P.$("#kdExit", container); if (ex) ex.onclick = () => { clearInterval(timer); opts.onExit && opts.onExit(); };
  };

  P.Views.kode = function (container) {
    container.innerHTML = `
<div class="runner view-enter"><div class="q-card section-intro">
  <div class="big">${P.icon("brain", 28)}</div><h1>Tes Kode & Ingatan</h1>
  <p class="muted">Hafalkan tabel kategori–kode dalam waktu terbatas, lalu jawab pertanyaan tanpa melihat tabel. Tabel diacak setiap kali, jadi yang terlatih adalah tekniknya.</p>
  <div class="row" style="justify-content:center"><label class="row" style="gap:.4rem">Tingkat <select id="kdLevel" class="btn btn-sm"><option value="1">Mudah (4 kategori × 3, hafal 60 dtk)</option><option value="2" selected>Sedang (5 × 4, hafal 90 dtk)</option><option value="3">Sulit (5 × 5, hafal 120 dtk)</option></select></label></div>
  <div class="row mt-2" style="justify-content:center"><a class="btn" href="#/modul/kode/materi/hafalan">${P.icon("book", 16)} Materi & teknik</a><button class="btn btn-primary btn-lg" id="kdStart">Mulai ${P.icon("arrowRight", 18)}</button></div>
</div></div>`;
    P.$("#kdStart", container).onclick = () => {
      const d = +P.$("#kdLevel", container).value;
      P.Views.kodeFlow(container, { d, onExit: () => (location.hash = "#/modul/kode"), onFinish: (res) => {
        const pct = P.pct(res.score, res.total);
        P.Store.recordQuiz("kode", "hafalan", res.score, res.total);
        const id = P.Store.addAttempt({ kind: "kuis", title: "Kode & Ingatan (tingkat " + d + ")", moduleId: "kode", ts: Date.now(), score: res.score, total: res.total, pct, duration: res.duration, items: res.items });
        container.innerHTML = `<div class="runner fade-in"><div class="q-card section-intro">${P.scoreBlock(pct)}<h1 class="mt-2" style="font-size:1.6rem">${res.score} dari ${res.total} benar</h1><p class="muted">${pct >= 80 ? "Ingatan kerjamu bagus. Naikkan tingkat kesulitan." : pct >= 60 ? "Cukup. Fokus pada teknik: kenali pola kode per kategori dulu, baru hafalkan isinya." : "Latih chunking: hafalkan satu kategori sampai lancar sebelum pindah; manfaatkan pola kode untuk eliminasi."}</p>
          <details class="mt-2" style="text-align:left"><summary class="btn btn-sm">${P.icon("eye", 15)} Lihat tabel yang tadi dihafal</summary><div class="mt-2 kode-table">${res.table.map((t) => `<div class="kt-col"><h4>${t.cat}</h4>${t.items.map((it) => `<div class="kt-row"><span>${it.name}</span><b>${it.code}</b></div>`).join("")}</div>`).join("")}</div></details>
          <div class="row mt-2" style="justify-content:center"><a class="btn" href="#/hasil/${id}">${P.icon("list", 16)} Pembahasan</a><button class="btn btn-primary" id="kdAgain">${P.icon("refresh", 16)} Ulangi (tabel baru)</button></div></div></div>`;
        if (pct >= 80) P.confetti();
        P.$("#kdAgain", container).onclick = () => P.Views.kode(container);
      } });
    };
  };
})(window.PSI);

/* js/views/wartegg.js */
/* Latihan Wartegg interaktif: 8 kotak kanvas + daftar periksa */
(function (P) {
  P.Views = P.Views || {};
  const HINTS = ["Titik tengah: jadikan pusat (bunga, jam, sasaran)", "Lengkung kecil: benda hidup (burung, ikan, wajah)", "Garis naik: lanjutkan tren naik (tangga, grafik)", "Kotak hitam: bagian konstruktif (jendela gedung)", "Dua garis tegak lurus: objek dinamis (kapal, roket)", "Garis H & V terpisah: bangunan/benda lurus (rumah, TV)", "Titik-titik lengkung: benda halus (kalung, bunga)", "Lengkung besar: melindungi (payung, pelangi, kubah)"];
  const CHECK = ["Semua 8 kotak terisi gambar bermakna", "Stimulus dijadikan bagian utama gambar (bukan ditempel)", "Garis lengkung (1,2,7,8) menjadi benda hidup/organik", "Garis lurus (3,4,5,6) menjadi benda mati/teknis", "Kotak 3 melanjutkan tren naik", "Kotak 4 (kotak hitam) terintegrasi konstruktif", "Ukuran gambar memadai (tidak mungil di pojok)", "Tidak ada tema kekerasan/suram", "Tiap kotak diberi judul konkret", "Urutan pengerjaan kombinasi urut & acak"];

  P.Views.wartegg = function (container) {
    let timeLeft = 15 * 60, timer = null, order = [], pen = 3, erasing = false;
    container.innerHTML = `
<div class="view-enter">
  <div class="row-between"><div><h1>Latihan Wartegg</h1><div class="small muted" style="margin-top:-.4rem">Tes Menggambar · 8 kotak · 15 menit</div></div><div class="row"><span class="timer" id="wzTimer">${P.icon("clock", 16)}<span>15:00</span></span><a class="btn btn-ghost btn-sm" href="#/modul/gambar/materi/wartegg">${P.icon("book", 15)} Materi</a></div></div>
  <p class="muted small">Lengkapi 8 stimulus menjadi gambar bermakna dengan mouse atau jari. Urutan kotak yang kamu kerjakan dicatat otomatis. Setelah selesai, beri judul dan isi daftar periksa penilaian diri.</p>
  <div class="wz-tools"><button class="btn btn-sm" data-pen="2">Pena tipis</button><button class="btn btn-sm btn-ink" data-pen="3">Pena sedang</button><button class="btn btn-sm" data-pen="5">Pena tebal</button><button class="btn btn-sm" id="wzErase">${P.icon("eraser", 15)} Penghapus</button><button class="btn btn-sm" id="wzClear">Bersihkan kotak terakhir</button><button class="btn btn-sm btn-primary" id="wzDone">Selesai menggambar ${P.icon("arrowRight", 15)}</button></div>
  <div class="wz-grid" id="wzGrid">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<div class="wz-box" data-i="${i}" title="${HINTS[i]}"><span class="wz-num">${i + 1}</span><canvas></canvas></div>`).join("")}</div>
  <div class="small muted center mt-1">Arahkan kursor ke kotak untuk melihat petunjuk stimulus. Urutan: <b class="mono" id="wzOrder">—</b></div>
</div>`;
    const boxes = P.$$(".wz-box", container);
    const ctxs = [];
    function setup() {
      boxes.forEach((box, i) => {
        const cv = P.$("canvas", box); const s = Math.round(box.clientWidth * 2); cv.width = s; cv.height = s;
        const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, s, s); P.SVG.warteggStimulus(ctx, i, s); ctxs[i] = { ctx, s, cv };
        let drawing = false, last = null;
        const pos = (e) => { const r = cv.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return [((p.clientX - r.left) / r.width) * s, ((p.clientY - r.top) / r.height) * s]; };
        const down = (e) => { e.preventDefault(); drawing = true; last = pos(e); if (!order.includes(i)) { order.push(i); P.$("#wzOrder", container).textContent = order.map((o) => o + 1).join(" → "); } };
        const move = (e) => { if (!drawing) return; e.preventDefault(); const p = pos(e); ctx.strokeStyle = erasing ? "#fff" : "#111"; ctx.lineWidth = (erasing ? 14 : pen) * 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; };
        const up = () => { drawing = false; };
        cv.addEventListener("mousedown", down); cv.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
        cv.addEventListener("touchstart", down, { passive: false }); cv.addEventListener("touchmove", move, { passive: false }); cv.addEventListener("touchend", up);
      });
    }
    setTimeout(setup, 0);
    P.$$("[data-pen]", container).forEach((b) => b.onclick = () => { pen = +b.dataset.pen; erasing = false; P.$$("[data-pen]", container).forEach((x) => x.classList.remove("btn-ink")); b.classList.add("btn-ink"); P.$("#wzErase", container).classList.remove("btn-ink"); });
    P.$("#wzErase", container).onclick = (e) => { erasing = !erasing; e.currentTarget.classList.toggle("btn-ink", erasing); };
    P.$("#wzClear", container).onclick = () => { const i = order[order.length - 1]; if (i === undefined) return; const { ctx, s } = ctxs[i]; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, s, s); P.SVG.warteggStimulus(ctx, i, s); };
    timer = setInterval(() => { timeLeft--; const el = P.$("#wzTimer", container); if (!el) return clearInterval(timer); el.lastChild.textContent = P.fmtTime(timeLeft); el.classList.toggle("low", timeLeft <= 60); if (timeLeft <= 0) { clearInterval(timer); P.toast("Waktu habis, lanjut ke penilaian"); review(); } }, 1000);
    P.cleanupView = () => clearInterval(timer);
    P.$("#wzDone", container).onclick = () => { clearInterval(timer); review(); };

    function review() {
      const thumbs = ctxs.map((c, i) => `<div class="card" style="padding:.6rem"><img src="${c.cv.toDataURL("image/png")}" style="width:100%;border:1px solid var(--line);border-radius:6px;background:#fff" alt="Kotak ${i + 1}"><div class="small muted mt-1">Kotak ${i + 1}: ${HINTS[i].split(":")[0]}</div><input class="btn btn-sm btn-block mt-1" placeholder="Judul gambar…" data-title="${i}"></div>`).join("");
      const seq = order.map((o) => o + 1);
      let orderNote = "Urutanmu: " + (seq.length ? seq.join(" → ") : "—") + ". ";
      const isSeq = seq.join() === "1,2,3,4,5,6,7,8"; const isRev = seq.join() === "8,7,6,5,4,3,2,1";
      if (seq.length < 8) orderNote += `<b>${8 - seq.length} kotak belum dikerjakan</b>; kotak kosong dibaca negatif.`;
      else if (isSeq) orderNote += "Sepenuhnya berurutan, dapat dibaca kaku/konservatif. Coba kombinasi, misalnya 1-2-3-4 lalu 8-7-6-5.";
      else if (isRev) orderNote += "Sepenuhnya terbalik, tidak lazim; pertimbangkan kombinasi urut dan acak.";
      else orderNote += "Kombinasi urut dan acak, pola yang umumnya dinilai wajar.";
      if (seq[0] === 5) orderNote += " Catatan: memulai dari kotak 5 kadang ditafsirkan khusus bagi peserta wanita (konvensi lama).";
      if (seq[0] === 7 || seq[0] === 8) orderNote += " Catatan: memulai dari kotak 7/8 kadang ditafsirkan khusus bagi peserta pria (konvensi lama).";
      container.innerHTML = `
<div class="view-enter"><h1>Penilaian diri Wartegg</h1>
  <div class="callout callout-info"><span class="co-ico">${P.icon("list", 22)}</span><div>${orderNote}</div></div>
  <div class="grid grid-4">${thumbs}</div>
  <h3 class="mt-3">Daftar periksa</h3><div class="checklist">${CHECK.map((c, i) => `<label><input type="checkbox" data-c="${i}"> <span>${c}</span></label>`).join("")}</div>
  <div class="row mt-2"><button class="btn btn-primary" id="wzScore">Hitung skor periksa</button><button class="btn" id="wzAgain">${P.icon("refresh", 16)} Latihan lagi</button><a class="btn btn-ghost" href="#/modul/gambar/materi/wartegg">${P.icon("book", 16)} Materi</a></div><div id="wzResult" class="mt-2"></div>
</div>`;
      P.$("#wzScore", container).onclick = () => {
        const n = P.$$("[data-c]:checked", container).length; const t = P.$$("[data-title]", container).filter((i) => i.value.trim()).length;
        P.Store.addWartegg({ ts: Date.now(), score: n, titles: t, order: seq });
        P.$("#wzResult", container).innerHTML = `<div class="callout ${n >= 8 ? "callout-ok" : n >= 6 ? "callout-tip" : "callout-danger"}"><span class="co-ico">${P.icon(n >= 8 ? "check" : "sparkle", 22)}</span><div><b>${n}/10 kriteria terpenuhi</b>, ${t}/8 kotak berjudul. ${n >= 8 ? "Sangat baik, kamu sudah punya repertoar yang aman. Latih sekali lagi dengan waktu lebih singkat (10 menit)." : n >= 6 ? "Cukup. Perbaiki kriteria yang belum tercentang; biasanya integrasi stimulus dan kotak 4/5." : "Baca kembali tabel makna tiap stimulus di materi, lalu siapkan satu ide gambar untuk tiap kotak sebelum mencoba lagi."}</div></div>`;
        if (n >= 8) P.confetti(24);
      };
      P.$("#wzAgain", container).onclick = () => P.Views.wartegg(container);
    }
  };
})(window.PSI);

/* js/views/personality.js */
/* Simulasi inventori kepribadian: pair (EPPS/PAPI), mostleast (DISC), likert (MBTI) */
(function (P) {
  P.Views = P.Views || {};
  P.Views.personality = function (container, { testId }) {
    const inv = P.INVENTORY[testId];
    if (!inv) { container.innerHTML = `<div class="empty">Tes tidak ditemukan.</div>`; return; }
    const prev = P.Store.personality(testId);
    container.innerHTML = `<div class="runner view-enter"><div class="q-card section-intro"><div class="big">${P.icon("mask", 28)}</div><h1>${inv.title}</h1><p class="muted">${inv.instr}</p>
      <div class="callout callout-tip" style="text-align:left"><span class="co-ico">${P.icon("bulb", 22)}</span><div>Tidak ada jawaban benar atau salah. Hasil di sini adalah <b>gambaran kecenderungan</b> untuk membantumu memahami dimensi yang diukur dan mengecek konsistensi, bukan diagnosis.</div></div>
      ${prev ? `<p class="small muted">Terakhir dikerjakan ${P.fmtDate(prev.ts)}.</p>` : ""}
      <div class="row" style="justify-content:center"><a class="btn" href="#/modul/kepribadian/materi/${testId}">${P.icon("book", 16)} Materi</a><button class="btn btn-primary btn-lg" id="pStart">Mulai ${P.icon("arrowRight", 18)}</button></div></div></div>`;
    P.$("#pStart", container).onclick = () => run(container, inv);
  };

  function run(container, inv) {
    const items = inv.items; const n = items.length; let cur = 0;
    const ans = Array(n).fill(null);
    const render = () => {
      const it = items[cur];
      let body = "";
      if (inv.type === "pair") body = `<div class="pers-pair"><button class="opt ${ans[cur] === "A" ? "selected" : ""}" data-v="A"><span class="letter">A</span><span class="opt-text">${it.A.text}</span></button><button class="opt ${ans[cur] === "B" ? "selected" : ""}" data-v="B"><span class="letter">B</span><span class="opt-text">${it.B.text}</span></button></div>`;
      else if (inv.type === "mostleast") { const a = ans[cur] || { most: null, least: null }; body = `<table><tr><th>Pernyataan</th><th class="center">Paling (M)</th><th class="center">Paling tidak (L)</th></tr>${it.map(([w], i) => `<tr><td><b>${w}</b></td><td class="center"><input type="radio" name="most" value="${i}" ${a.most === i ? "checked" : ""}></td><td class="center"><input type="radio" name="least" value="${i}" ${a.least === i ? "checked" : ""}></td></tr>`).join("")}</table>`; }
      else body = `<p class="q-text">${it[0]}</p><div class="scale">${[1, 2, 3, 4, 5].map((v) => `<button class="${ans[cur] === v ? "selected" : ""}" data-v="${v}"><span class="num" style="font-size:1.2rem">${v}</span><br><span class="small muted">${["", "Sangat tidak setuju", "Tidak setuju", "Netral", "Setuju", "Sangat setuju"][v]}</span></button>`).join("")}</div>`;
      container.innerHTML = `<div class="runner fade-in"><div class="runner-top"><div><h2>Nomor <span class="num">${cur + 1}</span> <span class="muted-3">/ ${n}</span></h2><div class="small muted">${inv.title}</div></div><button class="btn btn-ghost btn-sm" id="pExit">Keluar</button></div><div class="progress thin mb-2"><span class="accent" style="width:${((cur + 1) / n) * 100}%"></span></div>
        <div class="q-card">${inv.type === "pair" ? `<div class="small muted mb-1">Mana yang lebih menggambarkan diri Anda?</div>` : inv.type === "mostleast" ? `<div class="small muted mb-1">Pilih satu M dan satu L (berbeda).</div>` : ""}${body}</div>
        <div class="runner-foot"><button class="btn" id="pPrev" ${cur === 0 ? "disabled" : ""}>${P.icon("arrowLeft", 16)} Sebelumnya</button><span class="small muted">${ans.filter((a) => a !== null).length} terjawab</span>${cur < n - 1 ? `<button class="btn btn-ink" id="pNext">Berikutnya ${P.icon("arrowRight", 16)}</button>` : `<button class="btn btn-success" id="pDone">Lihat hasil ${P.icon("check", 16)}</button>`}</div></div>`;
      P.$$("[data-v]", container).forEach((b) => b.onclick = () => { ans[cur] = inv.type === "likert" ? +b.dataset.v : b.dataset.v; if (cur < n - 1) { cur++; render(); } else render(); });
      P.$$("input[type=radio]", container).forEach((r) => r.onchange = () => { const m = P.$("input[name=most]:checked", container), l = P.$("input[name=least]:checked", container); if (m && l && m.value === l.value) { r.checked = false; return P.toast("M dan L tidak boleh sama"); } ans[cur] = { most: m ? +m.value : null, least: l ? +l.value : null }; if (m && l && cur < n - 1) setTimeout(() => { cur++; render(); }, 250); });
      P.$("#pPrev", container).onclick = () => { cur--; render(); };
      const nx = P.$("#pNext", container); if (nx) nx.onclick = () => { cur++; render(); };
      const dn = P.$("#pDone", container); if (dn) dn.onclick = () => { const missing = ans.filter((a) => a === null || (inv.type === "mostleast" && (a.most === null || a.least === null))).length; if (missing) return P.toast(`${missing} nomor belum lengkap`); result(); };
      P.$("#pExit", container).onclick = () => (location.hash = "#/modul/kepribadian");
    };
    const result = () => {
      let html = "";
      const barList = (scores, labels, max) => `<div class="bar-list">${Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="bar-row"><span title="${labels[k]}">${k.length <= 3 ? `<b>${k}</b> ` : ""}${labels[k]}</span><div class="progress"><span style="width:${(v / max) * 100}%"></span></div><b>${v}</b></div>`).join("")}</div>`;
      if (inv.type === "pair") {
        const scores = {}; Object.keys(inv.scales).forEach((k) => (scores[k] = 0)); items.forEach((it, i) => { scores[it[ans[i]].need]++; });
        const r = inv.interpret(scores); const max = Math.max(...Object.values(scores), 1);
        html = `<h3>Profil kebutuhan</h3>${barList(scores, inv.scales, max)}<div class="grid grid-2 mt-2"><div class="panel"><b>Paling menonjol</b><ul class="small mt-1">${r.top.map((t) => `<li>${t}</li>`).join("")}</ul></div><div class="panel"><b>Paling rendah</b><ul class="small mt-1">${r.low.map((t) => `<li>${t}</li>`).join("")}</ul></div></div>${r.notes.map((t) => `<div class="reco"><span class="r-ico">${P.icon("sparkle", 20)}</span><p class="small">${t}</p></div>`).join("")}`;
        P.Store.savePersonality(inv.id, { scores });
      } else if (inv.type === "mostleast") {
        const most = { D: 0, I: 0, S: 0, C: 0 }, least = { D: 0, I: 0, S: 0, C: 0 };
        items.forEach((it, i) => { most[it[ans[i].most][1]]++; least[it[ans[i].least][1]]++; });
        const r = inv.interpret(most, least);
        html = `<div class="grid grid-2"><div><h3>Grafik Most (perilaku kerja)</h3>${barList(most, inv.scales, n)}</div><div><h3>Grafik Least (paling bukan kamu)</h3>${barList(least, inv.scales, n)}</div></div><div class="panel mt-3"><h3>Gaya dominan: <span style="color:var(--accent)">${r.primary}${r.secondary}</span></h3><p class="small"><b>${r.primary}, ${inv.scales[r.primary]}:</b> ${r.desc}</p><p class="small"><b>${r.secondary}, ${inv.scales[r.secondary]}:</b> ${r.desc2}</p>${r.gapNote ? `<div class="callout callout-danger"><span class="co-ico">${P.icon("alert", 22)}</span><div>${r.gapNote}</div></div>` : ""}</div>`;
        P.Store.savePersonality(inv.id, { most, least });
      } else {
        const scores = {}; Object.keys(inv.scales).forEach((k) => (scores[k] = 0)); items.forEach((it, i) => { scores[it[1]] += ans[i]; });
        const r = inv.interpret(scores);
        const dim = (a, b) => { const t = scores[a] + scores[b]; const pa = Math.round((scores[a] / t) * 100); return `<div class="sec-bar" style="grid-template-columns:40px 1fr 40px"><b class="num" style="font-size:1.1rem">${a}</b><div class="progress" style="height:10px"><span class="accent" style="width:${pa}%"></span></div><b class="num" style="font-size:1.1rem">${b}</b></div><div class="small muted center" style="margin-top:-.3rem">${pa}% ${inv.scales[a]} · ${100 - pa}% ${inv.scales[b]}</div>`; };
        html = `<div class="score-hero c-ok" style="grid-template-columns:1fr;justify-items:center;text-align:center"><div><div class="small muted">Tipe kecenderunganmu</div><div class="score" style="color:var(--ink);letter-spacing:.04em">${r.type}</div><p class="small" style="max-width:48ch">${r.desc}</p></div></div><div class="mt-3">${dim("E", "I")}${dim("S", "N")}${dim("T", "F")}${dim("J", "P")}</div>${r.close.length ? `<div class="callout callout-info mt-2"><span class="co-ico">${P.icon("info", 22)}</span><div>Dimensi ${r.close.join(", ")} sangat berimbang, hurufnya bisa berubah antar tes. Itu normal.</div></div>` : ""}`;
        P.Store.savePersonality(inv.id, { scores, type: r.type });
      }
      container.innerHTML = `<div class="view-enter"><h1>Hasil ${inv.title}</h1><p class="muted small">Gunakan hasil ini untuk mengenali dimensi yang diukur dan memeriksa apakah gambaran dirimu konsisten dengan posisi yang dituju. Di tes sungguhan, jawablah dengan cara yang sama: spontan dan jujur.</p>${html}<div class="row mt-3"><a class="btn btn-primary" href="#/modul/kepribadian/materi/${inv.id}">${P.icon("book", 16)} Baca interpretasi di materi</a><button class="btn" id="pAgain">${P.icon("refresh", 16)} Ulangi</button><a class="btn btn-ghost" href="#/modul/kepribadian">Modul kepribadian</a></div></div>`;
      P.$("#pAgain", container).onclick = () => P.Views.personality(container, { testId: inv.id });
      window.scrollTo(0, 0);
    };
    render();
  }
})(window.PSI);

/* js/views/sim.js */
/* Simulasi: pemilih paket + runner multi-bagian */
(function (P) {
  P.Views = P.Views || {};

  const PRESETS = {
    lengkap: { id: "lengkap", title: "Simulasi Lengkap", icon: "target", desc: "Semua paket kognitif berurutan dengan waktu per bagian, ditambah tes Kode & Ingatan. Mirip rangkaian psikotes satu hari.", build: () => P.Bank.simSections().map(({ mod, sec }) => ({ moduleId: mod.id, sectionId: sec.id, count: sec.sim.count, time: sec.sim.time })).concat([{ moduleId: "kode", sectionId: "hafalan", special: "kode", d: 2 }]) },
    cepat: { id: "cepat", title: "Simulasi Cepat (gaya Wonderlic)", icon: "bolt", desc: "50 soal campuran verbal, numerik, logika, figural dalam satu timer 12 menit. Melatih kecepatan dan prioritas.", build: () => [{ mixed: true, count: 50, time: 12 * 60, sources: [["verbal", "sinonim"], ["verbal", "antonim"], ["verbal", "analogi"], ["numerik", "deret-angka"], ["numerik", "aritmatika"], ["numerik", "cerita"], ["logika", "silogisme"], ["logika", "pernyataan"], ["figural", "deret-gambar"], ["figural", "klasifikasi"], ["ketelitian", "bandingkan"]] }] },
    tiu: { id: "tiu", title: "Paket TIU / TKD (BUMN & Bank)", icon: "bank", desc: "Verbal, numerik, dan logika dengan porsi seimbang; format yang umum di seleksi BUMN, perbankan, dan CPNS.", build: () => [["verbal", "sinonim", 10, 240], ["verbal", "antonim", 10, 240], ["verbal", "analogi", 10, 300], ["numerik", "deret-angka", 10, 420], ["numerik", "aritmatika", 10, 420], ["numerik", "cerita", 8, 540], ["numerik", "kuantitatif", 8, 360], ["logika", "silogisme", 10, 480], ["logika", "analitis", 6, 480]].map(([m, s, c, t]) => ({ moduleId: m, sectionId: s, count: c, time: t })) },
    mnc: { id: "mnc", title: "Paket Multinasional / Startup", icon: "globe", desc: "Numerical, verbal, dan logical reasoning gaya SHL/graduate program: wacana Benar-Salah-Tidak dapat disimpulkan, tabel data, deret gambar, matriks.", build: () => [["verbal", "wacana", 10, 540], ["numerik", "cerita", 10, 660], ["figural", "deret-gambar", 10, 480], ["figural", "matriks", 8, 480], ["logika", "pernyataan", 8, 360], ["logika", "analitis", 6, 480]].map(([m, s, c, t]) => ({ moduleId: m, sectionId: s, count: c, time: t })) },
    tpa: { id: "tpa", title: "Paket TPA Online (aplikasi seleksi)", icon: "hash", desc: "Meniru subtes TPA di aplikasi seleksi online: matematika aljabar-geometri lalu deret gambar simbol garis, masing-masing satu timer.", build: () => [["numerik", "tpa", 20, 600], ["figural", "deret-gambar", 20, 600]].map(([m, s, c, t]) => ({ moduleId: m, sectionId: s, count: c, time: t })) },
    kecepatan: { id: "kecepatan", title: "Paket Kecepatan & Ketelitian", icon: "search", desc: "Ketelitian, hitung simbol, Army Alpha, dan Kode & Ingatan. Untuk posisi administrasi, keuangan, operasional.", build: () => [["ketelitian", "bandingkan", 25, 240], ["ketelitian", "hitung", 8, 180], ["army", "instruksi", 10, 250]].map(([m, s, c, t]) => ({ moduleId: m, sectionId: s, count: c, time: t })).concat([{ moduleId: "kode", sectionId: "hafalan", special: "kode", d: 2 }]) },
  };
  P.SIM_PRESETS = PRESETS;

  function buildQuestions(plan) {
    return plan.map((p) => {
      if (p.special) return p;
      if (p.mixed) {
        const per = Math.ceil(p.count / p.sources.length);
        let qs = p.sources.flatMap(([m, s]) => P.Bank.build(m, s, per, { mix: { 1: 0.4, 2: 0.4, 3: 0.2 } }));
        qs = P.shuffle(qs).slice(0, p.count);
        return { title: "Soal campuran", subtitle: "Simulasi Cepat", questions: qs, time: p.time };
      }
      const mod = P.moduleById(p.moduleId), sec = P.sectionById(p.moduleId, p.sectionId);
      return { title: sec.title, subtitle: mod.title, questions: P.Bank.build(p.moduleId, p.sectionId, p.count), time: p.time, moduleId: p.moduleId, sectionId: p.sectionId };
    });
  }

  P.Views.simChooser = function (container) {
    const secs = P.Bank.simSections();
    container.innerHTML = `
<div class="view-enter">
  <h1>Mode simulasi</h1>
  <p class="lead">Soal diacak ulang setiap kali (bank tulisan tangan + generator), waktu per bagian seperti tes sungguhan, tanpa pembahasan di tengah jalan. Di akhir: laporan nomor yang salah, pembahasannya, dan apa yang perlu diperbaiki.</p>
  <div class="preset-list mt-3">${Object.values(PRESETS).map((p) => {
      const plan = p.build(); const nQ = plan.reduce((n, x) => n + (x.count || 15), 0); const t = plan.reduce((n, x) => n + (x.time || 180), 0);
      return `<div class="preset"><span class="p-ico">${P.icon(p.icon, 20)}</span><div><h3>${p.title}</h3><p>${p.desc}</p><div class="pc-meta"><span class="tag tag-soft">± ${nQ} soal</span><span class="tag tag-soft">± ${Math.round(t / 60)} menit</span><span class="tag tag-soft">${plan.length} bagian</span></div></div><a class="btn btn-ink" href="#/simulasi/paket/${p.id}">Mulai ${P.icon("arrowRight", 16)}</a></div>`;
    }).join("")}</div>

  <h2 class="mt-4">Simulasi per modul</h2>
  <div class="index">${P.MODULES.filter((m) => m.sections.some((s) => s.sim)).map((m) => `<a class="index-row" href="#/simulasi/modul/${m.id}"><span class="ir-ico">${P.icon(m.icon, 20)}</span><div><h3>${m.title}</h3><p>${m.sections.filter((s) => s.sim).length} bagian · ± ${m.sections.filter((s) => s.sim).reduce((n, s) => n + s.sim.count, 0)} soal</p></div><div></div><span class="ir-arrow">${P.icon("arrowRight", 20)}</span></a>`).join("")}
    <a class="index-row" href="#/kraepelin"><span class="ir-ico">${P.icon("plus", 20)}</span><div><h3>Kraepelin / Pauli</h3><p>Simulasi interaktif dengan grafik kerja</p></div><div></div><span class="ir-arrow">${P.icon("arrowRight", 20)}</span></a>
    <a class="index-row" href="#/kode"><span class="ir-ico">${P.icon("brain", 20)}</span><div><h3>Kode & Ingatan</h3><p>Hafalkan tabel, lalu jawab</p></div><div></div><span class="ir-arrow">${P.icon("arrowRight", 20)}</span></a>
  </div>

  <h2 class="mt-4">Simulasi kustom</h2>
  <p class="muted small">Pilih bagian yang ingin diuji dan jumlah soal per bagian. Waktu tiap bagian mengikuti standar bagian itu secara proporsional.</p>
  <div class="grid grid-3" id="customSecs">${secs.map(({ mod, sec }) => `<label class="check-row"><input type="checkbox" value="${mod.id}/${sec.id}"> <span>${sec.title}</span></label>`).join("")}</div>
  <div class="row mt-2"><label class="row" style="gap:.4rem">Soal per bagian <select id="customCount" class="btn btn-sm"><option>5</option><option selected>8</option><option>10</option><option>15</option><option>20</option></select></label><button class="btn btn-primary" id="customStart">Mulai simulasi kustom ${P.icon("arrowRight", 16)}</button></div>
</div>`;
    P.$("#customStart", container).onclick = () => {
      const chosen = P.$$("#customSecs input:checked", container).map((i) => i.value.split("/"));
      if (!chosen.length) return P.toast("Pilih minimal satu bagian");
      const cnt = +P.$("#customCount", container).value;
      const plan = chosen.map(([m, s]) => { const sec = P.sectionById(m, s); return { moduleId: m, sectionId: s, count: cnt, time: Math.round((sec.sim.time / sec.sim.count) * cnt) }; });
      P.Views.simRun(container, { title: "Simulasi Kustom", presetId: null, plan });
    };
  };

  P.Views.simPreset = function (container, { presetId }) {
    const p = PRESETS[presetId]; if (!p) return (location.hash = "#/simulasi");
    P.Views.simRun(container, { title: p.title, presetId, plan: p.build() });
  };
  P.Views.simModule = function (container, { moduleId }) {
    const mod = P.moduleById(moduleId); if (!mod) return (location.hash = "#/simulasi");
    const plan = mod.sections.filter((s) => s.sim).map((s) => ({ moduleId, sectionId: s.id, count: s.sim.count, time: s.sim.time }));
    P.Views.simRun(container, { title: `Simulasi ${mod.title}`, presetId: "modul:" + moduleId, plan });
  };

  P.Views.simRun = function (container, { title, presetId, plan }) {
    const parts = buildQuestions(plan);
    const totalQ = parts.reduce((n, p) => n + (p.questions ? p.questions.length : 15), 0);
    const totalT = parts.reduce((n, p) => n + (p.time || 240), 0);
    const results = []; let idx = 0; const startTs = Date.now();
    container.innerHTML = `<div class="runner fade-in"><div class="q-card section-intro">
      <div class="big">${P.icon("target", 28)}</div><h1>${title}</h1>
      <p class="muted">${parts.length} bagian · ± ${totalQ} soal · ± ${Math.round(totalT / 60)} menit</p>
      <table class="small" style="max-width:520px;margin:0 auto 1rem;text-align:left"><tr><th>#</th><th>Bagian</th><th>Soal</th><th>Waktu</th></tr>${parts.map((p, i) => `<tr><td class="mono">${i + 1}</td><td>${p.special === "kode" ? "Kode & Ingatan (hafal lalu jawab)" : p.title}</td><td class="mono">${p.questions ? p.questions.length : "±15"}</td><td class="mono">${p.special ? "±5 mnt" : P.fmtDur(p.time)}</td></tr>`).join("")}</table>
      <ul class="muted small"><li>Tiap bagian punya timer sendiri; saat habis, otomatis lanjut ke bagian berikutnya.</li><li>Tidak ada pembahasan di tengah. Tandai soal ragu dan kembali selama waktu bagian tersisa.</li><li>Jawaban kosong dihitung salah. Siapkan kertas coret-coretan.</li></ul>
      <div class="row" style="justify-content:center"><a class="btn" href="#/simulasi">Kembali</a><button class="btn btn-primary btn-lg" id="simStart">Mulai bagian 1 ${P.icon("arrowRight", 18)}</button></div></div></div>`;
    P.$("#simStart", container).onclick = () => runPart();

    function runPart() {
      if (idx >= parts.length) return finishAll();
      const p = parts[idx];
      if (p.special === "kode") {
        P.Views.kodeFlow(container, { d: p.d || 2, embedded: true, label: `Bagian ${idx + 1}/${parts.length}`, onFinish: (res) => { results.push(res); idx++; intermission(); }, onExit: () => (location.hash = "#/simulasi") });
        return;
      }
      P.Runner.create({ container, questions: p.questions, mode: "sim", timeLimit: p.time, title: p.title, subtitle: `${title} · Bagian ${idx + 1}/${parts.length}`, onExit: () => (location.hash = "#/simulasi"), onFinish: (res) => { results.push(res); idx++; intermission(); } });
    }
    function intermission() {
      if (idx >= parts.length) return finishAll();
      const p = parts[idx];
      container.innerHTML = `<div class="runner fade-in"><div class="q-card section-intro"><div class="big">${P.icon("coffee", 28)}</div><h2>Bagian ${idx} selesai</h2><p class="muted">Berikutnya: <b>${p.special === "kode" ? "Kode & Ingatan" : p.title}</b>, ${p.questions ? p.questions.length + " soal · " + P.fmtDur(p.time) : "hafalkan tabel lalu jawab"}.</p><p class="small muted">Tarik napas sepuluh detik. Timer bagian berikutnya baru berjalan saat kamu menekan tombol.</p><button class="btn btn-primary btn-lg" id="nextPart">Mulai bagian ${idx + 1} ${P.icon("arrowRight", 18)}</button></div></div>`;
      P.$("#nextPart", container).onclick = runPart;
    }
    function finishAll() {
      let num = 0; const items = results.flatMap((r) => r.items.map((it) => Object.assign({}, it, { num: ++num })));
      const score = items.filter((i) => i.correct).length;
      const attempt = { kind: "simulasi", title, presetId, ts: Date.now(), score, total: items.length, pct: P.pct(score, items.length), duration: Math.round((Date.now() - startTs) / 1000), items, parts: results.map((r, i) => ({ title: parts[i].special ? "Kode & Ingatan" : parts[i].title, score: r.score, total: r.total, duration: r.duration, timeLimit: r.timeLimit })) };
      const id = P.Store.addAttempt(attempt);
      location.hash = `#/hasil/${id}`;
    }
  };
})(window.PSI);

/* js/views/result.js */
/* Laporan hasil simulasi / kuis */
(function (P) {
  P.Views = P.Views || {};

  function optText(o) { return typeof o === "object" && o.svg ? `<span class="fig-inline">${o.svg.replace(/viewBox/, 'width="56" height="56" viewBox')}</span>` : o; }

  P.Views.result = function (container, { attemptId }) {
    const a = P.Store.attempt(attemptId);
    if (!a) { container.innerHTML = `<div class="empty"><div class="big">${P.icon("search", 24)}</div>Laporan tidak ditemukan.<br><a class="btn mt-2" href="#/riwayat">Lihat riwayat</a></div>`; return; }
    const an = P.Report.analyze(a);
    const blankN = an.blank.length, wrongN = an.wrong.length - blankN;
    const cls = an.pct >= 75 ? "c-ok" : an.pct >= 60 ? "c-warn" : "c-bad";
    const bar = (label, c, t, extraCls = "") => { const p = P.pct(c, t); return `<div class="sec-bar"><span>${label}</span><div class="progress"><span class="${p >= 75 ? "ok" : p >= 50 ? "warn" : "bad"}" style="width:${p}%"></span></div><b>${c}/${t}</b></div>`; };
    const diffRow = (d, label) => { const [c, t] = an.byDiff[d]; return t ? bar(`<span class="tag diff-${d}">${label}</span>`, c, t) : ""; };
    const again = a.presetId && a.kind === "simulasi" ? `<a class="btn btn-primary" href="#/simulasi/${a.presetId.startsWith("modul:") ? "modul/" + a.presetId.slice(6) : "paket/" + a.presetId}">${P.icon("refresh", 16)} Ulangi (soal baru)</a>` : "";
    container.innerHTML = `
<div class="view-enter">
  <div class="row-between"><div><h1>${a.title}</h1><p class="sub">${a.kind === "simulasi" ? "Laporan simulasi" : "Pembahasan kuis"} · ${P.fmtDate(a.ts)}</p></div><div class="row">${again}<a class="btn" href="#/riwayat">Riwayat</a></div></div>

  <div class="score-hero ${cls}">
    <div><div class="score">${an.pct}<small>%</small></div><div class="grade">${an.grade.label}</div><div class="small muted">Durasi ${P.fmtDur(a.duration)}</div></div>
    <div class="stats-row"><div><b style="color:var(--ok)">${a.score}</b><span>Benar</span></div><div><b style="color:var(--bad)">${wrongN}</b><span>Salah</span></div><div><b style="color:var(--ink-3)">${blankN}</b><span>Kosong</span></div><div><b>${Math.round(an.avgTime)}<small style="font-size:.5em;color:var(--ink-3)"> dtk</small></b><span>Rata-rata per soal</span></div></div>
  </div>

  <div class="grid grid-2 mt-3">
    <div><h3>Per bagian</h3>${an.sections.map((s) => bar(s.title, s.correct, s.total)).join("")}</div>
    <div><h3>Per tingkat kesulitan</h3>${diffRow(1, "Mudah")}${diffRow(2, "Sedang")}${diffRow(3, "Sulit")}</div>
  </div>

  <h2 class="mt-4">Apa yang perlu diperbaiki</h2>
  <div class="panel" style="padding-top:0">${an.recos.map((r) => `<div class="reco"><span class="r-ico">${P.icon(r.link ? "book" : "sparkle", 22)}</span><div><b>${r.title}</b><p class="small muted">${r.text}</p>${r.link ? `<div class="row mt-1"><a class="btn btn-sm" href="${r.link}">Materi</a><a class="btn btn-sm btn-ink" href="${r.link2}">Kuis bagian</a></div>` : ""}</div></div>`).join("")}</div>

  ${a.parts && a.parts.length > 1 ? `<h2 class="mt-4">Waktu per bagian</h2><table class="small"><tr><th>Bagian</th><th>Skor</th><th>Waktu dipakai</th><th>Batas</th></tr>${a.parts.map((p) => `<tr><td>${p.title}</td><td class="mono">${p.score}/${p.total}</td><td class="mono">${P.fmtDur(p.duration)}</td><td class="mono">${p.timeLimit ? P.fmtDur(p.timeLimit) : "—"}</td></tr>`).join("")}</table>` : ""}

  <h2 class="mt-4">Soal yang salah atau kosong <span class="tag badge-danger" style="vertical-align:middle">${an.wrong.length}</span></h2>
  ${an.wrong.length ? `<p class="muted small">Nomor ${an.wrong.map((w) => w.num).join(", ")}.</p>` : `<div class="callout callout-ok"><span class="co-ico">${P.icon("check", 22)}</span><div>Semua soal benar.</div></div>`}
  <div>${an.wrong.map(renderItem).join("")}</div>

  <details class="mt-3"><summary class="btn">${P.icon("eye", 16)} Tampilkan semua soal & pembahasan (${a.items.length})</summary><div class="mt-2">${a.items.map(renderItem).join("")}</div></details>
</div>`;
  };

  function renderItem(it) {
    const q = it.q;
    const chosenTxt = q.type === "multi" ? (Array.isArray(it.chosen) && it.chosen.length ? "gambar " + it.chosen.map((i) => i + 1).join(", ") : "—") : it.chosen === null || it.chosen === undefined ? "— (kosong)" : `${P.letter(it.chosen)}. ${optText(q.o[it.chosen])}`;
    const keyTxt = q.type === "multi" ? "gambar " + q.answerSet.map((i) => i + 1).join(", ") : `${P.letter(q.a)}. ${optText(q.o[q.a])}`;
    return `<div class="wrong-item"><div class="wi-head"><div class="row"><span class="tag ${it.correct ? "badge-success" : "badge-danger"}">No. ${it.num} · ${it.correct ? "Benar" : "Salah"}</span><span class="tag tag-soft">${q.moduleTitle} · ${q.sectionTitle}</span><span class="tag diff-${q.d}">${["", "Mudah", "Sedang", "Sulit"][q.d]}</span></div><span class="small muted mono">${it.time || 0} dtk</span></div>
      ${q.p ? `<div class="small muted" style="margin-bottom:.4rem"><i>${q.p}</i></div>` : ""}<div class="wi-q">${q.q}</div>${q.fig ? `<div class="wi-fig">${q.fig}</div>` : ""}
      ${q.type !== "multi" ? `<div class="small muted" style="margin:.3rem 0 .5rem">${q.o.map((o, i) => `<span style="margin-right:.8rem">${P.letter(i)}. ${optText(o)}</span>`).join("")}</div>` : ""}
      <div class="wi-ans"><span class="you">Jawabanmu: <b>${chosenTxt}</b></span><span class="key">Kunci: <b>${keyTxt}</b></span></div>
      <div class="wi-ex"><b>Pembahasan:</b> ${q.e}</div></div>`;
  }
})(window.PSI);

/* js/views/history.js */
/* Riwayat percobaan & tren */
(function (P) {
  P.Views = P.Views || {};
  P.Views.history = function (container) {
    const all = P.Store.attempts();
    const sims = all.filter((a) => a.kind === "simulasi");
    const trend = sims.slice(0, 12).reverse();
    const col = (p) => (p >= 75 ? "var(--ok)" : p >= 50 ? "var(--warn)" : "var(--bad)");
    container.innerHTML = `
<div class="view-enter">
  <div class="row-between"><h1>Riwayat & progres</h1><button class="btn btn-ghost btn-sm" id="resetAll">${P.icon("trash", 15)} Hapus semua data</button></div>
  <div class="stats-row panel"><div><b>${sims.length}</b><span>Simulasi</span></div><div><b>${all.filter((a) => a.kind === "kuis").length}</b><span>Kuis</span></div><div><b>${sims.length ? Math.max(...sims.map((s) => s.pct)) + "%" : "—"}</b><span>Skor terbaik</span></div><div><b>${sims.length ? Math.round(P.avg(sims.map((s) => s.pct))) + "%" : "—"}</b><span>Rata-rata simulasi</span></div></div>
  ${trend.length >= 2 ? `<h3 class="mt-3">Tren skor simulasi (${trend.length} terakhir)</h3><div class="trend">${trend.map((s) => `<div class="t-bar" style="height:${Math.max(4, s.pct)}%" title="${s.title} · ${P.fmtDate(s.ts)}"><span>${s.pct}%</span></div>`).join("")}</div>` : ""}
  <h3 class="mt-3">Skor kuis terbaik per bagian</h3>
  <div class="panel">${P.MODULES.filter((m) => m.sections.some((s) => s.quiz)).map((m) => `<div class="mt-2"><div class="row" style="gap:.4rem"><span style="color:var(--ink-2)">${P.icon(m.icon, 16)}</span><b>${m.title}</b></div><div class="grid grid-3 mt-1">${m.sections.filter((s) => s.quiz).map((s) => { const b = P.Store.quizBest(m.id, s.id); return `<div class="sec-bar" style="grid-template-columns:1fr 70px 44px"><span class="small">${s.title}</span><div class="progress thin"><span class="${b && b.pct >= 75 ? "ok" : b && b.pct >= 50 ? "warn" : "bad"}" style="width:${b ? b.pct : 0}%"></span></div><b class="small">${b ? b.pct + "%" : "—"}</b></div>`; }).join("")}</div></div>`).join("")}</div>
  <h2 class="mt-4">Semua percobaan</h2>
  <div class="panel" style="padding-top:0">${all.length ? all.map((a) => `<div class="history-item"><div class="h-score" style="color:${col(a.pct)}">${a.pct}%</div><div><b>${a.title}</b><div class="small muted">${a.kind === "simulasi" ? "Simulasi" : "Kuis"} · ${a.score}/${a.total} benar · ${P.fmtDur(a.duration)} · ${P.fmtDate(a.ts)}</div></div><div class="row"><a class="btn btn-sm" href="#/hasil/${a.id}">Lihat laporan</a><button class="btn btn-ghost btn-sm" data-del="${a.id}" aria-label="Hapus">${P.icon("x", 14)}</button></div></div>`).join("") : `<div class="empty"><div class="big">${P.icon("history", 24)}</div>Belum ada percobaan. Mulai dari <a href="#/simulasi" style="text-decoration:underline">simulasi</a> atau kuis di tiap modul.</div>`}</div>
</div>`;
    P.$$("[data-del]", container).forEach((b) => b.onclick = async () => { if (await P.confirm("Hapus laporan ini?", "Tindakan tidak dapat dibatalkan.", "Hapus")) { P.Store.deleteAttempt(b.dataset.del); P.Views.history(container); } });
    P.$("#resetAll", container).onclick = async () => { if (await P.confirm("Hapus semua progres?", "Riwayat, skor kuis, dan tanda materi dibaca akan dihapus dari perangkat ini.", "Hapus semua")) { P.Store.reset(); P.toast("Data dihapus"); P.Views.history(container); P.renderNav && P.renderNav(); } };
  };
})(window.PSI);

/* js/app.js */
/* Router & kerangka aplikasi */
(function (P) {
  const view = document.getElementById("view");
  const app = document.getElementById("app");
  const themeBtn = document.getElementById("themeBtn");

  // Tema
  const currentTheme = () => P.Store.get().theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const applyTheme = () => { const t = currentTheme(); document.documentElement.setAttribute("data-theme", t); themeBtn.innerHTML = P.icon(t === "dark" ? "sun" : "moon", 19); };
  applyTheme();
  themeBtn.onclick = () => { P.Store.setTheme(currentTheme() === "dark" ? "light" : "dark"); applyTheme(); };

  // Menu mobile
  const menuBtn = document.getElementById("menuBtn"); menuBtn.innerHTML = P.icon("menu", 20);
  menuBtn.onclick = () => app.classList.toggle("nav-open");
  document.getElementById("scrim").onclick = () => app.classList.remove("nav-open");

  // Navigasi: rail modul dengan bilah panjang (extent) sebanding jumlah bagian, terisi sesuai progres
  P.renderNav = function () {
    const hash = location.hash || "#/";
    const nav = document.getElementById("nav");
    const maxSec = Math.max(...P.MODULES.map((m) => m.sections.length));
    const link = (href, label, ico, extra = "", ext = null) => `<a href="${href}" class="${hash === href || (href !== "#/" && hash.startsWith(href)) ? "active" : ""}">${P.icon(ico, 18)}<span>${label}</span>${extra}${ext !== null ? `<span class="ext" style="width:${Math.round((ext.n / maxSec) * 100)}%"><span style="width:${ext.p}%"></span></span>` : ""}</a>`;
    nav.innerHTML = `
      ${link("#/", "Beranda", "home")}
      ${link("#/simulasi", "Mode Simulasi", "target")}
      ${link("#/riwayat", "Riwayat & Progres", "chart")}
      <div class="nav-label">Modul</div>
      ${P.MODULES.map((m) => { const p = P.Store.moduleProgress(m); return link("#/modul/" + m.id, m.short || m.title, m.icon, `<span class="prog">${p}%</span>`, { n: m.sections.length, p }); }).join("")}`;
    const s = P.Store.streak();
    document.getElementById("streak").innerHTML = `<span style="color:var(--accent)">${P.icon("fire", 18)}</span><span><b>${s}</b> hari beruntun · ${P.Store.attempts().filter((a) => a.kind === "simulasi").length} simulasi</span>`;
  };

  function crumbs(parts) {
    document.getElementById("crumbs").innerHTML = parts.map((p, i) => (p.href ? `<a href="${p.href}">${p.t}</a>` : `<span>${p.t}</span>`) + (i < parts.length - 1 ? `<span class="sep">/</span>` : "")).join("");
  }

  const routes = [
    [/^#\/?$/, () => { crumbs([{ t: "Beranda" }]); P.Views.home(view); }],
    [/^#\/simulasi\/?$/, () => { crumbs([{ t: "Beranda", href: "#/" }, { t: "Simulasi" }]); P.Views.simChooser(view); }],
    [/^#\/simulasi\/paket\/([\w-]+)$/, (m) => { crumbs([{ t: "Simulasi", href: "#/simulasi" }, { t: (P.SIM_PRESETS[m[1]] || {}).title || m[1] }]); P.Views.simPreset(view, { presetId: m[1] }); }],
    [/^#\/simulasi\/modul\/([\w-]+)$/, (m) => { const mod = P.moduleById(m[1]); crumbs([{ t: "Simulasi", href: "#/simulasi" }, { t: mod ? mod.title : m[1] }]); P.Views.simModule(view, { moduleId: m[1] }); }],
    [/^#\/riwayat\/?$/, () => { crumbs([{ t: "Beranda", href: "#/" }, { t: "Riwayat" }]); P.Views.history(view); }],
    [/^#\/hasil\/([\w]+)$/, (m) => { crumbs([{ t: "Riwayat", href: "#/riwayat" }, { t: "Laporan" }]); P.Views.result(view, { attemptId: m[1] }); }],
    [/^#\/modul\/([\w-]+)\/?$/, (m) => { const mod = P.moduleById(m[1]); crumbs([{ t: "Beranda", href: "#/" }, { t: mod ? mod.title : m[1] }]); P.Views.module(view, { moduleId: m[1] }); }],
    [/^#\/modul\/([\w-]+)\/materi\/([\w-]+)$/, (m) => { const mod = P.moduleById(m[1]), sec = P.sectionById(m[1], m[2]); crumbs([{ t: mod ? mod.title : m[1], href: "#/modul/" + m[1] }, { t: "Materi: " + (sec ? sec.title : m[2]) }]); P.Views.materi(view, { moduleId: m[1], sectionId: m[2] }); }],
    [/^#\/kuis\/([\w-]+)\/([\w-]+)$/, (m) => { const mod = P.moduleById(m[1]), sec = P.sectionById(m[1], m[2]); crumbs([{ t: mod ? mod.title : m[1], href: "#/modul/" + m[1] }, { t: "Kuis: " + (sec ? sec.title : m[2]) }]); P.Views.quiz(view, { moduleId: m[1], sectionId: m[2] }); }],
    [/^#\/kraepelin\/?$/, () => { crumbs([{ t: "Kraepelin", href: "#/modul/kraepelin" }, { t: "Simulasi" }]); P.Views.kraepelin(view); }],
    [/^#\/kode\/?$/, () => { crumbs([{ t: "Kode & Ingatan", href: "#/modul/kode" }, { t: "Latihan" }]); P.Views.kode(view); }],
    [/^#\/wartegg\/?$/, () => { crumbs([{ t: "Tes Menggambar", href: "#/modul/gambar" }, { t: "Latihan Wartegg" }]); P.Views.wartegg(view); }],
    [/^#\/kepribadian\/([\w-]+)$/, (m) => { crumbs([{ t: "Kepribadian", href: "#/modul/kepribadian" }, { t: "Simulasi " + m[1].toUpperCase() }]); P.Views.personality(view, { testId: m[1] }); }],
  ];

  function route() {
    const h = location.hash || "#/";
    app.classList.remove("nav-open");
    P.cleanupView && P.cleanupView(); P.cleanupView = null;
    for (const [re, fn] of routes) {
      const m = h.match(re);
      if (m) {
        try { fn(m); } catch (e) { console.error(e); view.innerHTML = `<div class="empty"><div class="big">${P.icon("alert", 24)}</div>Terjadi kesalahan saat memuat halaman.<br><code>${P.esc(e.message)}</code></div>`; }
        P.renderNav(); window.scrollTo(0, 0); return;
      }
    }
    view.innerHTML = `<div class="empty"><div class="big">${P.icon("search", 24)}</div>Halaman tidak ditemukan. <a href="#/">Ke beranda</a></div>`; P.renderNav();
  }
  window.addEventListener("hashchange", route);
  route();

  // Konfeti kecil untuk skor tinggi (sekali, singkat)
  P.confetti = function (n = 36) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div"); box.className = "confetti";
    const colors = ["#F6B6C8", "#A8DCC5", "#A9CBEF", "#E38FAE", "#3B4470"];
    for (let i = 0; i < n; i++) { const el = document.createElement("i"); const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 220; el.style.setProperty("--dx", Math.cos(a) * d + "px"); el.style.setProperty("--dy", Math.sin(a) * d + 160 + "px"); el.style.setProperty("--rot", Math.random() * 720 - 360 + "deg"); el.style.background = colors[i % colors.length]; el.style.animationDelay = Math.random() * 120 + "ms"; box.appendChild(el); }
    document.body.appendChild(box); setTimeout(() => box.remove(), 1500);
  };
})(window.PSI);

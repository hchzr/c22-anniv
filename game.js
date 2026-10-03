// Joyeux 18 ans, Constantin. Tout se passe dans une Game Boy : 160×144, 4 couleurs.
// Intro (maison, PC) → session Claude Code jouée comme un RPG → chat libre au clavier Game Boy.
(() => {
"use strict";

/* ============================================================
   CONTENU
   ============================================================ */
const JOKES = [
  { file: "souvenirs/epfl.md",     line: 12,   text: "« Attends j'arrive je prends juste une branche Cailler ».", note: "on sent la passion." },
  { file: "souvenirs/casiers.md",  line: 1,    text: "The casier scheme.", note: "Je n'en sais pas plus, et je crois que c'est mieux comme ça." },
  { file: "souvenirs/apple.txt",   line: 404,  text: "« Oh, une faille dans iOS. »", note: "Visiblement. CVE publiée." },
  { file: "souvenirs/migros.csv",  line: 24,   text: "Thé froid citron ×24", note: "Une consommation quotidienne raisonnable finalement." },
  { file: "souvenirs/git-log.txt", line: 1,    text: "fix", note: "Son commit message préféré." },
  { file: "souvenirs/claude.log",  line: 9999, text: "« Attends, je demande à Claude. »", note: "Ne comprends pas l'algo derrière." },
];
// fy = où cadrer verticalement (0 = haut, 1 = bas)
const PHOTOS = [
  { src: "img/2.webp", name: "3F7EFCCF.PNG", cap: "Aura.", fy: .3 },
  { src: "img/1.webp", name: "0c9ed836.JPG", cap: "W Claudemaxxing tool", fy: .4 },
  { src: "img/5.webp", alt: "img/6.webp", name: "IMG_9451.HEIC", cap: "ouais j'arrive je vous rejoins", fy: .28 },
  { src: "img/7.webp", name: "IMG_9563.HEIC", cap: "Average cs student when outside", fy: .3 },
  { src: "img/3.webp", name: "90771CB2.PNG", cap: "Personne ne sait ce qui s'est passé ici. Même pas lui.", fy: .35 },
  { src: "img/4.webp", name: "9ea34ecd.JPG", cap: "Average AICC class", fy: .6 },
  { src: "img/8.webp", name: "IMG_9564.HEIC", cap: "When Claude fixes the bug you spent 6 hours on", fy: .3 },
];
const BIRTHDAY = new Date("2026-10-03T00:00:00+02:00");
const RICK_CAPTION = "Le vrai, c'est avec claudinou@polygo.ch, mais comme Hugo n'a pas les codes Cloudflare, tu l'auras lundi.";

/* ============================================================
   BASE
   ============================================================ */
const W = 160, H = 144;
const PAL = ["#e0f8d0", "#88c070", "#346856", "#081820"];
const OFF = "#7b8a63";
const $ = s => document.querySelector(s);
const cv = $("#gbscreen"), ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;
const gbEl = $("#gb"), hintEl = $("#hint");
const AUTO = location.hash.includes("auto");
const sleep = ms => new Promise(r => setTimeout(r, AUTO ? Math.min(ms, 25) : ms));
const frame = () => new Promise(r => requestAnimationFrame(r));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const rnd = (a, b) => a + Math.random() * (b - a);
const view = { mode: "off", t0: 0, invert: false };
const col = c => PAL[view.invert ? 3 - c : c];
function rect(x, y, w, h, c) { ctx.fillStyle = col(c); ctx.fillRect(x, y, w, h); }
function setHint(t, blink = false) { hintEl.textContent = t || ""; hintEl.classList.toggle("blink", !!blink); }

/* ============================================================
   SON (tout synthétisé)
   ============================================================ */
const sfx = {
  on: true, ctx: null,
  init() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback"; // ignore le bouton silencieux sur iPhone
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state !== "running") this.ctx.resume();
    } catch {}
  },
  note(f, t, d, type = "square", v = .04) {
    const c = this.ctx; if (!c || !this.on) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + d * .7); g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  beep(f, d = .06, v = .04, type = "square", at = 0) { if (this.ctx) this.note(f, this.ctx.currentTime + at, d, type, v); },
  seq(notes, type = "square", v = .045) { let t = 0; for (const [f, d] of notes) { if (f) this.beep(f, d * .95, v, type, t); t += d; } },
  blip() { this.beep(1760, .015, .012); },
  tick() { this.beep(rnd(1900, 2600), .008, .02, "square"); },
  err() { this.beep(160, .25, .05, "sawtooth"); },
  ding() { this.beep(1046.5, .07, .05); this.beep(2093, .6, .045, "square", .08); },
  fanfare() { this.seq([[784, .1], [784, .1], [784, .1], [1047, .3], [0, .05], [988, .12], [1047, .5]], "square", .05); this.seq([[392, .3], [523, .3], [659, .7]], "triangle", .07); },
  thud() { this.beep(70, .25, .08, "square"); },
};
["touchend", "click", "keydown"].forEach(ev => addEventListener(ev, () => sfx.init(), { capture: true, passive: true }));
// petite musique originale pour la ville
const LEAD = [76, 74, 72, 74, 76, 79, 76, 72, 74, 76, 77, 76, 74, 0, 74, 0, 72, 74, 76, 72, 69, 72, 74, 76, 77, 76, 74, 71, 72, 0, 72, 0];
const BASS = [48, 55, 48, 55, 48, 55, 52, 55, 53, 60, 53, 60, 55, 62, 55, 62, 48, 55, 48, 55, 45, 52, 45, 52, 53, 60, 55, 62, 48, 55, 48, 55];
const mid = n => 440 * Math.pow(2, (n - 69) / 12);
let music = null;
function startMusic() {
  const c = sfx.ctx; if (!c || music) return;
  let next = c.currentTime + .1, i = 0;
  const tick = () => { while (next < c.currentTime + .6) { const l = LEAD[i % 32], b = BASS[i % 32]; if (l) sfx.note(mid(l), next, .18, "square", .022); if (b) sfx.note(mid(b), next, .19, "triangle", .055); next += .2; i++; } };
  tick(); music = setInterval(tick, 150);
}
function stopMusic() { clearInterval(music); music = null; }

/* ============================================================
   TEXTE (police pixel seuillée + glyphes dessinés à la main)
   ============================================================ */
const GLYPH = {
  "⏺": ["........", "..3333..", ".333333.", ".333333.", ".333333.", ".333333.", "..3333..", "........"],
  "⎿": ["..3.....", "..3.....", "..3.....", "..3.....", "..33333.", "........", "........", "........"],
  "✻": ["...3....", ".3.3.3..", "..333...", "3333333.", "..333...", ".3.3.3..", "...3....", "........"],
  "☒": ["3333333.", "33...33.", "3.3.3.3.", "3..3..3.", "3.3.3.3.", "33...33.", "3333333.", "........"],
  "☐": ["3333333.", "3.....3.", "3.....3.", "3.....3.", "3.....3.", "3.....3.", "3333333.", "........"],
  "▼": ["........", "3333333.", ".33333..", "..333...", "...3....", "........", "........", "........"],
  "▶": ["3.......", "33......", "333.....", "3333....", "333.....", "33......", "3.......", "........"],
  "✓": ["........", "......3.", ".....33.", "3...33..", "33.33...", ".333....", "..3.....", "........"],
  "✗": ["........", "33...33.", ".33.33..", "..333...", ".33.33..", "33...33.", "........", "........"],
  "♪": ["...333..", "...3.33.", "...3....", "...3....", ".333....", "3333....", ".33.....", "........"],
  "␣": ["........", "........", "........", "........", "........", "3.....3.", "3333333.", "........"],
  "⌫": ["........", "...3333.", "..3...3.", ".3.3.33.", "3...3.3.", ".3.3.33.", "..3...3.", "...3333."],
  "⚠": ["...3....", "..333...", "..3.3...", ".33.33..", ".33333..", "33.3.33.", "3333333.", "........"],
};
const gcache = new Map();
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function glyph(ch, hex) {
  const k = ch + hex; let o = gcache.get(k); if (o) return o;
  o = document.createElement("canvas"); o.width = 8; o.height = 8;
  const x = o.getContext("2d");
  x.font = '8px "Press Start 2P"'; x.textBaseline = "top"; x.fillStyle = "#000"; x.fillText(ch, 0, 0);
  const id = x.getImageData(0, 0, 8, 8), d = id.data, [r, g, b] = rgb(hex);
  for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] > 100 ? 255 : 0; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
  x.putImageData(id, 0, 0); gcache.set(k, o); return o;
}
function char(ch, x, y, c, s = 1) {
  if (ch === " ") return;
  const g = GLYPH[ch];
  if (g) { ctx.fillStyle = col(c); g.forEach((r, j) => { for (let i = 0; i < 8; i++) if (r[i] === "3") ctx.fillRect(x + i * s, y + j * s, s, s); }); return; }
  ctx.drawImage(glyph(ch, col(c)), x, y, 8 * s, 8 * s);
}
function text(str, x, y, c = 3, s = 1) { let i = 0; for (const ch of str) { char(ch, Math.round(x + i * 8 * s), Math.round(y), c, s); i++; } }
const len = s => [...s].length;
const center = (s, k = 1) => Math.round((W - len(s) * 8 * k) / 2);
function wrap(str, cols) {
  const out = [];
  for (const para of String(str).split("\n")) {
    let cur = "";
    for (let w of para.split(" ")) {
      if (!cur) { while (len(w) > cols) { out.push([...w].slice(0, cols).join("")); w = [...w].slice(cols).join(""); } cur = w; continue; }
      if (len(cur) + 1 + len(w) <= cols) cur += " " + w;
      else { out.push(cur); while (len(w) > cols) { out.push([...w].slice(0, cols).join("")); w = [...w].slice(cols).join(""); } cur = w; }
    }
    out.push(cur);
  }
  return out;
}

/* ============================================================
   SPRITES & DÉCORS
   ============================================================ */
const norm = rows => rows.map(r => (r + "................").slice(0, 16));
function sprite(rows, x, y, flip = false, s = 1) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < 16; i++) {
    const ch = rows[j][flip ? 15 - i : i];
    if (ch !== ".") { ctx.fillStyle = col(+ch); ctx.fillRect(x + i * s, y + j * s, s, s); }
  }
}
const BODY = {
  down: norm(["................", ".....333333.....", "....32222223....", "...3222222223...", "...3222222223...", "...3322222233...", "...3300000033...", "...3030000303...", "....30000003....", ".....333333.....", "....31111113....", "...3311221133...", "...3011221103...", "....31111113...."]),
  up: norm(["................", ".....333333.....", "....32222223....", "...3222222223...", "...3222222223...", "...3222222223...", "...3322222233...", "....32222223....", "....33222233....", ".....333333.....", "....31111113....", "...3311111133...", "...3011111103...", "....31111113...."]),
  left: norm(["................", ".....33333......", "....3222223.....", "...322222223....", "...322222223....", "...332222223....", "...300322223....", "...303032223....", "....30000333....", ".....33333......", ".....311113.....", "....3311113.....", "....3011113.....", ".....311113....."]),
};
const LEGS = {
  front: [norm(["....322..223....", "....333..333...."]), norm(["....322..333....", "....333........."]), norm(["....333..223....", ".........333...."])],
  side: [norm([".....3223.......", ".....3333......."]), norm(["....3223.33.....", "....333..33....."]), norm([".....33.3223....", ".....33.3333...."])],
};
const pl = { x: 72, y: 128, dir: "up", step: 0 };
function player(x = pl.x, y = pl.y, dir = pl.dir, step = pl.step, s = 1) {
  const side = dir === "left" || dir === "right";
  sprite(BODY[side ? "left" : dir].concat(LEGS[side ? "side" : "front"][step]), x, y - (step ? 1 : 0), dir === "right", s);
}
const TREE = norm([".....333333.....", "...3322222233...", "..322121212223..", ".32212121212123.", ".32121212121223.", "3221212121212223", "3212121212121213", "3221212121212223", ".32212121212223.", ".33222222222233.", "..333322223333..", "......3223......", "......3113......", "......3223......", ".....332233.....", "....33333333...."]);
function grass(x, y) { rect(x, y, 16, 16, 0); ctx.fillStyle = col(1); for (const [a, b] of [[2, 3], [3, 2], [4, 3], [10, 9], [11, 8], [12, 9], [6, 13], [7, 12], [8, 13]]) ctx.fillRect(x + a, y + b, 1, 1); }
function flower(x, y, t) { const o = Math.floor(t / 400) % 2; rect(x + 4 + o, y + 4, 3, 3, 2); rect(x + 9 - o, y + 9, 3, 3, 2); rect(x + 5 + o, y + 5, 1, 1, 0); rect(x + 10 - o, y + 10, 1, 1, 0); }
function fence(x, y) { rect(x, y + 5, 16, 2, 3); rect(x, y + 10, 16, 2, 3); rect(x + 2, y + 2, 3, 12, 3); rect(x + 3, y + 3, 1, 10, 1); rect(x + 10, y + 2, 3, 12, 3); rect(x + 11, y + 3, 1, 10, 1); }
function drawTown(t) {
  for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) grass(x, y);
  rect(72, 72, 16, 72, 0); rect(32, 112, 96, 16, 0);
  for (let y = 0; y < H; y += 16) { sprite(TREE, 0, y); sprite(TREE, 144, y); }
  sprite(TREE, 16, 0); sprite(TREE, 128, 0); sprite(TREE, 16, 16); sprite(TREE, 128, 16);
  rect(96, 6, 8, 12, 3); rect(97, 7, 6, 11, 2);
  for (let r = 0; r < 24; r += 4) { rect(42 + r / 2, 16 + r, 76 - r, 4, 2); rect(42 + r / 2, 19 + r, 76 - r, 1, 3); }
  rect(42, 16, 76, 1, 3); rect(48, 40, 64, 32, 0);
  for (let r = 45; r < 72; r += 6) rect(49, r, 62, 1, 1);
  rect(48, 40, 1, 32, 3); rect(111, 40, 1, 32, 3); rect(48, 71, 64, 1, 3); rect(48, 40, 64, 1, 3);
  for (const wx of [54, 94]) { rect(wx, 46, 12, 10, 3); rect(wx + 1, 47, 10, 8, 1); rect(wx + 1, 47, 4, 3, 0); rect(wx + 6, 47, 1, 8, 3); }
  rect(72, 52, 16, 20, 3);
  if (pl.y > 60) { rect(74, 54, 12, 17, 2); rect(75, 55, 10, 2, 1); rect(84, 62, 1, 2, 0); }
  rect(122, 58, 14, 9, 3); rect(123, 59, 12, 7, 0); rect(125, 61, 8, 1, 2); rect(125, 63, 6, 1, 2); rect(128, 67, 2, 6, 3);
  for (const fx of [16, 32, 48, 96, 112, 128]) fence(fx, 92);
  for (const [fx, fy] of [[32, 72], [112, 76], [24, 128], [120, 128], [96, 104], [48, 104]]) flower(fx, fy, t);
}
const STAR7 = ["...3...", ".3.3.3.", "..333..", "3333333", "..333..", ".3.3.3.", "...3..."];
function star(x, y, c = 3, s = 1) { STAR7.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === "3") rect(x + i * s, y + j * s, s, s, c); })); }
let pcOn = false;
function drawRoom(t) {
  rect(0, 0, W, 32, 1); for (let x = 0; x < W; x += 8) rect(x, 0, 1, 30, 2);
  rect(56, 6, 26, 18, 3); rect(57, 7, 24, 16, 0); rect(68, 7, 2, 16, 3); rect(57, 14, 24, 2, 3);
  rect(0, 30, W, 2, 3); rect(0, 32, W, 112, 0);
  for (let y = 32; y < H; y += 8) { rect(0, y + 7, W, 1, 1); for (let x = (y / 8) % 2 ? 0 : 16; x < W; x += 32) rect(x, y, 1, 7, 1); }
  rect(4, 26, 40, 22, 3); rect(5, 27, 38, 20, 2); rect(5, 27, 38, 3, 1);
  rect(10, 10, 24, 20, 3); rect(12, 12, 20, 14, pcOn ? 0 : 2);
  if (pcOn) { if (Math.floor(t / 250) % 2) star(18, 15); rect(14, 23, 16, 1, 1); } else { rect(13, 14, 4, 1, 1); rect(13, 17, 8, 1, 1); }
  rect(18, 30, 8, 2, 3); rect(12, 33, 20, 4, 3); rect(13, 34, 18, 2, 1);
  rect(60, 52, 28, 16, 3); rect(61, 53, 26, 14, 2); rect(64, 36, 20, 17, 3); rect(66, 38, 16, 12, 1); rect(67, 39, 5, 3, 0); rect(66, 58, 10, 5, 3); rect(67, 59, 8, 3, 1);
  rect(124, 60, 30, 48, 3); rect(125, 61, 28, 46, 0); rect(129, 64, 20, 9, 1); rect(125, 78, 28, 29, 1); for (let y = 82; y < 106; y += 6) rect(126, y, 26, 1, 2);
  rect(140, 40, 12, 10, 3); rect(141, 41, 10, 8, 2); rect(138, 30, 6, 10, 2); rect(146, 28, 6, 12, 2); rect(142, 26, 6, 14, 3);
  rect(64, 128, 32, 16, 2); rect(66, 130, 28, 12, 1); for (let x = 68; x < 94; x += 4) rect(x, 131, 1, 10, 2);
}

/* ============================================================
   PHOTOS TRAMÉES (façon Game Boy Camera)
   ============================================================ */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const imgs = new Map();
function loadImg(src) { if (!imgs.has(src)) { const i = new Image(); i.src = src; imgs.set(src, i); } return imgs.get(src); }
PHOTOS.forEach(p => { loadImg(p.src); if (p.alt) loadImg(p.alt); });
const dcache = new Map();
const isPortrait = src => { const i = loadImg(src); return i.naturalWidth && i.naturalHeight / i.naturalWidth > 1.25; };
function dither(src, mw = W, mh = H) {
  const key = src + mw + "x" + mh;
  if (dcache.has(key)) return dcache.get(key);
  const img = loadImg(src); if (!img.complete || !img.naturalWidth) return null;
  const sc = Math.min(mw / img.naturalWidth, mh / img.naturalHeight);
  const w = Math.round(img.naturalWidth * sc), h = Math.round(img.naturalHeight * sc);
  const o = document.createElement("canvas"); o.width = w; o.height = h;
  const x = o.getContext("2d");
  x.drawImage(img, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h), d = id.data, pal = PAL.map(rgb);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const p = (j * w + i) * 4;
    let L = (.299 * d[p] + .587 * d[p + 1] + .114 * d[p + 2]) / 255;
    L = Math.min(1, Math.max(0, (L - .5) * 1.35 + .52));
    const v = L * 3, f = Math.floor(v), th = (BAYER[(j % 4) * 4 + (i % 4)] + .5) / 16;
    const lvl = Math.min(3, f + (v - f > th ? 1 : 0)), c = pal[3 - lvl];
    d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2];
  }
  x.putImageData(id, 0, 0); dcache.set(key, o); return o;
}

/* ============================================================
   ÉTAT D'AFFICHAGE
   ============================================================ */
const LOG = [];
const tb = { on: false, lines: ["", ""], arrow: false };
let menu = null;           // { items, sel, x, y, w }
let toast = null;          // { lines, until }
let logArrow = false;
const parts = [];
const fx = { flash: 0, shake: 0, fade: 0, squash: 0, reset: 0, off: false, melt: null };
let banner = 0, ticketT = 0, photo = null, cakeT = 0, cakeOut = 0;

function drawTextbox() {
  rect(0, 96, W, 48, 0);
  rect(2, 98, 156, 44, 3); rect(3, 99, 154, 42, 0); rect(5, 101, 150, 38, 3); rect(6, 102, 148, 36, 0);
  text(tb.lines[0], 8, 110); text(tb.lines[1], 8, 126);
  if (tb.arrow && Math.floor(performance.now() / 350) % 2 === 0) char("▼", 144, 131, 3);
}
function drawMenu() {
  const m = menu, h = m.items.length * 12 + 10;
  rect(m.x, m.y, m.w, h, 3); rect(m.x + 1, m.y + 1, m.w - 2, h - 2, 0); rect(m.x + 3, m.y + 3, m.w - 6, h - 6, 3); rect(m.x + 4, m.y + 4, m.w - 8, h - 8, 0);
  m.items.forEach((it, i) => { text(it, m.x + 16, m.y + 7 + i * 12); if (i === m.sel) char("▶", m.x + 7, m.y + 7 + i * 12, 3); });
}
function drawLog(top, bottom) {
  const lh = 9, n = Math.floor((bottom - top) / lh), start = Math.max(0, LOG.length - n);
  for (let i = 0; i < n && start + i < LOG.length; i++) {
    const ln = LOG[start + i], y = top + i * lh;
    if (ln.bg != null) rect(0, y - 1, W, lh, ln.bg);
    let x = 4; for (const [s, c] of ln.segs) { text(s, x, y, c); x += len(s) * 8; }
  }
}
function drawHeader() { rect(0, 0, W, 9, 1); char("✻", 3, 1, 3); text("claude", 13, 1, 3); text("~/anniv", 101, 1, 2); }
function drawTerm(now) {
  rect(0, 0, W, H, 3); drawHeader();
  if (chat.on) { drawLog(11, 87); drawChat(now); return; }
  drawLog(11, tb.on ? 95 : 143);
  if (logArrow && !tb.on && Math.floor(now / 350) % 2 === 0) { rect(146, 134, 12, 10, 3); char("▼", 148, 135, 0); }
}
function drawBanner(now) {
  const t = now - banner;
  rect(0, 0, W, H, 3);
  const s1 = Math.min(1, t / 500);
  text("JOYEUX", Math.round(-100 + (center("JOYEUX", 2) + 100) * s1), 10, 0, 2);
  if (t > 600) text("18 ANS", center("18 ANS", 3), 32, Math.floor(t / 180) % 2 ? 0 : 1, 3);
  if (t > 1200) text("CONSTANTIN", 0, 66, 0, 2);
  if (t > 1300 && Math.random() < .5) spawnConfetti(2);
}
function drawPhoto(now) {
  rect(0, 0, W, H, 3);
  const p = photo; if (!p) return;
  const live = p.alt && Math.floor(now / 700) % 2;
  const src = live ? p.alt : p.src, portrait = isPortrait(p.src);
  if (portrait) {
    const im = dither(src, 82, H);
    if (im) ctx.drawImage(im, 0, 0);
    rect(84, 12, 74, 130, 0); rect(85, 13, 72, 128, 3); rect(86, 14, 70, 126, 0);
    side.lines.forEach((l, i) => text(l, 89, 20 + i * 12, 3));
    if (side.arrow && Math.floor(now / 350) % 2 === 0) char("▼", 146, 130, 3);
  } else {
    const im = dither(src, W, tb.on ? 96 : H);
    if (im) ctx.drawImage(im, Math.round((W - im.width) / 2), tb.on ? Math.round((96 - im.height) / 2) : Math.round((H - im.height) / 2));
  }
  if (!loadImg(p.src).naturalWidth) text("...", 68, 68, 1);
  rect(0, 0, len(p.name) * 8 + 4, 10, 3); text(p.name, 2, 1, 0);
  if (p.alt) { rect(W - 42, 0, 42, 10, 3); char("⏺", W - 40, 1, Math.floor(now / 500) % 2 ? 0 : 1); text("LIVE", W - 32, 1, 0); }
}
let joke = null, jokeI = 0, limitT = 0, rickT = 0;
const side = { lines: [], arrow: false };
function drawJoke() {
  rect(0, 0, W, H, 0);
  rect(0, 0, W, 12, 3); char("✻", 3, 2, 0); text(`SOUVENIR ${jokeI + 1}/${JOKES.length}`, 14, 2, 0);
  text(`${joke.file.split("/").pop()}:${joke.line}`.slice(0, 19), 4, 17, 2);
  const lines = wrap(joke.text, 17).slice(0, 5), h = lines.length * 11 + 12, y = 30 + Math.max(0, Math.round((62 - h) / 2));
  rect(4, y, 152, h, 3); rect(4, y, 3, h, 1);
  lines.forEach((l, i) => text(l, 12, y + 7 + i * 11, 0));
}
function drawLimit(now) {
  const t = now - limitT, flash = t < 900 && Math.floor(t / 110) % 2;
  rect(0, 0, W, H, flash ? 0 : 3);
  const c = flash ? 3 : 0;
  char("⚠", 64, 6, c, 4);
  if (t > 300) { text("USAGE", center("USAGE", 2), 44, c, 2); text("LIMIT", center("LIMIT", 2), 62, c, 2); }
  if (t > 600 && (t < 900 || Math.floor(t / 400) % 2 === 0)) text("REACHED", center("REACHED", 2), 80, c, 2);
  if (t > 900) { rect(0, 104, W, 1, 1); text("reset : 19h00", center("reset : 19h00"), 112, 1); text("Pro n°1 : vide", center("Pro n°1 : vide"), 126, 1); }
}

function drawTicket(now) {
  const t = now - ticketT;
  rect(0, 0, W, H, 3);
  rect(6, 4, 148, 136, 0); rect(8, 6, 144, 132, 3); rect(9, 7, 142, 130, 0);
  text("BON CADEAU", 14, 12, 3); text("N°18", 114, 12, 2);
  text("UN 2e", 14, 26, 3, 2); text("CLAUDE", 14, 44, 3, 2); text("PRO", 14, 62, 3, 2);
  for (let x = 12; x < 148; x += 4) rect(x, 82, 2, 1, 2);
  text("Pro n°1 .à toi", 14, 88, 3); text("Pro n°2 1 mois", 14, 99, 3); text("Limits ....×2", 14, 110, 3);
  if (t > 700) {
    const k = t < 820 ? 2 : 1, sx = 86, sy = 60;
    rect(sx - 2 * k, sy - 2 * k, 66 + 4 * k, 22 + 4 * k, 2); rect(sx, sy, 66, 22, 0);
    text("CERTIFIÉ", sx + 1, sy + 3, 2); text("MAJEUR", sx + 9, sy + 12, 2);
  }
  const on = Math.floor(now / 400) % 2;
  rect(14, 122, 74, 12, 3); text("REDEEM", 34, 124, 0); if (on) char("▶", 20, 124, 0);
}
function drawCake(now) {
  const t = now - cakeT;
  rect(0, 0, W, H, 3);
  text("18 BOUGIES", center("18 BOUGIES"), 10, 0);
  rect(20, 96, 120, 6, 1); rect(30, 76, 100, 20, 0); rect(30, 76, 100, 3, 1); for (let x = 34; x < 128; x += 8) rect(x, 82, 4, 2, 2);
  rect(40, 60, 80, 16, 0); rect(40, 60, 80, 3, 1); text("C", 76, 65, 2);
  for (let i = 0; i < 18; i++) {
    const x = 42 + i * 4.3, out = cakeOut && t - cakeOut > i * 55;
    rect(Math.round(x), 50, 2, 10, i % 2 ? 1 : 2);
    if (!out) { const f = Math.floor((now + i * 90) / 120) % 2; rect(Math.round(x), 46 - f, 2, 3 + f, 0); }
    else if (t - cakeOut < i * 55 + 400) rect(Math.round(x), 42 - Math.floor((t - cakeOut - i * 55) / 100), 1, 1, 1);
  }
  if (cakeOut && t - cakeOut > 1300) text("18/18 !", center("18/18 !"), 116, 0);
}
function drawBoot(now) {
  const t = now - view.t0;
  rect(0, 0, W, H, 0);
  const y = Math.min(64, -16 + t * .045);
  star(50, y + 1); text("Claude", 62, y);
}
function drawTitle(now) {
  rect(0, 0, W, H, 0); rect(0, 0, W, 54, 3);
  text("CONSTANTIN", center("CONSTANTIN"), 10, 0);
  text("18 ANS", center("18 ANS", 2), 24, 0, 2);
  rect(0, 54, W, 2, 2);
  sprite(BODY.down.concat(LEGS.front[0]), 56, 62, false, 3);
  if (Math.floor(now / 530) % 2 === 0) text("PRESS START", center("PRESS START"), 116);
  text("2026 HUGO", center("2026 HUGO"), 132, 2);
}

/* ---------- particules ---------- */
function spawnConfetti(n) { for (let i = 0; i < n; i++) parts.push({ k: "c", x: rnd(0, W), y: -4, vx: rnd(-.02, .02), vy: rnd(.03, .07), c: [0, 1, 2][Math.random() * 3 | 0], s: Math.random() < .3 ? 3 : 2, life: 4000 }); }
function burst(n = 60) { for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), v = rnd(.04, .12); parts.push({ k: "c", x: 80, y: 72, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .05, g: .00012, c: [0, 1, 2][Math.random() * 3 | 0], s: 2, life: 2200 }); } }
function teaRain(n = 26) { for (let i = 0; i < n; i++) parts.push({ k: "t", x: rnd(0, W - 8), y: rnd(-120, -10), vx: 0, vy: rnd(.05, .1), life: 5000 }); }
function drawParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; p.life -= dt;
    if (p.life <= 0 || p.y > H + 12) { parts.splice(i, 1); continue; }
    if (p.k === "t") { const x = Math.round(p.x), y = Math.round(p.y); rect(x, y, 8, 11, 3); rect(x + 1, y + 1, 6, 9, 0); rect(x + 1, y + 4, 6, 3, 2); rect(x + 6, y - 2, 1, 3, 3); }
    else rect(Math.round(p.x), Math.round(p.y), p.s, p.s, p.c);
  }
}

/* ---------- boucle de rendu ---------- */
let lastT = performance.now();
const snap = document.createElement("canvas"); snap.width = W; snap.height = H;
function render(now) {
  const dt = Math.min(50, now - lastT); lastT = now;
  if (fx.off) { ctx.fillStyle = OFF; ctx.fillRect(0, 0, W, H); requestAnimationFrame(render); return; }
  if (fx.melt) { drawMelt(now); requestAnimationFrame(render); return; }
  ctx.save();
  if (now < fx.shake) ctx.translate(Math.round(rnd(-3, 3)), Math.round(rnd(-2, 2)));
  switch (view.mode) {
    case "off": ctx.fillStyle = OFF; ctx.fillRect(0, 0, W, H); break;
    case "boot": drawBoot(now); break;
    case "title": drawTitle(now); break;
    case "town": drawTown(now); if (pl.y > 58) player(); break;
    case "room": drawRoom(now); player(); break;
    case "term": drawTerm(now); break;
    case "banner": drawBanner(now); break;
    case "photo": drawPhoto(now); break;
    case "ticket": drawTicket(now); break;
    case "cake": drawCake(now); break;
    case "joke": drawJoke(now); break;
    case "limit": drawLimit(now); break;
    case "rick": drawRick(now); break;
  }
  if (tb.on) drawTextbox();
  if (menu) drawMenu();
  drawParts(dt);
  ctx.restore();
  if (toast && now < toast.until) {
    const h = toast.lines.length * 10 + 8;
    rect(4, 4, 152, h, 3); rect(5, 5, 150, h - 2, 0); toast.lines.forEach((l, i) => text(l, center(l), 9 + i * 10, 3));
  }
  if (now < fx.reset) drawBoot(now - 0 + (performance.now() - fx.reset + 2400) * 0 + 0, true);
  if (fx.fade > 0) { ctx.globalAlpha = fx.fade; rect(0, 0, W, H, 0); ctx.globalAlpha = 1; }
  if (now < fx.flash) rect(0, 0, W, H, Math.floor(now / 60) % 2 ? 0 : 3);
  if (now < fx.squash) { snap.getContext("2d").drawImage(cv, 0, 0); rect(0, 0, W, H, 3); ctx.drawImage(snap, 0, 0, W, H, 0, H / 4, W, H / 2); }
  requestAnimationFrame(render);
}
function drawMelt(now) {
  const m = fx.melt, t = now - m.t0;
  rect(0, 0, W, H, 3);
  for (let x = 0; x < W; x++) { const k = Math.max(0, t - m.d[x]); const off = Math.min(H, k * k * .00025); ctx.drawImage(m.img, x, 0, 1, H, x, off, 1, H); }
}

/* ============================================================
   ENTRÉES
   ============================================================ */
let waiter = null, typing = false, typeSkip = false;
const KONAMI = ["UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "B", "A"];
let kon = 0, lastSel = 0, lastStart = 0;
function waitBtn(...btns) {
  return new Promise(r => {
    waiter = { btns: new Set(btns), r };
    if (AUTO) setTimeout(() => { if (waiter && waiter.r === r) { waiter = null; r(btns[0]); } }, 60);
  });
}
const waitA = () => waitBtn("A", "B", "START");
async function waitLog() { logArrow = true; setHint("A ▸"); await waitA(); logArrow = false; setHint(""); }

function press(b) {
  sfx.init();
  // konami & soft reset fonctionnent partout
  kon = b === KONAMI[kon] ? kon + 1 : b === KONAMI[0] ? 1 : 0;
  if (kon === KONAMI.length) { kon = 0; if (!rickOn) rickroll(); return; }
  const now = performance.now();
  if (b === "SELECT") lastSel = now;
  if (b === "START") lastStart = now;
  if (Math.abs(lastSel - lastStart) < 450 && (b === "SELECT" || b === "START") && view.mode !== "off" && view.mode !== "boot") { lastSel = lastStart = 0; softReset(); return; }
  if (photoColor) { hidePhotoColor(); return; }
  if (b === "SELECT" && view.mode === "photo") { showPhotoColor(); return; }
  if (typing && (b === "A" || b === "B")) { typeSkip = true; return; }
  if (chat.on && !waiter && chat.handle(b)) return;
  if (waiter && waiter.btns.has(b)) { const w = waiter; waiter = null; w.r(b); }
}
document.querySelectorAll("[data-b]").forEach(el => el.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); press(el.dataset.b); }));
document.addEventListener("pointerdown", e => {
  if (e.target.closest("button, .ov, #gbscreen")) return;
  if (!chat.on || waiter) press("A");
});
cv.addEventListener("pointerdown", e => {
  e.preventDefault();
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
  sfx.init();
  if (menu && waiter) {
    const i = Math.floor((y - menu.y - 5) / 12);
    if (x >= menu.x && i >= 0 && i < menu.items.length) { menu.sel = i; press("A"); return; }
  }
  if (view.mode === "ticket" && waiter && y > 118 && x < 92) { press("A"); return; }
  if (chat.on && !waiter) { chat.tap(x, y); return; }
  press("A");
});
addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey) return;
  if (chat.on && !waiter && chat.key(e)) { e.preventDefault(); return; }
  const map = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT", Enter: "START", " ": "A", a: "A", x: "A", z: "A", b: "B", Escape: "B", Backspace: "B", Tab: "SELECT", Shift: "SELECT" };
  const b = map[e.key]; if (b) { e.preventDefault(); press(b); }
});

/* ============================================================
   PRIMITIVES DU SCRIPT
   ============================================================ */
const KIND = {
  plain: ["", 0, null], dim: ["", 1, null], title: ["", 0, null],
  tool: ["⏺ ", 0, null, 1], res: ["⎿ ", 1, null, 1], claude: ["⏺ ", 0, null, 0],
  add: ["+ ", 3, 1, 3], del: ["- ", 0, 2, 0], ctx: ["  ", 1, null],
  prompt: ["> ", 0, 2], bash: ["! ", 0, 2], err: ["", 3, 0], done: ["☒ ", 1, null], todo: ["☐ ", 0, null],
};
async function log(str, kind = "plain", gap = 160) {
  const [pre, c, bg, pc] = KIND[kind], pw = len(pre);
  const lines = wrap(str, 19 - pw);
  for (let i = 0; i < lines.length; i++) {
    const p = i === 0 || kind === "add" || kind === "del" ? pre : " ".repeat(pw);
    LOG.push({ segs: p ? [[p, pc ?? c], [lines[i], c]] : [[lines[i], c]], bg });
    if (LOG.length > 300) LOG.shift();
    if (gap) { sfx.blip(); await sleep(gap); }
  }
}
async function say(str, { cut = false, keep = false } = {}) {
  const lines = wrap(str, 18);
  for (let p = 0; p < lines.length; p += 2) {
    const page = [lines[p] || "", lines[p + 1] || ""];
    tb.on = true; tb.lines = ["", ""]; tb.arrow = false;
    typing = true; typeSkip = false;
    outer: for (let li = 0; li < 2; li++) for (const ch of page[li]) {
      if (typeSkip) break outer;
      tb.lines[li] += ch; if (ch !== " ") sfx.blip();
      await sleep(26);
    }
    tb.lines = page.slice(); typing = false;
    if (cut && p + 2 >= lines.length) { await sleep(250); break; }
    tb.arrow = true; setHint("A ▸"); await waitA(); tb.arrow = false; setHint("");
  }
  if (!keep) tb.on = false;
}
async function sideSay(str) {
  const lines = wrap(str, 8);
  side.lines = lines.map(() => "");
  typing = true; typeSkip = false;
  outer: for (let i = 0; i < lines.length; i++) for (const ch of lines[i]) {
    if (typeSkip) break outer;
    side.lines[i] += ch; if (ch !== " ") sfx.blip(); await sleep(30);
  }
  side.lines = lines.slice(); typing = false;
  side.arrow = true; await waitA(); side.arrow = false;
}
async function prompt(str, kind = "prompt") {
  const [pre] = KIND[kind];
  const lines = wrap(str, 17);
  typing = true; typeSkip = false;
  for (let i = 0; i < lines.length; i++) {
    const seg = ["", 0];
    LOG.push({ segs: [[i ? "  " : pre, 0], seg], bg: 2 });
    for (const ch of lines[i]) { seg[0] += ch; if (!typeSkip) { if (ch !== " ") sfx.tick(); await sleep(rnd(45, 95)); } }
  }
  typing = false;
  await sleep(450);
}
const SPIN = ["·", "+", "*", "✻", "*", "+"];
async function think(verb, ms) {
  const g = ["✻", 0], tx = ["", 0], line = { segs: [g, tx], bg: null };
  LOG.push(line);
  const t0 = performance.now();
  typeSkip = false; typing = true;
  while (performance.now() - t0 < (AUTO ? 40 : ms) && !typeSkip) {
    const el = performance.now() - t0;
    g[0] = SPIN[Math.floor(el / 120) % SPIN.length]; tx[0] = ` ${verb}… ${Math.floor(el / 1000)}s`;
    await new Promise(r => setTimeout(r, 60));
  }
  typing = false;
  LOG.splice(LOG.indexOf(line), 1);
}
async function walkTo(path, speed = .05) {
  for (const [tx, ty] of path) {
    let last = performance.now();
    while (pl.x !== tx || pl.y !== ty) {
      await frame(); const now = performance.now(), d = Math.min(50, now - last) * speed * (AUTO ? 20 : 1); last = now;
      const dx = tx - pl.x, dy = ty - pl.y;
      if (dx) { pl.dir = dx > 0 ? "right" : "left"; pl.x += Math.sign(dx) * Math.min(d, Math.abs(dx)); }
      else { pl.dir = dy > 0 ? "down" : "up"; pl.y += Math.sign(dy) * Math.min(d, Math.abs(dy)); }
      pl.step = [0, 1, 0, 2][Math.floor(now / 140) % 4];
    }
  }
  pl.step = 0;
}
async function fadeTo(target, ms = 500) {
  const from = fx.fade, t0 = performance.now();
  while (true) { await frame(); const k = Math.min(1, (performance.now() - t0) / (AUTO ? 10 : ms)); fx.fade = from + (target - from) * k; if (k >= 1) break; }
}
async function yesno(question, items = ["OUI", "NON"]) {
  await say(question, { cut: true, keep: true });
  tb.on = true;
  menu = { items, sel: 0, x: 96, y: 54, w: 64 };
  setHint("A : choisir");
  while (true) {
    const b = await waitBtn("A", "B", "UP", "DOWN");
    if (b === "UP" || b === "DOWN") { menu.sel = (menu.sel + (b === "DOWN" ? 1 : items.length - 1)) % items.length; sfx.blip(); continue; }
    const r = b === "A" ? menu.sel : items.length - 1;
    menu = null; tb.on = false; setHint(""); sfx.beep(1318, .05);
    return r;
  }
}
function showToast(lines, ms = 2400) { toast = { lines: [].concat(lines), until: performance.now() + ms }; }

/* ============================================================
   L'HISTOIRE
   ============================================================ */
async function powerOn() {
  sfx.init();
  $("#led").classList.add("on");
  setHint("");
}
async function boot() {
  view.mode = "boot"; view.t0 = performance.now();
  setTimeout(() => sfx.ding(), AUTO ? 0 : 1800);
  await sleep(1500);
  await Promise.race([sleep(1500), waitBtn("A", "START")]);
  waiter = null;
}
async function title() {
  view.mode = "title"; setHint("Appuie sur START", true);
  await waitBtn("START", "A");
  sfx.beep(1318, .05); sfx.beep(1760, .12, .04, "square", .06);
  setHint("");
}
async function town() {
  view.mode = "town"; pl.x = 72; pl.y = 128; pl.dir = "up";
  startMusic();
  await sleep(400);
  await walkTo([[72, 56]]);
  sfx.beep(220, .12, .05);
  await fadeTo(1, 600);
}
async function room() {
  view.mode = "room"; pl.x = 72; pl.y = 124; pl.dir = "up";
  await fadeTo(0, 500);
  await walkTo([[72, 88], [16, 88], [16, 48]]);
  pl.dir = "up";
  await say("CONSTANTIN allume le PC.");
  pcOn = true; stopMusic();
  sfx.seq([[523, .08], [784, .08], [1046, .15]]);
  await sleep(600);
  await say("Une session Claude Code est ouverte. C'est celle de HUGO.");
  fx.flash = performance.now() + 500; sfx.beep(130, .4, .06, "sawtooth");
  await sleep(550);
}
async function session() {
  view.mode = "term"; LOG.length = 0;
  await log("✻ Claude Code", "title", 120);
  await log("cwd: ~/anniv", "dim", 120);
  await log("", "plain", 300);
  await prompt("c'est l'anniversaire de constantin aujourd'hui, il a 18 ans. prépare-lui un truc stylé stp");
  await think("Réfléchit", 2200);
  await say("Je commence par son âge.");
  await log("Read(Constantin.swift)", "tool");
  await log("Read 6 lines", "res");
  await sleep(500);
  await log("Update(Constantin.swift)", "tool");
  await log("struct Constantin", "ctx", 120);
  await log("let age = 17", "del", 120);
  await log("isAdult = false", "del", 120);
  await log("let age = 18", "add", 120);
  await log("isAdult = true", "add", 120);
  await log("canSignOwnSlips", "add", 120);
  await log("}", "ctx", 120);
  await waitLog();
  await log("Bash(swift build)", "tool");
  await think("Compile", 1500);
  await log("Build complete!", "res");
  await log("  (18.00s)", "dim");
  await think("Prépare la surprise", 1800);

  view.mode = "banner"; banner = performance.now(); sfx.fanfare();
  await sleep(2600);
  await say("Joyeux anniversaire Constantin. 18 ans, enfin majeur.");
  await say("Hugo voulait un truc stylé. Il a relu chaque ligne, donc les fautes, c'est lui.");

  view.mode = "term";
  await log("Update Todos", "tool");
  for (const [done, t] of [[1, "Naître (2008)"], [1, "Sortir badnotes"], [1, "Payloads Switch"], [1, "LLM sur iPhone"], [1, "CVE Apple publiée"], [1, "Entrer à l'EPFL"], [1, "Avoir 18 ans"], [0, "Fêter ça"], [0, "Commit de 4 mots"], [0, "Arrêter les chaises"], [0, "Boire de l'eau. Pas du thé froid."]])
    await log(t, done ? "done" : "todo", 260);
  await waitLog();

  await think("Fouille les souvenirs", 1600);
  await log("Search(souvenirs)", "tool");
  await log(`Found ${JOKES.length} files`, "res");
  await sleep(400);
  for (let i = 0; i < JOKES.length; i++) {
    joke = JOKES[i]; jokeI = i; view.mode = "joke";
    sfx.seq([[988, .05], [1319, .09]]);
    await sleep(500);
    await say(joke.note ? "Claude : " + joke.note : "…");
  }
  view.mode = "term";

  await think("Regarde les photos", 1400);
  await log("Read(photos/*)", "tool");
  await log(`Read ${PHOTOS.length + 1} images`, "res");
  await sleep(500);
  for (const p of PHOTOS) {
    view.mode = "photo"; photo = p; side.lines = []; side.arrow = false;
    setHint("A ▸   SELECT : en couleur");
    if (isPortrait(p.src)) await sideSay(p.cap);
    else { await Promise.race([sleep(1600), waitA()]); waiter = null; await say(p.cap); }
  }
  view.mode = "term"; photo = null; setHint("");

  await think("Cherche autre chose", 1400);
  await say("J'ai aussi retrouvé une vidéo où Constantin essaie de", { cut: true });
  sfx.err();
  await log("Interrupted by user", "res", 300);
  await prompt("non. pas celle-là.");
  await think("Efface des preuves", 1200);
  await say("Compris. Cette vidéo n'a jamais existé.");
  await log("Removed video.mov", "res");
  await sleep(500);

  await prompt("t'as oublié le plus important : il est complètement accro au thé froid migros");
  await think("Réalise son erreur", 1500);
  await say("You're absolutely right!");
  await log("Update(Constantin.swift)", "tool");
  await log("drink = .théFroid", "add", 140);
  await log("iceTea = .tooMuch", "add", 140);
  await log("bloodType =", "add", 140);
  await log(" \"thé froid citron\"", "add", 140);
  await waitLog();

  await prompt("et le cadeau ?");
  await think("Vérifie le solde", 2400);
  view.mode = "limit"; limitT = performance.now();
  gbEl.classList.remove("shake"); void gbEl.offsetWidth; gbEl.classList.add("shake");
  sfx.seq([[440, .12], [0, .04], [440, .12], [0, .04], [220, .5]], "sawtooth", .06);
  setTimeout(() => { gbEl.classList.remove("shake"); void gbEl.offsetWidth; gbEl.classList.add("shake"); }, 450);
  await sleep(1600);
  setHint("A ▸", true); await waitA(); setHint("");
  await say("Claude usage limit reached. Your limit will reset at 7pm.");
  view.mode = "term";
  await log("Claude usage limit", "err", 80);
  await log("reached. Reset 7pm.", "err", 80);
  await log("/upgrade to increase your usage limit.", "dim", 120);
  await say("Attends. Hugo a laissé un truc.");
  await say("Un deuxième abonnement Claude Pro. Oui, tu en as déjà un. On sait.");
  const REFUS = ["Ce n'était pas vraiment une question.", "Relis le titre. C'est un cadeau.", "J'ai transmis à Hugo. Il a dit non.", "Option NON désactivée par l'admin (Hugo)."];
  for (let i = 0; ; i++) {
    const r = await yesno("Activer le 2e Claude Pro ?");
    if (r === 0) break;
    sfx.err(); await say(REFUS[i % REFUS.length]);
  }
  await log("Bash(claude /login)", "tool");
  await think("Connexion", 1300);
  await log("Login successful.", "res");
  await log("2 abonnements Pro", "dim");
  await sleep(400);
  sfx.fanfare(); burst(80);
  await say("CONSTANTIN obtient UN 2e CLAUDE PRO !");
  view.mode = "ticket"; ticketT = performance.now();
  setTimeout(() => sfx.thud(), AUTO ? 0 : 720);
  setHint("A : REDEEM   B : plus tard");
  const b = await waitBtn(AUTO ? "B" : "A", "B");
  setHint("");
  if (b === "A") { await rickroll(); view.mode = "ticket"; await say(RICK_CAPTION); }
  view.mode = "term";
  await say("Joyeux anniversaire mec.\n— Hugo");
}

/* ============================================================
   RICKROLL 8-BIT (joué par la Game Boy, avec le son)
   ============================================================ */
const DANCER = [
  norm(["......3333......", ".....322223.....", "....32222223....", "....33333333....", "....30000003....", "....30300303....", "....30000003....", ".....300003.....", "......3333......", "....33300333....", "...3222002223...", "..322220022223..", ".3.3222002223.3.", "3..3222002223..3", "...3222222223...", "...3222222223...", "...3222222223...", "...3222332223...", "....322..223....", "....322..223....", "....322..223....", "....311..113....", "...3333..3333...", "................"]),
  norm(["......3333......", ".....322223.....", "....32222223....", "....33333333....", "....30000003....", "....30300303....", "....30000003....", ".....300003.....", "3.....3333.....3", ".3..33300333..3.", "..3222200222223.", "...3222002223...", "...3222002223...", "...3222002223...", "...3222222223...", "...3222222223...", "...3222222223...", "...3222332223...", "...322....223...", "..322......223..", "..322......223..", "..311......113..", ".3333......3333.", "................"]),
];
let rickOn = false, rickStop = null;
function drawRick(now) {
  const t = now - rickT, beat = Math.floor(t / 265);
  rect(0, 0, W, H, 3);
  for (let i = -2; i < 12; i++) { const x = ((i * 24 + t * .03) % 288) - 32; ctx.fillStyle = col(beat % 2 ? 2 : 1); ctx.beginPath(); ctx.moveTo(80, -10); ctx.lineTo(x, H); ctx.lineTo(x + 10, H); ctx.closePath(); ctx.fill(); }
  rect(0, 112, W, 32, 2); for (let x = 0; x < W; x += 16) rect(x + (beat % 2) * 8, 112, 8, 2, 1);
  const title = "♪ NEVER GONNA GIVE YOU UP ♪   ", mx = -((t * .05) % (len(title) * 8));
  rect(0, 0, W, 12, 3); text(title + title, Math.round(mx), 2, 0);
  const sway = [0, 4, 0, -4][beat % 4];
  rect(50 + sway, 106, 60, 5, 3);
  sprite(DANCER[beat % 2], 56 + sway, 36, beat % 4 === 3, 3);
  if (Math.floor(t / 300) % 2 === 0) text("RICKROLL", center("RICKROLL", 2), 120, 0, 2);
  if (Math.random() < .05) parts.push({ k: "c", x: rnd(10, 150), y: 110, vx: rnd(-.01, .01), vy: -.04, c: 0, s: 2, life: 1500 });
}
// refrain en 8-bit, ~8 s, transposé en do
const RICK_LEAD = [[67, 1], [69, 1], [72, 1], [69, 1], [76, 3], [76, 3], [74, 6], [67, 1], [69, 1], [72, 1], [69, 1], [74, 3], [74, 3], [72, 3], [71, 1], [69, 2], [67, 1], [69, 1], [72, 1], [69, 1], [72, 4], [74, 2], [71, 3], [69, 1], [67, 2], [0, 2], [67, 2], [74, 4], [72, 8]];
const RICK_BASS = [41, 43, 40, 45, 41, 43, 36, 36];
function playRick() {
  const c = sfx.ctx; if (!c) return () => {};
  const out = c.createGain(); out.gain.value = 1; out.connect(c.destination);
  const s16 = .133, t0 = c.currentTime + .08;
  const n = (f, t, d, type, v) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + d * .75); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g).connect(out); o.start(t); o.stop(t + d + .02); };
  const noise = (t, d, v, hp) => { const b = c.createBuffer(1, c.sampleRate * d, c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = "highpass"; f.frequency.value = hp; g.gain.value = v; s.connect(f).connect(g).connect(out); s.start(t); };
  for (let loop = 0; loop < 2; loop++) {
    const base = t0 + loop * 64 * s16;
    let k = 0; for (const [m, d] of RICK_LEAD) { if (m) n(mid(m), base + k * s16, d * s16 * .92, "square", .05); k += d; }
    RICK_BASS.forEach((m, half) => { for (let e = 0; e < 4; e++) n(mid(m + (e % 2 ? 12 : 0)), base + (half * 8 + e * 2) * s16, s16 * 1.8, "triangle", .09); });
    for (let beat = 0; beat < 16; beat++) { const t = base + beat * 4 * s16; if (beat % 2) noise(t, .12, .12, 1500); else n(60, t, .1, "square", .12); noise(t + 2 * s16, .03, .04, 6000); }
  }
  return () => { try { out.gain.setValueAtTime(0, c.currentTime); out.disconnect(); } catch {} };
}
async function rickroll() {
  if (rickOn) return;
  rickOn = true; egg("rickroll"); stopMusic(); sfx.init();
  const prev = view.mode, prevTb = tb.on, saved = waiter, prevHint = hintEl.textContent;
  tb.on = false;
  view.mode = "rick"; rickT = performance.now();
  const stop = playRick();
  setHint("B : stop");
  await Promise.race([sleep(17200), waitBtn("B", "START")]);
  stop(); waiter = saved; tb.on = prevTb; view.mode = prev; setHint(prevHint); rickOn = false;
}

/* photo en couleur (SELECT) */
let photoColor = false;
function showPhotoColor() { if (!photo) return; photoColor = true; $("#ov-img").src = photo.src; $("#ov-photo").classList.add("on"); }
function hidePhotoColor() { photoColor = false; $("#ov-photo").classList.remove("on"); }
$("#ov-photo").addEventListener("pointerdown", e => { e.stopPropagation(); hidePhotoColor(); });

/* ============================================================
   EASTER EGGS
   ============================================================ */
const EGGS = ["rickroll", "power", "star", "reset", "sudo", "vim", "yolo", "candles", "tea", "rm", "exit"];
const found = new Set(store.get("c22-gb-eggs", []).filter(k => EGGS.includes(k)));
function egg(k) {
  if (found.has(k)) return;
  found.add(k); store.set("c22-gb-eggs", [...found]);
  setTimeout(() => {
    sfx.seq([[1318, .06], [1760, .12]]);
    showToast(found.size === EGGS.length ? ["TOUS LES SECRETS", `${EGGS.length}/${EGGS.length} !`] : ["SECRET TROUVÉ", `${found.size}/${EGGS.length}`]);
    if (found.size === EGGS.length) { burst(120); sfx.fanfare(); }
  }, 300);
}
// interrupteur
$("#power").addEventListener("pointerdown", async e => {
  e.stopPropagation();
  if (view.mode === "off" || fx.off) return;
  fx.off = true; $("#power").classList.add("off"); $("#led").classList.remove("on"); sfx.beep(300, .3, .05, "sawtooth");
  await new Promise(r => setTimeout(r, 1400));
  fx.off = false; $("#power").classList.remove("off"); $("#led").classList.add("on"); sfx.ding();
  showToast(["IMPOSSIBLE D'ÉTEINDRE", "TES 18 ANS."], 2600); egg("power");
});
// ✻ du logo
let starN = 0, starTm;
$("#star").addEventListener("pointerdown", e => {
  e.stopPropagation(); sfx.blip(); starN++; clearTimeout(starTm); starTm = setTimeout(() => (starN = 0), 1500);
  if (starN >= 5) { starN = 0; $("#star").classList.add("wild"); burst(50); egg("star"); setTimeout(() => $("#star").classList.remove("wild"), 2400); }
});
function softReset() {
  const prev = view.mode, prevT = view.t0;
  view.mode = "boot"; view.t0 = performance.now(); setTimeout(() => sfx.ding(), 1700);
  setTimeout(() => { view.mode = prev; view.t0 = prevT; showToast(["SOFT RESET"]); egg("reset"); }, 3000);
}
async function melt() {
  snap.getContext("2d").drawImage(cv, 0, 0);
  const img = document.createElement("canvas"); img.width = W; img.height = H; img.getContext("2d").drawImage(cv, 0, 0);
  const d = []; let v = rnd(0, 200); for (let x = 0; x < W; x++) { v = Math.max(0, Math.min(400, v + rnd(-40, 40))); d.push(v); }
  fx.melt = { img, d, t0: performance.now() };
  sfx.beep(110, 1.4, .05, "sawtooth"); gbEl.classList.remove("shake"); void gbEl.offsetWidth; gbEl.classList.add("shake");
  await sleep(2200); fx.melt = null;
  egg("rm");
}

/* ============================================================
   CHAT FINAL (clavier façon écran de nom Pokémon)
   ============================================================ */
const KB = [
  "abcdefghij".split(""), "klmnopqrst".split(""),
  ["u", "v", "w", "x", "y", "z", "é", "-", "'", "."],
  ["/", "!", ":", "1", "8", "?", "␣", "␣", "⌫", "OK"],
];
const SLASH = ["/help", "/cost", "/model", "/status", "/doctor", "/init", "/compact", "/clear", "/vim", "/upgrade", "/exit"];
const chat = {
  on: false, buf: "", r: 0, c: 0, menu: false, msel: 0, busy: false, vim: false, abort: false,
  handle(b) {
    if (this.menu) {
      if (b === "UP" || b === "DOWN") { this.msel = (this.msel + (b === "DOWN" ? 1 : SLASH.length - 1)) % SLASH.length; sfx.blip(); }
      else if (b === "A" || b === "START") { this.menu = false; this.send(SLASH[this.msel]); }
      else if (b === "B" || b === "SELECT") this.menu = false;
      return true;
    }
    if (this.busy) { if (b === "B") this.abort = true; return true; }
    if (b === "UP") this.r = (this.r + 3) % 4;
    else if (b === "DOWN") this.r = (this.r + 1) % 4;
    else if (b === "LEFT") this.c = (this.c + 9) % 10;
    else if (b === "RIGHT") this.c = (this.c + 1) % 10;
    else if (b === "A") this.typeKey(KB[this.r][this.c]);
    else if (b === "B") this.buf = [...this.buf].slice(0, -1).join("");
    else if (b === "START") this.send();
    else if (b === "SELECT") { this.menu = true; this.msel = 0; }
    if (["UP", "DOWN", "LEFT", "RIGHT"].includes(b)) sfx.blip();
    return true;
  },
  typeKey(k) {
    if (k === "OK") return this.send();
    if (k === "⌫") { this.buf = [...this.buf].slice(0, -1).join(""); return; }
    if (len(this.buf) >= 60) return;
    this.buf += k === "␣" ? " " : k; sfx.tick();
  },
  tap(x, y) {
    if (this.menu) {
      const i = Math.floor((y - 16) / 9);
      if (x >= 36 && i >= 0 && i < SLASH.length) { this.menu = false; this.send(SLASH[i]); } else this.menu = false;
      return;
    }
    if (y >= 88 && y < 99) { nativeKbd(); return; }
    if (y >= 100) { this.r = Math.min(3, Math.floor((y - 100) / 11)); this.c = Math.min(9, Math.floor(x / 16)); this.typeKey(KB[this.r][this.c]); }
  },
  key(e) {
    if (e.key === "Enter") { this.menu ? this.handle("A") : this.send(); return true; }
    if (e.key === "Backspace") { this.buf = [...this.buf].slice(0, -1).join(""); return true; }
    if (e.key === "Escape") { if (this.busy) this.abort = true; this.menu = false; return true; }
    if (e.key === "Tab") { this.menu = !this.menu; this.msel = 0; return true; }
    if (e.key.startsWith("Arrow")) { this.handle(e.key.slice(5).toUpperCase()); return true; }
    if (e.key.length === 1 && !this.busy) { if (len(this.buf) < 60) { this.buf += e.key; sfx.tick(); } return true; }
    return false;
  },
  async send(forced) {
    const text = (forced ?? this.buf).trim();
    if (!forced) this.buf = "";
    if (!text || this.busy) return;
    this.busy = true; this.abort = false;
    try { await handleChat(text); } finally { this.busy = false; }
  },
};
function drawChat(now) {
  const blink = Math.floor(now / 400) % 2;
  rect(0, 88, W, 11, 2);
  const shown = chat.buf ? [...chat.buf].slice(-17).join("") : (chat.vim ? "-- INSERT --" : "");
  text("> " + shown, 3, 90, chat.buf || !chat.vim ? 0 : 1);
  if (blink && !chat.busy) rect(3 + (2 + len(shown)) * 8 + (chat.vim && !chat.buf ? -len(shown) * 8 : 0), 97, 7, 1, 0);
  rect(0, 99, W, 45, 0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
    const k = KB[r][c], x = c * 16, y = 100 + r * 11, sel = r === chat.r && c === chat.c;
    if (sel) rect(x + 1, y, 14, 11, 3);
    if (k === "OK") text("OK", x, y + 2, sel ? 0 : 3); else char(k, x + 4, y + 2, sel ? 0 : 3);
  }
  if (chat.menu) {
    const h = SLASH.length * 9 + 8;
    rect(32, 10, 128, h, 3); rect(33, 11, 126, h - 2, 0);
    SLASH.forEach((s, i) => { text(s, 46, 16 + i * 9); if (i === chat.msel) char("▶", 36, 16 + i * 9, 3); });
  }
  if (chat.busy) { const g = SPIN[Math.floor(now / 120) % SPIN.length]; text(g, 148, 90, 0); }
}
// clavier natif sur téléphone (toucher la ligne de saisie)
const kbdIn = document.createElement("input");
Object.assign(kbdIn, { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: false });
kbdIn.setAttribute("autocorrect", "off");
Object.assign(kbdIn.style, { position: "fixed", left: "-1000px", top: "0", opacity: "0", width: "1px", height: "1px", fontSize: "16px" });
document.body.append(kbdIn);
function nativeKbd() { kbdIn.value = chat.buf; kbdIn.focus(); }
kbdIn.addEventListener("input", () => { chat.buf = [...kbdIn.value].slice(0, 60).join(""); });
kbdIn.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); chat.send(); kbdIn.value = ""; kbdIn.blur(); } e.stopPropagation(); });

async function stream(str, c = 0) {
  const lines = wrap(str, 17);
  for (let i = 0; i < lines.length; i++) {
    const seg = ["", c];
    LOG.push({ segs: [[i ? "  " : "⏺ ", 0], seg], bg: null });
    for (const ch of lines[i]) { if (chat.abort) { seg[0] = lines[i]; break; } seg[0] += ch; await sleep(16); }
  }
}
async function chatThink(ms) {
  const g = ["✻", 0], tx = ["", 0], line = { segs: [g, tx], bg: null };
  LOG.push(line);
  const t0 = performance.now(), verbs = ["Infusing", "Mijote", "Cogite", "Glougloute", "Compile"], v = verbs[Math.random() * verbs.length | 0];
  while (performance.now() - t0 < ms && !chat.abort) { const el = performance.now() - t0; g[0] = SPIN[Math.floor(el / 120) % SPIN.length]; tx[0] = ` ${v}… ${Math.floor(el / 1000)}s`; await new Promise(r => setTimeout(r, 60)); }
  LOG.splice(LOG.indexOf(line), 1);
  if (chat.abort) { await log("Interrupted by user", "res", 0); sfx.err(); return false; }
  return true;
}
const res = (s, g = 40) => log(s, "res", g);
const pre = async (lines, g = 60) => { for (const l of lines) await log(l, "plain", g); };

async function handleChat(text) {
  const q = text.toLowerCase();
  if (chat.vim && /^:(q|q!|wq|x)$/.test(q)) { await log(text, "prompt", 0); chat.vim = false; egg("vim"); return res("Sorti de vim. Beaucoup n'y arrivent jamais."); }
  if (text.startsWith("!")) { await log(text.slice(1).trim(), "bash", 0); return shell(text.slice(1).trim()); }
  if (text.startsWith("/")) { await log(text, "prompt", 0); return slash(q.split(" ")[0]); }
  if (/^:(q|q!|wq)$/.test(q)) { await log(text, "prompt", 0); return res("Tu n'es pas dans vim. Pas encore."); }
  await log(text, "prompt", 0);
  return ask(text, q);
}

async function slash(k) {
  switch (k) {
    case "/help": return pre(["Claude Code 18.0.0", "", "Écris un message,", "START pour envoyer.", "SELECT : commandes", "! : mode bash"]);
    case "/cost": return pre(["Total cost: $0.00", "API: 18y 0d 0h", "Changes: +9 -2", "thé froid: 24 L"]);
    case "/model": return pre(["▶ Constantin 18.0 ✓", "  Opus", "  Sonnet", "  Haiku", "", "La 17.x n'est plus", "supportée."]);
    case "/status": { const d = Date.now() - BIRTHDAY; return pre(["Version: 18.0.0", "Model: Constantin", "Plan: Claude Pro ×2", `Majeur: ${Math.floor(d / 864e5)}j ${Math.floor(d / 36e5) % 24}h`]); }
    case "/doctor": return pre(["✓ Constantin 18.0.0", "✓ Majeur", "✗ Thé froid: stock", "  critique", "✗ Sommeil: absent"]);
    case "/init": await log("Write(CLAUDE.md)", "tool"); await res("Wrote 6 lines"); return pre(["# Constantin", "- 18 ans", "- Carburant: thé", "  froid citron", "- Commits: 1 mot", "- Pas de chaise à", "  sa portée"]);
    case "/compact": fx.squash = performance.now() + 700; await sleep(700); await res("Compacted."); return log("Résumé : Constantin a 18 ans. Il boit du thé froid. Fin.", "dim");
    case "/clear": { const saved = LOG.splice(0); await sleep(1300); LOG.push(...saved); return stream("Non. On garde tout."); }
    case "/vim": chat.vim = !chat.vim; return res(chat.vim ? "Vim mode on. Bonne chance pour sortir." : "Vim mode off.");
    case "/upgrade": return res("Tu as déjà deux Claude Pro. Max, ce sera pour tes 19 ans.");
    case "/exit": return exitScene();
    default: return log(`Unknown command: ${k}`, "err", 0);
  }
}
async function exitScene() {
  await log("Bye!", "dim", 300);
  await fadeTo(1, 400);
  chat.on = false; view.mode = "room"; pl.x = 16; pl.y = 48; pl.dir = "down"; pcOn = false;
  await fadeTo(0, 400);
  await sleep(500);
  await walkTo([[16, 64]]); pl.dir = "up"; await sleep(500);
  await say("…non. CONSTANTIN retourne au PC.");
  await walkTo([[16, 48]]); pl.dir = "up";
  pcOn = true; sfx.seq([[523, .08], [784, .08], [1046, .15]]);
  await say("claude --continue");
  view.mode = "term"; chat.on = true;
  egg("exit");
  return stream("Re. On ne quitte pas la session le jour de ses 18 ans.");
}
async function yolo() {
  view.invert = true; gbEl.style.transition = "transform .4s"; gbEl.style.transform = "rotate(-4deg)";
  sfx.err(); egg("yolo");
  await log("⚠ Bypass permissions", "err", 0);
  setTimeout(() => { view.invert = false; gbEl.style.transform = ""; }, 6000);
  return stream("Plus aucune permission ne sera demandée. Ça se calme dans 6 secondes.");
}
async function tea() {
  egg("tea"); teaRain(30); sfx.seq([[880, .08], [660, .08], [440, .15]]);
  await log('Bash(migros stock "thé froid")', "tool", 0);
  await res("0 en stock");
  return stream("Constantin est passé avant toi.");
}
async function candles() {
  await stream("Une seule tentative.");
  view.mode = "cake"; cakeT = performance.now(); cakeOut = 0;
  await sleep(1500);
  await say("Souffle ! (A)");
  cakeOut = performance.now(); sfx.beep(200, .5, .03, "sawtooth");
  await sleep(1800); sfx.fanfare(); burst(80); egg("candles");
  await sleep(1500);
  view.mode = "term";
}
async function shell(c) {
  const q = c.toLowerCase();
  if (/^(ls|ll|ls -la|ls -l)$/.test(q)) return pre(["CLAUDE.md", "Constantin.swift", "photos/  souvenirs/", "redeem.mp4"]);
  if (/^ls (photos|souvenirs)/.test(q)) return pre(q.includes("photos") ? PHOTOS.map(p => p.name) : JOKES.map(j => j.file.split("/").pop()));
  if (/^cat .*constantin/.test(q)) return pre(["struct Constantin {", " age = 18", " isAdult = true", " drink = .théFroid", " iceTea = .tooMuch", "}"]);
  if (/^cat .*souvenirs/.test(q)) return pre(JOKES.map(j => j.text));
  if (/redeem|rick|never gonna/.test(q)) { await res("Opening redeem.mp4…"); await rickroll(); return log(RICK_CAPTION, "dim", 0); }
  if (/^git log/.test(q)) return pre(["7b18c22 18", "a1f0c18 fix", "9e2b7d4 fix", "4c51e09 fix stuff", "0d3a6f2 wip"]);
  if (/^git push.*(-f|--force)/.test(q)) return pre(["! [rejected]", "Pas le jour de son", "anniversaire."]);
  if (/^git /.test(q)) return pre(["On branch main", "nothing to commit"]);
  if (/^sudo\b/.test(q)) { egg("sudo"); sfx.err(); return pre(["Password:", "constantin is not in", "the sudoers file.", "This incident will", "be reported.", "", "(à Hugo)"]); }
  if (/^rm\s+-\w*r/.test(q)) { await res(`rm: removing ${c.split(/\s+/).pop()}`); await melt(); return stream("Restauré depuis Time Machine. Ne refais pas ça."); }
  if (/^(vim?|nvim|nano|emacs)\b/.test(q)) { chat.vim = true; return res(q.startsWith("vi") || q.startsWith("nv") ? "-- INSERT --" : "Ici, on utilise vim."); }
  if (q === "whoami") return pre(["constantin"]);
  if (q === "pwd") return pre(["~/anniv-constantin"]);
  if (q === "uptime") return pre(["up 18 years, 0 days"]);
  if (q === "date") return pre([new Date().toLocaleDateString("fr-CH")]);
  if (/^echo /.test(q)) return pre([c.slice(5)]);
  if (/^swift build/.test(q)) return pre(["Build complete!", "(18.00s)"]);
  if (/^xcodebuild/.test(q)) return log("Xcode a cessé de répondre.", "err", 0);
  if (/^(exit|logout)$/.test(q)) return exitScene();
  if (q === "clear") return slash("/clear");
  if (/^claude\b.*(dangerously|yolo)/.test(q)) return yolo();
  if (/^claude\b/.test(q)) return res("Tu es déjà dedans.");
  if (/th[eé] ?froid|ice ?tea|migros/.test(q)) return tea();
  return pre([`zsh: command not found: ${c.split(/\s+/)[0]}`]);
}
let defI = 0;
const DEFAULTS = ["C'est ton anniversaire. Je ne travaille pas aujourd'hui.", "Noté. Je transmets à Hugo. (Non.)", "J'y réfléchis jusqu'à tes 19 ans.", "Reformule, mais avec un thé froid à la main."];
async function ask(text, q) {
  if (!(await chatThink(rnd(900, 2000)))) return;
  if (/rick|never gonna|redeem/.test(q)) { await stream("Ok."); await rickroll(); return log(RICK_CAPTION, "dim", 0); }
  if (/dangerously|yolo/.test(q)) return yolo();
  if (/th[eé] ?froid|ice ?tea|migros/.test(q)) return tea();
  if (/bougie|souffle|g[aâ]teau|candle/.test(q)) return candles();
  if (/^(rm|sudo|ls|cat|git|vim|echo|pwd|whoami|uptime|date|swift|xcodebuild)\b/.test(q)) { await log(`Bash(${text})`, "tool", 0); return shell(text); }
  if (/cadeau|gift|lien/.test(q)) return stream("Un deuxième Claude Pro. Le bon est passé plus haut. Tape « redeem » pour le revoir.");
  if (/merci|thanks|thx/.test(q)) return stream("Remercie Hugo. Moi j'ai juste tapé.");
  if (/^(salut|hello|hey|yo|coucou|bonjour|slt|wesh)/.test(q)) return stream("Salut Constantin. Joyeux anniversaire.");
  if (/qui es|t'es qui|tu es qui|who are you/.test(q)) return stream("Claude. Celui à qui tu demandes tout, toutes les quatre minutes.");
  if (/hugo/.test(q)) return stream("Il a écrit le prompt. J'ai fait le reste. Comme d'habitude.");
  if (/ha[iï]ku|po[eè]me|poem/.test(q)) return stream("Dix-huit bougies\nun thé froid à la main\ngit commit -m fix");
  if (/explique|c'est quoi|what is this/.test(q)) return stream("Un site que Hugo a fait pour tes 18 ans. Avec moi. Il y a des secrets dedans. Je n'en dirai pas plus.");
  if (/bug|fix|swift|code/.test(q)) return stream("Pas aujourd'hui. Le seul bug, c'est iceTea = .tooMuch.");
  if (/je t'aime|love you|ily/.test(q)) return stream("Je suis un modèle de langage. Mais c'est réciproque.");
  if (/âge|age|vieux|18/.test(q)) return stream("18 ans. Plus vieux que Swift, qui en a 12. Respect.");
  if (/blague|joke/.test(q)) return stream("Un dev Swift entre dans un bar. Xcode plante. Fin.");
  if (/pokemon|pokémon|game ?boy/.test(q)) return stream("CONSTANTIN utilise CLAUDE. C'est super efficace !");
  return stream(DEFAULTS[defI++ % DEFAULTS.length]);
}

async function enterChat() {
  view.mode = "term";
  await say("La session est à toi. START pour envoyer, SELECT pour les commandes.");
  chat.on = true;
  store.set("c22-gb-seen", true);
  setHint("START envoyer · SELECT commandes");
}

/* ============================================================
   LANCEMENT
   ============================================================ */
const skip = $("#skip");
if (store.get("c22-gb-seen", false)) skip.hidden = false;
skip.addEventListener("pointerdown", e => { e.stopPropagation(); location.hash = "chat"; location.reload(); });

async function main() {
  await (document.fonts ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve()).catch(() => {});
  requestAnimationFrame(render);
  if (location.hash.includes("chat")) {
    setHint("Appuie sur START", true);
    if (!AUTO) await waitBtn("A", "B", "START", "SELECT");
    await powerOn(); skip.hidden = true;
    view.mode = "term"; LOG.length = 0;
    await log("✻ Claude Code", "title", 0); await log("cwd: ~/anniv", "dim", 0); await log("", "plain", 0);
    return enterChat();
  }
  setHint("Appuie sur START", true);
  await waitBtn("A", "B", "START", "SELECT");
  await powerOn(); skip.hidden = true;
  await boot();
  await title();
  await town();
  await room();
  await session();
  await enterChat();
}
main();
window.__gb = { view, chat, LOG, press, found };
})();

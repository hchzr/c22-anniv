// Intro façon jeu Game Boy : on allume, écran titre, Constantin rentre chez lui,
// va au PC… et bam, Claude Code. Tout est dessiné à la main en 160×144, 4 couleurs.
(() => {
  const root = document.getElementById("intro");
  if (!root) return;

  const W = 160, H = 144;
  const P = ["#e0f8d0", "#88c070", "#346856", "#081820"];
  const OFF = "#7b8a63";
  const cv = document.getElementById("gbscreen");
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const hint = document.getElementById("intro-hint");
  const led = document.getElementById("led");

  /* ---------- dessin ---------- */
  const rect = (x, y, w, h, c) => { ctx.fillStyle = P[c]; ctx.fillRect(x, y, w, h); };
  const norm = rows => rows.map(r => (r + "................").slice(0, 16));
  function sprite(rows, x, y, flip = false, s = 1) {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < 16; i++) {
      const ch = rows[j][flip ? 15 - i : i];
      if (ch !== ".") { ctx.fillStyle = P[+ch]; ctx.fillRect(x + i * s, y + j * s, s, s); }
    }
  }

  // Texte : police pixel rendue hors écran puis seuillée, pour rester net en 4 couleurs.
  const tcache = new Map();
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function txt(str, x, y, c = 3, s = 1) {
    if (!str) return;
    const key = str + "|" + c;
    let o = tcache.get(key);
    if (!o) {
      o = document.createElement("canvas"); o.width = str.length * 8 + 2; o.height = 9;
      const ox = o.getContext("2d");
      ox.font = '8px "Press Start 2P"'; ox.textBaseline = "top"; ox.fillStyle = "#000"; ox.fillText(str, 0, 0);
      const id = ox.getImageData(0, 0, o.width, o.height), d = id.data, [r, g, b] = rgb(P[c]);
      for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] > 100 ? 255 : 0; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
      ox.putImageData(id, 0, 0); tcache.set(key, o);
    }
    ctx.drawImage(o, Math.round(x), Math.round(y), o.width * s, o.height * s);
  }
  const center = (str, s = 1) => Math.round((W - str.length * 8 * s) / 2);

  /* ---------- sprites ---------- */
  const BODY = {
    down: norm([
      "................",
      ".....333333.....",
      "....32222223....",
      "...3222222223...",
      "...3222222223...",
      "...3322222233...",
      "...3300000033...",
      "...3030000303...",
      "....30000003....",
      ".....333333.....",
      "....31111113....",
      "...3311221133...",
      "...3011221103...",
      "....31111113....",
    ]),
    up: norm([
      "................",
      ".....333333.....",
      "....32222223....",
      "...3222222223...",
      "...3222222223...",
      "...3222222223...",
      "...3322222233...",
      "....32222223....",
      "....33222233....",
      ".....333333.....",
      "....31111113....",
      "...3311111133...",
      "...3011111103...",
      "....31111113....",
    ]),
    left: norm([
      "................",
      ".....33333......",
      "....3222223.....",
      "...322222223....",
      "...322222223....",
      "...332222223....",
      "...300322223....",
      "...303032223....",
      "....30000333....",
      ".....33333......",
      ".....311113.....",
      "....3311113.....",
      "....3011113.....",
      ".....311113.....",
    ]),
  };
  const LEGS = {
    front: [norm(["....322..223....", "....333..333...."]), norm(["....322..333....", "....333........."]), norm(["....333..223....", ".........333...."])],
    side: [norm([".....3223.......", ".....3333......."]), norm(["....3223.33.....", "....333..33....."]), norm([".....33.3223....", ".....33.3333...."])],
  };
  function player(x, y, dir, step) {
    const side = dir === "left" || dir === "right";
    const body = BODY[side ? "left" : dir];
    const legs = LEGS[side ? "side" : "front"][step];
    const rows = body.concat(legs);
    sprite(rows, x, y - (step ? 1 : 0), dir === "right");
  }
  const TREE = norm([
    ".....333333.....",
    "...3322222233...",
    "..322121212223..",
    ".32212121212123.",
    ".32121212121223.",
    "3221212121212223",
    "3212121212121213",
    "3221212121212223",
    ".32212121212223.",
    ".33222222222233.",
    "..333322223333..",
    "......3223......",
    "......3113......",
    "......3223......",
    ".....332233.....",
    "....33333333....",
  ]);
  const STAR = ["...3...", ".3.3.3.", "..333..", "3333333", "..333..", ".3.3.3.", "...3..."];
  function star(x, y, c = 3) {
    STAR.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === "3") rect(x + i, y + j, 1, 1, c); }));
  }

  /* ---------- décors ---------- */
  function grass(x, y) {
    rect(x, y, 16, 16, 0);
    ctx.fillStyle = P[1];
    for (const [a, b] of [[2, 3], [3, 2], [4, 3], [10, 9], [11, 8], [12, 9], [6, 13], [7, 12], [8, 13]]) ctx.fillRect(x + a, y + b, 1, 1);
  }
  function flower(x, y, t) {
    const o = Math.floor(t / 24) % 2;
    rect(x + 4 + o, y + 4, 3, 3, 2); rect(x + 9 - o, y + 9, 3, 3, 2);
    rect(x + 5 + o, y + 5, 1, 1, 0); rect(x + 10 - o, y + 10, 1, 1, 0);
  }
  function fence(x, y) {
    rect(x, y + 5, 16, 2, 3); rect(x, y + 10, 16, 2, 3);
    rect(x + 2, y + 2, 3, 12, 3); rect(x + 3, y + 3, 1, 10, 1);
    rect(x + 10, y + 2, 3, 12, 3); rect(x + 11, y + 3, 1, 10, 1);
  }
  function drawTown(t, doorOpen) {
    for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) grass(x, y);
    rect(72, 72, 16, 72, 0);
    rect(32, 112, 96, 16, 0);
    for (let y = 0; y < H; y += 16) { sprite(TREE, 0, y); sprite(TREE, 144, y); }
    sprite(TREE, 16, 0); sprite(TREE, 128, 0); sprite(TREE, 16, 16); sprite(TREE, 128, 16);
    // maison
    rect(96, 6, 8, 12, 3); rect(97, 7, 6, 11, 2);
    for (let r = 0; r < 24; r += 4) { rect(42 + r / 2, 16 + r, 76 - r, 4, 2); rect(42 + r / 2, 19 + r, 76 - r, 1, 3); }
    rect(42, 16, 76, 1, 3);
    rect(48, 40, 64, 32, 0);
    for (let r = 45; r < 72; r += 6) rect(49, r, 62, 1, 1);
    rect(48, 40, 1, 32, 3); rect(111, 40, 1, 32, 3); rect(48, 71, 64, 1, 3); rect(48, 40, 64, 1, 3);
    for (const wx of [54, 94]) { rect(wx, 46, 12, 10, 3); rect(wx + 1, 47, 10, 8, 1); rect(wx + 1, 47, 4, 3, 0); rect(wx + 6, 47, 1, 8, 3); }
    rect(72, 52, 16, 20, 3);
    if (!doorOpen) { rect(74, 54, 12, 17, 2); rect(75, 55, 10, 2, 1); rect(84, 62, 1, 2, 0); }
    // panneau
    rect(122, 58, 14, 9, 3); rect(123, 59, 12, 7, 0); rect(125, 61, 8, 1, 2); rect(125, 63, 6, 1, 2); rect(128, 67, 2, 6, 3);
    // barrières et fleurs
    for (const fx of [16, 32, 48, 96, 112, 128]) fence(fx, 92);
    for (const [fx, fy] of [[32, 72], [112, 76], [24, 128], [120, 128], [96, 104], [48, 104]]) flower(fx, fy, t);
  }
  function drawRoom(pcOn, t) {
    rect(0, 0, W, 32, 1);
    for (let x = 0; x < W; x += 8) rect(x, 0, 1, 30, 2);
    rect(56, 6, 26, 18, 3); rect(57, 7, 24, 16, 0); rect(68, 7, 2, 16, 3); rect(57, 14, 24, 2, 3);
    rect(0, 30, W, 2, 3);
    rect(0, 32, W, 112, 0);
    for (let y = 32; y < H; y += 8) {
      rect(0, y + 7, W, 1, 1);
      for (let x = (y / 8) % 2 ? 0 : 16; x < W; x += 32) rect(x, y, 1, 7, 1);
    }
    // bureau + PC
    rect(4, 26, 40, 22, 3); rect(5, 27, 38, 20, 2); rect(5, 27, 38, 3, 1);
    rect(10, 10, 24, 20, 3); rect(12, 12, 20, 14, pcOn ? 0 : 2);
    if (pcOn) { if (Math.floor(t / 15) % 2) star(18, 15); rect(14, 23, 16, 1, 1); }
    else { rect(13, 14, 4, 1, 1); rect(13, 17, 8, 1, 1); }
    rect(18, 30, 8, 2, 3); rect(12, 33, 20, 4, 3); rect(13, 34, 18, 2, 1);
    // télé + console
    rect(60, 52, 28, 16, 3); rect(61, 53, 26, 14, 2);
    rect(64, 36, 20, 17, 3); rect(66, 38, 16, 12, 1); rect(67, 39, 5, 3, 0);
    rect(66, 58, 10, 5, 3); rect(67, 59, 8, 3, 1);
    // lit
    rect(124, 60, 30, 48, 3); rect(125, 61, 28, 46, 0); rect(129, 64, 20, 9, 1); rect(125, 78, 28, 29, 1);
    for (let y = 82; y < 106; y += 6) rect(126, y, 26, 1, 2);
    // plante
    rect(140, 40, 12, 10, 3); rect(141, 41, 10, 8, 2);
    rect(138, 30, 6, 10, 2); rect(146, 28, 6, 12, 2); rect(142, 26, 6, 14, 3);
    // paillasson
    rect(64, 128, 32, 16, 2); rect(66, 130, 28, 12, 1);
    for (let x = 68; x < 94; x += 4) rect(x, 131, 1, 10, 2);
  }
  function textbox(l1, l2, arrow) {
    rect(0, 96, W, 48, 0);
    rect(2, 98, 156, 44, 3); rect(3, 99, 154, 42, 0);
    rect(5, 101, 150, 38, 3); rect(6, 102, 148, 36, 0);
    txt(l1, 12, 110); txt(l2, 12, 126);
    if (arrow) { rect(144, 132, 7, 1, 3); rect(145, 133, 5, 1, 3); rect(146, 134, 3, 1, 3); rect(147, 135, 1, 1, 3); }
  }

  /* ---------- musique (mélodie originale) ---------- */
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const LEAD = [76, 74, 72, 74, 76, 79, 76, 72, 74, 76, 77, 76, 74, 0, 74, 0, 72, 74, 76, 72, 69, 72, 74, 76, 77, 76, 74, 71, 72, 0, 72, 0];
  const BASS = [48, 55, 48, 55, 48, 55, 52, 55, 53, 60, 53, 60, 55, 62, 55, 62, 48, 55, 48, 55, 45, 52, 45, 52, 53, 60, 55, 62, 48, 55, 48, 55];
  let music = null;
  function startMusic() {
    const c = sfx.ctx; if (!c || !sfx.on || music) return;
    const beat = .2; let next = c.currentTime + .1, i = 0;
    const tick = () => {
      while (next < c.currentTime + .6) {
        const l = LEAD[i % LEAD.length], b = BASS[i % BASS.length];
        if (l) note(N(l), next, beat * .9, "square", .025);
        if (b) note(N(b), next, beat * .95, "triangle", .06);
        next += beat; i++;
      }
    };
    tick(); music = setInterval(tick, 150);
  }
  function stopMusic() { clearInterval(music); music = null; }
  function note(f, t, d, type, vol) {
    const c = sfx.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + d * .7); g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  }
  const beep = (f, d = .06, v = .04, type = "square") => { if (sfx.on && sfx.ctx) note(f, sfx.ctx.currentTime, d, type, v); };

  /* ---------- scènes ---------- */
  let state = "off", t = 0, st = 0;
  const go = s => { state = s; st = 0; };
  let px = 72, py = 128, dir = "up", step = 0, walkT = 0, path = [], pcOn = false;
  let dialog = null, typed = 0, waitA = false;
  const MSGS = [
    ["CONSTANTIN allume", "le PC."],
    ["Connexion a", "CLAUDE CODE..."],
  ];
  let msgI = 0;

  function walk() {
    if (!path.length) { step = 0; return true; }
    const [tx, ty] = path[0], sp = .75;
    const dx = tx - px, dy = ty - py;
    if (Math.abs(dx) > 0) { dir = dx > 0 ? "right" : "left"; px += Math.sign(dx) * Math.min(sp, Math.abs(dx)); }
    else if (Math.abs(dy) > 0) { dir = dy > 0 ? "down" : "up"; py += Math.sign(dy) * Math.min(sp, Math.abs(dy)); }
    if (px === tx && py === ty) path.shift();
    walkT++; step = Math.floor(walkT / 8) % 4 === 1 ? 1 : Math.floor(walkT / 8) % 4 === 3 ? 2 : 0;
    return false;
  }

  function update() {
    t++; st++;
    switch (state) {
      case "boot":
        if (st === 112) { beep(1046.5, .08, .05); setTimeout(() => beep(2093, .5, .05), 90); }
        if (st > 190) go("title");
        break;
      case "town-in":
        if (st === 1) { px = 72; py = 128; dir = "up"; path = [[72, 56]]; startMusic(); }
        if (walk()) { beep(220, .12, .05, "square"); go("fade-out"); }
        break;
      case "fade-out":
        if (st > 36) { go("room"); px = 72; py = 124; dir = "up"; path = [[72, 88], [16, 88], [16, 48]]; }
        break;
      case "room":
        if (st > 24 && walk()) { dir = "up"; step = 0; openMsg(0); }
        break;
      case "dialog":
        if (typed < 40 && st % 2 === 0) {
          const full = (dialog[0] + dialog[1]).length;
          if (typed < full) { typed++; if (typed % 2) beep(880, .02, .015); }
          else if (!waitA) { waitA = true; hint.textContent = "A ›"; hint.hidden = false; autoT = setTimeout(press, 2200); }
        }
        break;
      case "bam":
        if (st === 1) { stopMusic(); beep(130, .4, .07, "sawtooth"); }
        if (st === 10) finish();
        break;
    }
  }
  let autoT;
  function openMsg(i) { msgI = i; dialog = MSGS[i]; typed = 0; waitA = false; go("dialog"); }

  function render() {
    switch (state) {
      case "off": ctx.fillStyle = OFF; ctx.fillRect(0, 0, W, H); break;
      case "boot": {
        rect(0, 0, W, H, 0);
        const y = Math.min(64, -16 + st * .75);
        star(52, y + 1); txt("Claude", 62, y);
        break;
      }
      case "title": {
        rect(0, 0, W, H, 0);
        rect(0, 0, W, 54, 3);
        txt("CONSTANTIN", center("CONSTANTIN"), 10, 0);
        txt("18 ANS", center("18 ANS", 2), 24, 0, 2);
        rect(0, 54, W, 2, 2);
        const rows = BODY.down.concat(LEGS.front[Math.floor(t / 30) % 2 ? 0 : 0]);
        sprite(rows, 56, 62, false, 3);
        if (Math.floor(t / 32) % 2 === 0) txt("PRESS START", center("PRESS START"), 116);
        txt("2026 HUGO", center("2026 HUGO"), 132, 2);
        break;
      }
      case "town-in": drawTown(t, py <= 60); if (py > 58) player(px, py, dir, step); break;
      case "fade-out": {
        drawTown(t, true);
        ctx.globalAlpha = Math.min(1, st / 30); rect(0, 0, W, H, 0); ctx.globalAlpha = 1;
        break;
      }
      case "room": {
        drawRoom(pcOn, t); player(px, py, dir, step);
        if (st < 24) { ctx.globalAlpha = 1 - st / 24; rect(0, 0, W, H, 0); ctx.globalAlpha = 1; }
        break;
      }
      case "dialog": {
        drawRoom(pcOn, t); player(px, py, "up", 0);
        const l1 = dialog[0].slice(0, typed), l2 = dialog[1].slice(0, Math.max(0, typed - dialog[0].length));
        textbox(l1, l2, waitA && Math.floor(t / 20) % 2 === 0);
        break;
      }
      case "bam": rect(0, 0, W, H, st % 4 < 2 ? 0 : 3); break;
    }
  }

  /* ---------- entrées ---------- */
  function press() {
    clearTimeout(autoT);
    if (state === "off") {
      sfx.on = true; sfx.init();
      led.classList.add("on"); hint.hidden = true; go("boot");
    } else if (state === "boot" && st > 120) go("title");
    else if (state === "title") { beep(1318, .05); beep(1760, .1); hint.hidden = true; go("town-in"); }
    else if (state === "dialog") {
      const full = (dialog[0] + dialog[1]).length;
      if (typed < full) { typed = full; return; }
      hint.hidden = true;
      if (msgI === 0) { pcOn = true; beep(523, .08); setTimeout(() => beep(784, .08), 90); setTimeout(() => beep(1046, .15), 180); openMsg(1); }
      else go("bam");
    }
  }
  root.addEventListener("click", e => { if (!e.target.closest("#intro-skip")) press(); });
  addEventListener("keydown", e => {
    if (!document.getElementById("intro")) return;
    if (["Enter", " ", "a", "A", "x", "z", "ArrowRight"].includes(e.key)) { e.preventDefault(); press(); }
  });

  let finished = false;
  function finish(instant) {
    if (finished) return; finished = true;
    stopMusic(); clearTimeout(autoT);
    const done = () => { root.remove(); window.enterClaude && window.enterClaude(); };
    if (instant) return done();
    root.classList.add("zoom");
    setTimeout(() => { root.classList.add("gone"); done(); }, 950);
  }
  const skip = document.getElementById("intro-skip");
  try { if (JSON.parse(localStorage.getItem("c22-seen"))) skip.hidden = false; } catch {}
  skip.addEventListener("click", e => { e.stopPropagation(); sfx.on = true; sfx.init(); finish(true); });

  /* ---------- boucle à pas fixe ---------- */
  let last = performance.now(), acc = 0;
  function loop(now) {
    if (finished) return;
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) { update(); acc -= 1000 / 60; }
    render();
    requestAnimationFrame(loop);
  }
  (document.fonts ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve()).finally(() => requestAnimationFrame(loop));
})();

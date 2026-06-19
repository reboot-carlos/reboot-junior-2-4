/* ============================================================
   GAMES — Mini-jeux canvas (Dinosaure · Serpent · Tetris)
   ============================================================ */

const GAMES = (() => {
  let canvas, ctx, loopId, _key, _click;

  function _init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
  }

  function _cleanup() {
    if (loopId)  { cancelAnimationFrame(loopId); loopId = null; }
    if (_key)    { document.removeEventListener('keydown', _key);   _key = null; }
    if (_click)  { canvas && canvas.removeEventListener('click', _click); _click = null; }
  }

  function launch(name) {
    if (!canvas) _init();
    _cleanup();
    const titles = { dinosaure: '🦕 Dinosaure', serpent: '🐍 Serpent', tetris: '🧩 Tetris' };
    const el = document.getElementById('jeu-titre');
    if (el) el.textContent = titles[name] || '🎮 Jeu';
    switch (name) {
      case 'dinosaure': _dino();   break;
      case 'serpent':   _snake();  break;
      case 'tetris':    _tetris(); break;
    }
  }

  function stop() { _cleanup(); }

  // ── helpers ──────────────────────────────────────────────────
  function _txt(t, x, y, size, color, align) {
    ctx.fillStyle = color || '#fff';
    ctx.font = `bold ${size || 16}px monospace`;
    ctx.textAlign = align || 'center';
    ctx.fillText(t, x, y);
  }
  function _box(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

  // ── DINOSAURE ────────────────────────────────────────────────
  function _dino() {
    canvas.width = 520; canvas.height = 260;
    const W = 520, H = 260, GY = 205;

    let d = { x: 60, y: GY - 60, w: 36, h: 60, vy: 0, ground: true };
    let obs = [], score = 0, speed = 4, spawnIn = 80, frame = 0, over = false;

    function jump() {
      if (d.ground && !over) { d.vy = -13; d.ground = false; }
      if (over) reset();
    }
    function reset() {
      d.y = GY - 60; d.vy = 0; d.ground = true;
      obs = []; score = 0; speed = 4; spawnIn = 80; frame = 0; over = false;
    }

    _key   = e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    _click = () => jump();
    document.addEventListener('keydown', _key);
    canvas.addEventListener('click', _click);

    function tick() {
      loopId = requestAnimationFrame(tick);
      frame++;
      _box(0, 0, W, H, '#1a1a2e');
      _box(0, GY, W, 4, '#7B5EA7');
      _box(0, GY + 4, W, H - GY - 4, '#111');

      if (!over) {
        d.vy += 0.55; d.y += d.vy;
        if (d.y >= GY - d.h) { d.y = GY - d.h; d.vy = 0; d.ground = true; }

        if (--spawnIn <= 0) {
          const h = 28 + Math.random() * 36;
          obs.push({ x: W, y: GY - h, w: 18, h });
          spawnIn = 55 + Math.floor(Math.random() * 55);
        }
        for (let i = obs.length - 1; i >= 0; i--) {
          obs[i].x -= speed;
          if (obs[i].x + obs[i].w < 0) { obs.splice(i, 1); continue; }
          if (d.x + 4 < obs[i].x + obs[i].w && d.x + d.w - 4 > obs[i].x &&
              d.y + 4 < obs[i].y + obs[i].h && d.y + d.h > obs[i].y) over = true;
        }
        score++;
        if (score % 400 === 0) speed += 0.5;
      }

      // dino
      _box(d.x, d.y + 18, d.w, d.h - 18, '#7B5EA7');
      _box(d.x + 8, d.y, 28, 22, '#7B5EA7');
      _box(d.x + 24, d.y + 5, 5, 5, '#FFD700');
      if (d.ground) {
        const a = frame % 18 < 9 ? 10 : 0;
        _box(d.x + 4,  GY - 12, 9, 12 + a, '#5C3D7A');
        _box(d.x + 20, GY - 12, 9, 12 + (a ? 0 : 10), '#5C3D7A');
      }
      // cactus
      for (const o of obs) {
        _box(o.x, o.y, o.w, o.h, '#4CAF50');
        _box(o.x - 7, o.y + 8, 7, 12, '#4CAF50');
        _box(o.x + o.w, o.y + 12, 7, 10, '#4CAF50');
      }

      _txt(Math.floor(score / 10), W - 12, 28, 18, '#FFD700', 'right');
      if (score < 30) _txt('Espace / Clic pour sauter', W / 2, H - 8, 12, '#555');
      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
        _txt('GAME OVER', W / 2, H / 2 - 16, 30, '#FF6B6B');
        _txt('Score : ' + Math.floor(score / 10), W / 2, H / 2 + 18, 18, '#FFD700');
        _txt('Clic ou Espace pour rejouer', W / 2, H / 2 + 48, 13, '#aaa');
      }
    }
    tick();
  }

  // ── SERPENT ──────────────────────────────────────────────────
  function _snake() {
    const SZ = 20, COLS = 20, ROWS = 20;
    canvas.width = COLS * SZ; canvas.height = ROWS * SZ;
    const W = canvas.width, H = canvas.height;

    let body, dir, nDir, food, score, over, spd, last, elapsed;

    function spawn() {
      let p;
      do { p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
      while (body.some(s => s.x === p.x && s.y === p.y));
      food = p;
    }
    function reset() {
      body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      dir = { x: 1, y: 0 }; nDir = { x: 1, y: 0 };
      score = 0; over = false; spd = 150; last = 0; elapsed = 0;
      spawn();
    }
    function step() {
      dir = nDir;
      const h = { x: (body[0].x + dir.x + COLS) % COLS, y: (body[0].y + dir.y + ROWS) % ROWS };
      if (body.some(s => s.x === h.x && s.y === h.y)) { over = true; return; }
      body.unshift(h);
      if (h.x === food.x && h.y === food.y) { score++; if (spd > 60) spd -= 5; spawn(); }
      else body.pop();
    }

    _key   = e => {
      const m = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
      const nd = m[e.code];
      if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) { nDir = nd; e.preventDefault(); }
      if (e.code === 'Space' && over) reset();
    };
    _click = () => { if (over) reset(); };
    document.addEventListener('keydown', _key);
    canvas.addEventListener('click', _click);

    reset();

    function tick(ts) {
      loopId = requestAnimationFrame(tick);
      if (!over) {
        elapsed += ts - (last || ts); last = ts;
        if (elapsed >= spd) { step(); elapsed = 0; }
      }
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          _box(c * SZ, r * SZ, SZ, SZ, (c + r) % 2 === 0 ? '#1a1a2e' : '#1d1d33');
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath(); ctx.arc(food.x*SZ+SZ/2, food.y*SZ+SZ/2, SZ/2-2, 0, Math.PI*2); ctx.fill();
      body.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#7B5EA7' : `hsl(140,60%,${30 + (1 - i / body.length) * 25}%)`;
        ctx.fillRect(s.x*SZ+1, s.y*SZ+1, SZ-2, SZ-2);
        if (i === 0) {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(s.x*SZ+4, s.y*SZ+4, 4, 4);
          ctx.fillRect(s.x*SZ+12, s.y*SZ+4, 4, 4);
        }
      });
      _txt('🍎 ' + score, W / 2, 18, 16, '#FFD700');
      if (!over && score === 0) _txt('↑↓←→ pour bouger', W / 2, H - 6, 11, '#444');
      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(0, 0, W, H);
        _txt('GAME OVER', W / 2, H / 2 - 18, 30, '#FF6B6B');
        _txt('Score : ' + score, W / 2, H / 2 + 16, 20, '#FFD700');
        _txt('Clic ou Espace pour rejouer', W / 2, H / 2 + 50, 13, '#aaa');
      }
    }
    tick(0);
  }

  // ── TETRIS ───────────────────────────────────────────────────
  function _tetris() {
    const BS = 24, COLS_T = 10, ROWS_T = 20;
    const BW = COLS_T * BS, BH = ROWS_T * BS, PW = 100;
    canvas.width = BW + PW; canvas.height = BH;

    const PIECES = [
      { s: [[1,1,1,1]],            c: '#00f0f0' },
      { s: [[1,1],[1,1]],           c: '#f0f000' },
      { s: [[0,1,0],[1,1,1]],       c: '#a000f0' },
      { s: [[0,1,1],[1,1,0]],       c: '#00f000' },
      { s: [[1,1,0],[0,1,1]],       c: '#f00000' },
      { s: [[1,0,0],[1,1,1]],       c: '#0000f0' },
      { s: [[0,0,1],[1,1,1]],       c: '#f0a000' },
    ];

    let board, piece, next, score, lines, level, over, dtimer, dint, last;

    function mkBoard() { return Array.from({ length: ROWS_T }, () => Array(COLS_T).fill(0)); }
    function rnd() {
      const p = PIECES[Math.floor(Math.random() * PIECES.length)];
      return { s: p.s.map(r => [...r]), c: p.c, x: Math.floor(COLS_T / 2) - Math.floor(p.s[0].length / 2), y: 0 };
    }
    function rot(s) { return s[0].map((_, c) => s.map(r => r[c]).reverse()); }
    function ok(s, px, py) {
      for (let r = 0; r < s.length; r++) for (let c = 0; c < s[r].length; c++) {
        if (!s[r][c]) continue;
        const nx = px + c, ny = py + r;
        if (nx < 0 || nx >= COLS_T || ny >= ROWS_T) return false;
        if (ny >= 0 && board[ny][nx]) return false;
      }
      return true;
    }
    function place() {
      for (let r = 0; r < piece.s.length; r++) for (let c = 0; c < piece.s[r].length; c++) {
        if (!piece.s[r][c]) continue;
        if (piece.y + r < 0) { over = true; return; }
        board[piece.y + r][piece.x + c] = piece.c;
      }
      let cl = 0;
      for (let r = ROWS_T - 1; r >= 0;) {
        if (board[r].every(c => c)) { board.splice(r, 1); board.unshift(Array(COLS_T).fill(0)); cl++; } else r--;
      }
      score += ([0, 100, 300, 500, 800][cl] || 0) * level;
      lines += cl; level = Math.floor(lines / 10) + 1; dint = Math.max(100, 800 - (level - 1) * 70);
      piece = next; next = rnd();
      if (!ok(piece.s, piece.x, piece.y)) over = true;
    }
    function reset() {
      board = mkBoard(); next = rnd(); piece = rnd();
      score = 0; lines = 0; level = 1; over = false; dtimer = 0; dint = 800; last = 0;
    }

    _key   = e => {
      if (over) { if (e.code === 'Space') reset(); return; }
      if (e.code === 'ArrowLeft')  { if (ok(piece.s, piece.x - 1, piece.y)) piece.x--; e.preventDefault(); }
      if (e.code === 'ArrowRight') { if (ok(piece.s, piece.x + 1, piece.y)) piece.x++; e.preventDefault(); }
      if (e.code === 'ArrowDown')  { if (ok(piece.s, piece.x, piece.y + 1)) piece.y++; else place(); e.preventDefault(); }
      if (e.code === 'ArrowUp')    { const r = rot(piece.s); if (ok(r, piece.x, piece.y)) piece.s = r; e.preventDefault(); }
      if (e.code === 'Space')      { while (ok(piece.s, piece.x, piece.y + 1)) piece.y++; place(); e.preventDefault(); }
    };
    _click = () => { if (over) reset(); };
    document.addEventListener('keydown', _key);
    canvas.addEventListener('click', _click);

    reset();

    function draw() {
      const W = canvas.width, H = canvas.height;
      _box(0, 0, W, H, '#0d0d1a');
      _box(0, 0, BW, BH, '#111122');
      ctx.strokeStyle = '#1a1a33'; ctx.lineWidth = 0.5;
      for (let r = 0; r <= ROWS_T; r++) { ctx.beginPath(); ctx.moveTo(0, r*BS); ctx.lineTo(BW, r*BS); ctx.stroke(); }
      for (let c = 0; c <= COLS_T; c++) { ctx.beginPath(); ctx.moveTo(c*BS, 0); ctx.lineTo(c*BS, BH); ctx.stroke(); }
      for (let r = 0; r < ROWS_T; r++) for (let c = 0; c < COLS_T; c++) if (board[r][c]) {
        ctx.fillStyle = board[r][c]; ctx.fillRect(c*BS+1, r*BS+1, BS-2, BS-2);
        ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(c*BS+2, r*BS+2, BS-4, 4);
      }
      // ghost
      let gy = piece.y; while (ok(piece.s, piece.x, gy + 1)) gy++;
      for (let r = 0; r < piece.s.length; r++) for (let c = 0; c < piece.s[r].length; c++) {
        if (!piece.s[r][c]) continue;
        ctx.fillStyle = 'rgba(255,255,255,.08)';
        ctx.fillRect((piece.x+c)*BS+1, (gy+r)*BS+1, BS-2, BS-2);
      }
      // active piece
      for (let r = 0; r < piece.s.length; r++) for (let c = 0; c < piece.s[r].length; c++) {
        if (!piece.s[r][c]) continue;
        ctx.fillStyle = piece.c; ctx.fillRect((piece.x+c)*BS+1, (piece.y+r)*BS+1, BS-2, BS-2);
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect((piece.x+c)*BS+2, (piece.y+r)*BS+2, BS-4, 4);
      }
      // side panel
      const PX = BW + 6;
      _txt('SCORE',   PX+47,  28, 10, '#888');  _txt(String(score),  PX+47,  46, 14, '#FFD700');
      _txt('LIGNES',  PX+47,  74, 10, '#888');  _txt(String(lines),  PX+47,  90, 14, '#FFD700');
      _txt('NIVEAU',  PX+47, 118, 10, '#888');  _txt(String(level),  PX+47, 134, 16, '#7B5EA7');
      _txt('SUIVANT', PX+47, 162, 10, '#888');
      const nb = 16, nox = PX + 8, noy = 172;
      for (let r = 0; r < next.s.length; r++) for (let c = 0; c < next.s[r].length; c++) {
        if (!next.s[r][c]) continue; ctx.fillStyle = next.c; ctx.fillRect(nox+c*nb, noy+r*nb, nb-2, nb-2);
      }
      _txt('↑ Rotation',  PX+47, BH-80, 9, '#444');
      _txt('← → Bouger', PX+47, BH-66, 9, '#444');
      _txt('↓ Descend',  PX+47, BH-52, 9, '#444');
      _txt('Espace Drop', PX+47, BH-38, 9, '#444');
      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(0, 0, BW, BH);
        _txt('GAME OVER', BW/2, BH/2-16, 26, '#FF6B6B');
        _txt('Score : ' + score, BW/2, BH/2+18, 18, '#FFD700');
        _txt('Espace pour rejouer', BW/2, BH/2+50, 12, '#aaa');
      }
    }

    function tick(ts) {
      loopId = requestAnimationFrame(tick);
      if (!over) {
        const dt = ts - (last || ts); last = ts; dtimer += dt;
        if (dtimer >= dint) { dtimer = 0; if (ok(piece.s, piece.x, piece.y+1)) piece.y++; else place(); }
      }
      draw();
    }
    tick(0);
  }

  return { launch, stop };
})();

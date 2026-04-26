'use strict';
const { W, H, ROAD_W, GRAVEL, STEP } = BB;

BB.Road = class {
  constructor(rng) {
    this.a1 = 55 + rng() * 45;
    this.a2 = 15 + rng() * 25;
    this.p1 = 2800 + rng() * 2200;
    this.p2 = 900  + rng() * 700;
    this.f1 = rng() * Math.PI * 2;
    this.f2 = rng() * Math.PI * 2;
    this.scroll = 0;
    this.dist   = 0;

    // PixiJS container + graphics (riusato ogni frame)
    this.container = new PIXI.Container();
    this._gfx = new PIXI.Graphics();
    this.container.addChild(this._gfx);
  }

  _curve(d) {
    const off = this.a1 * Math.sin(d / this.p1 + this.f1)
              + this.a2 * Math.sin(d / this.p2 + this.f2);
    const max = (W - ROAD_W) / 2 - 20;
    return Math.max(-max, Math.min(max, off));
  }

  centerAt(sy) {
    return W / 2 + this._curve(this.dist + (H - 100 - sy));
  }

  update(dt, spd) {
    this.scroll = (this.scroll + spd * dt) % 240;
    this.dist  += spd * dt;
  }

  edgesAt(sy) {
    const cx = this.centerAt(sy);
    return { l: cx - ROAD_W / 2, r: cx + ROAD_W / 2 };
  }

  edges() { return this.edgesAt(H - 100); }

  onRoad(b) {
    const { l, r } = this.edges();
    return b.x >= l + 10 && b.x + b.w <= r - 10;
  }

  // ─── DISEGNO ──────────────────────────────────────────────────────────────
  draw() {
    const g = this._gfx;
    g.clear();

    const rows = Math.ceil(H / STEP) + 2;
    const cx   = new Float32Array(rows);
    for (let i = 0; i < rows; i++) cx[i] = this.centerAt(i * STEP);

    // erba (sfondo)
    g.rect(0, 0, W, H).fill(0x227822);

    // strisce erba alternate
    for (let y = -40 + this.scroll % 80; y < H + 40; y += 80) {
      g.rect(0, y, W, 40).fill(0x2d912d);
    }

    // asfalto + ghiaia (riga per riga)
    for (let i = 0; i < rows - 1; i++) {
      const y  = i * STEP;
      const le = cx[i] - ROAD_W / 2;
      const re = cx[i] + ROAD_W / 2;
      const sh = STEP + 1;

      g.rect(le,        y, ROAD_W, sh).fill(0x585858); // asfalto
      g.rect(le,        y, GRAVEL, sh).fill(0x948062); // ghiaia sx
      g.rect(re - GRAVEL, y, GRAVEL, sh).fill(0x948062); // ghiaia dx
    }

    // linee bordo strada (bianche) - polyline aperte, non poligoni chiusi
    g.moveTo(cx[0] - ROAD_W / 2 + GRAVEL, 0);
    for (let i = 1; i < rows; i++) g.lineTo(cx[i] - ROAD_W / 2 + GRAVEL, i * STEP);
    g.stroke({ width: 2, color: 0xffffff });

    g.moveTo(cx[0] + ROAD_W / 2 - GRAVEL, 0);
    for (let i = 1; i < rows; i++) g.lineTo(cx[i] + ROAD_W / 2 - GRAVEL, i * STEP);
    g.stroke({ width: 2, color: 0xffffff });

    // linea centrale tratteggiata (gialla) - raccoglie tutti i tratti in un unico path
    const phase = this.scroll % 60;
    let dashStarted = false;
    for (let i = 0; i < rows - 1; i++) {
      const y    = i * STEP;
      const yRel = ((y - phase) % 60 + 60) % 60;
      if (yRel >= 30) { dashStarted = false; continue; }
      if (!dashStarted) { g.moveTo(cx[i], y); dashStarted = true; }
      g.lineTo(cx[i + 1], y + STEP);
    }
    g.stroke({ width: 3, color: 0xffdd00 });
  }
};

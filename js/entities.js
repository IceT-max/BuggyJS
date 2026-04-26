'use strict';
const { W, BF } = BB;

// ─── CHECKPOINT FLAG ──────────────────────────────────────────────────────────
BB.Flag = class {
  constructor(road, y, textures) {
    const e   = road.edges();
    this.rl   = e.l;
    this.rr   = e.r;
    this.y    = y;

    // colore casuale per questa flag
    const [r, g, b] = BB.hsvToRgb(Math.random() * 360, 0.9, 1.0);
    this._col = BB.rgbToHex(r, g, b);

    // ─── PixiJS: due pali + banner via Graphics ──────────────────────────
    this.container = new PIXI.Container();
    this._gfx = new PIXI.Graphics();
    this.container.addChild(this._gfx);
  }

  get gate() {
    return { x: this.rl + 12, y: this.y - 20, w: this.rr - this.rl - 24, h: 40 };
  }

  update(dt, spd) { this.y += spd * dt; }

  draw() {
    const g  = this._gfx;
    const lx = this.rl + 10;
    const rx = this.rr - 10;
    const iy = this.y;
    g.clear();

    // pali
    g.rect(lx - 1, iy - 44, 4, 54).fill(0xffffff);
    g.rect(rx - 1, iy - 44, 4, 54).fill(0xffffff);

    // banner orizzontale
    g.rect(lx + 2, iy - 42, rx - lx - 4, 18).fill(this._col);
    g.rect(lx + 2, iy - 42, rx - lx - 4, 18)
     .stroke({ width: 1, color: 0x000000 });

    // gagliardetti sui pali
    g.poly([lx, iy - 44, lx + 18, iy - 35, lx, iy - 26]).fill(this._col);

    // posiziona container
    this.container.x = 0;
    this.container.y = 0;
  }
};

// ─── BONUS FLAG ───────────────────────────────────────────────────────────────
BB.BonusFlag = class {
  constructor(x, y, type, textures) {
    this.x    = x;
    this.y    = y;
    this.type = type;

    this.sprite = new PIXI.Sprite(textures.bonus_flag);
    this.sprite.anchor.set(0, 1);   // ancora in basso-sinistra del palino
    this.sprite.tint = BF.COL[type];
  }

  get bounds() { return { x: this.x, y: this.y - BF.PH - 2, w: 14, h: 13 }; }

  update(dt, spd) {
    this.y          += spd * dt;
    this.sprite.x    = this.x;
    this.sprite.y    = this.y;
  }
};

// ─── BUMPER (rampa salto) ─────────────────────────────────────────────────────
BB.Bumper = class {
  constructor(x, y, textures) {
    this.x = x;
    this.y = y;

    this.sprite = new PIXI.Sprite(textures.bumper);
    this.sprite.anchor.set(0.5);
    this.sprite.width  = 52;
    this.sprite.height = 22;
  }

  get bounds() { return { x: this.x - 26, y: this.y - 11, w: 52, h: 22 }; }

  update(dt, spd) {
    this.y        += spd * dt;
    this.sprite.x  = this.x;
    this.sprite.y  = this.y;
  }
};

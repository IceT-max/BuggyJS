'use strict';
const { W, H, PL_W, PL_H, MAX_SPD } = BB;

BB.Player = class {
  constructor(textures) {
    this.x       = W / 2;
    this.y       = H - 100;
    this.spd     = 80;
    this.sliding = false;
    this.slideT  = 0;
    this.slideVX = 0;
    this.jumping = false;
    this.jumpT   = 0;
    this.jumpDur = 0;
    this.jumpPeak= 0;
    this.crashAnim  = false;
    this.crashT     = 0;
    this.crashAngle = 0;
    this._parts = [];

    // ─── PixiJS container ───────────────────────────────────────────────────
    this.container = new PIXI.Container();

    // ombra (Graphics)
    this._shadow = new PIXI.Graphics();
    this.container.addChild(this._shadow);

    // scia scivolamento
    this._slideFx = new PIXI.Graphics();
    this.container.addChild(this._slideFx);

    // sprite buggy
    this._sprite = new PIXI.Sprite(textures.buggy);
    this._sprite.anchor.set(0.5);
    this.container.addChild(this._sprite);

    // pool sprite particelle crash (14 max)
    this._particleContainer = new PIXI.Container();
    this.container.addChild(this._particleContainer);
    this._partSprites = [];
    for (let i = 0; i < 14; i++) {
      const s = new PIXI.Sprite(textures.particle);
      s.anchor.set(0.5);
      s.visible = false;
      this._particleContainer.addChild(s);
      this._partSprites.push(s);
    }

    this._textures = textures;
  }

  get bounds() { return { x: this.x - PL_W / 2, y: this.y - PL_H / 2, w: PL_W, h: PL_H }; }
  get jumpH()  { return this.jumping ? Math.sin(this.jumpT / this.jumpDur * Math.PI) * this.jumpPeak : 0; }

  startJump(spd) {
    this.jumping = true;
    this.jumpT   = 0;
    const t = spd / MAX_SPD;
    this.jumpDur  = 0.4 + t * 1.0;
    this.jumpPeak = 40  + t * 30;
  }

  update(dt, keys, road) {
    if (this.jumping) {
      this.jumpT += dt;
      if (this.jumpT >= this.jumpDur) { this.jumping = false; this.jumpT = 0; }
      this.spd = Math.max(this.spd - 40 * dt, 0);
      return;
    }
    const up = keys.has('ArrowUp')    || keys.has('KeyW');
    const dn = keys.has('ArrowDown')  || keys.has('KeyS');
    if      (up) this.spd = Math.min(this.spd + 180 * dt, MAX_SPD);
    else if (dn) this.spd = Math.max(this.spd - 280 * dt, 0);
    else         this.spd = Math.max(this.spd -  40 * dt, 0);

    if (this.sliding) {
      this.slideT -= dt;
      if (this.slideT <= 0) { this.sliding = false; this.slideVX = 0; }
      let dx = 0;
      if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
      this.x += dx * 230 * 0.20 * dt + this.slideVX * dt;
      this.slideVX *= Math.pow(0.08, dt);
    } else {
      let dx = 0;
      if (keys.has('ArrowLeft')  || keys.has('KeyA')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
      this.x += dx * 230 * dt;
    }
    this.x = Math.max(PL_W / 2 + 2, Math.min(W - PL_W / 2 - 2, this.x));
  }

  updateCrash(dt) {
    if (!this.crashAnim) return;
    this.crashT    += dt;
    this.crashAngle = (this.crashT / 1.4) * 720;
    for (let i = this._parts.length - 1; i >= 0; i--) {
      const p = this._parts[i];
      p.life -= dt;
      if (p.life <= 0) { this._parts.splice(i, 1); continue; }
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 180 * dt;
      p.vx *= Math.pow(0.3, dt);
    }
    if (this.crashT >= 1.4) this.crashAnim = false;
  }

  startCrash() {
    this.crashAnim  = true;
    this.crashT     = 0;
    this.crashAngle = 0;
    this._spawnParts();
  }

  startSlide() {
    this.spd     *= 0.55;
    this.sliding  = true;
    this.slideT   = 1.6;
    this.slideVX  = (Math.random() * 2 - 1) * 110;
  }

  reset() {
    this.spd = 80; this.sliding = false; this.slideT = 0; this.slideVX = 0;
    this.jumping = false; this.jumpT = 0;
    this.crashAnim = false; this._parts = [];
    this.x = W / 2;
  }

  _spawnParts() {
    const cols = [0xdc3c14, 0xffc800, 0x8c8c8c, 0x3c3c3c, 0x643714];
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 180;
      const l = 0.5 + Math.random() * 0.8;
      this._parts.push({
        x: this.x + Math.random() * 20 - 10,
        y: this.y + Math.random() * 20 - 10,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60,
        life: l, ml: l,
        col: cols[Math.floor(Math.random() * cols.length)],
      });
    }
  }

  draw(crashed) {
    const g  = this._shadow;
    const sf = this._slideFx;
    const sp = this._sprite;
    g.clear();
    sf.clear();

    // ─── Particelle crash (pool di sprite riutilizzati) ────────────────────
    this._partSprites.forEach(s => { s.visible = false; });
    for (let i = 0; i < this._parts.length && i < this._partSprites.length; i++) {
      const p = this._parts[i];
      const s = this._partSprites[i];
      s.x     = p.x;
      s.y     = p.y;
      s.tint  = p.col;
      s.alpha = (p.life / p.ml) * 0.86;
      s.visible = true;
    }

    if (this.crashAnim) {
      // rotazione + scala durante crash
      const prog = this.crashT / 1.4;
      const sc   = 1 + Math.sin(prog * Math.PI) * 0.55;
      sp.x     = this.x;
      sp.y     = this.y;
      sp.angle = this.crashAngle;
      sp.scale.set(sc);
      sp.tint  = 0xdc5028;
      sp.visible = true;
      return;
    }

    // lampeggio durante penalità
    if (crashed && Math.floor(Date.now() / 150) % 2 === 0) {
      sp.visible = false;
      return;
    }
    sp.visible = true;
    sp.angle   = 0;
    sp.scale.set(1);
    sp.tint    = this.sliding ? 0xb4a028 : 0xffffff;

    const jh = this.jumpH;
    sp.x = this.x;
    sp.y = this.y - jh;

    // ombra durante salto
    if (this.jumping) {
      const h  = jh / this.jumpPeak;
      const sc = 1 + h * 0.6;
      g.ellipse(this.x, this.y + PL_H / 2 - 2, (PL_W / 2 + 4) * sc, 7)
       .fill({ color: 0x000000, alpha: (80 * (1 - h * 0.55)) / 255 });
    }

    // scia scivolamento
    if (this.sliding) {
      sf.moveTo(this.x - 4, this.y + PL_H / 2)
        .lineTo(this.x - 6, this.y + PL_H / 2 + 18)
        .stroke({ width: 3, color: 0x141414, alpha: 0.31 });
      sf.moveTo(this.x + 4, this.y + PL_H / 2)
        .lineTo(this.x + 6, this.y + PL_H / 2 + 18)
        .stroke({ width: 3, color: 0x141414, alpha: 0.31 });
    }
  }
};

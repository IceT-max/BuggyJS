'use strict';
const { ST, PH, BF, W, H } = BB;

BB.Engine = class {
  constructor(aud, stage, textures) {
    this._aud      = aud;
    this._stage    = stage;
    this._textures = textures;

    // layer ordinati per depth
    this._roadLayer   = new PIXI.Container();
    this._worldLayer  = new PIXI.Container();
    this._playerLayer = new PIXI.Container();
    stage.addChild(this._roadLayer, this._worldLayer, this._playerLayer);

    this.road    = null;
    this.player  = null;
    this.obs     = [];
    this.flags   = [];
    this.bumpers = [];
    this.bflags  = [];

    this.score      = 0;
    this.lives      = 3;
    this.phase      = PH.PLAY;
    this.diff       = 1;
    this.cpTimer    = 0;
    this.cpExpired  = false;
    this.dist       = 0;
    this.nextObs    = 200;
    this.nextFlag   = 3500;
    this.nextBump   = 1000;
    this.nextBF     = 180;
    this.crashT     = 0;
    this.bonusT     = 0;
    this.bonusTxt   = null;
    this.bonusCol   = 0xffffff;
    this.fcnt       = [0, 0, 0, 0, 0];

    this._rng = null;
  }

  get cpLimit() {
    return this.diff === 2 ? 60 : this.diff === 3 ? 45 : this.diff === 4 ? 30 : 0;
  }

  reset(diff = 1) {
    this.diff = Math.max(1, Math.min(4, diff));

    // pulisci world layer
    this._worldLayer.removeChildren();
    this._playerLayer.removeChildren();
    this._roadLayer.removeChildren();

    // stato
    this.score = 0; this.lives = 3; this.phase = PH.PLAY;
    this.cpExpired = false; this.cpTimer = this.cpLimit; this.dist = 0;
    this.nextObs = 200; this.nextFlag = 3500; this.nextBump = 1000; this.nextBF = 180;
    this.bonusT = 0; this.bonusTxt = null; this.fcnt = [0, 0, 0, 0, 0];
    this.obs = []; this.flags = []; this.bumpers = []; this.bflags = [];

    this._rng    = BB.lcg(Date.now());
    this.road    = new BB.Road(this._rng);
    this.player  = new BB.Player(this._textures);

    this._roadLayer.addChild(this.road.container);
    this._playerLayer.addChild(this.player.container);

    this._aud.startEngine();
    this._aud.startMusic();
  }

  update(dt, keys) {
    if (this.phase === PH.OVER) return;

    if (this.phase === PH.CRASH) {
      this.player.updateCrash(dt);
      this.crashT -= dt;
      if (this.crashT <= 0) {
        this.phase = this.lives > 0 ? PH.PLAY : PH.OVER;
        if (this.phase === PH.PLAY) {
          this.player.reset();
          this._aud.startEngine();
          if (this.cpExpired) this.cpTimer = this.cpLimit;
          this.cpExpired = false;
        }
      }
      return;
    }

    // conto alla rovescia checkpoint
    if (this.diff > 1) {
      const prev = this.cpTimer;
      this.cpTimer -= dt;
      if (this.cpTimer <= 0) { this.cpExpired = true; this._crash(); return; }
      if (this.cpTimer <= 5 && Math.floor(prev) !== Math.floor(this.cpTimer))
        this._aud.playTick();
    }

    if (this.bonusT > 0) { this.bonusT -= dt; if (this.bonusT <= 0) this.bonusTxt = null; }

    const spd = this.player.spd;
    this.dist += spd * dt;
    this._aud.updateSpeed(spd);
    this.road.update(dt, spd);
    this.player.update(dt, keys, this.road);
    this.score += Math.floor(spd * dt * 0.06);

    this._spawn();
    this._updateEnts(dt, spd);
    this._collide();
  }

  _spawn() {
    const rng = this._rng;

    if (this.dist >= this.nextObs) {
      const { l, r } = this.road.edgesAt(-60);
      const x  = l + 22 + rng() * (r - l - 44);
      const rv = rng();
      const t  = rv < .22 ? 0 : rv < .44 ? 1 : rv < .55 ? 2 : rv < .78 ? 3 : 4;
      const ob = new BB.Obstacle(x, -60, t, this._textures);
      this.obs.push(ob);
      this._worldLayer.addChild(ob.sprite);
      const gap = Math.max(70, 240 - this.dist * 0.0015);
      this.nextObs = this.dist + gap * (0.7 + rng() * 0.6);
    }

    if (this.dist >= this.nextFlag) {
      const fl = new BB.Flag(this.road, -120, this._textures);
      this.flags.push(fl);
      this._worldLayer.addChild(fl.container);
      this.nextFlag = this.dist + 4500 + rng() * 4000;
    }

    if (this.dist >= this.nextBump) {
      const { l, r } = this.road.edgesAt(-60);
      const bmp = new BB.Bumper(l + 30 + rng() * (r - l - 60), -60, this._textures);
      this.bumpers.push(bmp);
      this._worldLayer.addChild(bmp.sprite);
      this.nextBump = this.dist + 1800 + rng() * 2200;
    }

    if (this.dist >= this.nextBF) {
      const rv = rng() * 100; let acc = 0, tp = 0;
      for (let i = 0; i < BF.W.length; i++) { acc += BF.W[i]; if (rv < acc) { tp = i; break; } }
      const { l, r } = this.road.edgesAt(-60);
      const bf = new BB.BonusFlag(l + 20 + rng() * (r - l - 40), -60, tp, this._textures);
      this.bflags.push(bf);
      this._worldLayer.addChild(bf.sprite);
      this.nextBF = this.dist + 250 + rng() * 350;
    }
  }

  _updateEnts(dt, spd) {
    const cull = H + 80;
    const _cull = (arr) => arr.filter(e => {
      e.update(dt, spd);
      if (e.y >= cull) {
        // rimuovi sprite dallo stage
        if (e.sprite)    this._worldLayer.removeChild(e.sprite);
        if (e.container) this._worldLayer.removeChild(e.container);
        return false;
      }
      return true;
    });
    this.obs     = _cull(this.obs);
    this.flags   = _cull(this.flags);
    this.bumpers = _cull(this.bumpers);
    this.bflags  = _cull(this.bflags);
  }

  _collide() {
    if (this.player.jumping) return;
    const pb = this.player.bounds;
    if (!this.road.onRoad(pb)) { this._crash(); return; }

    for (let i = this.bumpers.length - 1; i >= 0; i--) {
      if (!BB.rectsHit(this.bumpers[i].bounds, pb)) continue;
      this.player.startJump(this.player.spd);
      this._aud.playJump();
      this._worldLayer.removeChild(this.bumpers[i].sprite);
      this.bumpers.splice(i, 1);
      return;
    }

    for (let i = this.obs.length - 1; i >= 0; i--) {
      const o = this.obs[i];
      if (!BB.rectsHit(o.bounds, pb)) continue;
      if (o.solid) { this._crash(); return; }
      if (!this.player.sliding) {
        this.player.startSlide();
        o.type === 3 ? this._aud.playSplash() : this._aud.playSlide();
        this._worldLayer.removeChild(o.sprite);
        this.obs.splice(i, 1);
      }
    }

    for (let i = this.flags.length - 1; i >= 0; i--) {
      if (BB.rectsHit(this.flags[i].gate, pb)) {
        this.score += 500;
        this._aud.playCheckpoint();
        this.cpTimer = this.cpLimit;
        this._worldLayer.removeChild(this.flags[i].container);
        this.flags.splice(i, 1);
      }
    }

    for (let i = this.bflags.length - 1; i >= 0; i--) {
      if (!BB.rectsHit(this.bflags[i].bounds, pb)) continue;
      this._collectBF(this.bflags[i].type);
      this._worldLayer.removeChild(this.bflags[i].sprite);
      this.bflags.splice(i, 1);
    }
  }

  _collectBF(t) {
    this.score += BF.PTS[t];
    this.fcnt[t]++;
    if (this.fcnt[t] >= 5) {
      this.fcnt[t] = 0;
      this.score  += BF.BONUS[t];
      this.bonusTxt = `+${BF.BONUS[t].toLocaleString()}  BONUS ${BF.NAME[t]}!`;
      this.bonusCol = BF.COL[t];
      this.bonusT   = 2.5;
      this._aud.playBonus();
    } else {
      this._aud.playCollect();
    }
  }

  _crash() {
    this.lives--;
    this.phase  = PH.CRASH;
    this.crashT = 2.0;
    // rimuovi ostacoli dalla scena
    for (const o of this.obs) this._worldLayer.removeChild(o.sprite);
    this.obs = [];
    this.player.startCrash();
    this._aud.stopEngine();
    this._aud.playCrash();
  }

  draw() {
    this.road.draw();
    for (const f of this.flags)   f.draw();
    this.player.draw(this.phase === PH.CRASH);
  }
};

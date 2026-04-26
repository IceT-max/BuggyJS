(function () {
'use strict';
const { OBS_SIZES } = BB;

BB.Obstacle = class {
  constructor(x, y, type, textures, wScale = 1) {
    this.x    = x;
    this.y    = y;
    this.type = type;

    const base = OBS_SIZES[type];
    this._sz = wScale === 1 ? base : { w: base.w * wScale, h: base.h };

    this.sprite = new PIXI.Sprite(textures[_obsKey(type)]);
    this.sprite.anchor.set(0.5);
    this.sprite.width  = this._sz.w;
    this.sprite.height = this._sz.h;
  }

  get sz()     { return this._sz; }
  get bounds() { const s = this._sz; return { x: this.x - s.w / 2, y: this.y - s.h / 2, w: s.w, h: s.h }; }
  get solid()  { return this.type <= 2; }

  update(dt, spd) {
    this.y += spd * dt;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
};

function _obsKey(type) {
  return ['rock', 'log', 'barrel', 'puddle', 'oil'][type];
}

})();

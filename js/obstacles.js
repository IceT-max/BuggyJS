(function () {
'use strict';
const { OBS_SIZES } = BB;

BB.Obstacle = class {
  constructor(x, y, type, textures) {
    this.x    = x;
    this.y    = y;
    this.type = type;

    const sz = OBS_SIZES[type];
    // sprite centrato sulle coordinate logiche
    this.sprite = new PIXI.Sprite(textures[_obsKey(type)]);
    this.sprite.anchor.set(0.5);
    this.sprite.width  = sz.w;
    this.sprite.height = sz.h;
  }

  get sz()     { return OBS_SIZES[this.type]; }
  get bounds() { const s = this.sz; return { x: this.x - s.w / 2, y: this.y - s.h / 2, w: s.w, h: s.h }; }
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

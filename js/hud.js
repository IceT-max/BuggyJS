(function () {
'use strict';
const { W, H, MAX_SPD, BF, PH } = BB;

const _MONO = 'monospace';
const _WHITE = 0xffffff;

function _txt(text, size, bold, color = _WHITE) {
  return new PIXI.Text({
    text,
    style: {
      fontFamily: _MONO,
      fontSize:   size,
      fontWeight: bold ? 'bold' : 'normal',
      fill:       color,
    },
  });
}

BB.HUD = class {
  constructor(stage) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);

    // score
    this._score = _txt('SCORE  000000', 22, true);
    this._score.x = 10; this._score.y = 8;
    this.container.addChild(this._score);

    // vite
    this._lives = _txt('♥♥♥', 22, true);
    this._lives.anchor.set(1, 0);
    this._lives.x = W - 10; this._lives.y = 8;
    this.container.addChild(this._lives);

    // timer checkpoint
    this._timer = _txt('', 20, true);
    this._timer.anchor.set(0.5, 0);
    this._timer.x = W / 2; this._timer.y = 8;
    this.container.addChild(this._timer);

    // velocità km/h
    this._speed = _txt('0 km/h', 12, false, 0x8888ff);
    this._speed.anchor.set(1, 1);
    this._speed.x = W - 10; this._speed.y = H - 20;
    this.container.addChild(this._speed);

    // difficoltà
    this._diff = _txt('', 12, false, 0x888888);
    this._diff.anchor.set(0.5, 1);
    this._diff.x = W / 2; this._diff.y = H - 20;
    this.container.addChild(this._diff);

    // bandierine bonus
    this._bfTexts = [];
    const tierCols = [0xe03232, 0xe0e0e0, 0x9b37c8, 0x2d69dc, 0x23af3c];
    for (let i = 0; i < 5; i++) {
      const t = _txt('☆☆☆☆☆', 12, true, tierCols[i]);
      t.x = 10; t.y = H - 90 + i * 16;
      this.container.addChild(t);
      this._bfTexts.push(t);
    }

    // testo bonus
    this._bonusTxt = _txt('', 24, true, 0xffffff);
    this._bonusTxt.anchor.set(0.5, 0.5);
    this._bonusTxt.x = W / 2; this._bonusTxt.y = H / 2 - 50;
    this._bonusTxt.visible = false;
    this.container.addChild(this._bonusTxt);

    // overlay game over (Graphics + testi)
    this._overGfx = new PIXI.Graphics();
    this.container.addChild(this._overGfx);

    this._overTitle = _txt('GAME OVER', 52, true, 0xdc3232);
    this._overTitle.anchor.set(0.5, 0);
    this._overTitle.x = W / 2; this._overTitle.y = H / 2 - 50;
    this._overTitle.visible = false;
    this.container.addChild(this._overTitle);

    this._overScore = _txt('', 18, false, _WHITE);
    this._overScore.anchor.set(0.5, 0);
    this._overScore.x = W / 2; this._overScore.y = H / 2 + 5;
    this._overScore.visible = false;
    this.container.addChild(this._overScore);

    this._overCont = _txt('INVIO per continuare', 16, false, 0xaaaaaa);
    this._overCont.anchor.set(0.5, 0);
    this._overCont.x = W / 2; this._overCont.y = H / 2 + 35;
    this._overCont.visible = false;
    this.container.addChild(this._overCont);
  }

  update(eng) {
    const dnames = ['', 'FACILE', 'NORMALE', 'DIFFICILE', 'ESPERTO'];
    const isOver = eng.phase === PH.OVER;

    // score
    this._score.text = `SCORE  ${String(eng.score).padStart(6, '0')}`;

    // vite
    this._lives.text = '♥'.repeat(Math.max(0, eng.lives));

    // timer
    if (eng.diff > 1 && !isOver) {
      const t = Math.max(0, eng.cpTimer);
      this._timer.text  = `TEMPO ${Math.ceil(t)}`;
      this._timer.style.fill =
        t <= 5  ? 0xff5050 :
        t <= 15 ? 0xffc800 : _WHITE;
      this._timer.visible = true;
    } else {
      this._timer.visible = false;
    }

    // velocità
    this._speed.text = `${Math.round(eng.player.spd / MAX_SPD * 200)} km/h`;

    // difficoltà
    this._diff.text = dnames[eng.diff];

    // bandierine
    for (let i = 0; i < 5; i++) {
      const c = eng.fcnt[i];
      this._bfTexts[i].text = '★'.repeat(c) + '☆'.repeat(5 - c);
    }

    // bonus text
    if (eng.bonusTxt) {
      this._bonusTxt.text  = eng.bonusTxt;
      this._bonusTxt.style.fill = eng.bonusCol;
      this._bonusTxt.visible = true;
    } else {
      this._bonusTxt.visible = false;
    }

    // game over
    const g = this._overGfx;
    g.clear();
    if (isOver) {
      g.rect(0, H / 2 - 70, W, 130).fill({ color: 0x000000, alpha: 0.65 });
      this._overTitle.visible = true;
      this._overScore.text    = `Punteggio: ${String(eng.score).padStart(6, '0')}`;
      this._overScore.visible = true;
      this._overCont.visible  = true;
    } else {
      this._overTitle.visible = false;
      this._overScore.visible = false;
      this._overCont.visible  = false;
    }
  }
};

})();

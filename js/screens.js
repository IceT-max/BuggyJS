'use strict';
const { W, H } = BB;

const _MONO  = 'monospace';

function _t(text, size, bold, color, ax = 0, ay = 0) {
  const t = new PIXI.Text({
    text,
    style: { fontFamily: _MONO, fontSize: size, fontWeight: bold ? 'bold' : 'normal', fill: color },
  });
  t.anchor.set(ax, ay);
  return t;
}

// ─── HIGHSCORE SCREEN ─────────────────────────────────────────────────────────
BB.HSScreen = class {
  constructor(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    this._bg   = new PIXI.Graphics();
    this.container.addChild(this._bg);

    this._title = _t('BUGGY BOY', 46, true, 0xffc800, 0.5, 0);
    this._title.x = W / 2; this._title.y = 28;
    this.container.addChild(this._title);

    this._sub = _t('── CLASSIFICA ──', 15, true, 0xffe650, 0.5, 0);
    this._sub.x = W / 2; this._sub.y = 88;
    this.container.addChild(this._sub);

    // 10 righe classifica
    this._rows = [];
    for (let i = 0; i < 10; i++) {
      const rank  = _t(`${i + 1}.`, 16, false, 0xbebee0, 0, 0);
      const name  = _t('---',        16, false, 0xbebee0, 0, 0);
      const score = _t('------',     16, false, 0xbebee0, 1, 0);
      const date  = _t('',           11, false, 0x8c8ca0, 1, 0);
      rank.x  = 55;       rank.y  = 120 + i * 36;
      name.x  = 88;       name.y  = 120 + i * 36;
      score.x = W - 55;   score.y = 120 + i * 36;
      date.x  = W - 55;   date.y  = 120 + i * 36 + 18;
      this.container.addChild(rank, name, score, date);
      this._rows.push({ rank, name, score, date });
    }

    // selezione difficoltà (pallini)
    this._dots = [];
    for (let i = 0; i < 4; i++) {
      const d = _t('●', 18, false, 0x3c3c50, 0.5, 0);
      d.x = W / 2 - 30 + i * 22; d.y = H - 62;
      this.container.addChild(d);
      this._dots.push(d);
    }

    this._hint1 = _t('[1] Facile  [2] Normale  [3] Difficile  [4] Esperto', 13, false, 0x72727a, 0.5, 0);
    this._hint1.x = W / 2; this._hint1.y = H - 38;
    this.container.addChild(this._hint1);

    this._hint2 = _t('[R] Azzera  [ESC] Esci', 13, false, 0x72727a, 0.5, 0);
    this._hint2.x = W / 2; this._hint2.y = H - 16;
    this.container.addChild(this._hint2);
  }

  show(hs, diff) {
    this.container.visible = true;
    const g = this._bg;
    g.clear();
    g.rect(0, 0, W, H).fill(0x0c0c1c);

    const dnames = ['', 'FACILE', 'NORMALE', 'DIFFICILE', 'ESPERTO'];
    this._sub.text = `── CLASSIFICA  ${dnames[diff]} ──`;

    const list = hs[diff] || [];
    const medalCols = [0xffd200, 0xc0c0c0, 0xb46428, 0xbebee0];
    for (let i = 0; i < 10; i++) {
      const e   = list[i];
      const col = i < 3 ? medalCols[i] : medalCols[3];
      const row = this._rows[i];
      row.rank.style.fill  = col;
      row.name.style.fill  = col;
      row.score.style.fill = col;
      row.name.text  = e ? e.name.trim() : '---';
      row.score.text = e ? String(e.score).padStart(6, '0') : '------';
      row.date.text  = e ? e.date : '';
    }

    for (let i = 0; i < 4; i++) {
      this._dots[i].style.fill = (i + 1) === diff ? 0xffc800 : 0x3c3c50;
    }
  }

  hide() { this.container.visible = false; }
};

// ─── NAME ENTRY SCREEN ────────────────────────────────────────────────────────
BB.NameScreen = class {
  constructor(stage) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    stage.addChild(this.container);

    this._bg = new PIXI.Graphics();
    this.container.addChild(this._bg);

    this._title = _t('NUOVO RECORD!', 34, true, 0xffc800, 0.5, 0);
    this._title.x = W / 2; this._title.y = 150;
    this.container.addChild(this._title);

    this._scoreT = _t('Punteggio: 000000', 22, false, 0xffffff, 0.5, 0);
    this._scoreT.x = W / 2; this._scoreT.y = 204;
    this.container.addChild(this._scoreT);

    this._prompt = _t('Inserisci il tuo nome (3 caratteri):', 16, false, 0xa0d2ff, 0.5, 0);
    this._prompt.x = W / 2; this._prompt.y = 268;
    this.container.addChild(this._prompt);

    this._inputGfx = new PIXI.Graphics();
    this.container.addChild(this._inputGfx);

    this._nameT = _t('___', 34, true, 0xffffff, 0.5, 0);
    this._nameT.x = W / 2; this._nameT.y = 300;
    this.container.addChild(this._nameT);

    this._hint1 = _t('Lettere/Numeri per scrivere, BACKSPACE per cancellare', 13, false, 0x72727a, 0.5, 0);
    this._hint1.x = W / 2; this._hint1.y = 376;
    this.container.addChild(this._hint1);

    this._hint2 = _t('INVIO per confermare', 13, false, 0x72727a, 0.5, 0);
    this._hint2.x = W / 2; this._hint2.y = 396;
    this.container.addChild(this._hint2);
  }

  show(score) {
    this.container.visible = true;
    const g = this._bg;
    g.clear();
    g.rect(0, 0, W, H).fill(0x0c0c1c);

    this._scoreT.text = `Punteggio: ${String(score).padStart(6, '0')}`;

    // box input
    const ig = this._inputGfx;
    ig.clear();
    ig.rect(W / 2 - 72, 294, 144, 52).fill(0x161632);
    ig.rect(W / 2 - 72, 294, 144, 52).stroke({ width: 2, color: 0xffc800 });
  }

  update(name) {
    this._nameT.text = (name + '___').slice(0, 3);
  }

  hide() { this.container.visible = false; }
};

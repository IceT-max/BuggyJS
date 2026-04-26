'use strict';

(async () => {
  const { ST, PH, W, H } = BB;
  // ─── PIXI APP ─────────────────────────────────────────────────────────────
  const app = new PIXI.Application();
  await app.init({
    width:           W,
    height:          H,
    backgroundColor: 0x111111,
    antialias:       false,
    resolution:      1,
  });
  document.getElementById('game-container').appendChild(app.canvas);

  // ─── CARICA ASSETS SVG ────────────────────────────────────────────────────
  const SVG_BASE = 'svg/';
  PIXI.Assets.addBundle('game', {
    buggy:      SVG_BASE + 'buggy.svg',
    rock:       SVG_BASE + 'rock.svg',
    log:        SVG_BASE + 'log.svg',
    log_m:      SVG_BASE + 'log_m.svg',
    log_l:      SVG_BASE + 'log_l.svg',
    barrel:     SVG_BASE + 'barrel.svg',
    puddle:     SVG_BASE + 'puddle.svg',
    oil:        SVG_BASE + 'oil.svg',
    bumper:     SVG_BASE + 'bumper.svg',
    flag:       SVG_BASE + 'flag.svg',
    bonus_flag: SVG_BASE + 'bonus_flag.svg',
    particle:   SVG_BASE + 'particle.svg',
  });
  const textures = await PIXI.Assets.loadBundle('game');

  // ─── STATO APPLICAZIONE ───────────────────────────────────────────────────
  let appSt    = ST.HS;
  let hs       = BB.loadHS();
  let cycleDiff = 1, cycleT = 0;
  let eng       = null;
  let hud       = null;
  let pendScore = 0, pendDiff = 1, entName = '';

  const aud = new BB.Audio();

  // ─── SCHERMATE ────────────────────────────────────────────────────────────
  const hsScreen   = new BB.HSScreen(app.stage);
  const nameScreen = new BB.NameScreen(app.stage);

  // container gioco (road + world + player)
  const gameStage = new PIXI.Container();
  app.stage.addChild(gameStage);

  // ─── INPUT ────────────────────────────────────────────────────────────────
  const keys = new Set();

  document.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))
      e.preventDefault();
    keys.add(e.code);
    onKey(e);
  });
  document.addEventListener('keyup', e => keys.delete(e.code));

  function onKey(e) {
    if (appSt === ST.HS) {
      if (e.key >= '1' && e.key <= '4') {
        _initGame(parseInt(e.key));
      }
      if (e.key === 'r' || e.key === 'R') {
        hs = { 1: [], 2: [], 3: [], 4: [] };
        BB.saveHS(hs);
        hsScreen.show(hs, cycleDiff);
      }
    } else if (appSt === ST.PLAY) {
      if (eng && eng.phase === PH.OVER && e.code === 'Enter') {
        aud.stopEngine();
        aud.stopMusic();
        if (BB.isTop(hs, eng.diff, eng.score)) {
          pendScore = eng.score;
          pendDiff  = eng.diff;
          entName   = '';
          appSt     = ST.NAME;
          _showName();
        } else {
          appSt = ST.HS;
          _showHS();
        }
      }
    } else if (appSt === ST.NAME) {
      if (e.code === 'Enter' && entName.length > 0) {
        const name = (entName + '   ').slice(0, 3).toUpperCase();
        BB.addScore(hs, pendDiff, name, pendScore);
        cycleDiff = pendDiff;
        appSt = ST.HS;
        _showHS();
      } else if (e.code === 'Backspace') {
        entName = entName.slice(0, -1);
        nameScreen.update(entName);
      } else if (entName.length < 3 && /^[a-zA-Z0-9]$/.test(e.key)) {
        entName += e.key.toUpperCase();
        nameScreen.update(entName);
      }
    }
  }

  // ─── HELPERS NAVIGAZIONE ──────────────────────────────────────────────────
  function _showHS() {
    gameStage.visible = false;
    nameScreen.hide();
    if (hud) hud.container.visible = false;
    hsScreen.show(hs, cycleDiff);
  }

  function _showName() {
    hsScreen.hide();
    gameStage.visible = false;
    if (hud) hud.container.visible = false;
    nameScreen.show(pendScore);
    nameScreen.update(entName);
  }

  function _initGame(diff) {
    hsScreen.hide();
    nameScreen.hide();
    gameStage.visible = true;

    // rimuovi HUD precedente prima di crearne uno nuovo
    if (hud) app.stage.removeChild(hud.container);
    gameStage.removeChildren();

    eng = new BB.Engine(aud, gameStage, textures);
    eng.reset(diff);

    hud = new BB.HUD(app.stage);
    hud.container.visible = true;

    appSt = ST.PLAY;
  }

  // ─── GAME LOOP ────────────────────────────────────────────────────────────
  app.ticker.maxFPS = 60;
  app.ticker.add(ticker => {
    const dt = Math.min(ticker.deltaMS / 1000, 0.05);

    if (appSt === ST.HS) {
      cycleT += dt;
      if (cycleT >= 4) { cycleT = 0; cycleDiff = cycleDiff % 4 + 1; hsScreen.show(hs, cycleDiff); }
    } else if (appSt === ST.PLAY && eng) {
      eng.update(dt, keys);
      eng.draw();
      hud.update(eng);
    }
    // ST.NAME non ha animazioni, la schermata è statica
  });

  // ─── AVVIO ────────────────────────────────────────────────────────────────
  gameStage.visible = false;
  _showHS();

})();

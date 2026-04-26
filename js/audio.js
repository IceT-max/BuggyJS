'use strict';

// ─── SONG ZzFXM (musica di sottofondo, stile arcade racing) ──────────────────
// Formato: [instruments, patterns, sequence, bpm]
// Ogni nota: [instrument_1based, semitone_offset_da_freq_base]
const _SONG = [
  // Instruments: parametri ZzFX (senza il volume iniziale)
  [
    // 0: lead synth - onda quadra con vibrato leggero
    [, 0, 523, .02, .08, .15, 1, 1.5, 0, 0, 0, 0, 0, 0, 5],
    // 1: basso - onda dente di sega, profondo
    [, 0, 131, .04, .12, .3, 3, 1, -1, 0, 0, 0, 0, 0],
    // 2: hi-hat - rumore breve
    [, 0, 1200, 0, 0, .04, 4, 1, 0, 0, 0, 0, 0, 8],
  ],
  // Patterns (ogni passo = 1/16 di nota a BPM 140)
  [
    // Pattern 0: 16 passi - melodia principale
    [
      // Lead [volume, pan, ...notes]
      [1, 0,
        [1, 0], [1, 4], [1, 7], [1, 4],   // C E G E
        [1, 5], [1, 9], [1, 12],[1, 9],   // F A C' A
        [1, 7], [1, 4], [1, 5], [1, 2],   // G E F D
        [1, 0], 0, [1, 0], 0,             // C - C -
      ],
      // Bass [volume, pan, ...notes]
      [.75, 0,
        [2, 0], 0, [2, 0], 0,
        [2, 5], 0, [2, 5], 0,
        [2, 7], 0, [2, 7], 0,
        [2, 0], 0, 0, 0,
      ],
      // Hi-hat [volume, pan, ...notes]
      [.4, 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
      ],
    ],
    // Pattern 1: variazione
    [
      [1, 0,
        [1, 7], [1, 9], [1, 12],[1, 9],
        [1, 7], [1, 5], [1, 4], [1, 2],
        [1, 0], [1, 2], [1, 4], [1, 5],
        [1, 7], 0, [1, 7], 0,
      ],
      [.75, 0,
        [2, 7], 0, [2, 7], 0,
        [2, 5], 0, [2, 5], 0,
        [2, 0], 0, [2, 0], 0,
        [2, 7], 0, 0, 0,
      ],
      [.4, 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
        [3, 0], 0, [3, 0], 0,
      ],
    ],
  ],
  // Sequence
  [0, 0, 1, 0],
  // BPM
  140,
];

// ─── AUDIO SYSTEM ─────────────────────────────────────────────────────────────
BB.Audio = class {
  constructor() {
    this._ctx      = null;
    this._engGain  = null;
    this._engOsc   = null;
    this._musicSrc = null;
    this._musicBuf = null;
    this._muted    = false;
  }

  _init() {
    if (!this._ctx) this._ctx = zzfxX; // riusa il contesto di ZzFX
  }

  // ─── ENGINE ────────────────────────────────────────────────────────────────
  startEngine() {
    this._init();
    this.stopEngine();
    this._engGain = this._ctx.createGain();
    this._engGain.gain.value = 0.12;

    const dist = this._ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) curve[i] = ((i / 128) - 1) ** 3;
    dist.curve = curve;

    this._engOsc = this._ctx.createOscillator();
    this._engOsc.type = 'sawtooth';
    this._engOsc.frequency.value = 50;
    this._engOsc.connect(dist);
    dist.connect(this._engGain);
    this._engGain.connect(this._ctx.destination);
    this._engOsc.start();
  }

  updateSpeed(spd) {
    if (!this._engOsc) return;
    this._engOsc.frequency.setTargetAtTime(
      40 + (spd / BB.MAX_SPD) * 130,
      this._ctx.currentTime, 0.08
    );
  }

  stopEngine() {
    if (this._engOsc) {
      try { this._engOsc.stop(); } catch (e) {}
      this._engOsc = null;
    }
    if (this._engGain) { this._engGain.disconnect(); this._engGain = null; }
  }

  // ─── MUSICA DI SOTTOFONDO (ZzFXM) ─────────────────────────────────────────
  startMusic() {
    this._init();
    this.stopMusic();
    try {
      if (!this._musicBuf) {
        const [l, r] = zzfxM(..._SONG);
        const buf = this._ctx.createBuffer(2, l.length, zzfxR);
        buf.getChannelData(0).set(l);
        buf.getChannelData(1).set(r);
        this._musicBuf = buf;
      }
      this._musicSrc = this._ctx.createBufferSource();
      this._musicSrc.buffer = this._musicBuf;
      this._musicSrc.loop = true;
      const gain = this._ctx.createGain();
      gain.gain.value = 0.25;
      this._musicSrc.connect(gain);
      gain.connect(this._ctx.destination);
      this._musicSrc.start();
    } catch (e) {
      // ZzFXM non disponibile o errore: continua senza musica
    }
  }

  stopMusic() {
    if (this._musicSrc) {
      try { this._musicSrc.stop(); } catch (e) {}
      this._musicSrc = null;
    }
  }

  // ─── EFFETTI ZzFX ─────────────────────────────────────────────────────────
  playCrash() {
    zzfx(1.5, .1, 60,  0, .05, .4, 4, 1, 0, 0, 0, 0, 0, 9, 0, .3, 0, .8, .2);
    zzfx(.8,  .1, 80,  0, .02, .5, 3, 1, -.1);
  }

  playSlide() {
    zzfx(.7, .1, 180, 0, .05, .5, 0, 1, -.18, 0, 0, 0, 0, 0, 0, 0, 0, .6, .1);
  }

  playSplash() {
    zzfx(.6, .1, 350, 0, .03, .25, 0, 1, 0, 0, 0, 0, 0, 5, 0, 0, 0, .5, .05);
  }

  playTick() {
    zzfx(.5, 0, 900, 0, 0, .08, 1, 1);
  }

  playCheckpoint() {
    zzfx(.6, 0, 660, 0, .05, .12, 0, 1);
    setTimeout(() => zzfx(.6, 0, 880, 0, .05, .2, 0, 1), 130);
  }

  playCollect() {
    zzfx(.5, 0, 660, 0, .02, .1, 0, 1, .2);
  }

  playJump() {
    zzfx(.5, 0, 330, 0, .05, .2, 0, 1, .2);
  }

  playBonus() {
    [880, 1100, 1320].forEach((f, i) =>
      setTimeout(() => zzfx(.8, 0, f, 0, .05, .15, 0, 1), i * 100)
    );
  }
};

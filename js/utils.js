'use strict';

// ─── LCG random ──────────────────────────────────────────────────────────────
BB.lcg = function(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

// ─── HSV → RGB (0-255) ───────────────────────────────────────────────────────
BB.hsvToRgb = function(h, s, v) {
  const hi = Math.floor(h / 60) % 6;
  const f  = h / 60 - Math.floor(h / 60);
  const p  = v * (1 - s);
  const q  = v * (1 - f * s);
  const t  = v * (1 - (1 - f) * s);
  return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][hi].map(x => Math.round(x * 255));
};

// ─── AABB collision ──────────────────────────────────────────────────────────
BB.rectsHit = function(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
};

// ─── Converti colore RGB array → numero esadecimale PixiJS ───────────────────
BB.rgbToHex = function(r, g, b) {
  return (r << 16) | (g << 8) | b;
};

// ─── Numero esadecimale → CSS string ─────────────────────────────────────────
BB.hexToCss = function(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
};

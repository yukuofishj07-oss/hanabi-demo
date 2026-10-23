export const GRID = {
  R: 2.02,
  SPACING: 2.30,
  TOP: 0.65,
  WATER_Y: -0.18
};

export const COLORS = {
  coral: 0xdb6a41,
  ink: 0x211d1d,
  cream: 0xfff8f4,
  yellow: 0xfcea8b,
  stone: 0xc5b5a7,
  green: 0x5a7a52,     // 森林深綠
  cherry: 0xf7a8b8,    // 櫻花粉
  glass: 0x86a8a6,
  wood: 0xb48560,
  teal: 0x3e7c8c,
  gold: 0xffb830,
  purple: 0x9b59b6,
  sky: 0x3498db
};

export function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(1337);

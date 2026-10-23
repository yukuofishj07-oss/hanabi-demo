export const WORLD = {
  R: 10.0,             // 島嶼半徑設為寬廣的 R = 10.0！
  SPACING: 15.6,       // 中心距拉開至 27 單位 (留出約 7 單位寬闊海道與長拱橋，且全景不至於縮成小點)
  TOP: 1.25,           // 島面高度
  WATER_Y: -0.35,
  WALKER_SCALE: 1.15   // 小人維持精緻微縮比例，絕不變成巨人
};

export const PALETTE = {
  coral: 0xdb6a41,
  ink: 0x211d1d,
  cream: 0xfff8f4,
  yellow: 0xfcea8b,
  stone: 0xc5b5a7,
  green: 0x71806a,
  glass: 0x86a8a6,
  wood: 0xb48560,
  teal: 0x3e7c8c,
  foliage1: 0x9cc27a,
  foliage2: 0x8db86f,
  foliage3: 0x728f5f,
  pastelPink: 0xf2b5c6,
  pastelCyan: 0x58a6a6,
  pastelBlue: 0x6f7fb5,
  wallWarm: 0xf4ebdd,
  eaveRust: 0xa34e34,
  windowGlass: 0xa8c4c2,
  glowGold: 0xffc777
};

export const DAY_KEYFRAMES = [
  { min: 0,    skyTop: 0x1e2c58, horizon: 0x3f4f80, sunColor: 0xb4c2ff, sunI: 1.15, hemiSky: 0x94a2d8, hemiGround: 0x64566a, hemiI: 1.85, night: 1.0,  water: 0x5a88b2 },
  { min: 300,  skyTop: 0x26365f, horizon: 0x4c5688, sunColor: 0xb8c4ff, sunI: 1.0,  hemiSky: 0x96a4da, hemiGround: 0x66586c, hemiI: 1.85, night: 1.0,  water: 0x5c8ab4 },
  { min: 360,  skyTop: 0x7f8fc4, horizon: 0xf6c3a6, sunColor: 0xffb48a, sunI: 1.3,  hemiSky: 0xf3c6b5, hemiGround: 0x6b5a5a, hemiI: 1.1,  night: 0.55, water: 0x8fb7c4 },
  { min: 450,  skyTop: 0xa9d1ea, horizon: 0xfbe6d3, sunColor: 0xffe2c4, sunI: 2.4,  hemiSky: 0xeaf2f6, hemiGround: 0x8a7a68, hemiI: 1.25, night: 0.0,  water: 0x9fcfd6 },
  { min: 720,  skyTop: 0x9fd0ec, horizon: 0xf4eee3, sunColor: 0xfff1de, sunI: 2.9,  hemiSky: 0xeef6fa, hemiGround: 0x8f8270, hemiI: 1.35, night: 0.0,  water: 0xa9d8db },
  { min: 960,  skyTop: 0xa6cfe6, horizon: 0xf8e7d2, sunColor: 0xffe3c0, sunI: 2.5,  hemiSky: 0xf1efe8, hemiGround: 0x8a7a66, hemiI: 1.25, night: 0.0,  water: 0x9fcbd2 },
  { min: 1065, skyTop: 0x8b8fc4, horizon: 0xf7b98f, sunColor: 0xff9f6a, sunI: 1.8,  hemiSky: 0xf6d2bc, hemiGround: 0x7d6660, hemiI: 1.2,  night: 0.3,  water: 0x93a9bd },
  { min: 1140, skyTop: 0x5a5e9e, horizon: 0xd99aa6, sunColor: 0xff9a7a, sunI: 1.3,  hemiSky: 0xc0b2e0, hemiGround: 0x655868, hemiI: 1.35, night: 0.75, water: 0x6a7cab },
  { min: 1260, skyTop: 0x22325f, horizon: 0x445488, sunColor: 0xc0ccff, sunI: 1.2,  hemiSky: 0x98a8dc, hemiGround: 0x685a6e, hemiI: 1.9,  night: 1.0,  water: 0x5a88b2 },
  { min: 1440, skyTop: 0x1e2c58, horizon: 0x3f4f80, sunColor: 0xb4c2ff, sunI: 1.15, hemiSky: 0x94a2d8, hemiGround: 0x64566a, hemiI: 1.85, night: 1.0,  water: 0x5a88b2 }
];

export function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(202608);

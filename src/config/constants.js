export const GRID = {
  R: 2.05,
  SPACING: 2.32,
  TOP: 0.68,
  WATER_Y: -0.18
};

// 溫暖黏土玩具模型色票
export const COLORS = {
  wall: 0xf5eee6,       // 暖白黏土牆
  roof: 0xd95a32,       // 暖紅赤陶四坡斜頂
  wood: 0xb57849,       // 溫暖木材色
  drum: 0xf1c40f,       // 金黃造粒筒
  steel: 0x3d4451,      // 迫擊鋼管
  pine: 0x3d6647,       // 翠綠針葉松
  cherry: 0xf8a5b5,     // 柔粉櫻花
  lampPost: 0x2c3e50,   // 路燈柱
  lightGlow: 0xffe066,  // 暖黃燈罩
  pathway: 0xd8c2af     // 淺磚色環形步道
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

export const GRID = {
  R: 2.85,          // 放大島嶼半徑 (原 2.02 -> 2.85)，面積擴大近 2 倍，容納精緻建築與步道
  SPACING: 6.4,     // 島心距
  TOP: 0.78,        // 島面高度
  WATER_Y: -0.22
};

// 溫暖黏土玩具模型色票
export const COLORS = {
  wall: 0xf7f0e6,       // 暖白黏土牆
  wallCream: 0xf2e3ce,  // 奶油米色牆
  roofCoral: 0xd95a32,  // 赤陶紅屋頂
  roofDark: 0x383e4c,   // 日式黑瓦屋頂
  roofTeal: 0x3b7a8c,   // 青瓷色屋頂
  wood: 0xb57849,       // 溫暖松木色
  woodDark: 0x7d4e2d,   // 深胡桃木
  brass: 0xf39c12,      // 黃銅/金黃色機械
  steel: 0x3d4451,      // 黑鐵迫擊砲管
  pine: 0x3d6b48,       // 翠綠針葉松
  leafLight: 0x76a05e,  // 嫩綠闊葉
  cherry: 0xf9a8b8,     // 櫻花粉
  lampPost: 0x2c3e50,   // 路燈柱
  lightGlow: 0xffe066,  // 暖黃燈光
  pathway: 0xd8c2af     // 淺磚色步道
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

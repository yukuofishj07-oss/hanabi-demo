export const GRID = {
  R: 4.2,           // 放大兩倍的島嶼半徑，可容納完整微縮工廠園區、水車、步道與燈籠
  TOP: 0.95,        // 厚實溫暖的黏土島面高度
  WATER_Y: -0.25
};

// 高質感溫暖黏土色票 (Teal & Orange 冷暖對比美學)
export const COLORS = {
  wall: 0xf9f3eb,       // 暖白陶土牆
  wallCream: 0xf3e4cf,  // 奶油杏色牆
  roofCoral: 0xd95a32,  // 赤陶朱紅屋頂
  roofDark: 0x2c3545,   // 日式黑瓦屋頂
  roofTeal: 0x2a7b88,   // 青瓷色屋頂
  wood: 0xb87b4b,       // 溫暖松木色
  woodDark: 0x754829,   // 深胡桃木
  brass: 0xf3a612,      // 亮黃銅機械
  steel: 0x3d4654,      // 鍛造黑鐵
  pine: 0x386646,       // 森林深綠
  leafLight: 0x72a358,  // 嫩草綠
  autumn: 0xe67e22,     // 楓葉橘
  cherry: 0xf9a8b8,     // 櫻花粉
  lanternRed: 0xe74c3c, // 祭典紅燈籠
  lightGlow: 0xffd86b,  // 溫暖燈火金
  pathway: 0xd8c1ad     // 石板小徑
};

export function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(2026);

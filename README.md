# 花火島 HANABI ISLAND (性能極致絲滑旗艦版)

微縮黏土玩具模型風格的 3D 互動花火工藝城。經過專業前端管線優化，兼顧高幀率 60FPS 絲滑流暢度與電影級夜空花火光影。

## 🚀 性能與視覺關鍵優化
1. **零 GC 粒子物件池 (Zero-GC Particle Pooling)**：
   - 解決以往頻繁 `new` 與 `splice` 陣列導致的瀏覽器垃圾回收卡頓。
   - 粒子顯存直接映射，確保高密度爆炸火花下依然穩跑 60FPS。
2. **單一 InstancedMesh 工匠群**：
   - 全島數十位 2頭身 Chibi 工匠合併為 1 次 Draw Call，消除 CPU 提交負擔。
3. **優雅相機插值飛行 (800ms easeInOutCubic)**：
   - 點擊島嶼自動平滑對焦，手勢觸控即刻平穩打斷。
4. **精準陰影與 GPU 海面著色器**：
   - 陰影計算適配微縮模型尺寸，海面波動完全由 GPU 平行計算。

## 本地執行
```bash
npx serve .
# 或
python3 -m http.server 8000
```
瀏覽器開啟 `http://localhost:8000` 即可體驗！

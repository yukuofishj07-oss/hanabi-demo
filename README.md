# 花火島 (Firework Island)

微縮玩具模型風格的 3D 互動花火工藝島，展示從原料精煉、配色、星體造粒、紙殼成型到高空施放的完整製程。

## 專案架構
- **原生 ES Modules (No-Build)**：直接以靜態檔案伺服器或 GitHub Pages 提供服務。
- **Three.js 0.160.0**：透過 importmap 載入 CDN。
- **純程式化資產**：無外載圖片或 3D 模型檔，地表、材質與幾何形狀皆由程式生成。

## 本地執行方式
使用任意靜態 HTTP 伺服器啟動：
```bash
npx serve .
# 或
python3 -m http.server 8000
```
瀏覽器開啟 `http://localhost:8000` 即可檢視。

# 花火島 (Hanabi Island Demo)

GitHub 專案：`yukuofishj07-oss/hanabi-demo`
微縮玩具模型風格的 3D 互動花火工藝島，展示從原料精煉、配色、星體造粒、紙殼成型到高空施放的完整製程。

## 部署與上傳注意事項
當您把拆分後的程式碼推送到 GitHub 時，請務必將根目錄的 `index.html` 以及 `src/` 與 `styles/` 資料夾**一同推送至 repository**。
若僅推送更新後的 `index.html`，會因路徑缺少 `./src/main.js` 與 `./styles/main.css` 而報 404 錯誤。

## 本地測試
```bash
npx serve .
# 或
python3 -m http.server 8000
```

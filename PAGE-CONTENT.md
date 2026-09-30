# 四個獨立頁面的內容維護

主要編輯 `page-data.js`，重新整理網頁即可看到修改。只修改 SyncTime.web。

- 最新消息：`news`。每則有 `title`、`category`、`summary`、`body`（段落陣列）、`coverUrl`。目前 3 則 Demo；新增消息需在 news.html 加入一張卡片，data-detail 對應資料 id。
- 線下展覽：`exhibitions`。日期、地址、地圖來源為使用者提供的 https://komorebi.tw/exhibition。三張場次卡片在 exhibitions.html；`map` 必須填 Google Maps 的嵌入網址，`query` 為導航目的地。未提供時間，版型不臆造開放時間。
- 贊助商：`sponsors`，6 個版位。填入 `name`、`type`、`logoUrl`、`body`、`website`。
- 團隊：`members`，7 位。分工為 PM 1 位、技術 3 位（前端／後端／部署）、美術 1 位、行銷 2 位（公開企劃／行銷企劃）。填入 `name`、`role`、`tag`、`intro`、`photoUrl`。`group` 為分類，不改四大類名稱。
- 老師：`advisor`，1 位。填入 `name`、`photoUrl`、`body`。
- 圖片建議放在 assets，網址可填 `assets/你的檔名.webp`。留白會保留 Demo 插畫版位。
- 正式資料完成後，把個別項目的 `demo` 改成 `false`，移除該卡片和簡介視窗的 Demo 標籤。頁面底下的整體 Demo 提示要在對應 HTML 刪除。
- 動畫與版型在 `pages.css`；互動在 `pages.js`。動畫支援減少動態效果設定，未支援跨頁轉場的瀏覽器會正常換頁。

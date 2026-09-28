# SyncTime Web

SyncTime 共時的宣傳網站。這是一個不需要建置工具的純靜態網站，透過長捲動與手機功能示意，介紹徵旅伴、旅吧、旅程群組與旅遊軌跡。功能與文案依 [SyncTime 主專案](https://github.com/xpyfx/SyncTime) 整理；手機畫面是示意內容，並非主程式畫面截圖或即時資料。

## 檔案結構

```text
.
├── index.html
├── styles.css
├── script.js
└── assets
    ├── NotoSansTC-Regular.ttf
    ├── friends-overlook.png
    ├── hero-station.png
    ├── logo.svg
    ├── passport-watermark-80.svg
    └── voice-silhouette.png
```

## 本機預覽

```bash
python3 -m http.server 4174
```

開啟 [http://localhost:4174](http://localhost:4174) 即可查看。

## 技術

- Semantic HTML
- Responsive CSS
- Vanilla JavaScript
- Intersection Observer
- Local image and font assets

## 公開留言「冒個泡」

跑馬燈的示意心聲不需要資料庫。要讓訪客送出的留言跨裝置永久顯示，需為本宣傳網站建立**獨立的 Firebase 專案**；不要使用 SyncTime 主程式的 Firebase 專案或改動主程式規則。

1. 在 Firebase Console 建立獨立專案，新增網頁應用程式並啟用 Cloud Firestore（預設資料庫）。
2. 在 Authentication → Sign-in method 啟用「匿名」。確認授權網域包含 `xpyfx.github.io`。
3. 在 Firestore Database → Rules 貼上本資料夾的 `firestore.rules`，發布規則。這組規則僅允許每個匿名訪客建立一則 2–80 字的留言；所有人可讀，訪客不能更新或刪除。
4. 將 Firebase 網頁應用程式的 `apiKey`、`authDomain`、`projectId`、`appId` 填入 `guestbook-config.js`。若使用非預設資料庫，另填 `databaseId`。提交到 `SyncTime.web` 後，留言功能才會啟用。

未設定資料庫時，按鈕與視窗可預覽，但「送出留言」會保持停用，不會假裝已儲存。Firebase 網頁設定可以公開；資料存取權由 Firestore 規則決定。正式開放匿名留言後，建議在 Firebase Console 設定用量警示與 App Check 來減少濫用。

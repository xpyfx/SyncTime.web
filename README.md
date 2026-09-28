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

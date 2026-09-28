# SyncTime Web

SyncTime 共時的官方宣傳網站。這是一個不需要建置工具的純靜態網站，透過電影式長捲動、黏著手機畫面與 Liquid Glass 元件，介紹旅伴配對、Travel Bar、旅程群組與旅行軌跡。

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

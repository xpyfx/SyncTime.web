import { guestbookConfig } from "./guestbook-config.js?v=2";

const examples = [
  ["🌊", "好想去看海，卻還沒找到同行的人。"],
  ["🧳", "機票都查好了，只差一句一起走。"],
  ["☕", "想在陌生城市找人喝杯咖啡。"],
  ["🚄", "週末想出發，有人也剛好有空嗎？"],
  ["📍", "想去的地方，存在地圖裡好久了。"],
  ["🌅", "如果有人一起看日出就好了。"],
  ["🗺️", "想走一條沒有排太滿的路線。"],
  ["🍜", "一個人吃美食，總想多點一道菜。"],
  ["📷", "旅行的照片，想有人一起回憶。"],
  ["✈️", "今年想完成第一次獨自出國。"],
  ["🏕️", "想有人陪我去山裡待一個週末。"],
  ["🌙", "今晚又收藏了新的旅行目的地。"],
  ["🚶", "不趕行程，慢慢走也很好。"],
  ["🌿", "想去一個能好好呼吸的地方。"],
  ["💙", "一句「我也想去」，就能開始計畫。"],
];
const icons = ["🫧", "🌊", "✨", "🧳", "🌤️", "📍", "💙"];
const rows = [...document.querySelectorAll("[data-bubble-row]")];
const dialog = document.querySelector("#bubble-dialog");
const form = document.querySelector("#bubble-form");
const message = document.querySelector("#bubble-message");
const submit = document.querySelector("#submit-bubble");
const status = document.querySelector("#bubble-status");
const count = document.querySelector("#bubble-count");
let canSubmit = false;
let submitMessage = null;

function renderRows(posts = []) {
  const items = posts.map((post, index) => [icons[index % icons.length], post.message]);
  const all = [...items, ...examples];
  rows.forEach((row, rowIndex) => {
    const group = document.createElement("div");
    group.className = "bubble-group";
    const selected = all.filter((_, index) => index % 3 === rowIndex);
    selected.forEach(([icon, words]) => {
      const pill = document.createElement("div");
      pill.className = "bubble-pill";
      const avatar = document.createElement("span");
      avatar.className = "bubble-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = icon;
      const text = document.createElement("span");
      text.textContent = words;
      pill.append(avatar, text);
      group.append(pill);
    });
    const repeat = group.cloneNode(true);
    repeat.setAttribute("aria-hidden", "true");
    row.replaceChildren(group, repeat);
  });
}

renderRows();
document.querySelector("#open-bubble").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-bubble").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
message.addEventListener("input", () => {
  const length = [...message.value].length;
  count.textContent = `${length} / 80`;
  submit.disabled = !canSubmit || length < 2 || length > 80;
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = message.value.trim();
  if (!canSubmit || !submitMessage || text.length < 2 || text.length > 80) return;
  submit.disabled = true;
  status.textContent = "正在送出…";
  try {
    await submitMessage(text);
    canSubmit = false;
    message.value = "";
    count.textContent = "0 / 80";
    status.textContent = "已送出！你的泡泡會留在這裡。";
    setTimeout(() => dialog.close(), 900);
  } catch (error) {
    status.textContent = error.message || "送出失敗，請稍後再試。";
    submit.disabled = false;
  }
});

if (!guestbookConfig?.projectId || !guestbookConfig?.apiKey || !guestbookConfig?.appId) {
  status.textContent = "公開留言尚未啟用：需先連接獨立的留言資料庫。";
} else {
  try {
    const [{ initializeApp }, { getAuth, signInAnonymously }, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"),
    ]);
    const app = initializeApp(guestbookConfig, "synctime-web-guestbook");
    const auth = getAuth(app);
    const db = firestore.getFirestore(app, guestbookConfig.databaseId || "(default)");
    const credential = await signInAnonymously(auth);
    const ownPost = firestore.doc(db, "bubbles", credential.user.uid);
    const currentPost = await firestore.getDoc(ownPost);
    canSubmit = !currentPost.exists();
    status.textContent = canSubmit ? "每位訪客可以留下一個泡泡。" : "你已經留過一個泡泡，謝謝你！";
    const feed = firestore.query(firestore.collection(db, "bubbles"), firestore.orderBy("createdAt", "desc"));
    firestore.onSnapshot(feed, (snapshot) => {
      renderRows(snapshot.docs.map((doc) => doc.data()).filter((post) => typeof post.message === "string"));
    }, (error) => {
      status.textContent = error.code === "permission-denied"
        ? "請先在 Firestore 發布網站的留言規則。"
        : "目前無法載入公開留言，請稍後再試。";
    });
    submitMessage = async (text) => {
      await firestore.setDoc(ownPost, { message: text, createdAt: firestore.serverTimestamp() });
    };
  } catch (error) {
    status.textContent = ["auth/configuration-not-found", "auth/operation-not-allowed"].includes(error.code)
      ? "請先在 Firebase Authentication 啟用匿名登入。"
      : "留言服務目前無法連線，請稍後再試。";
    console.error("Guestbook connection error:", error);
  }
}

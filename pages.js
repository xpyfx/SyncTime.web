(() => {
  const data = window.SYNCTIME_PAGE_DATA || {};
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  let frame = 0;
  const updateHeader = () => {
    frame = 0;
    header?.classList.toggle("is-scrolled", scrollY > 28);
    const max = document.documentElement.scrollHeight - innerHeight;
    header?.style.setProperty("--read-progress", String(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0));
  };
  updateHeader();
  const scheduleHeader = () => { if (!frame) frame = requestAnimationFrame(updateHeader); };
  addEventListener("scroll", scheduleHeader, { passive: true });
  addEventListener("resize", scheduleHeader, { passive: true });

  // Text uses textContent so editorial content is never interpreted as HTML.
  const safeUrl = (value) => {
    if (!value) return "";
    try { const url = new URL(value, location.href); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; }
    catch { return ""; }
  };
  const text = (root, selector, value) => {
    const node = root.querySelector(selector);
    if (node) node.textContent = value || "";
  };
  const photo = (slot, value, alt) => {
    const url = safeUrl(value);
    if (!slot || !url) return;
    const img = document.createElement("img");
    img.src = url; img.alt = alt; img.loading = "lazy";
    img.addEventListener("error", () => img.remove(), { once: true });
    slot.append(img);
  };
  const showDemo = (root, enabled) => root.querySelectorAll(".demo-label").forEach(label => label.hidden = enabled === false);
  const getDetail = (kind, id) => {
    if (kind === "advisor") return data.advisor;
    return ({ news: data.news, sponsor: data.sponsors, member: data.members }[kind] || []).find(item => item.id === id);
  };
  document.querySelectorAll("[data-detail]").forEach(button => {
    const item = getDetail(button.dataset.detailKind, button.dataset.detail);
    if (!item) return;
    const card = button.closest("article");
    showDemo(card || button, item.demo);
    if (button.dataset.detailKind === "news") {
      text(button, "h3", item.title); text(button, ".news-card-content > p", item.summary);
      text(button, ".card-meta > span:first-child", item.category);
      card.dataset.category = item.category;
      photo(button.querySelector(".news-art"), item.coverUrl, item.title);
      button.setAttribute("aria-label", "閱讀消息：" + item.title);
    } else if (button.dataset.detailKind === "sponsor") {
      text(button, "h3", item.name); text(button, ".sponsor-card-bottom div > span", item.type);
      photo(button.querySelector(".sponsor-logo-slot"), item.logoUrl, item.name + " Logo");
      if (item.logoUrl) button.querySelector(".sponsor-monogram").hidden = true;
      button.setAttribute("aria-label", "認識贊助商：" + item.name);
    } else if (button.dataset.detailKind === "member") {
      const heading = button.querySelector("h3");
      heading.replaceChildren(document.createTextNode(item.name + " "));
      const arrow = document.createElement("i"); arrow.textContent = "↗"; arrow.setAttribute("aria-hidden", "true"); heading.append(arrow);
      text(button, ".member-role", item.role); text(button, ".member-card-copy > p", item.tag);
      text(button, ".portrait-initials", item.initials);
      card.dataset.category = item.group;
      photo(button.querySelector(".member-portrait"), item.photoUrl, item.name);
      button.setAttribute("aria-label", "認識" + item.role + "：" + item.name);
    }
  });
  if (data.advisor) {
    const card = document.querySelector(".advisor-card");
    if (card) {
      text(card, "h3", data.advisor.name); photo(card.querySelector(".advisor-portrait"), data.advisor.photoUrl, data.advisor.name);
      showDemo(card, data.advisor.demo);
    }
  }

  const motionItems = [...document.querySelectorAll(".motion-item")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in-view"); observer.unobserve(entry.target);
    }), { threshold: .08, rootMargin: "0px 0px -30px 0px" });
    motionItems.forEach(item => {
      const siblings = [...item.parentElement.children].filter(sibling => sibling.classList.contains("motion-item"));
      item.style.setProperty("--motion-delay", Math.min(180, siblings.indexOf(item) * 55) + "ms");
      observer.observe(item);
    });
  } else motionItems.forEach(item => item.classList.add("is-in-view"));

  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    const target = button.dataset.filterTarget, category = button.dataset.filter;
    document.querySelectorAll('[data-filter-target="' + target + '"]').forEach(tab => {
      const active = tab === button; tab.classList.toggle("is-selected", active); tab.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll('[data-filter-item="' + target + '"]').forEach(item => {
      item.hidden = category !== "全部" && item.dataset.category !== category;
      if (!item.hidden) item.classList.add("is-in-view");
    });
    updateHeader();
  }));

  const dialog = document.querySelector(".content-dialog");
  let lastTrigger;
  const closeDialog = () => dialog?.close();
  document.querySelector(".dialog-close")?.addEventListener("click", closeDialog);
  dialog?.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog();
  });
  dialog?.addEventListener("close", () => {
    document.body.style.overflow = "";
    lastTrigger?.focus();
  });
  document.querySelectorAll("[data-detail]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.detailKind, item = getDetail(kind, button.dataset.detail);
    if (!item || !dialog) return;
    const title = document.getElementById("detail-title"), body = document.getElementById("detail-body");
    title.textContent = item.title || item.name;
    document.getElementById("detail-category").textContent = item.category || item.role || item.type;
    body.replaceChildren();
    const paragraphs = item.body || [item.intro, "此處可補上成員自我介紹、專長與在共時負責的工作。"];
    paragraphs.filter(Boolean).forEach(copy => {
      const p = document.createElement("p"); p.textContent = copy; body.append(p);
    });
    if (kind === "sponsor" && safeUrl(item.website)) {
      const a = document.createElement("a"); a.href = safeUrl(item.website); a.className = "page-link";
      a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "前往贊助商官網 ↗"; body.append(a);
    }
    showDemo(dialog, item.demo);
    dialog.querySelector(".demo-note").hidden = item.demo === false;
    lastTrigger = button;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector(".dialog-close").focus();
  }));

  const exhibitionTabs = [...document.querySelectorAll("[data-exhibition]")];
  const selectExhibition = (button, moveFocus = false) => {
    const index = exhibitionTabs.indexOf(button);
    const event = (data.exhibitions || []).find(item => item.id === button.dataset.exhibition);
    if (!event) return;
    exhibitionTabs.forEach(tab => {
      const selected = tab === button;
      tab.classList.toggle("is-selected", selected); tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    const panel = document.getElementById("exhibition-panel");
    panel.setAttribute("aria-labelledby", button.id);
    text(panel, ".section-label", "Next stop / " + String(index + 1).padStart(2, "0"));
    text(panel, "#exhibition-name", event.name); text(panel, "#exhibition-date", event.date);
    text(panel, "#exhibition-place", event.place); text(panel, "#exhibition-address", event.address);
    const map = document.getElementById("exhibition-map");
    if (safeUrl(event.map) && map.getAttribute("src") !== event.map) map.src = event.map;
    map.title = event.mapTitle || event.place + "位置地圖";
    document.getElementById("exhibition-directions").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(event.query);
    if (!reducedMotion) {
      panel.classList.remove("map-swap");
      requestAnimationFrame(() => panel.classList.add("map-swap"));
    }
    if (moveFocus) button.focus();
  };
  exhibitionTabs.forEach(button => {
    button.addEventListener("click", () => selectExhibition(button));
    button.addEventListener("keydown", event => {
      let index = exhibitionTabs.indexOf(button);
      if (["ArrowRight", "ArrowDown"].includes(event.key)) index = (index + 1) % exhibitionTabs.length;
      else if (["ArrowLeft", "ArrowUp"].includes(event.key)) index = (index - 1 + exhibitionTabs.length) % exhibitionTabs.length;
      else if (event.key === "Home") index = 0;
      else if (event.key === "End") index = exhibitionTabs.length - 1;
      else return;
      event.preventDefault(); selectExhibition(exhibitionTabs[index], true);
    });
  });
  if (exhibitionTabs.length) selectExhibition(exhibitionTabs[0]);
  // Reveal already-visible content after browser back/forward cache restoration.
  addEventListener("pageshow", event => { if (event.persisted) { motionItems.forEach(item => item.classList.add("is-in-view")); updateHeader(); } });
})();

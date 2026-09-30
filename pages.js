(() => {
  const header = document.querySelector(".site-header");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 28);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
})();

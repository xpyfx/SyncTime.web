(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const revealItems = document.querySelectorAll(".reveal");
  const journeySteps = document.querySelectorAll(".journey-step");
  const phoneScreens = document.querySelectorAll("[data-phone-screen]");
  const navLinks = document.querySelectorAll(".nav-glass a");
  const trackedSections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 28);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const showPhoneScreen = (name) => {
    document.body.dataset.screen = name;
    phoneScreens.forEach((screen) => {
      screen.classList.toggle("is-visible", screen.dataset.phoneScreen === name);
    });
    journeySteps.forEach((step) => {
      step.classList.toggle("is-current", step.dataset.screen === name);
    });
  };

  const stepObserver = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (activeEntry) {
        showPhoneScreen(activeEntry.target.dataset.screen);
      }
    },
    { threshold: [0.35, 0.55, 0.75], rootMargin: "-15% 0px -15% 0px" }
  );

  journeySteps.forEach((step) => stepObserver.observe(step));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.12, rootMargin: "-30% 0px -55% 0px" }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));

  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".phone-shell").forEach((phone) => {
      const bezel = phone.querySelector(".phone-bezel");
      if (!bezel) return;

      phone.addEventListener("pointermove", (event) => {
        const rect = phone.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        bezel.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
      });

      phone.addEventListener("pointerleave", () => {
        bezel.style.transform = "";
      });
    });
  }
})();

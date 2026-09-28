(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const revealItems = document.querySelectorAll(".reveal");
  const journeySteps = document.querySelectorAll(".journey-step");
  const phoneScreens = document.querySelectorAll("[data-phone-screen]");
  const journeyPhone = document.querySelector(".journey-phone");
  const heroPhone = document.querySelector(".hero-phone");
  const featureSection = document.querySelector(".phone-journey");
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

  if (reducedMotion) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (activeEntry) showPhoneScreen(activeEntry.target.dataset.screen);
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-15% 0px -15% 0px" }
    );
    journeySteps.forEach((step) => stepObserver.observe(step));
  } else if (journeySteps.length && phoneScreens.length) {
    let frame = 0;
    let activeScreen = "";
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const smoothstep = (value) => value * value * (3 - 2 * value);
    const bridgePhone = heroPhone && featureSection && journeyPhone
      ? heroPhone.cloneNode(true) : null;
    if (bridgePhone) {
      bridgePhone.classList.add("bridge-phone");
      bridgePhone.setAttribute("aria-hidden", "true");
      bridgePhone.querySelectorAll("a").forEach((link) => {
        link.tabIndex = -1;
      });
      document.body.appendChild(bridgePhone);
      document.body.classList.add("has-phone-bridge");
    }

    const renderBridge = () => {
      if (!bridgePhone) return;
      const scroll = window.scrollY;
      const heroRect = heroPhone.getBoundingClientRect();
      const featureTop = featureSection.getBoundingClientRect().top;
      const width = heroPhone.offsetWidth;
      const height = heroPhone.offsetHeight;
      const targetWidth = journeyPhone.offsetWidth;
      const targetHeight = journeyPhone.offsetHeight;
      const travel = smoothstep(clamp(scroll / Math.max(1, featureSection.offsetTop - window.innerHeight * 0.9)));
      const handoff = smoothstep(clamp((window.innerHeight * 0.2 - featureTop) / (window.innerHeight * 0.42)));
      const showing = scroll > 20 && handoff < 1;

      heroPhone.classList.toggle("is-bridged", showing);
      bridgePhone.style.visibility = showing ? "visible" : "hidden";
      bridgePhone.style.opacity = String(1 - handoff);
      bridgePhone.style.width = `${width + (targetWidth - width) * travel}px`;
      bridgePhone.style.height = `${height + (targetHeight - height) * travel}px`;
      bridgePhone.style.left = `${heroRect.left + ((window.innerWidth - targetWidth) / 2 - heroRect.left) * travel}px`;
      bridgePhone.style.top = `${heroRect.top + ((window.innerHeight - targetHeight) / 2 - heroRect.top) * travel}px`;
      journeyPhone.style.setProperty("--journey-opacity", handoff.toFixed(3));
    };

    const renderJourney = () => {
      frame = 0;
      renderBridge();
      const viewportCenter = window.scrollY + window.innerHeight * 0.5;
      const centers = [...journeySteps].map((step) => {
        const rect = step.getBoundingClientRect();
        return window.scrollY + rect.top + rect.height * 0.5;
      });
      let from = 0;
      while (from < centers.length - 2 && viewportCenter > centers[from + 1]) from++;
      const interval = centers[from + 1] - centers[from];
      const position = interval > 0 ? clamp((viewportCenter - centers[from]) / interval) : 0;
      const blend = viewportCenter <= centers[0] ? 0
        : viewportCenter >= centers[centers.length - 1] ? 1
        : smoothstep(clamp((position - 0.22) / 0.56));
      const current = viewportCenter >= centers[centers.length - 1]
        ? centers.length - 1 : blend >= 0.5 ? from + 1 : from;

      phoneScreens.forEach((screen, index) => {
        const opacity = index === from ? 1 - blend : index === from + 1 ? blend : 0;
        const offset = index === from ? -blend : index === from + 1 ? 1 - blend : 1;
        screen.style.setProperty("--screen-opacity", opacity.toFixed(3));
        screen.style.setProperty("--screen-offset", offset.toFixed(3));
        screen.style.zIndex = index === current ? "3" : "2";
      });

      if (journeyPhone) {
        journeyPhone.style.setProperty("--journey-lift", `${(-7 * Math.sin(Math.PI * blend)).toFixed(2)}px`);
        journeyPhone.style.setProperty("--journey-scale", (1 - 0.018 * Math.sin(Math.PI * blend)).toFixed(4));
      }
      const name = journeySteps[current].dataset.screen;
      if (name !== activeScreen) {
        activeScreen = name;
        document.body.dataset.screen = name;
        journeySteps.forEach((step, index) => step.classList.toggle("is-current", index === current));
      }
    };
    const scheduleJourney = () => {
      if (!frame) frame = requestAnimationFrame(renderJourney);
    };
    window.addEventListener("scroll", scheduleJourney, { passive: true });
    window.addEventListener("resize", scheduleJourney, { passive: true });
    scheduleJourney();
  }

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

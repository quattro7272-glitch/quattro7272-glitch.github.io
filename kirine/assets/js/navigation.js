// 迷子にならないための仕掛け：メニュー・現在地・ページ内目次・先頭へ・ページ内リンクの履歴
(() => {
  const header = document.querySelector(".js-header");
  const menuButton = document.querySelector(".js-menu-button");
  const navigation = document.querySelector(".js-global-nav");
  const pageTopButton = document.querySelector(".js-page-top");
  const locatorSection = document.querySelector(".js-locator-section");
  const hero = document.querySelector(".js-hero");
  const sections = [...document.querySelectorAll("[data-section]")];
  const tocLinks = [...document.querySelectorAll(".js-toc a")];

  // スマホのメニュー
  const setMenuOpen = (isOpen) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    navigation.classList.toggle("is-open", isOpen);
  };

  menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  // ページ内リンクは履歴に積まない（iPhone Safari の戻るで位置が巻き戻らないように）
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", id && id !== "top" ? `#${id}` : location.pathname);
  });

  // ヘッダーの地色・先頭へボタン
  const updateOnScroll = () => {
    const scrolled = window.scrollY;
    if (header && hero) {
      header.classList.toggle("is-over-hero", scrolled < hero.offsetHeight - header.offsetHeight);
    }
    pageTopButton?.classList.toggle("is-visible", scrolled > window.innerHeight * 0.6);
  };

  window.addEventListener("scroll", updateOnScroll, { passive: true });
  updateOnScroll();

  // 今どの節にいるか：左の現在地表示・目次・URLの#
  if (sections.length === 0) return;

  let currentId = "";
  let hashTimer = 0;

  const setCurrent = (section) => {
    if (!section || section.id === currentId) return;
    currentId = section.id;
    if (locatorSection) locatorSection.textContent = section.dataset.section;
    tocLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${section.id}`;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "location");
        link.scrollIntoView({ block: "nearest", inline: "nearest" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const isAtTop = window.scrollY < window.innerHeight * 0.3;
      history.replaceState(null, "", section.dataset.hash === "none" || isAtTop ? location.pathname : `#${section.id}`);
    }, 400);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) return;
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      setCurrent(visible[0].target);
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
})();

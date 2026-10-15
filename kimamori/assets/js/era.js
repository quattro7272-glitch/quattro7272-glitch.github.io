// 現在地（築何年・どの章か）を、ものさし・ヘッダー・目次・URL に常に反映する
(() => {
  const RULER_YEARS = [0, 1, 5, 10, 20, 30]; // 目盛りは等間隔に並べる（1年と30年を同じ幅で読めるように）
  const sections = [...document.querySelectorAll("[data-era-section]")];
  const rulerTrack = document.querySelector(".ruler__track");
  const rulerMark = document.querySelector(".ruler__mark");
  const rulerLabel = document.querySelector(".ruler__label");
  const hereText = document.querySelector(".site-header__here");
  const navigation = document.querySelector(".site-nav");
  const navigationList = navigation && navigation.querySelector(".js-sections");
  const menuButton = document.querySelector(".site-header__menu");
  if (!sections.length || !rulerTrack || !rulerMark) return;

  const maxYear = RULER_YEARS[RULER_YEARS.length - 1];

  // 年 → ものさし上の位置（%）。目盛りの間は直線でつなぐ
  function yearToPercent(year) {
    for (let i = 1; i < RULER_YEARS.length; i += 1) {
      if (year <= RULER_YEARS[i]) {
        const from = RULER_YEARS[i - 1];
        const to = RULER_YEARS[i];
        const step = 100 / (RULER_YEARS.length - 1);
        return (i - 1) * step + ((year - from) / (to - from)) * step;
      }
    }
    return 100;
  }

  function buildRuler() {
    RULER_YEARS.forEach((year) => {
      const tick = document.createElement("span");
      tick.className = "ruler__tick";
      tick.style.top = `${yearToPercent(year)}%`;
      tick.dataset.year = String(year);
      tick.textContent = String(year);
      rulerTrack.append(tick);
    });
  }

  function buildNavigation() {
    if (!navigationList) return;
    sections.forEach((section) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${section.id}`;
      link.dataset.target = section.id;
      const year = document.createElement("span");
      year.className = "site-nav__year";
      year.textContent = section.dataset.here;
      link.append(year, document.createTextNode(section.dataset.navTitle));
      item.append(link);
      navigationList.append(item);
    });
  }

  function setCurrent(section, { updateUrl = true } = {}) {
    const year = Number(section.dataset.year);
    rulerMark.style.setProperty("--mark-y", `${yearToPercent(year)}%`);
    rulerLabel.textContent = section.dataset.ruler;
    // 札（現在の年）と目盛りの数字が重ならないよう、同じ年の目盛りの数字は隠す
    rulerTrack.querySelectorAll(".ruler__tick").forEach((tick) => {
      tick.classList.toggle("is-current", Number(tick.dataset.year) === year);
    });
    document.documentElement.style.setProperty("--era", String(Math.min(year / maxYear, 1)));
    if (hereText) {
      hereText.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent = section.dataset.here;
      hereText.append("いま　", strong);
      if (section.dataset.here !== section.dataset.navTitle) hereText.append(`　${section.dataset.navTitle}`);
    }
    navigationList?.querySelectorAll("a").forEach((link) => {
      link.toggleAttribute("aria-current", link.dataset.target === section.id);
      if (link.dataset.target === section.id) link.setAttribute("aria-current", "true");
    });
    if (!updateUrl) return;
    // 位置をURLに残す（再読み込み・戻るで同じ場所に戻れる）。表紙では印を外す
    const hash = section === sections[0] ? location.pathname + location.search : `#${section.id}`;
    history.replaceState(null, "", hash);
  }

  function observeSections() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.filter((entry) => entry.isIntersecting).forEach((entry) => setCurrent(entry.target));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }

  function setupMenu() {
    if (!menuButton || !navigation) return;
    const close = () => {
      navigation.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton.addEventListener("click", () => {
      const willOpen = navigation.hidden;
      navigation.hidden = !willOpen;
      menuButton.setAttribute("aria-expanded", String(willOpen));
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !navigation.hidden) {
        close();
        menuButton.focus();
      }
    });
  }

  buildRuler();
  buildNavigation();
  setupMenu();
  // 起動時は、URLの印（#y10 など）が指す章を現在地にする。URL は書き換えない（印を消さない）
  const startSection = sections.find((section) => `#${section.id}` === location.hash) || sections[0];
  setCurrent(startSection, { updateUrl: false });
  // ブラウザの自動スクロールより先に見張りが表紙を拾うと、URLの印が消える。先に自分で目的の章へ移動する
  if (startSection !== sections[0]) startSection.scrollIntoView({ behavior: "instant", block: "start" });
  observeSections();
})();

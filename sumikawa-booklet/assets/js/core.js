// 全ページ共通：季節の切替・手描きの図案・降るもの・目次
const root = document.documentElement;
const seasonTabs = document.querySelectorAll(".js-season");
const fxLayer = document.querySelector(".js-fx");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let artCounter = 0;
let drawObserver = null;

function currentSeason() {
  return root.getAttribute("data-season");
}

/* ---- 図譜：.js-art に季節の画像を差し込む。data-art="winter" のように固定もできる ---- */
const PLATE_ALT = { spring: "桜の枝の図譜", summer: "青楓の枝の図譜", autumn: "紅葉の図譜", winter: "松の枝の図譜" };

function artRoot() {
  return document.body.dataset.root || "";
}

function renderArt(slot) {
  const season = slot.dataset.art || currentSeason();
  slot.classList.remove("is-drawing");
  const image = document.createElement("img");
  image.src = `${artRoot()}assets/img/plates/plate-${season}.webp`;
  image.alt = PLATE_ALT[season] || "";
  image.width = 896;
  image.height = 1088;
  image.loading = slot.dataset.when === "load" ? "eager" : "lazy";
  slot.replaceChildren(image);
  if (slot.dataset.when === "open") return; // トップの表紙の裏は、ひらいたときに top.js が描き始める
  if (slot.dataset.when === "load" || !drawObserver) {
    window.requestAnimationFrame(() => slot.classList.add("is-drawing"));
  } else {
    drawObserver.observe(slot);
  }
}

function renderAllArt(onlyFollowingSeason) {
  document.querySelectorAll(".js-art").forEach((slot) => {
    if (onlyFollowingSeason && slot.dataset.art) return;
    renderArt(slot);
  });
  document.dispatchEvent(new CustomEvent("booklet:art"));
}

function startDrawing(when) {
  window.requestAnimationFrame(() => {
    document.querySelectorAll(".js-art, .js-photo").forEach((slot) => {
      if (slot.dataset.when === when) slot.classList.add("is-drawing");
    });
  });
}

/* ---- 季節で降るもの ---- */
const fxSettings = {
  spring: { count: 16, type: "petal", size: [9, 15], time: [14, 24], drift: [-14, 10] },
  summer: { count: 14, type: "mote", size: [3, 6], time: [12, 22], drift: [-6, 6] },
  autumn: { count: 14, type: "leaf", size: [10, 16], time: [13, 22], drift: [-16, 8] },
  winter: { count: 54, type: "snow", size: [2, 6], time: [11, 20], drift: [-6, 6] }
};

function between(range) {
  return range[0] + Math.random() * (range[1] - range[0]);
}

function buildFx() {
  if (!fxLayer) return;
  const setting = fxSettings[currentSeason()];
  fxLayer.replaceChildren();
  if (reducedMotion.matches) return;
  for (let index = 0; index < setting.count; index += 1) {
    const item = document.createElement("span");
    item.className = `fx__item fx__item--${setting.type}`;
    const time = between(setting.time);
    item.style.setProperty("--x", `${(Math.random() * 100).toFixed(1)}vw`);
    item.style.setProperty("--s", `${between(setting.size).toFixed(1)}px`);
    item.style.setProperty("--t", `${time.toFixed(1)}s`);
    item.style.setProperty("--d", `${(-Math.random() * time).toFixed(1)}s`);
    item.style.setProperty("--drift", `${between(setting.drift).toFixed(1)}vw`);
    fxLayer.append(item);
  }
}

/* ---- 季節を切り替える（選んだ季節は、この画面を閉じるまで引き継ぐ） ---- */
function markPressed() {
  seasonTabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.seasonValue === currentSeason())));
}

function chooseSeason(season) {
  root.setAttribute("data-season", season);
  try {
    window.sessionStorage.setItem("sumikawa-booklet-season", season);
  } catch (error) {
    // 保存できなくても、切り替えは行う
  }
  markPressed();
  renderAllArt(true);
  buildFx();
}

/* ---- 目次（全画面の頁） ---- */
const tocButton = document.querySelector(".js-toc-button");
const tocPanel = document.querySelector(".js-toc");

function setTocOpen(isOpen) {
  if (!tocPanel || !tocButton) return;
  tocPanel.classList.toggle("is-open", isOpen);
  tocButton.setAttribute("aria-expanded", String(isOpen));
  tocButton.querySelector("span").textContent = isOpen ? "閉じる" : "目次";
  document.body.classList.toggle("is-toc-open", isOpen);
  if (isOpen) tocPanel.querySelector("a")?.focus();
}

if (tocButton && tocPanel) {
  tocButton.addEventListener("click", () => setTocOpen(tocButton.getAttribute("aria-expanded") !== "true"));
  tocPanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setTocOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && tocPanel.classList.contains("is-open")) {
      setTocOpen(false);
      tocButton.focus();
    }
  });
}

seasonTabs.forEach((tab) => tab.addEventListener("click", () => chooseSeason(tab.dataset.seasonValue)));

if ("IntersectionObserver" in window) {
  drawObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-drawing");
        drawObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
}

window.Booklet = { startDrawing, renderAllArt };
markPressed();
renderAllArt(false);
buildFx();

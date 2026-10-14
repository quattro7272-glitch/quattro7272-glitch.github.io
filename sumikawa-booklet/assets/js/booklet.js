// 湯宿 澄川：一冊の小冊子（試作）。PC＝スクロールで表紙がひらく／スマホ＝なぞると紙がめくれ上がる
const root = document.documentElement;
const stage = document.querySelector(".js-stage");
const book = document.querySelector(".js-book");
const cover = document.querySelector(".js-cover");
const fxLayer = document.querySelector(".js-fx");
const seasonTabs = document.querySelectorAll(".js-season");
const artSlots = document.querySelectorAll(".js-art");
const desktopQuery = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let artCounter = 0;
let drawnWhenOpen = false;
let phoneOpened = false;

function currentSeason() {
  return root.getAttribute("data-season");
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

/* ---- 図案を差し込む（描き始めは「表紙＝すぐ」「図版＝ひらいたとき」） ---- */
function injectArt() {
  const art = window.ART && window.ART[currentSeason()];
  if (!art) return;
  artSlots.forEach((slot) => {
    artCounter += 1;
    slot.classList.remove("is-drawing");
    slot.innerHTML = art.replace(/__ID__/g, `a${artCounter}_`);
  });
  drawnWhenOpen = false;
  startDrawing("load");
  if (isOpened()) startDrawing("open");
}

function startDrawing(when) {
  if (when === "open") drawnWhenOpen = true;
  window.requestAnimationFrame(() => {
    artSlots.forEach((slot) => {
      if (slot.dataset.when === when) slot.classList.add("is-drawing");
    });
  });
}

function isOpened() {
  return desktopQuery.matches
    ? Number(book.style.getPropertyValue("--open") || 0) > 0.5
    : phoneOpened;
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

/* ---- PC：スクロール量を、表紙のひらき具合にする ---- */
function updateDesktop() {
  if (!desktopQuery.matches) return;
  const travel = stage.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - stage.offsetTop) / travel, 0, 1);
  const open = smooth(clamp((progress - 0.05) / 0.5, 0, 1));
  book.style.setProperty("--open", open.toFixed(4));
  if (open > 0.5 && !drawnWhenOpen) startDrawing("open");
}

function scrollToOpen() {
  const travel = stage.offsetHeight - window.innerHeight;
  window.scrollTo({ top: stage.offsetTop + travel * 0.6, behavior: reducedMotion.matches ? "auto" : "smooth" });
}

/* ---- スマホ：なぞる／押す／キー操作で、表紙が上へめくれる ---- */
function openPhone() {
  if (phoneOpened || desktopQuery.matches) return;
  phoneOpened = true;
  document.body.classList.add("is-open");
  document.body.classList.remove("is-locked");
  startDrawing("open");
}

function lockPhoneIfNeeded() {
  if (desktopQuery.matches) {
    document.body.classList.remove("is-locked", "is-open");
    phoneOpened = false;
    updateDesktop();
  } else if (!phoneOpened) {
    document.body.classList.add("is-locked");
  }
}

let touchStartY = null;

function setupPhoneGestures() {
  window.addEventListener("wheel", (event) => { if (Math.abs(event.deltaY) > 4) openPhone(); }, { passive: true });
  window.addEventListener("touchstart", (event) => { touchStartY = event.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", (event) => {
    if (touchStartY !== null && Math.abs(event.touches[0].clientY - touchStartY) > 14) openPhone();
  }, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "PageDown", " ", "Enter"].includes(event.key)) openPhone();
  });
}

function activateCover() {
  if (desktopQuery.matches) scrollToOpen();
  else openPhone();
}

/* ---- 季節を切り替える ---- */
function chooseSeason(season) {
  root.setAttribute("data-season", season);
  seasonTabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.seasonValue === season)));
  injectArt();
  buildFx();
}

seasonTabs.forEach((tab) => tab.addEventListener("click", () => chooseSeason(tab.dataset.seasonValue)));
cover.addEventListener("click", activateCover);
cover.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activateCover();
  }
});

window.addEventListener("scroll", updateDesktop, { passive: true });
window.addEventListener("resize", () => { lockPhoneIfNeeded(); updateDesktop(); });
desktopQuery.addEventListener("change", lockPhoneIfNeeded);

setupPhoneGestures();
seasonTabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.seasonValue === currentSeason())));
injectArt();
buildFx();
lockPhoneIfNeeded();
updateDesktop();

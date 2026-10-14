// トップ：PC＝スクロールで表紙がひらく／スマホ＝なぞると表紙が紙のようにめくれ上がる
const stage = document.querySelector(".js-stage");
const book = document.querySelector(".js-book");
const cover = document.querySelector(".js-cover");
const desktopQuery = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let drawnWhenOpen = false;
let phoneOpened = false;

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function isOpened() {
  return desktopQuery.matches ? Number(book.style.getPropertyValue("--open") || 0) > 0.5 : phoneOpened;
}

function drawOpenArt() {
  drawnWhenOpen = true;
  window.Booklet.startDrawing("open");
}

/* ---- PC ---- */
function updateDesktop() {
  if (!desktopQuery.matches) return;
  const travel = stage.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - stage.offsetTop) / travel, 0, 1);
  const open = smooth(clamp((progress - 0.05) / 0.5, 0, 1));
  book.style.setProperty("--open", open.toFixed(4));
  if (open > 0.5 && !drawnWhenOpen) drawOpenArt();
}

function scrollToOpen() {
  const travel = stage.offsetHeight - window.innerHeight;
  window.scrollTo({ top: stage.offsetTop + travel * 0.6, behavior: reducedMotion.matches ? "auto" : "smooth" });
}

/* ---- スマホ ---- */
function openPhone() {
  if (phoneOpened || desktopQuery.matches) return;
  phoneOpened = true;
  document.body.classList.add("is-open");
  document.body.classList.remove("is-locked");
  drawOpenArt();
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

if (stage && book && cover) {
  cover.addEventListener("click", activateCover);
  cover.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCover();
    }
  });
  document.addEventListener("booklet:art", () => {
    drawnWhenOpen = false;
    if (isOpened()) drawOpenArt();
  });
  window.addEventListener("scroll", updateDesktop, { passive: true });
  window.addEventListener("resize", () => { lockPhoneIfNeeded(); updateDesktop(); });
  desktopQuery.addEventListener("change", lockPhoneIfNeeded);
  setupPhoneGestures();
  lockPhoneIfNeeded();
  updateDesktop();
}

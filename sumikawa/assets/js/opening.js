// 表紙の障子を、読み込み後に開く（「動きを減らす」設定のときは何もしない：CSS 側で障子を出さない）
const heroElement = document.querySelector(".hero");
const wantsReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroElement && !wantsReducedMotion) {
  window.setTimeout(() => heroElement.classList.add("is-open"), 500);
}

// 家のつくり：材の名前を開くと、断面図のその部分を濃くする（開かなくても読める。図は補助）
(() => {
  const figure = document.querySelector(".js-parts-figure");
  const drawing = figure && figure.querySelector(".drawing");
  const items = [...document.querySelectorAll(".part-item")];
  if (!drawing || !items.length) return;

  const caption = figure.querySelector(".figure__caption");
  const defaultCaption = caption ? caption.textContent : "";

  function highlight(partName) {
    drawing.classList.toggle("has-active", Boolean(partName));
    // 小さな図でも、いま見ている所が文字で分かるようにする
    if (caption) {
      const active = items.find((item) => item.dataset.part === partName);
      caption.textContent = active ? `いま見ている所：${active.querySelector("summary").textContent}` : defaultCaption;
    }
    drawing.querySelectorAll(".part").forEach((part) => {
      part.classList.toggle("is-active", part.dataset.part === partName);
    });
  }

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        highlight(item.dataset.part);
        // 上の項目が閉じて位置がずれても、開いた項目が図の下に来るようにする
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        item.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
        return;
      }
      // 別の項目が開いていなければ、全体の表示に戻す
      if (!items.some((other) => other.open)) highlight("");
    });
  });
})();

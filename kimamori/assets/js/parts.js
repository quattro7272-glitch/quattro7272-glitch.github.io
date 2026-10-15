// 家のつくり：材の名前を開くと、断面図のその部分を濃くする（開かなくても読める。図は補助）
(() => {
  const figure = document.querySelector(".js-parts-figure");
  const drawing = figure && figure.querySelector(".drawing");
  const items = [...document.querySelectorAll(".part-item")];
  if (!drawing || !items.length) return;

  function highlight(partName) {
    drawing.classList.toggle("has-active", Boolean(partName));
    drawing.querySelectorAll(".part").forEach((part) => {
      part.classList.toggle("is-active", part.dataset.part === partName);
    });
  }

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        highlight(item.dataset.part);
        return;
      }
      // 別の項目が開いていなければ、全体の表示に戻す
      if (!items.some((other) => other.open)) highlight("");
    });
  });
})();

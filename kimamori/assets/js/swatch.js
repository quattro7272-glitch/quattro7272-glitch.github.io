// 「同じ木の、年の重ね方」：年数のつまみで、床・柱・梁の色見本の色を滑らかに変える（イメージの絵）
(() => {
  const range = document.querySelector(".js-era-range");
  const output = document.querySelector(".js-era-output");
  const target = document.querySelector(".js-era-swatches");
  if (!range || !output || !target) return;

  // 築0年・10年・30年のときの色（木の経年を想像した色）
  const STOPS = [0, 10, 30];
  const COLORS = {
    floor: ["#e9dabb", "#c99552", "#6f4c2d"],
    post: ["#dfc99c", "#b98443", "#5b3f27"],
    beam: ["#cdb07a", "#9d6a35", "#3f2a19"],
  };

  const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const mix = (a, b, ratio) => a.map((v, i) => Math.round(v + (b[i] - v) * ratio));

  function colorAt(list, year) {
    const upper = STOPS.findIndex((stop) => year <= stop);
    if (upper <= 0) return toRgb(list[0]);
    const ratio = (year - STOPS[upper - 1]) / (STOPS[upper] - STOPS[upper - 1]);
    return mix(toRgb(list[upper - 1]), toRgb(list[upper]), ratio);
  }

  function update() {
    const year = Number(range.value);
    Object.entries(COLORS).forEach(([name, list]) => {
      target.style.setProperty(`--${name}`, `rgb(${colorAt(list, year).join(",")})`);
    });
    output.textContent = year === 0 ? "築0年" : `築${year}年`;
    range.setAttribute("aria-valuetext", output.textContent);
  }

  range.addEventListener("input", update);
  update();
})();

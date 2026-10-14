const seasonButtons = document.querySelectorAll(".js-season-button");

function markPressedSeason(season) {
  seasonButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.seasonValue === season));
  });
}

function chooseSeason(season) {
  document.documentElement.setAttribute("data-season", season);
  markPressedSeason(season);
  try {
    window.localStorage.setItem("sumikawa-season", season);
  } catch (error) {
    // 保存できない環境では、切り替えるだけにする
  }
}

if (seasonButtons.length > 0) {
  markPressedSeason(document.documentElement.getAttribute("data-season"));
  seasonButtons.forEach((button) => {
    button.addEventListener("click", () => chooseSeason(button.dataset.seasonValue));
  });
}

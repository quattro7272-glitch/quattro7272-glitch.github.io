// 表示前に季節を決める。?season= → 前回の選択 → 前の頁の選択 → 今日の日付 の順
(function () {
  var seasons = ["spring", "summer", "autumn", "winter"];
  var chosen = null;
  try {
    var fromUrl = new URLSearchParams(window.location.search).get("season");
    if (seasons.indexOf(fromUrl) !== -1) {
      chosen = fromUrl;
      try { window.sessionStorage.setItem("sumikawa-booklet-season", chosen); } catch (error) {}
    }
  } catch (error) {}
  if (!chosen) {
    try {
      var saved = window.sessionStorage.getItem("sumikawa-booklet-season");
      if (seasons.indexOf(saved) !== -1) chosen = saved;
    } catch (error) {}
  }
  if (!chosen) {
    var month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) chosen = "spring";
    else if (month >= 6 && month <= 8) chosen = "summer";
    else if (month >= 9 && month <= 11) chosen = "autumn";
    else chosen = "winter";
  }
  document.documentElement.setAttribute("data-season", chosen);
  document.documentElement.classList.add("js");
})();

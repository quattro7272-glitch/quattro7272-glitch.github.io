// 料理ページ：春夏秋冬の札を押すと、その季節の料理に入れ替わる（矢印キーでも移れる）
(() => {
  const tabList = document.querySelector(".js-season-tabs");
  if (!tabList) return;

  const tabs = [...tabList.querySelectorAll('[role="tab"]')];

  const selectTab = (nextTab) => {
    tabs.forEach((tab) => {
      const isSelected = tab === nextTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (panel) panel.hidden = !isSelected;
    });
  };

  tabList.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tabList.addEventListener("keydown", (event) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(document.activeElement);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    selectTab(tabs[next]);
    tabs[next].focus();
  });

  // 開いた日の季節を最初に出す
  const month = new Date().getMonth() + 1;
  const seasonIndex = month >= 3 && month <= 5 ? 0 : month >= 6 && month <= 8 ? 1 : month >= 9 && month <= 11 ? 2 : 3;
  selectTab(tabs[seasonIndex]);
})();

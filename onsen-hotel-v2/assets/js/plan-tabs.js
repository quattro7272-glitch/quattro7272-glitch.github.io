// ===== 宿泊プラン / 日帰りプランの切り替え =====
// クリックのほか、左右の矢印キーでもタブを移動できる

function initPlanTabs() {
  const tabs = [...document.querySelectorAll('.plan-tabs__tab')];
  if (!tabs.length) return;

  const select = (selectedTab) => {
    tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !isSelected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const nextTab = tabs[(index + step + tabs.length) % tabs.length];
      select(nextTab);
      nextTab.focus();
    });
  });
}

initPlanTabs();

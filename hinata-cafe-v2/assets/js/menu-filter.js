// ===== メニューページ：種類で絞り込む =====
// ・ボタンを押すと、その種類だけを表示する
// ・トップページの「menu.html#bread」などから来たときは、その種類を選んだ状態で開く

function initMenuFilter() {
  const buttons = [...document.querySelectorAll('.js-filter')];
  const groups = [...document.querySelectorAll('.menu-group')];
  const status = document.getElementById('filter-status');
  if (!buttons.length || !groups.length) return;

  const categories = groups.map((group) => group.dataset.cat);

  const applyFilter = (filter) => {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });
    groups.forEach((group) => {
      group.hidden = filter !== 'all' && group.dataset.cat !== filter;
    });
    if (status) {
      const current = buttons.find((button) => button.dataset.filter === filter);
      status.textContent = filter === 'all' ? 'すべてのメニューを表示しています' : `${current.textContent}のメニューだけを表示しています`;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      applyFilter(filter);
      // 選んだ種類をアドレスに残す（再読み込みや共有でも同じ表示になる）
      history.replaceState(null, '', filter === 'all' ? location.pathname : `#${filter}`);
    });
  });

  const applyHash = () => {
    const hash = location.hash.slice(1);
    applyFilter(categories.includes(hash) ? hash : 'all');
  };

  window.addEventListener('hashchange', applyHash);
  applyHash();
  // ハッシュ付きで開いたときは、見出しではなく絞り込みボタンの位置から見せる
  if (categories.includes(location.hash.slice(1))) {
    document.querySelector('.menu-filter').scrollIntoView({ block: 'start' });
  }
}

initMenuFilter();

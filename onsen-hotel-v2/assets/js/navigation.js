// ===== メニュー（全画面）の開け閉め =====
// ・ボタン / メニュー内のリンク / Escキーで閉じる
// ・開いている間は、うしろの本文をキーボードで触れないようにする

function initMenu() {
  const root = document.documentElement;
  const menuButton = document.querySelector('.js-menu-button');
  const globalNav = document.getElementById('global-nav');
  if (!menuButton || !globalNav) return;

  const label = menuButton.querySelector('.menu-button__label');
  const background = document.querySelectorAll('.site-header, .site-main, .site-footer, .sp-bar, .site-tools__reserve');

  const setOpen = (open) => {
    root.classList.toggle('is-menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '閉じる' : 'メニュー';
    background.forEach((element) => { element.inert = open; });
    globalNav.inert = !open;
    if (open) globalNav.querySelector('a')?.focus();
  };

  globalNav.inert = true;
  menuButton.addEventListener('click', () => setOpen(!root.classList.contains('is-menu-open')));
  globalNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-menu-open')) {
      setOpen(false);
      menuButton.focus();
    }
  });
}

initMenu();

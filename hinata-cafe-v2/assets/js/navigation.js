// ===== ヘッダーとナビゲーション =====
// ・スクロールしたらヘッダーに背景を付ける
// ・スマホ用メニューの開閉（Esc・外側のタップでも閉じる）
// ・今見ているセクションのメニューに印を付ける

const root = document.documentElement;

function initHeaderOnScroll() {
  const update = () => root.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initMenu() {
  const menuButton = document.querySelector('.js-menu-button');
  const spNav = document.getElementById('sp-nav');
  if (!menuButton || !spNav) return;

  const label = menuButton.querySelector('.menu-button__label');

  const setOpen = (open) => {
    root.classList.toggle('is-menu-open', open);
    document.querySelectorAll('main, .site-footer').forEach((element) => { element.inert = open; });
    menuButton.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '閉じる' : 'メニュー';
  };

  menuButton.addEventListener('click', () => setOpen(!root.classList.contains('is-menu-open')));
  spNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  spNav.addEventListener('click', (event) => {
    if (event.target === spNav) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-menu-open')) {
      setOpen(false);
      menuButton.focus();
    }
  });
  // 画面を広げてPC表示になったら閉じておく
  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

function initScrollSpy() {
  const links = [...document.querySelectorAll('.gnav__list a[href^="#"]')];
  // メニューにないセクション（ファーストビューなど）に来たら印を消すため、main 直下のセクションをすべて見る
  const sections = [...document.querySelectorAll('main > section')];
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        if (entry.target.id && link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

initHeaderOnScroll();
initMenu();
initScrollSpy();

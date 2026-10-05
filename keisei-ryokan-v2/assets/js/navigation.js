// ===== ヘッダーとナビゲーション =====
// ・スクロールしたらヘッダーに背景を付ける
// ・「上スクロールで表示」モードでは、下へ進むとヘッダーを隠す
// ・スマホ用メニューの開閉
// ・今見ているセクションのメニューに印を付ける
// ・ナビの表示方法の切り替え（設定はブラウザに保存して全ページで続く）

const root = document.documentElement;
const NAV_MODE_KEY = 'keisei-nav-mode';
const header = document.querySelector('.site-header');

function initHeaderOnScroll() {
  if (!header) return;
  let lastScrollY = window.scrollY;

  const update = () => {
    const scrollY = window.scrollY;
    root.classList.toggle('is-scrolled', scrollY > 40);

    const goingDown = scrollY > lastScrollY;
    const pastHeader = scrollY > header.offsetHeight * 2;
    header.classList.toggle('is-hidden', goingDown && pastHeader && !root.classList.contains('is-menu-open'));
    lastScrollY = scrollY;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initMenu() {
  const menuButton = document.querySelector('.js-menu-button');
  const spNav = document.getElementById('sp-nav');
  if (!menuButton || !spNav) return;

  const setOpen = (open) => {
    root.classList.toggle('is-menu-open', open);
    document.querySelectorAll('main, .site-footer, .side-reserve, .demo-switch')
      .forEach((element) => { element.inert = open; });
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.menu-button__label').textContent = open ? '閉じる' : 'メニュー';
    if (window.keiseiLenis) open ? window.keiseiLenis.stop() : window.keiseiLenis.start();
  };

  menuButton.addEventListener('click', () => setOpen(!root.classList.contains('is-menu-open')));
  spNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  // パネルの外（暗い幕）を押したら閉じる
  spNav.addEventListener('click', (event) => {
    if (event.target === spNav) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-menu-open')) {
      setOpen(false);
      menuButton.focus();
    }
  });
}

function initScrollSpy() {
  const links = [...document.querySelectorAll('.gnav__list a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  // 画面の真ん中にあるセクションと同じリンクに印を付ける（メニューにないセクションでは印を消す）
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

function initNavModeSwitch() {
  const options = [...document.querySelectorAll('.js-nav-mode')];
  const hint = document.querySelector('.js-nav-mode-hint');
  if (!options.length) return;

  const HINTS = {
    fixed: 'ナビはいつも画面の上に表示されます',
    smart: '下へスクロールするとナビが隠れ、上へ戻すと出てきます',
  };
  let hintTimer;

  const render = () => {
    const mode = root.classList.contains('smart-header') ? 'smart' : 'fixed';
    options.forEach((option) => option.setAttribute('aria-pressed', String(option.dataset.mode === mode)));
  };

  const showHint = (mode) => {
    if (!hint) return;
    hint.textContent = HINTS[mode];
    hint.classList.add('is-visible');
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => hint.classList.remove('is-visible'), 4000);
  };

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const mode = option.dataset.mode;
      root.classList.toggle('smart-header', mode === 'smart');
      header?.classList.remove('is-hidden');
      try { localStorage.setItem(NAV_MODE_KEY, mode); } catch (error) { /* 保存できない環境では、このページだけ切り替える */ }
      render();
      showHint(mode);
    });
  });
  render();
}

initHeaderOnScroll();
initMenu();
initScrollSpy();
initNavModeSwitch();

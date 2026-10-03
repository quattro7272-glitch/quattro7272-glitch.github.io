// ===== ヘッダー =====
// 常に表示       … スクロールしても常に表示（少し小さくなる）
// 上スクロール表示 … 下に読み進めると隠れ、少し上に戻すと出てくる
// どちらにするかは左下のボタンで切り替え、ブラウザに保存して全ページで続ける
// （参考にしたサイトはヘッダーが上に置いてあるだけで、
//   メニューから移動するとナビが画面外に消えていた。ここを改善）
const header = document.querySelector('.header');
// 「上スクロールで表示」かどうかは <html> の smart-header クラスで判断する
// （<head> 内の小さなスクリプトが、保存された設定を読んで付けている）
const root = document.documentElement;
const NAV_KEY = 'keisei-nav-mode';
const isSmartMode = () => root.classList.contains('smart-header');
const spBar = document.querySelector('.sp-bar'); // スマホ下部のメニュー
let lastY = window.scrollY;

// 上のナビと下のメニューの出し入れ（「上スクロールで表示」の時だけ動く）
//   下へスクロール → 上のナビを隠し、下のメニューを出す
//   上へスクロール → 上のナビを出し、下のメニューを隠す（どちらか片方だけ表示）
const setBars = (headerHidden, barHidden) => {
  header.classList.toggle('is-hidden', headerHidden);
  if (spBar) spBar.classList.toggle('is-hidden', barHidden);
};

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-compact', y > 80);

  if (!isSmartMode()) return;
  const menuOpen = document.body.classList.contains('no-scroll');
  if (y < 120 || menuOpen) {
    setBars(false, false);                       // ページの一番上付近では両方表示
    lastY = y;
    return;
  }
  const delta = y - lastY;
  if (Math.abs(delta) < 8) return;               // ゆっくりした小さな動きは、たまるまで待つ
  if (delta > 0) setBars(true, false);           // 下へ進んだ
  else setBars(false, true);                     // 上へ戻した
  lastY = y;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 左下のボタンで切り替え → 設定を保存（ページを移っても、次に来た時も続く）
const switchBtn = document.querySelector('.demo-switch');
const updateSwitch = () => {
  if (!switchBtn) return;
  switchBtn.textContent = isSmartMode()
    ? 'ナビ：上スクロールで表示 ▶ 常に表示に切替'
    : 'ナビ：常に表示 ▶ 上スクロールで表示に切替';
};
if (switchBtn) {
  switchBtn.addEventListener('click', () => {
    const smart = !isSmartMode();
    root.classList.toggle('smart-header', smart);
    setBars(false, false);
    try { localStorage.setItem(NAV_KEY, smart ? 'smart' : 'fixed'); } catch (e) {}
    updateSwitch();
  });
}
updateSwitch();

// キーボードでナビにフォーカスが来たら、隠れていても表示する
header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

// ===== 今見ているセクションのメニューに印をつける =====
// 同じページ内へのリンク（#〜）だけを対象にする（空室状況ページなどでは対象なし）
const navLinks = [...document.querySelectorAll('.gnav a')].filter((a) => a.getAttribute('href').startsWith('#'));
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      const active = a.getAttribute('href') === `#${entry.target.id}`;
      a.classList.toggle('is-current', active);
      if (active) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => s && spy.observe(s));

// ===== スマホ用メニュー =====
const menuBtn = document.querySelector('.menu-btn');
const spNav = document.querySelector('.sp-nav');
const setMenu = (open) => {
  spNav.classList.toggle('is-open', open);
  if (open) header.classList.remove('is-hidden'); // 閉じるボタンが隠れないように
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  document.body.classList.toggle('no-scroll', open);
};
menuBtn.addEventListener('click', () => setMenu(!spNav.classList.contains('is-open')));
spNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// ===== スライドショー =====
const slides = document.querySelectorAll('.slide__img');
const dots = document.querySelectorAll('.slide__dots li');
let current = 0;
if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }, 5000);
}

// ===== 温泉の写真カルーセル（左右ボタンで1枚ずつ・端まで行くと反対側へつながる） =====
const track = document.querySelector('.carousel__track');
if (track) {
  const originals = [...track.children];
  const count = originals.length;
  // 前後に2枚ずつ複製を置いて、端でも左右に写真がのぞくようにする
  const clone = (li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; };
  originals.slice(-2).reverse().forEach((li) => track.prepend(clone(li)));
  originals.slice(0, 2).forEach((li) => track.append(clone(li)));

  let index = 2; // 複製2枚の次が本物の1枚目
  const slides = () => [...track.children];

  const moveTo = (i, animate = true) => {
    const li = slides()[i];
    const offset = track.parentElement.clientWidth / 2 - (li.offsetLeft + li.offsetWidth / 2);
    track.classList.toggle('is-animating', animate);
    track.style.transform = `translateX(${offset}px)`;
    slides().forEach((s, k) => s.classList.toggle('is-current', k === i));
  };

  // 複製の位置まで来たら、アニメーションなしで本物の同じ写真の位置へ戻す
  track.addEventListener('transitionend', (e) => {
    if (e.target !== track) return;
    if (index >= count + 2) { index -= count; moveTo(index, false); }
    if (index < 2) { index += count; moveTo(index, false); }
  });

  let busy = false;
  const go = (step) => {
    if (busy) return;
    busy = true;
    index += step;
    moveTo(index);
    setTimeout(() => { busy = false; }, 620);
  };
  document.querySelector('.carousel__btn--prev').addEventListener('click', () => go(-1));
  document.querySelector('.carousel__btn--next').addEventListener('click', () => go(1));

  // スマホのスワイプでも送れるようにする
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX = null;
  });

  moveTo(index, false);
  window.addEventListener('resize', () => moveTo(index, false));
  window.addEventListener('load', () => moveTo(index, false)); // 画像の読み込み後に位置を合わせ直す
}

// ===== 詳細ポップアップ =====
document.querySelectorAll('[data-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.modal).showModal();
    document.body.classList.add('no-scroll'); // 後ろのページが動かないように
  });
});
document.querySelectorAll('.modal').forEach((modal) => {
  modal.querySelector('.modal__close').addEventListener('click', () => modal.close());
  // 写真や文章のない黒い部分をクリックしても閉じる
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  // ×・Escキー・背景クリック、どの閉じ方でもスクロールを戻す
  modal.addEventListener('close', () => document.body.classList.remove('no-scroll'));
});

// ===== ふわっと表示 =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade, .reveal, .anim-ver, .anim-catch, .anim-member, .anim-area, .btn-more')
  .forEach((el) => observer.observe(el));

// 右端の「ご予約について」タブは、ページを開くと画面の外から滑り込む
const sideTab = document.querySelector('.side-reserve');
if (sideTab) window.addEventListener('load', () => sideTab.classList.add('is-on'));

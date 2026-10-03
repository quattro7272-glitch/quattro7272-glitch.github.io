// スマホ用メニューの開閉
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  document.body.classList.toggle('no-scroll', open);
};
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// スクロールでヘッダーの見た目を切り替え、ページトップボタンを表示
const header = document.querySelector('.header');
const pagetop = document.querySelector('.pagetop');
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 80);
  pagetop.classList.toggle('is-show', y > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// メインビジュアルのスライドショー（6秒ごとに切り替え）
const slides = document.querySelectorAll('.hero__slide');
const dots = document.querySelectorAll('.hero__dots li');
let current = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (slides.length > 1 && !reduceMotion) {
  setInterval(() => {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }, 6000);
}

// 空室検索：チェックイン日の初期値を「明日」にする
const checkin = document.getElementById('checkin');
if (checkin) {
  // toISOString() は世界標準時になるので、日本時間の日付を自分で組み立てる
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  checkin.value = ymd(tomorrow);
  checkin.min = ymd(today);
}

// おすすめプランのタブ切り替え
const tabs = document.querySelectorAll('.plan__tab');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  });
});

// 画面に入った要素をふわっと表示
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade').forEach((el) => observer.observe(el));

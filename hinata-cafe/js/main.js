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
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

// スクロールしたらヘッダーに影をつける
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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

// メニューページ：タブで種類を絞り込む
const tabs = document.querySelectorAll('.tab');
const items = document.querySelectorAll('.menu-item');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    const filter = tab.dataset.filter;
    items.forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.cat !== filter;
    });
  });
});

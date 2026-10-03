// ハンバーガーメニュー
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuBtn.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
});

// メニュー内のリンクを押したら閉じる
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', false);
  });
});

// スクロールでヘッダーに背景をつける
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
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

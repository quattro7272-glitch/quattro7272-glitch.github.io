// ===== 動き =====
// ・読み込み時：ファーストビューの写真と文字（1回だけ）
// ・写真：画面に入ったらゆっくり現れる
// ・飾り：スクロールに合わせて、吊るし飾りが別々の速さで動き、日の出の帯が横に流れる
// 「動きを減らす」設定の人には何も動かさない

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initLoadMotion() {
  const html = document.documentElement;
  html.classList.add('has-motion');
  // 次の描画で is-loaded を付けて、CSS の変化を始める
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('is-loaded')));
}

function initReveal() {
  const targets = document.querySelectorAll('.js-reveal');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  targets.forEach((target) => observer.observe(target));
}

function initScrollDecor() {
  const strands = [...document.querySelectorAll('.js-parallax')];
  const band = document.querySelector('.js-band');
  if (!strands.length && !band) return;

  let ticking = false;
  const update = () => {
    const viewH = window.innerHeight;
    strands.forEach((strand) => {
      const box = strand.parentElement.getBoundingClientRect();
      const offset = (box.top + box.height / 2 - viewH / 2) * Number(strand.dataset.speed || 0);
      strand.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    if (band) {
      const box = band.getBoundingClientRect();
      // 帯が画面の下から上へ通りすぎる間に、左へ最大 600px 流れる
      const progress = Math.min(Math.max((viewH - box.top) / (viewH + box.height), 0), 1);
      band.style.transform = `translate3d(${(300 - progress * 600).toFixed(1)}px, 0, 0)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

window.hinataMotionReady = true;

if (!reduceMotion) {
  initLoadMotion();
  initReveal();
  initScrollDecor();
}

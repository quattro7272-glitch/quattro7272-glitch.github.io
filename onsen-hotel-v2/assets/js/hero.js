// ===== トップの写真の切り替え（7秒ごと） =====
// ・動きを減らす設定の人には切り替えない
// ・「写真の切り替えを止める」ボタンで止めたり、また動かしたりできる

function initHeroSlides() {
  const slides = [...document.querySelectorAll('.hero__slide')];
  const marks = [...document.querySelectorAll('.hero__progress li')];
  const pauseButton = document.querySelector('.js-hero-pause');
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let current = 0;
  let timerId = null;

  const show = (index) => {
    slides[current].classList.remove('is-active');
    marks[current]?.classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    marks[current]?.classList.add('is-active');
  };

  const play = () => {
    timerId = window.setInterval(() => show((current + 1) % slides.length), 7000);
  };

  const stop = () => {
    window.clearInterval(timerId);
    timerId = null;
  };

  play();

  if (!pauseButton) return;
  pauseButton.hidden = false;
  pauseButton.addEventListener('click', () => {
    const isPlaying = timerId !== null;
    if (isPlaying) stop(); else play();
    pauseButton.setAttribute('aria-pressed', String(isPlaying));
    pauseButton.textContent = isPlaying ? '写真の切り替えを再開する' : '写真の切り替えを止める';
  });
}

initHeroSlides();

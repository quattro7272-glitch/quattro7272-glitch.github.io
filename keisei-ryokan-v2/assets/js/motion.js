// ===== 動き（GSAP + Lenis） =====
// 動きは「最初の一場面（トップ・下層の見出し）」と「写真が幕を上げて現れる」の2つだけに絞っている。
// 動きを減らす設定の人や、ライブラリが読み込めなかったときは何もしない（そのまま全部見える）。

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSmoothScroll() {
  if (typeof window.Lenis !== 'function') return null;

  const lenis = new window.Lenis({ lerp: 0.1 });
  lenis.on('scroll', window.ScrollTrigger.update);
  window.gsap.ticker.add((time) => lenis.raf(time * 1000));
  window.gsap.ticker.lagSmoothing(0);
  window.keiseiLenis = lenis;

  // ページ内リンクもなめらかに移動させる（固定ヘッダーの高さ分ずらす）
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      const target = hash === '#top' ? 0 : document.querySelector(hash);
      if (target === null) return;
      event.preventDefault();
      lenis.start();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -header.offsetHeight });
      history.replaceState(null, '', hash);
    });
  });

  return lenis;
}

function playHeroIntro() {
  const { gsap } = window;
  const firstSlide = document.querySelector('.hero__slide.is-active');
  const lines = document.querySelectorAll('.js-hero-copy .hero__line');
  const caption = document.querySelector('.js-hero-caption');
  if (!firstSlide) return;

  // 縦書きの文字が、上から筆で書くように現れる
  gsap.timeline()
    .fromTo(firstSlide, { scale: 1.1 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
    .fromTo(lines, { clipPath: 'inset(0 0 100% 0)' }, {
      clipPath: 'inset(0 0 0% 0)', duration: 1.6, ease: 'power3.inOut', stagger: 0.45,
    }, 0.4)
    .fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 1.6);
}

function initHeroSlideshow() {
  const { gsap } = window;
  const slides = [...document.querySelectorAll('.js-hero-slides .hero__slide')];
  if (slides.length < 2) return;

  let current = 0;
  const showNext = () => {
    const prev = slides[current];
    current = (current + 1) % slides.length;
    const next = slides[current];
    next.classList.add('is-active');
    gsap.set(next, { zIndex: 1 });
    gsap.set(prev, { zIndex: 0 });
    gsap.fromTo(next, { opacity: 0, scale: 1.06 }, {
      opacity: 1, scale: 1, duration: 2, ease: 'power1.inOut',
      onComplete: () => {
        prev.classList.remove('is-active');
        gsap.set(prev, { opacity: 0 });
      },
    });
  };
  window.setInterval(showNext, 7000);
}

function initHeroParallax() {
  const { gsap } = window;
  gsap.to('.js-hero-slides', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

// 下層ページ：見出しの写真がゆっくり寄ってきて、見出しの文字が下から現れる
function playPageHeadIntro() {
  const { gsap } = window;
  const image = document.querySelector('.js-page-head-image');
  const title = document.querySelector('.js-page-head-title');
  if (!image || !title) return;

  gsap.timeline()
    .fromTo(image, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
    .fromTo(title, { clipPath: 'inset(100% 0 0 0)', y: 20 }, {
      clipPath: 'inset(0% 0 0 0)', y: 0, duration: 1.4, ease: 'power3.out',
    }, 0.3);
}

function initPhotoReveal() {
  const { gsap } = window;
  document.querySelectorAll('.js-reveal').forEach((figure) => {
    const image = figure.querySelector('img');
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: figure, start: 'top 85%', once: true },
    });
    timeline
      .fromTo(figure, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power3.inOut' }, 0)
      .fromTo(image, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0);
  });
}

function initMotion() {
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;
  window.gsap.registerPlugin(window.ScrollTrigger);

  initSmoothScroll();
  if (document.querySelector('.hero')) {
    playHeroIntro();
    initHeroSlideshow();
    initHeroParallax();
  }
  playPageHeadIntro();
  initPhotoReveal();
}

initMotion();

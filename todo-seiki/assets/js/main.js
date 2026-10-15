(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 現在地・目次・先頭へ ---------- */
  const sections = Array.from(document.querySelectorAll('[data-label]'));
  const hereNum = document.querySelector('.gnav__num');
  const hereLabel = document.querySelector('.gnav__label');
  const tocLinks = Array.from(document.querySelectorAll('.gnav__toc a'));
  const tocScroller = document.querySelector('.gnav__toc');
  const totop = document.querySelector('.totop');

  function setCurrent(section) {
    if (hereNum) hereNum.textContent = section.dataset.num;
    if (hereLabel) hereLabel.textContent = section.dataset.label;
    tocLinks.forEach((link) => {
      const active = link.getAttribute('href') === '#' + section.id;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      if (active && tocScroller) {
        const offset = link.offsetLeft - (tocScroller.clientWidth - link.offsetWidth) / 2;
        tocScroller.scrollTo({ left: Math.max(offset, 0), behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
    if (location.hash !== '#' + section.id) {
      history.replaceState(null, '', '#' + section.id);
    }
  }

  const currentObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setCurrent(entry.target);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach((section) => currentObserver.observe(section));

  /* 「次へ」行の矢印と重なる間は、先頭へ戻るボタンをよける */
  const nextRows = Array.from(document.querySelectorAll('.next'));
  const covering = new Set();
  let nextObserver = null;
  function watchNextRows() {
    if (!totop || !nextRows.length) return;
    if (nextObserver) nextObserver.disconnect();
    covering.clear();
    const strip = Math.max(window.innerHeight - 84, 0);
    nextObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) covering.add(entry.target);
        else covering.delete(entry.target);
      });
      totop.classList.toggle('is-covering', covering.size > 0);
    }, { rootMargin: `-${strip}px 0px 0px 0px` });
    nextRows.forEach((row) => nextObserver.observe(row));
  }
  watchNextRows();
  window.addEventListener('resize', watchNextRows);

  function updateTotop() {
    if (totop) totop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', updateTotop, { passive: true });
  updateTotop();

  /* ---------- 動画：画面に入った時だけ再生 ---------- */
  const loopVideos = Array.from(document.querySelectorAll('.js-loop'));
  if (!reducedMotion && loopVideos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.4 });
    loopVideos.forEach((video) => videoObserver.observe(video));
  }

  /* ---------- 工場の数字：数えて止まる ---------- */
  const counters = Array.from(document.querySelectorAll('.js-count'));
  if (!reducedMotion && counters.length) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  }
  function runCount(el) {
    const target = Number(el.dataset.to);
    const start = target > 100 ? target - 40 : 0;
    const duration = 900;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 見積もりの目安（金額は出さない・日数と工程だけ） ---------- */
  const form = document.getElementById('estimate-form');
  const daysOut = document.getElementById('result-days');
  const stepsOut = document.getElementById('result-steps');
  const sendLink = document.getElementById('result-send');

  const MATERIAL = {
    aluminum: { label: 'アルミ', days: 0 },
    brass: { label: '真鍮', days: 1 },
    stainless: { label: 'ステンレス', days: 2 },
    titanium: { label: 'チタン', days: 4 }
  };
  const PROCESS = {
    lathe: { label: '旋削', days: 1 },
    mill: { label: 'フライス', days: 1 },
    drill: { label: '穴あけ・ねじ', days: 1 },
    finish: { label: '仕上げ', days: 1 }
  };

  function readForm() {
    const data = new FormData(form);
    const num = (name, min, max) => Math.min(Math.max(Number(data.get(name)) || min, min), max);
    return {
      material: data.get('material'),
      w: num('w', 1, 300), d: num('d', 1, 300), h: num('h', 1, 300),
      qty: num('qty', 1, 1000),
      procs: data.getAll('proc')
    };
  }

  function estimate(input) {
    const volume = (input.w * input.d * input.h) / 1000; // 立方センチ
    let days = 2; // 図面確認と段取り
    days += MATERIAL[input.material].days;
    days += input.procs.reduce((sum, key) => sum + PROCESS[key].days, 0);
    if (volume > 200) days += 1;
    if (volume > 1000) days += 2;
    if (input.qty >= 10) days += 1;
    if (input.qty >= 50) days += 2;
    if (input.qty >= 200) days += 3;
    return days;
  }

  function renderEstimate() {
    const input = readForm();
    const days = estimate(input);
    daysOut.textContent = days;
    stepsOut.textContent = '';
    const steps = [
      ['図面確認・段取り'],
      ...input.procs.map((key) => [PROCESS[key].label]),
      ['寸法検査・出荷']
    ];
    if (input.procs.length === 0) steps.splice(1, 0, ['加工を選んでください', '']);
    steps.forEach(([label], index) => {
      const li = document.createElement('li');
      li.style.animationDelay = (reducedMotion ? 0 : index * 60) + 'ms';
      li.textContent = label;
      stepsOut.appendChild(li);
    });
    const summary = `素材：${MATERIAL[input.material].label}／大きさ：${input.w}×${input.d}×${input.h}ミリ／加工：` +
      (input.procs.map((key) => PROCESS[key].label).join('・') || '未選択') +
      `／個数：${input.qty}個／日数の目安：${days}営業日ほど`;
    sendLink.dataset.summary = summary;
  }

  if (form) {
    form.addEventListener('input', renderEstimate);
    form.addEventListener('submit', (event) => event.preventDefault());
    renderEstimate();
  }

  /* ---------- 問い合わせ（見積もりの結果を引き継ぐ。送信はしない） ---------- */
  const contactBody = document.getElementById('c-body');
  const contactForm = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');

  if (sendLink && contactBody) {
    sendLink.addEventListener('click', () => {
      const summary = sendLink.dataset.summary || '';
      if (!contactBody.value.includes('日数の目安')) {
        contactBody.value = (contactBody.value ? contactBody.value + '\n\n' : '') + summary;
      } else {
        contactBody.value = contactBody.value.replace(/素材：[^\n]*日数の目安：[^\n]*/, summary);
      }
    });
  }

  if (contactForm && status) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      status.hidden = false;
      status.textContent = 'これは架空のサイトのため、送信はされません。';
    });
  }
})();

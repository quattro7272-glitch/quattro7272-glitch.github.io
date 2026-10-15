(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 見本ごとのスイッチ ---------- */
  document.querySelectorAll('.ex').forEach((section) => {
    const toggle = section.querySelector('.switch');
    const phrases = section.querySelector('.js-demo-phrases');
    const replay = section.querySelector('.js-replay');
    if (!toggle) return;

    function play() {
      if (!phrases) return;
      phrases.classList.remove('is-playing');
      void phrases.offsetWidth; // 一度リセットしてから、もう一度動かす
      phrases.classList.add('is-playing');
    }

    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(on));
      section.classList.toggle('is-on', on);
      if (on) play();
    });
    if (replay) replay.addEventListener('click', play);
  });

  /* ---------- 08 枠の中の小さなページ：現在地・目次・先頭へ ---------- */
  const minipage = document.querySelector('.js-minipage');
  if (minipage) {
    const num = minipage.querySelector('.js-mini-num');
    const label = minipage.querySelector('.js-mini-label');
    const links = Array.from(minipage.querySelectorAll('.js-mini-link'));
    const sections = Array.from(minipage.querySelectorAll('.mini-sec'));
    const miniObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sec = entry.target;
        num.textContent = sec.dataset.mini;
        label.textContent = sec.dataset.minilabel;
        links.forEach((link) => {
          if (link.getAttribute('href') === '#' + sec.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { root: minipage, rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((sec) => miniObserver.observe(sec));
    // 枠の中のリンクは、ページ全体ではなく枠だけを動かす
    minipage.querySelectorAll('a[href^="#m"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = minipage.querySelector(link.getAttribute('href'));
        if (!target) return;
        const bar = minipage.querySelector('.mini-bar');
        const barHeight = bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
        // 枠の中での位置＝（目標の画面上の位置 − 枠の画面上の位置）＋今のスクロール量
        const top = target.getBoundingClientRect().top - minipage.getBoundingClientRect().top + minipage.scrollTop - barHeight;
        minipage.scrollTo({ top: Math.max(top, 0), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- ページの現在地・目次・先頭へ（08 が入るまでは表示だけ隠れている） ---------- */
  const pageSections = Array.from(document.querySelectorAll('[data-label]'));
  const hereNum = document.querySelector('.gnav__num');
  const hereLabel = document.querySelector('.gnav__label');
  const tocLinks = Array.from(document.querySelectorAll('.gnav__toc a'));
  const tocScroller = document.querySelector('.gnav__toc');
  const totop = document.querySelector('.totop');
  let montageRunning = false;

  function setCurrent(section) {
    hereNum.textContent = section.dataset.num;
    hereLabel.textContent = section.dataset.label;
    tocLinks.forEach((link) => {
      const active = link.getAttribute('href') === '#' + section.id;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      if (active && tocScroller && getComputedStyle(tocScroller).display !== 'none') {
        const offset = link.offsetLeft - (tocScroller.clientWidth - link.offsetWidth) / 2;
        tocScroller.scrollTo({ left: Math.max(offset, 0), behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
    pendingHash = '#' + section.id;
    scheduleHash();
  }
  // URL の # は、スクロールが止まってから書き換える（iPhone はスクロール中に書き換えると跳ねることがある）
  let pendingHash = '';
  let hashTimer = 0;
  function scheduleHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      if (!montageRunning && pendingHash && location.hash !== pendingHash) history.replaceState(null, '', pendingHash);
    }, 400);
  }
  const currentObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setCurrent(entry.target); });
  }, { rootMargin: '-30% 0px -60% 0px' });
  pageSections.forEach((section) => currentObserver.observe(section));

  /* ページの中の移動は履歴に積まない（Safari の端スワイプで同じページの中を行き来してしまうため） */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.closest('.js-minipage')) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
  });

  function updateTotop() {
    totop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', updateTotop, { passive: true });
  updateTotop();

  // 「次へ」行の矢印と重なる間は、先頭へ戻るボタンをよける
  const nextRows = Array.from(document.querySelectorAll('.next'));
  const covering = new Set();
  let nextObserver = null;
  function watchNextRows() {
    if (nextObserver) nextObserver.disconnect();
    covering.clear();
    const strip = Math.max(window.innerHeight - 84, 0);
    nextObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) covering.add(entry.target); else covering.delete(entry.target);
      });
      totop.classList.toggle('is-covering', covering.size > 0);
    }, { rootMargin: `-${strip}px 0px 0px 0px` });
    nextRows.forEach((row) => nextObserver.observe(row));
  }
  watchNextRows();
  // iPhone はバーの出入りでも resize が来るので、幅が変わった時だけ作り直す
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    watchNextRows();
  });

  /* ---------- 最後のスイッチ：早送りで技が重なる ---------- */
  const finaleButton = document.querySelector('.js-finale');
  const stamp = document.querySelector('.stamp');
  const STEPS = [
    ['w-paper', '01 紙の色'],
    ['w-type', '02 行間と字間'],
    ['w-btn', '03 ボタン'],
    ['w-row', '04 行リンク'],
    ['w-text', '05 文字の出方'],
    ['w-card', '06 カードの縁'],
    ['w-sticky', '07 貼り付く見出し'],
    ['w-nav', '08 迷子にならない'],
    ['w-img', '09 写真'],
    ['w-grid', '＋ 余白と配置']
  ];
  const ALL = STEPS.map(([cls]) => cls);
  const INTERVAL = 340;
  let timers = [];

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function showStamp(text) {
    stamp.hidden = false;
    stamp.textContent = text;
    stamp.style.animation = 'none';
    void stamp.offsetWidth;
    stamp.style.animation = '';
  }

  function replayCover() {
    // 05：表紙の文字をもう一度、句ごとに出す
    document.querySelectorAll('.cover .js-phrases').forEach((el) => {
      el.querySelectorAll('span').forEach((span) => { span.style.animation = 'none'; });
      void el.offsetWidth;
      el.querySelectorAll('span').forEach((span) => { span.style.animation = ''; });
    });
  }

  /* ヘッダーの「ビフォー｜アフター」：早送りを一度見たあとは、どこからでも一押しで切り替え */
  const baButton = document.querySelector('.js-ba');
  function showBa() { if (baButton) baButton.hidden = false; }
  function syncBa(on) { if (baButton) baButton.setAttribute('aria-pressed', String(on)); }
  if (baButton) {
    baButton.addEventListener('click', () => {
      const on = root.classList.contains('w-paper');
      if (on) removeAll(); else applyAll();
    });
  }

  function applyAll() {
    clearTimers();
    root.classList.add(...ALL);
    stamp.hidden = true;
    finaleButton.setAttribute('aria-pressed', 'true');
    finaleButton.textContent = '素朴なページに戻す';
    updateTotop();
    showBa(); syncBa(true);
  }

  function removeAll() {
    clearTimers();
    root.classList.remove(...ALL);
    stamp.hidden = true;
    finaleButton.setAttribute('aria-pressed', 'false');
    finaleButton.textContent = 'この頁に、全部の技を使う';
    updateTotop();
    syncBa(false);
  }

  function runMontage() {
    montageRunning = true;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = '';
    finaleButton.setAttribute('aria-pressed', 'true');
    finaleButton.textContent = '素朴なページに戻す';
    STEPS.forEach(([cls, text], index) => {
      timers.push(setTimeout(() => {
        root.classList.add(cls);
        showStamp(text);
        if (cls === 'w-text') replayCover();
        if (cls === 'w-nav') updateTotop();
      }, 500 + index * INTERVAL));
    });
    timers.push(setTimeout(() => {
      stamp.hidden = true;
      montageRunning = false;
      history.replaceState(null, '', '#top');
      showBa(); syncBa(true);
    }, 500 + STEPS.length * INTERVAL + 900));
  }

  if (finaleButton) {
    finaleButton.addEventListener('click', () => {
      const on = finaleButton.getAttribute('aria-pressed') === 'true';
      if (on) { removeAll(); return; }
      if (reducedMotion) {
        window.scrollTo(0, 0);
        applyAll();
      } else {
        runMontage();
      }
    });
  }
})();

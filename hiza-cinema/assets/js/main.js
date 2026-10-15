(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- 現在地・進捗・先頭へ ---------- */
  const sections = Array.from(document.querySelectorAll('[data-label]'));
  const hereNum = document.querySelector('.gnav__num');
  const hereLabel = document.querySelector('.gnav__label');
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const totop = document.querySelector('.totop');
  const cover = document.getElementById('top');
  const film = document.getElementById('film');

  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--page', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    const viewport = Math.max(window.innerHeight, 1);
    root.style.setProperty('--scroll', Math.min(window.scrollY / viewport, 1));
    totop.classList.toggle('is-visible', window.scrollY > viewport * 0.6);
    if (film && !reducedMotion) {
      const rect = film.getBoundingClientRect();
      const progress = 1 - (rect.bottom / Math.max(rect.height + window.innerHeight, 1));
      film.style.setProperty('--sp', Math.max(0, Math.min(progress, 1)).toFixed(3));
    }
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  const currentObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const section = entry.target;
      const index = sections.indexOf(section);
      hereNum.textContent = String(index).padStart(2, '0');
      hereLabel.textContent = section.dataset.label;
      tocLinks.forEach((link) => {
        link.setAttribute('aria-current', link.getAttribute('href') === '#' + section.id ? 'true' : 'false');
      });
      if (window.scrollY > 10 || location.hash) {
        history.replaceState(null, '', index === 0 ? location.pathname : '#' + section.id);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((section) => currentObserver.observe(section));

  /* ページの中の移動は履歴に積まない（Safari の端スワイプで同じページの中を行き来してしまうため） */
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash.length > 1 ? document.querySelector(hash) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  });

  /* ---------- 目次 ---------- */
  const tocButton = document.querySelector('.gnav__toggle');
  const toc = document.getElementById('toc');
  function setToc(open) {
    toc.hidden = !open;
    tocButton.setAttribute('aria-expanded', String(open));
    tocButton.textContent = open ? '閉じる' : '目次';
  }
  tocButton.addEventListener('click', () => setToc(toc.hidden));
  toc.addEventListener('click', (e) => { if (e.target.closest('a')) setToc(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !toc.hidden) { setToc(false); tocButton.focus(); } });

  /* ---------- 文章が順にともる ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObserver.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -20% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- 日没の計算（架空の港町＝北緯37.4・東経136.9、日本標準時） ---------- */
  const LAT = 37.4;
  const LON = 136.9;
  const rad = (deg) => deg * Math.PI / 180;

  function sunsetMinutes(year, month, day) {
    const dayOfYear = Math.round((Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000);
    const b = rad(360 / 365 * (dayOfYear - 81));
    const declination = rad(23.44) * Math.sin(b);
    const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    const cosHour = (Math.sin(rad(-0.833)) - Math.sin(rad(LAT)) * Math.sin(declination)) /
      (Math.cos(rad(LAT)) * Math.cos(declination));
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHour))) * 180 / Math.PI;
    const solarNoon = 720 - 4 * (LON - 135) - equationOfTime;
    return solarNoon + hourAngle * 4;
  }
  const clock = (minutes) => {
    const rounded = Math.ceil(minutes / 5) * 5;
    return String(Math.floor(rounded / 60)).padStart(2, '0') + ':' + String(rounded % 60).padStart(2, '0');
  };

  const jstNow = new Date(Date.now() + 9 * 3600000);
  const todayShow = clock(sunsetMinutes(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate()) + 30);
  document.querySelectorAll('[data-sunset-show]').forEach((el) => { el.textContent = todayShow + '（日没の30分後）'; });

  const body = document.getElementById('timetable-body');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  body.textContent = '';
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate() + i));
    const row = document.createElement('tr');
    if (i === 0) row.className = 'is-today';
    const closed = d.getUTCDay() === 3;
    const head = document.createElement('th');
    head.scope = 'row';
    head.textContent = (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + '（' + weekdays[d.getUTCDay()] + '）' + (i === 0 ? ' 今日' : '');
    row.appendChild(head);
    if (closed) {
      const rest = document.createElement('td');
      rest.colSpan = 3;
      rest.textContent = '休館';
      rest.style.fontFamily = 'var(--serif)';
      rest.style.fontSize = '1rem';
      rest.style.color = 'var(--ink-dim)';
      row.appendChild(rest);
    } else {
      const sunset = clock(sunsetMinutes(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + 30);
      ['11:00', '14:00', sunset].forEach((time) => {
        const cell = document.createElement('td');
        cell.textContent = time;
        row.appendChild(cell);
      });
    }
    body.appendChild(row);
  }

  /* ---------- 座席表 ---------- */
  const svg = document.getElementById('seatmap');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const rowCounts = [8, 9, 10, 10, 10, 11];
  const rowNames = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatSize = 28;
  const pitch = 40;
  const rowPitch = 44;
  const firstRowY = 74;

  const make = (name, attrs) => {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  const screen = make('path', { d: 'M110 22 Q300 6 490 22 L486 38 Q300 24 114 38 Z', class: 'screen' });
  const screenLabel = make('text', { x: 300, y: 54, 'text-anchor': 'middle', class: 'screen-label' });
  screenLabel.setAttribute('fill', 'var(--ink-dim)');
  screenLabel.style.fill = 'var(--ink-dim)';
  screenLabel.textContent = 'SCREEN';
  svg.append(screen, screenLabel);

  const seatNodes = [];
  rowCounts.forEach((count, rowIndex) => {
    const y = firstRowY + rowIndex * rowPitch;
    const label = make('text', { x: 24, y: y + 19, class: 'row-label' });
    label.textContent = rowNames[rowIndex];
    svg.appendChild(label);
    for (let n = 0; n < count; n += 1) {
      const x = 300 - ((count - 1) * pitch) / 2 + n * pitch - seatSize / 2;
      const seat = make('g', {
        class: 'seat', role: 'button', tabindex: 0, 'aria-pressed': 'false',
        'aria-label': rowNames[rowIndex] + '列 ' + (n + 1) + '番の席からの見え方'
      });
      seat.dataset.row = rowIndex;
      seat.dataset.col = n;
      seat.dataset.cx = x + seatSize / 2;
      seat.dataset.name = rowNames[rowIndex] + '-' + (n + 1);
      seat.appendChild(make('rect', { x, y, width: seatSize, height: seatSize - 4, rx: 5 }));
      svg.appendChild(seat);
      seatNodes.push(seat);
    }
  });

  const lightSeats = () => {
    seatNodes.forEach((seat, index) => {
      setTimeout(() => seat.classList.add('is-lit'), reducedMotion ? 0 : index * 38);
    });
  };
  const seatObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) { lightSeats(); seatObserver.disconnect(); }
  }, { threshold: 0.35 });
  seatObserver.observe(svg);

  const viewSeat = document.getElementById('view-seat');
  const viewNote = document.getElementById('view-note');
  const viewScreen = document.getElementById('view-screen');
  const notes = [
    '画面がすぐ目の前。見上げる角度で、映像に包まれます。',
    '近め。画面の端まで視線を動かして観る席です。',
    '画面全体が自然に収まります。迷ったら、このあたり。',
    '中央寄りなら、音も正面から届きます。',
    '後ろ寄り。画面の全体と、客席の暗がりが一緒に見えます。',
    '最後列。映写機の光の筋が、頭の上を通ります。'
  ];

  function chooseSeat(seat) {
    seatNodes.forEach((node) => node.setAttribute('aria-pressed', String(node === seat)));
    const row = Number(seat.dataset.row);
    const lateral = (Number(seat.dataset.cx) - 300) / 220;
    const half = 120 - row * 9;
    const heightNear = 60 - row * 4.5;
    const shrinkFar = 1 - Math.abs(lateral) * 0.22;
    const centerX = 160 - lateral * 38;
    const leftHeight = lateral > 0 ? heightNear * shrinkFar : heightNear;
    const rightHeight = lateral < 0 ? heightNear * shrinkFar : heightNear;
    const centerY = 90 - row * 1.5;
    viewScreen.setAttribute('points', [
      [centerX - half, centerY - leftHeight],
      [centerX + half, centerY - rightHeight],
      [centerX + half, centerY + rightHeight],
      [centerX - half, centerY + leftHeight]
    ].map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
    viewSeat.textContent = seat.dataset.name;
    viewNote.textContent = notes[row] + (Math.abs(lateral) > 0.55 ? ' 端の席なので、画面は少し斜めに見えます。' : '');
  }

  svg.addEventListener('click', (e) => { const seat = e.target.closest('.seat'); if (seat) chooseSeat(seat); });
  svg.addEventListener('keydown', (e) => {
    const seat = e.target.closest('.seat');
    if (seat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); chooseSeat(seat); }
  });
})();

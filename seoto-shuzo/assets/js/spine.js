/* 温度経過表の線（背骨）と、「いま何日目か」の表示。
   スクロール位置から、日・工程名・温度を読み取って画面の固定欄に出す。 */
(function () {
  const tracks = document.querySelector('.js-tracks');
  if (!tracks) return;

  const steps = Array.from(tracks.querySelectorAll('.js-step'));
  const svg = tracks.querySelector('.js-spine-svg');
  const baseLine = svg.querySelector('.js-line-base');
  const doneLine = svg.querySelector('.js-line-done');
  const dotLayer = svg.querySelector('.js-dots');
  const marker = svg.querySelector('.js-marker');

  const nowDay = document.querySelector('.js-now-day');
  const nowName = document.querySelector('.js-now-name');
  const nowTemp = document.querySelector('.js-now-temp');
  const nowBar = document.querySelector('.js-now-bar');
  const rulerLinks = Array.from(document.querySelectorAll('.js-ruler-link'));

  const TEMP_MIN = 4;
  const TEMP_MAX = 42;
  const READ_LINE = 0.45; // 画面の上から45%の位置を「いまここ」とみなす
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const TOTAL_DAYS = 48;

  let points = [];
  let totalLength = 0;
  let lastHash = null;
  let hashTimer = null;
  let frame = null;

  /* 章の本文が終わる位置（章のいちばん下に「経過表示」が入っていれば、その手前）。
     日数・温度は、ここまでで章の最初から最後まで進み、経過表示のところでは最終日になる */
  function contentEnd(step) {
    const interval = step.querySelector('.interval');
    return interval ? interval.offsetTop : step.offsetTop + step.offsetHeight;
  }

  function build() {
    const width = svg.parentElement.clientWidth;
    const height = tracks.offsetHeight;
    const pad = width < 100 ? 10 : 22;

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    points = [];
    steps.forEach(function (step) {
      const temps = step.dataset.temps.split(',').map(Number);
      const top = step.offsetTop;
      const bodyHeight = contentEnd(step) - top;
      const toX = function (temp) {
        return pad + ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * (width - pad * 2);
      };
      temps.forEach(function (temp, index) {
        const ratio = temps.length === 1 ? 0 : index / (temps.length - 1);
        points.push({ x: toX(temp), y: top + ratio * bodyHeight, length: 0 });
      });
      if (step.offsetHeight > bodyHeight + 1) {
        points.push({ x: toX(temps[temps.length - 1]), y: top + step.offsetHeight, length: 0 });
      }
    });

    totalLength = 0;
    points.forEach(function (point, index) {
      if (index > 0) {
        const previous = points[index - 1];
        totalLength += Math.hypot(point.x - previous.x, point.y - previous.y);
      }
      point.length = totalLength;
    });

    const pointString = points.map(function (point) {
      return point.x.toFixed(1) + ',' + point.y.toFixed(1);
    }).join(' ');
    baseLine.setAttribute('points', pointString);
    doneLine.setAttribute('points', pointString);
    doneLine.style.strokeDasharray = totalLength;

    dotLayer.textContent = '';
    points.forEach(function (point) {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'spine__dot');
      dot.setAttribute('r', '3');
      dot.setAttribute('cx', point.x.toFixed(1));
      dot.setAttribute('cy', point.y.toFixed(1));
      dotLayer.appendChild(dot);
    });
  }

  /* 基準線の高さ(y)に対応する線上の点（x と、線の長さ）を返す */
  function locate(y) {
    if (!points.length) return null;
    if (y <= points[0].y) return { x: points[0].x, y: points[0].y, length: 0 };
    let index = 0;
    for (let i = 0; i < points.length; i += 1) {
      if (points[i].y <= y) index = i;
    }
    const current = points[index];
    const next = points[index + 1];
    if (!next) return { x: current.x, y: current.y, length: current.length };
    const rise = next.y - current.y;
    const ratio = rise > 0 ? (y - current.y) / rise : 0;
    return {
      x: current.x + (next.x - current.x) * ratio,
      y: y,
      length: current.length + (next.length - current.length) * ratio
    };
  }

  function currentStep(y) {
    for (let i = 0; i < steps.length; i += 1) {
      const top = steps[i].offsetTop;
      if (y >= top && y < top + steps[i].offsetHeight) return { step: steps[i], index: i };
    }
    return null;
  }

  function interpolate(list, ratio) {
    if (list.length === 1) return list[0];
    const scaled = ratio * (list.length - 1);
    const low = Math.min(Math.floor(scaled), list.length - 2);
    return list[low] + (list[low + 1] - list[low]) * (scaled - low);
  }

  function updateHash(id) {
    if (id === lastHash) return;
    lastHash = id;
    window.clearTimeout(hashTimer);
    hashTimer = window.setTimeout(function () {
      const url = window.location.pathname + window.location.search + (id ? '#' + id : '');
      window.history.replaceState(null, '', url);
    }, 200);
  }

  function update() {
    frame = null;
    const tracksTop = tracks.getBoundingClientRect().top + window.scrollY;
    const referenceY = window.scrollY + window.innerHeight * READ_LINE - tracksTop;
    const clampedY = Math.max(0, Math.min(tracks.offsetHeight, referenceY));

    const spot = locate(clampedY);
    if (spot) {
      marker.setAttribute('cx', spot.x.toFixed(1));
      marker.setAttribute('cy', spot.y.toFixed(1));
      doneLine.style.strokeDashoffset = totalLength - spot.length;
    }

    const found = currentStep(referenceY < 0 ? -1 : clampedY >= tracks.offsetHeight ? tracks.offsetHeight - 1 : clampedY);
    let activeId = '';

    if (!found) {
      nowDay.textContent = '0';
      nowName.textContent = 'はじめに';
      nowTemp.textContent = '';
      nowBar.style.width = '0%';
    } else {
      const step = found.step;
      const ratio = Math.max(0, Math.min(1, (clampedY - step.offsetTop) / Math.max(1, contentEnd(step) - step.offsetTop)));
      const dayStart = Number(step.dataset.dayStart);
      const dayEnd = Number(step.dataset.dayEnd);
      const day = Math.round(dayStart + (dayEnd - dayStart) * ratio);
      const temp = interpolate(step.dataset.temps.split(',').map(Number), ratio);
      nowDay.textContent = String(day);
      nowName.textContent = step.dataset.name;
      nowTemp.textContent = Math.round(temp) + '℃ の記録';
      nowBar.style.width = (day / TOTAL_DAYS * 100).toFixed(1) + '%';
      activeId = step.id;
    }

    rulerLinks.forEach(function (link) {
      if (link.dataset.target === activeId) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    updateHash(activeId);
  }

  function schedule() {
    if (frame === null) frame = window.requestAnimationFrame(update);
  }

  function rebuild() {
    build();
    schedule();
  }

  rebuild();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', rebuild);
  if ('ResizeObserver' in window) {
    new ResizeObserver(rebuild).observe(tracks);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rebuild);
  }
})();

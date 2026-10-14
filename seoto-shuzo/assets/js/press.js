/* 搾りの長押し：袋を押している間だけ、酒が一滴ずつ落ちる。
   縦スクロールは邪魔しない（touch-action: pan-y）。指が動いてスクロールになったら、押したことにはしない。 */
(function () {
  const root = document.querySelector('.js-press-root');
  if (!root) return;

  const zone = root.querySelector('.js-press-zone');
  const art = root.querySelector('.js-press-art');
  const dropLayer = root.querySelector('.js-press-drops');
  const liquid = root.querySelector('.js-press-liquid');
  const stateLabel = root.querySelector('.js-press-state');
  const countElement = root.querySelector('.js-press-count');
  const mlElement = root.querySelector('.js-press-ml');
  const noteElement = root.querySelector('.js-press-note');
  const resetButton = root.querySelector('.js-press-reset');
  const liveRegion = root.querySelector('#press-live');

  const DROP_INTERVAL_MS = 125; // 1秒に8滴
  const ML_PER_DROP = 0.05;
  const CUP_ML = 10;
  // 位置の数字は、絵（SVG）の側に書いてある（絵を差し替えても、ここは触らなくてよい）
  const CUP_TOP = Number(art.dataset.cupTop);
  const CUP_BOTTOM = Number(art.dataset.cupBottom);
  const DROP_X = Number(art.dataset.dropX);
  const DROP_Y = Number(art.dataset.dropY);
  const DROP_TRAVEL = Number(art.dataset.dropTravel);
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initialNote = noteElement.textContent;

  let count = 0;
  let timer = null;
  let isFull = false;

  function render() {
    const ml = count * ML_PER_DROP;
    countElement.textContent = String(count);
    mlElement.textContent = ml.toFixed(1);
    const fraction = Math.min(1, ml / CUP_ML);
    const surface = CUP_BOTTOM - (CUP_BOTTOM - CUP_TOP) * fraction;
    liquid.setAttribute('y', surface.toFixed(1));
  }

  function fallDrop() {
    if (reducedMotion.matches || !dropLayer.animate) return;
    const drop = document.createElementNS(SVG_NS, 'ellipse');
    drop.setAttribute('class', 'press-art__drop');
    drop.setAttribute('cx', String(DROP_X));
    drop.setAttribute('cy', String(DROP_Y));
    drop.setAttribute('rx', '7');
    drop.setAttribute('ry', '10');
    dropLayer.appendChild(drop);
    const animation = drop.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(' + DROP_TRAVEL + 'px)' }],
      { duration: 380, easing: 'ease-in' }
    );
    animation.onfinish = function () {
      drop.remove();
    };
  }

  function stop() {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
    zone.classList.remove('is-pressing');
    if (!isFull) stateLabel.textContent = 'おす';
  }

  function finish() {
    isFull = true;
    stop();
    stateLabel.textContent = 'いっぱい';
    noteElement.textContent = '盃がいっぱいになりました。約' + count + '滴、10ml。一升瓶なら、この180倍です。';
    resetButton.hidden = false;
    liveRegion.textContent = '盃がいっぱいになりました。';
  }

  function tick() {
    count += 1;
    fallDrop();
    render();
    if (count % 100 === 0) liveRegion.textContent = count + '滴';
    if (count * ML_PER_DROP >= CUP_ML) finish();
  }

  function start() {
    if (timer !== null || isFull) return;
    zone.classList.add('is-pressing');
    stateLabel.textContent = 'したたる…';
    tick();
    if (!isFull) timer = window.setInterval(tick, DROP_INTERVAL_MS);
  }

  zone.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (zone.setPointerCapture) {
      try { zone.setPointerCapture(event.pointerId); } catch (error) { /* 対応していなければ何もしない */ }
    }
    start();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (name) {
    zone.addEventListener(name, stop);
  });
  zone.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  zone.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) start();
    }
  });
  zone.addEventListener('keyup', function (event) {
    if (event.key === ' ' || event.key === 'Enter') stop();
  });
  zone.addEventListener('blur', stop);
  window.addEventListener('blur', stop);

  resetButton.addEventListener('click', function () {
    count = 0;
    isFull = false;
    resetButton.hidden = true;
    noteElement.textContent = initialNote;
    stateLabel.textContent = 'おす';
    liveRegion.textContent = '空の盃にもどしました。';
    render();
    zone.focus();
  });

  render();
})();

/* 縮尺ズーム：スクロールにあわせて、米1粒 → 心白 → でんぷん → 麹菌 と倍率が上がる。
   動きを減らす設定のときは何もせず、4枚の絵が縦に並ぶ（CSS側で対応）。 */
(function () {
  const zoom = document.querySelector('.js-zoom');
  if (!zoom) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const track = zoom.querySelector('.js-zoom-track');
  const stage = zoom.querySelector('.js-zoom-stage');
  const scenes = Array.from(zoom.querySelectorAll('.js-zoom-scene'));
  const scaleItems = Array.from(zoom.querySelectorAll('.js-zoom-scale li'));
  const nowElement = zoom.querySelector('.js-zoom-now');
  if (!track || !stage || scenes.length < 2) return;

  const arts = scenes.map(function (scene) {
    return scene.querySelector('.zoom-art');
  });
  let frame = null;

  zoom.classList.add('is-live');

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function update() {
    frame = null;
    const rect = track.getBoundingClientRect();
    const stickyTop = parseFloat(window.getComputedStyle(stage).top) || 0;
    const range = Math.max(1, rect.height - stage.offsetHeight);
    const progress = clamp((stickyTop - rect.top) / range, 0, 1);
    const position = progress * (scenes.length - 1);

    scenes.forEach(function (scene, index) {
      const distance = position - index;
      const opacity = clamp(1 - Math.abs(distance) * 1.25, 0, 1);
      const scale = distance < 0 ? 1 + distance * 0.55 : 1 + distance * 1.8;
      scene.style.opacity = opacity.toFixed(3);
      scene.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      arts[index].style.transform = 'scale(' + scale.toFixed(3) + ')';
    });

    const active = Math.round(position);
    scaleItems.forEach(function (item, index) {
      if (index === active) {
        item.setAttribute('aria-current', 'step');
      } else {
        item.removeAttribute('aria-current');
      }
    });
    nowElement.textContent = String(active + 1);
  }

  function schedule() {
    if (frame === null) frame = window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
})();

/* 酒・蔵・買う のページ用：いまどの章にいるかを、固定欄（左／下の帯）に出す。
   トップの spine.js と同じ考え方（現在地を常に見せる）。 */
(function () {
  const sections = Array.from(document.querySelectorAll('.js-section'));
  if (!sections.length) return;

  const nowIndex = document.querySelector('.js-now-day');
  const nowName = document.querySelector('.js-now-name');
  const nowBar = document.querySelector('.js-now-bar');
  const rulerLinks = Array.from(document.querySelectorAll('.js-ruler-link'));
  const READ_LINE = 0.4; // 画面の上から40%の位置を「いまここ」とみなす

  let lastHash = null;
  let hashTimer = null;
  let frame = null;

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
    const referenceY = window.scrollY + window.innerHeight * READ_LINE;
    let activeIndex = -1;
    sections.forEach(function (section, index) {
      if (section.getBoundingClientRect().top + window.scrollY <= referenceY) activeIndex = index;
    });

    const active = activeIndex >= 0 ? sections[activeIndex] : null;
    nowIndex.textContent = String(activeIndex + 1);
    nowName.textContent = active ? active.dataset.name : 'はじめに';

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    nowBar.style.width = (ratio * 100).toFixed(1) + '%';

    const activeId = active ? active.id : '';
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

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
})();

/* 「いま、蔵では」：見ている端末の時刻から、蔵の一日の表のどこにいるかを出す。
   表は HTML の一覧が正本（JSが動かなくても、表は読める）。時刻は端末の中だけで使う。 */
(function () {
  const root = document.querySelector('.js-kura-now');
  if (!root) return;

  const timeElement = root.querySelector('.js-kura-time');
  const taskElement = root.querySelector('.js-kura-task');
  const detailElement = root.querySelector('.js-kura-detail');
  const nextElement = root.querySelector('.js-kura-next');
  const strip = root.querySelector('.js-kura-strip');

  const items = Array.from(root.querySelectorAll('.js-kura-list li')).map(function (li) {
    return {
      element: li,
      start: Number(li.dataset.start),
      end: Number(li.dataset.end),
      title: li.querySelector('.kura-now__item-title').textContent,
      // 自分のHTMLの中身をそのままコピーする（文節の <wbr> も一緒に運ぶ）
      detail: li.querySelector('.kura-now__item-detail').innerHTML
    };
  });
  if (!items.length) return;

  const segments = items.map(function (item) {
    const segment = document.createElement('i');
    segment.className = 'kura-now__segment';
    segment.style.flexGrow = String(item.end - item.start);
    strip.appendChild(segment);
    return segment;
  });
  const marker = document.createElement('b');
  marker.className = 'kura-now__marker';
  strip.appendChild(marker);

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function update() {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    let currentIndex = items.findIndex(function (item) {
      return hours >= item.start && hours < item.end;
    });
    if (currentIndex < 0) currentIndex = 0;
    const current = items[currentIndex];

    let nextIndex = (currentIndex + 1) % items.length;
    while (items[nextIndex].title === current.title && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % items.length;
    }
    const next = items[nextIndex];

    timeElement.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
    taskElement.textContent = current.title;
    detailElement.innerHTML = current.detail;
    nextElement.textContent = '次は ' + (next.start % 24) + ':00 から「' + next.title + '」';

    items.forEach(function (item, index) {
      if (index === currentIndex) {
        item.element.setAttribute('aria-current', 'time');
      } else {
        item.element.removeAttribute('aria-current');
      }
      segments[index].classList.toggle('is-current', index === currentIndex);
    });
    marker.style.left = (hours / 24 * 100).toFixed(2) + '%';
  }

  update();
  window.setInterval(update, 30000);
})();

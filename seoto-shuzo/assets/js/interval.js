/* 章と章のあいだの「経過」表示：
   その章の終わりの数日ぶんの帳面の記録（日・温度）が、スクロールで1行ずつ現れ、
   その下に「つぎ：◯日目 ○○」と、経過中を表す点が出る。
   各章（section）の最後の子として入れるので、現在地の判定（spine.js）は、あいだで途切れない。
   数字は、章の data-属性（日数・温度）から作る。 */
(function () {
  const steps = Array.from(document.querySelectorAll('.js-step'));
  if (steps.length < 2) return;

  const LOG_LINES = 3;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function temperatureAt(temps, ratio) {
    if (temps.length === 1) return temps[0];
    const scaled = ratio * (temps.length - 1);
    const low = Math.min(Math.floor(scaled), temps.length - 2);
    return temps[low] + (temps[low + 1] - temps[low]) * (scaled - low);
  }

  function buildInterval(step, nextStep) {
    const dayStart = Number(step.dataset.dayStart);
    const dayEnd = Number(step.dataset.dayEnd);
    const temps = step.dataset.temps.split(',').map(Number);
    const firstDay = Math.max(dayStart, dayEnd - LOG_LINES + 1);

    const wrapper = document.createElement('div');
    wrapper.className = 'interval';
    wrapper.setAttribute('aria-hidden', 'true');

    const log = document.createElement('ol');
    log.className = 'interval__log';
    for (let day = firstDay; day <= dayEnd; day += 1) {
      const ratio = dayEnd === dayStart ? 1 : (day - dayStart) / (dayEnd - dayStart);
      const item = document.createElement('li');
      item.className = 'interval__line';
      item.innerHTML =
        '<span class="interval__day">' + day + '日目</span>' +
        '<span class="interval__name"></span>' +
        '<span class="interval__temp">' + temperatureAt(temps, ratio).toFixed(1) + '℃</span>';
      item.querySelector('.interval__name').textContent = step.dataset.name;
      log.appendChild(item);
    }
    wrapper.appendChild(log);

    const wait = document.createElement('p');
    wait.className = 'interval__wait';
    wait.innerHTML = '<span class="interval__dots"><i></i><i></i><i></i></span>';
    const label = document.createElement('span');
    label.textContent = 'つぎ：' + nextStep.dataset.dayStart + '日目　' + nextStep.dataset.name;
    wait.appendChild(label);
    wrapper.appendChild(wait);

    step.appendChild(wrapper);
    return wrapper;
  }

  const intervals = steps.slice(0, -1).map(function (step, index) {
    return buildInterval(step, steps[index + 1]);
  });

  // スクロールで、記録が1行ずつ現れる（動きを減らす設定では、最初から全部見せる）
  if (reducedMotion || !('IntersectionObserver' in window)) {
    intervals.forEach(function (wrapper) { wrapper.classList.add('is-seen'); });
    return;
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-seen');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.3 });
  intervals.forEach(function (wrapper) { observer.observe(wrapper); });
})();

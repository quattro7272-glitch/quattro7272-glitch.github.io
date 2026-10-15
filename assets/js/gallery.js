// 作品集：今どの作品を見ているかを、上の帯の番号とURLの「#」に反映する。
// 画像は、画面に入ったらゆっくり現れる（動きを減らす設定のときは何もしない）。

const indexLinks = Array.from(document.querySelectorAll('.js-index a'));
const sections = indexLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function markCurrent(id) {
  indexLinks.forEach((link) => {
    if (link.hash === `#${id}`) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function reflectHash(id) {
  const next = id ? `#${id}` : location.pathname;
  if (location.hash !== (id ? next : '')) {
    history.replaceState(null, '', next);
  }
}

if ('IntersectionObserver' in window) {
  // 画面のまん中あたりを横切っている作品を「いま見ている作品」とする
  const currentObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markCurrent(entry.target.id);
          reflectHash(entry.target.id);
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((section) => currentObserver.observe(section));

  // 先頭（はじめに）に戻ったら、番号の印と「#」を外す
  const intro = document.querySelector('.intro');
  if (intro) {
    const introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markCurrent('');
            reflectHash('');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    introObserver.observe(intro);
  }

  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (motionOk) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    targets.forEach((target) => revealObserver.observe(target));
  } else {
    targets.forEach((target) => target.classList.add('is-in'));
  }
} else {
  document.querySelectorAll('.reveal').forEach((target) => target.classList.add('is-in'));
}

// 「#」つきで開かれたときも、現在地を出す
if (location.hash) {
  markCurrent(location.hash.slice(1));
}

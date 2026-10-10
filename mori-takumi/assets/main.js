(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* スクロールに合わせて、ゆっくり現れる */
  var items = document.querySelectorAll('.reveal');
  if(reduce || !hasIO){
    items.forEach(function(el){ el.classList.add('in'); });
  }else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:0.15,rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el){ io.observe(el); });
  }

  /* スマホのメニュー */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function setMenu(open){
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  }
  btn.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function(e){ if(e.target.tagName === 'A'){ setMenu(false); } });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ setMenu(false); } });

  /* スマホの固定バー：最初の画面を過ぎたら表示、締めの予約が見えたら隠す */
  var bar = document.querySelector('.sticky-cta');
  var heroGone = false, endSeen = false;
  function updateBar(){
    var show = heroGone && !endSeen;
    bar.classList.toggle('show', show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    bar.querySelector('a').tabIndex = show ? 0 : -1;
  }
  if(hasIO){
    new IntersectionObserver(function(es){ heroGone = !es[0].isIntersecting; updateBar(); }).observe(document.querySelector('.hero'));
    new IntersectionObserver(function(es){ endSeen = es[0].isIntersecting; updateBar(); }).observe(document.getElementById('cta'));
  }
})();

/* 予約フォーム：ポートフォリオ用の見本のため、送信は止めて案内だけ出す */
(function(){
  var form = document.querySelector('form[data-review="form-unfinished"]');
  if(!form){ return; }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var s = document.getElementById('form-status');
    s.hidden = false;
    s.textContent = 'ポートフォリオ用の見本のため、送信はされません。';
  });
})();

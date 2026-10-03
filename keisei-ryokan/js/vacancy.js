// ===== 空室状況カレンダー =====
// 本物のサイトでは予約システムからデータを読み込むところ。
// ここではサンプルとして、日付から決まった空室状況を作っている。

const MONTHS = 6;           // 今月から6か月分を表示
const CLOSED_WEEKDAY = 3;   // 水曜日は休館日（サンプル）

const STATUS = {
  ok:     { mark: '○', label: '空室あり',     text: 'ご予約いただけます。' },
  few:    { mark: '△', label: '残りわずか',   text: '残りわずかです。お早めにお電話ください。' },
  full:   { mark: '×', label: '満室',         text: '満室です。キャンセル待ちはお電話で承ります。' },
  tel:    { mark: '☎', label: 'お電話でお問い合わせください', text: '空室状況はお電話でご確認ください。' },
  closed: { mark: '休', label: '休館日',       text: '休館日のため、ご宿泊いただけません。' },
  past:   { mark: '',   label: '',             text: '' },
};

const today = new Date();
today.setHours(0, 0, 0, 0);

// 日付ごとのサンプル状況（同じ日付なら毎回同じ結果になる）
const statusOf = (date) => {
  if (date < today) return 'past';
  if (date.getDay() === CLOSED_WEEKDAY) return 'closed';
  const n = (date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate()) * 2654435761 % 100;
  const weekend = date.getDay() === 6 || date.getDay() === 5;
  if (weekend) return n < 45 ? 'full' : n < 75 ? 'few' : 'ok';
  return n < 12 ? 'full' : n < 27 ? 'few' : n < 35 ? 'tel' : 'ok';
};

const pad = (n) => String(n).padStart(2, '0');
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

const tabsEl = document.querySelector('.month-tabs');
const titleEl = document.querySelector('.cal-title');
const tbody = document.querySelector('.calendar tbody');
const prevBtn = document.querySelector('.cal-nav--prev');
const nextBtn = document.querySelector('.cal-nav--next');
const info = document.querySelector('.day-info');

const months = [...Array(MONTHS)].map((_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1));
let index = 0;

// 月のタブを作る
months.forEach((m, i) => {
  const b = document.createElement('button');
  b.className = 'month-tab';
  b.setAttribute('role', 'tab');
  b.innerHTML = `<small>${m.getFullYear()}</small>${m.getMonth() + 1}月`;
  b.addEventListener('click', () => show(i));
  tabsEl.appendChild(b);
});

function show(i) {
  index = i;
  const m = months[i];
  titleEl.textContent = `${m.getFullYear()}年 ${m.getMonth() + 1}月`;
  [...tabsEl.children].forEach((b, k) => {
    b.classList.toggle('is-active', k === i);
    b.setAttribute('aria-selected', k === i);
  });
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === MONTHS - 1;
  info.hidden = true;

  // カレンダーの中身を作る
  tbody.innerHTML = '';
  const first = new Date(m.getFullYear(), m.getMonth(), 1);
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  let row = document.createElement('tr');
  for (let k = 0; k < first.getDay(); k++) row.appendChild(document.createElement('td'));

  for (let d = 1; d <= days; d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d);
    const st = statusOf(date);
    const td = document.createElement('td');
    td.className = `is-${st}`;
    if (date.getTime() === today.getTime()) td.classList.add('is-today');

    if (st === 'past') {
      td.innerHTML = `<span class="day">${d}</span>`;
    } else {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.innerHTML = `<span class="day">${d}</span><span class="st" aria-hidden="true">${STATUS[st].mark}</span>`;
      btn.setAttribute('aria-label', `${m.getMonth() + 1}月${d}日 ${STATUS[st].label}`);
      btn.addEventListener('click', () => select(date, st, btn));
      td.appendChild(btn);
    }
    row.appendChild(td);
    if (date.getDay() === 6) { tbody.appendChild(row); row = document.createElement('tr'); }
  }
  if (row.children.length) {
    while (row.children.length < 7) row.appendChild(document.createElement('td'));
    tbody.appendChild(row);
  }
}

// 日付を押したときの案内
function select(date, st, btn) {
  tbody.querySelectorAll('.is-selected').forEach((b) => b.classList.remove('is-selected'));
  btn.classList.add('is-selected');
  info.hidden = false;
  info.className = `day-info day-info--${st}`;
  info.querySelector('.day-info__date').textContent =
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEK[date.getDay()]}）ご到着`;
  info.querySelector('.day-info__status').textContent = `${STATUS[st].mark} ${STATUS[st].label} ── ${STATUS[st].text}`;
  info.querySelector('.day-info__btns').hidden = st === 'closed';
  // 満室の日は「予約」ではなく「キャンセル待ち」の案内にする
  info.querySelector('.day-info__btns a').textContent =
    st === 'full' ? 'キャンセル待ちをお電話で申し込む（0000-00-0000）' : 'お電話で予約する（0000-00-0000）';
  info.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

prevBtn.addEventListener('click', () => index > 0 && show(index - 1));
nextBtn.addEventListener('click', () => index < MONTHS - 1 && show(index + 1));
show(0);

// ===== 空室状況カレンダー =====
// 本物のサイトでは予約システムからデータを読み込むところ。
// ここではサンプルとして、日付から決まった空室状況を作っている。

const MONTH_COUNT = 6;      // 今月から6か月分を表示
const CLOSED_WEEKDAY = 3;   // 水曜日は休館日（サンプル）
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const STATUS = {
  ok:     { mark: '○', label: '空室あり', text: 'ご予約いただけます。' },
  few:    { mark: '△', label: '残りわずか', text: '残りわずかです。お早めにお電話ください。' },
  full:   { mark: '×', label: '満室', text: '満室です。キャンセル待ちはお電話で承ります。' },
  tel:    { mark: '☎', label: 'お電話でお問い合わせください', text: '空室状況はお電話でご確認ください。' },
  closed: { mark: '休', label: '休館日', text: '休館日のため、ご宿泊いただけません。' },
  past:   { mark: '', label: '', text: '' },
};

const today = new Date();
today.setHours(0, 0, 0, 0);

// 日付ごとのサンプル状況（同じ日付なら毎回同じ結果になる）
function statusOf(date) {
  if (date < today) return 'past';
  if (date.getDay() === CLOSED_WEEKDAY) return 'closed';
  const seed = (date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate()) * 2654435761 % 100;
  const isWeekend = date.getDay() === 5 || date.getDay() === 6;
  if (isWeekend) return seed < 45 ? 'full' : seed < 75 ? 'few' : 'ok';
  return seed < 12 ? 'full' : seed < 27 ? 'few' : seed < 35 ? 'tel' : 'ok';
}

function initVacancyCalendar() {
  const tabList = document.querySelector('.js-month-tabs');
  const title = document.querySelector('.js-calendar-title');
  const calendarBody = document.querySelector('.js-calendar-body');
  const prevButton = document.querySelector('.js-calendar-prev');
  const nextButton = document.querySelector('.js-calendar-next');
  const dayInfo = document.querySelector('.js-day-info');
  if (!tabList || !title || !calendarBody || !prevButton || !nextButton || !dayInfo) return;

  const months = [...Array(MONTH_COUNT)].map((_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1));
  let currentIndex = 0;

  months.forEach((month, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'month-tab';
    tab.setAttribute('role', 'tab');
    tab.innerHTML = `<small>${month.getFullYear()}</small>${month.getMonth() + 1}月`;
    tab.addEventListener('click', () => showMonth(i));
    tabList.appendChild(tab);
  });

  function showMonth(index) {
    currentIndex = index;
    const month = months[index];
    title.textContent = `${month.getFullYear()}年 ${month.getMonth() + 1}月`;
    [...tabList.children].forEach((tab, i) => {
      tab.classList.toggle('is-active', i === index);
      tab.setAttribute('aria-selected', String(i === index));
    });
    prevButton.disabled = index === 0;
    nextButton.disabled = index === MONTH_COUNT - 1;
    dayInfo.hidden = true;
    renderDays(month);
  }

  function renderDays(month) {
    calendarBody.textContent = '';
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();
    let row = document.createElement('tr');
    for (let i = 0; i < new Date(year, monthIndex, 1).getDay(); i++) row.appendChild(document.createElement('td'));

    for (let day = 1; day <= dayCount; day++) {
      const date = new Date(year, monthIndex, day);
      const status = statusOf(date);
      const cell = document.createElement('td');
      cell.className = `is-${status}`;
      if (date.getTime() === today.getTime()) cell.classList.add('is-today');

      if (status === 'past') {
        cell.innerHTML = `<span class="day">${day}</span>`;
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-cell';
        button.innerHTML = `<span class="day">${day}</span><span class="status" aria-hidden="true">${STATUS[status].mark}</span>`;
        button.setAttribute('aria-label', `${monthIndex + 1}月${day}日 ${STATUS[status].label}`);
        button.addEventListener('click', () => selectDay(date, status, button));
        cell.appendChild(button);
      }
      row.appendChild(cell);

      if (date.getDay() === 6) {
        calendarBody.appendChild(row);
        row = document.createElement('tr');
      }
    }
    if (row.children.length) {
      while (row.children.length < 7) row.appendChild(document.createElement('td'));
      calendarBody.appendChild(row);
    }
  }

  // 日付を押したときの案内（満室の日は「キャンセル待ち」の案内にする）
  function selectDay(date, status, button) {
    calendarBody.querySelectorAll('.is-selected').forEach((cell) => cell.classList.remove('is-selected'));
    button.classList.add('is-selected');
    dayInfo.hidden = false;
    dayInfo.className = `day-info js-day-info day-info--${status}`;
    dayInfo.querySelector('.js-day-info-date').textContent =
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）ご到着`;
    dayInfo.querySelector('.js-day-info-status').textContent = `${STATUS[status].mark} ${STATUS[status].text}`;
    dayInfo.querySelector('.js-day-info-actions').hidden = status === 'closed';
    dayInfo.querySelector('.js-day-info-tel').textContent = status === 'full'
      ? 'キャンセル待ちを電話で申し込む（0000-00-0000）'
      : '電話で予約する（0000-00-0000）';

    if (window.keiseiLenis) window.keiseiLenis.scrollTo(dayInfo, { offset: -window.innerHeight / 2 });
    else dayInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  prevButton.addEventListener('click', () => currentIndex > 0 && showMonth(currentIndex - 1));
  nextButton.addEventListener('click', () => currentIndex < MONTH_COUNT - 1 && showMonth(currentIndex + 1));
  showMonth(0);
}

initVacancyCalendar();

// ===== 空室検索 =====
// ・チェックイン日の初期値を「明日」、選べる最初の日を「今日」にする
// ・見本のサイトなので、検索ボタンを押したら検索できないことを画面に表示する

function toDateValue(date) {
  // toISOString() は世界標準時になるため、日本時間の日付を自分で組み立てる
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function initReserveForm() {
  const form = document.querySelector('.js-reserve-form');
  if (!form) return;

  const checkin = form.querySelector('[name="checkin"]');
  const status = document.querySelector('.js-reserve-status');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (checkin) {
    checkin.min = toDateValue(today);
    if (!checkin.value) checkin.value = toDateValue(tomorrow);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = 'このサイトはWeb制作の見本のため、空室の検索・ご予約はできません。';
    }
  });
}

initReserveForm();

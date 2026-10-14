const reserveForm = document.querySelector(".js-reserve-form");

function fillReserveSelect(selectId, value) {
  const select = document.getElementById(selectId);
  if (select && value) select.value = value;
}

function showReserveMessage(text) {
  reserveForm.querySelector(".reserve__message").textContent = text;
}

if (reserveForm) {
  document.addEventListener("click", (event) => {
    const quizLink = event.target.closest(".js-quiz-reserve");
    const stylistLink = event.target.closest(".js-reserve-link");
    if (quizLink) fillReserveSelect("reserve-menu", quizLink.dataset.menu);
    if (stylistLink) fillReserveSelect("reserve-stylist", stylistLink.dataset.stylist);
  });

  reserveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!reserveForm.checkValidity()) {
      showReserveMessage("未入力の項目があります。ご希望の日とメールアドレスをご確認ください。");
      reserveForm.reportValidity();
      return;
    }
    showReserveMessage("ありがとうございます。制作見本のため、実際には送信されていません。");
  });
}

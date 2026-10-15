// 見学の申込（デモ）：何も送信しない。入力の確認と、デモであることの表示だけ行う
(() => {
  const form = document.querySelector(".js-demo-form");
  if (!form) return;
  const result = form.querySelector(".form__result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const missing = [...form.querySelectorAll("[required]")].find((field) => !field.value.trim());
    if (missing) {
      result.textContent = "お名前とご連絡先を入力してください。";
      missing.focus();
      return;
    }
    const data = new FormData(form);
    result.textContent = `デモです。何も送信していません。（選んだ内容：${data.get("house")}、${data.get("date")}）`;
  });
})();

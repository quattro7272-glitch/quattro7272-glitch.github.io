/* お問い合わせフォーム（サンプル）：入力の確認だけして、何も送信しない。 */
(function () {
  const form = document.querySelector('.js-contact');
  if (!form) return;

  const result = form.querySelector('.js-contact-result');
  const requiredFields = Array.from(form.querySelectorAll('[required]'));

  function isFilled(field) {
    if (field.type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }
    return field.value.trim() !== '';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const missing = requiredFields.filter(function (field) {
      const ok = isFilled(field);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return !ok;
    });

    if (missing.length) {
      result.textContent = '入力のたりないところがあります。';
      missing[0].focus();
      return;
    }
    result.textContent = 'ありがとうございます。サンプルのため、実際には送信していません。';
    form.reset();
  });
})();

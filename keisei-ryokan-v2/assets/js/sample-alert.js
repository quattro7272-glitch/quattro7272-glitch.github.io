// ===== ポートフォリオ用サンプルの案内 =====
// 実在しない予約サイトへのボタンを押したときに、移動しない理由を伝える

document.querySelectorAll('.js-sample-alert').forEach((button) => {
  button.addEventListener('click', () => {
    window.alert('こちらはポートフォリオ用のサンプルのため、予約サイトには移動しません。');
  });
});

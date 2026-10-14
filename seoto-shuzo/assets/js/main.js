/* 目次（スマホの下の帯）の開閉。デスクトップでは常に開いているので何もしない */
(function () {
  const ruler = document.querySelector('.js-ruler');
  const toggleButton = document.querySelector('.js-ruler-toggle');
  if (!ruler || !toggleButton) return;

  function setOpen(isOpen) {
    ruler.classList.toggle('is-open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.textContent = isOpen ? '閉じる' : '目次';
  }

  toggleButton.addEventListener('click', function () {
    setOpen(!ruler.classList.contains('is-open'));
  });

  ruler.addEventListener('click', function (event) {
    if (event.target.closest('.js-ruler-link')) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && ruler.classList.contains('is-open')) {
      setOpen(false);
      toggleButton.focus();
    }
  });
})();

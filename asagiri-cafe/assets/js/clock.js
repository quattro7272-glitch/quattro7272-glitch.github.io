const clockElement = document.querySelector(".js-clock");
const timedSections = document.querySelectorAll("[data-time]");

function watchMorningClock() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) clockElement.textContent = entry.target.dataset.time;
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  timedSections.forEach((section) => observer.observe(section));
}

if (clockElement && "IntersectionObserver" in window) {
  watchMorningClock();
}

const footerElement = document.querySelector(".site-footer");

function hideClockOverFooter() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => clockElement.closest(".clock").classList.toggle("is-hidden", entry.isIntersecting));
  });
  observer.observe(footerElement);
}

if (clockElement && footerElement && "IntersectionObserver" in window) {
  hideClockOverFooter();
}

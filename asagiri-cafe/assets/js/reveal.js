const revealTargets = document.querySelectorAll(".reveal");

function showAll() {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

function observeReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  revealTargets.forEach((target) => observer.observe(target));
}

if ("IntersectionObserver" in window) {
  observeReveal();
} else {
  showAll();
}

const clearTargets = document.querySelectorAll(".plate");

function observeClear() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-clear");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0.15 }
  );
  clearTargets.forEach((target) => observer.observe(target));
}

if ("IntersectionObserver" in window) {
  observeClear();
} else {
  clearTargets.forEach((target) => target.classList.add("is-clear"));
}

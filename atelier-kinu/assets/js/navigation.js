const header = document.getElementById("header");
const menuButton = document.querySelector(".js-menu-button");
const menuPanel = document.querySelector(".js-menu");

function updateHeaderState() {
  const pastOpening = window.scrollY > window.innerHeight * 0.6;
  header.classList.toggle("is-solid", pastOpening);
}

function setMenuOpen(isOpen) {
  menuPanel.classList.toggle("is-open", isOpen);
  header.classList.toggle("is-menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.querySelector(".header__menu-label").textContent = isOpen ? "Close" : "Menu";
  document.body.style.overflow = isOpen ? "hidden" : "";
}

if (header && menuButton && menuPanel) {
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  menuPanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuPanel.classList.contains("is-open")) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
}

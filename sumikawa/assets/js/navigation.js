const header = document.getElementById("header");
const menuButton = document.querySelector(".js-menu-button");
const menuPanel = document.querySelector(".js-menu");
const hasOpening = document.querySelector(".hero") !== null;

function updateHeaderState() {
  header.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.6);
}

function setMenuOpen(isOpen) {
  menuPanel.classList.toggle("is-open", isOpen);
  header.classList.toggle("is-menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.querySelector(".header__menu-label").textContent = isOpen ? "Close" : "Menu";
  document.body.style.overflow = isOpen ? "hidden" : "";
}

if (header && menuButton && menuPanel) {
  if (hasOpening) {
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

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

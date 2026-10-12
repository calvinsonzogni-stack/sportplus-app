// ════════════════════════════════════════════════
//  SPORT+ — nav.js
//  Menu hamburger (mobile), commun à toutes les pages.
// ════════════════════════════════════════════════

(function () {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  if (!hamburger || !nav) return;

  function basculerMenu(ouvert) {
    nav.classList.toggle("open", ouvert);
    hamburger.classList.toggle("open", ouvert);
    hamburger.setAttribute("aria-expanded", String(ouvert));
    document.body.style.overflow = ouvert ? "hidden" : "";
  }

  hamburger.addEventListener("click", () => basculerMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => basculerMenu(false)));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      basculerMenu(false);
      hamburger.focus();
    }
  });
})();

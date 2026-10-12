// ════════════════════════════════════════════════
//  SPORT+ — notif-planning.js
//  À inclure sur TOUTES les pages, après commun.js
//  Affiche une notif persistante si séance prévue aujourd'hui
// ════════════════════════════════════════════════

(function () {
  const planning = lireStockage("planning", []);

  function getSeancesAujourdhui() {
    const today = todayStr();
    return planning.filter(entry => seanceTombeLe(entry, today));
  }

  // Valeur brute (non JSON) : format conservé depuis les versions précédentes
  function dateFermeture() {
    try { return localStorage.getItem("notif_dismissed_date"); } catch (e) { return null; }
  }

  function afficherNotif() {
    // Ne pas afficher si déjà fermée aujourd'hui
    if (dateFermeture() === todayStr()) return;

    const seances = getSeancesAujourdhui();
    if (!seances.length) return;

    const seance = seances[0]; // Afficher la première séance du jour

    const notif = document.createElement("div");
    notif.id = "planning-notif";
    notif.setAttribute("role", "status");
    notif.innerHTML = `
      <div class="pnotif-icon" aria-hidden="true">💪</div>
      <div class="pnotif-content">
        <div class="pnotif-title">${echapperHtml(seance.nom)}</div>
        <div class="pnotif-sub">Séance prévue aujourd'hui${seances.length > 1 ? ` · +${seances.length - 1} autre(s)` : ""}</div>
      </div>
      <div class="pnotif-actions">
        <button class="pnotif-btn-lancer" onclick="lancerSeancePlanning(${Number(seance.id)})">▶ Lancer</button>
        <button class="pnotif-btn-close" onclick="fermerNotifPlanning()" aria-label="Fermer">✕</button>
      </div>
    `;

    document.body.appendChild(notif);

    // Animer l'entrée
    setTimeout(() => notif.classList.add("pnotif-visible"), 100);
  }

  window.fermerNotifPlanning = function () {
    const notif = document.getElementById("planning-notif");
    if (notif) {
      notif.classList.remove("pnotif-visible");
      setTimeout(() => notif.remove(), 300);
    }
    // Mémoriser que l'utilisateur a fermé aujourd'hui
    try { localStorage.setItem("notif_dismissed_date", todayStr()); } catch (e) {}
  };

  window.lancerSeancePlanning = function (id) {
    const entry = planning.find(e => e.id === id);
    if (entry && entry.exercices.length > 0) {
      ecrireStockage("seance_preloaded", entry.exercices);
    }
    window.location.href = "seance.html";
  };

  // Lancer après chargement du DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", afficherNotif);
  } else {
    afficherNotif();
  }
})();

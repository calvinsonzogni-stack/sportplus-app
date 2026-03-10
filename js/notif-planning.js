// ════════════════════════════════════════════════
//  SPORT+ — notif-planning.js
//  À inclure sur TOUTES les pages
//  Affiche une notif persistante si séance prévue aujourd'hui
// ════════════════════════════════════════════════

(function () {
  const planning = JSON.parse(localStorage.getItem("planning")) || [];

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function getSeancesAujourdhui() {
    const today = todayStr();
    const results = [];
    planning.forEach(entry => {
      if (entry.recurrence === "once" && entry.date === today) {
        results.push(entry);
      } else if (entry.recurrence === "weekly") {
        const base = new Date(entry.date + "T12:00:00");
        const target = new Date(today + "T12:00:00");
        const diff = Math.round((target - base) / 86400000);
        if (diff >= 0 && diff % 7 === 0) results.push(entry);
      }
    });
    return results;
  }

  function afficherNotif() {
    // Ne pas afficher si déjà fermée aujourd'hui
    const dismissed = localStorage.getItem("notif_dismissed_date");
    if (dismissed === todayStr()) return;

    const seances = getSeancesAujourdhui();
    if (!seances.length) return;

    const seance = seances[0]; // Afficher la première séance du jour

    // Créer la notif
    const notif = document.createElement("div");
    notif.id = "planning-notif";
    notif.innerHTML = `
      <div class="pnotif-icon">💪</div>
      <div class="pnotif-content">
        <div class="pnotif-title">${seance.nom}</div>
        <div class="pnotif-sub">Séance prévue aujourd'hui${seances.length > 1 ? ` · +${seances.length - 1} autre(s)` : ""}</div>
      </div>
      <div class="pnotif-actions">
        <button class="pnotif-btn-lancer" onclick="lancerSeancePlanning(${seance.id})">▶ Lancer</button>
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
    localStorage.setItem("notif_dismissed_date", todayStr());
  };

  window.lancerSeancePlanning = function (id) {
    const entry = planning.find(e => e.id === id);
    if (entry && entry.exercices.length > 0) {
      localStorage.setItem("seance_preloaded", JSON.stringify(entry.exercices));
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

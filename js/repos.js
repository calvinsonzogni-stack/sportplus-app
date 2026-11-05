// ════════════════════════════════════════════════
//  SPORT+ — repos.js
//  Minuteur de repos entre deux séries (page séance).
//  Dépend de commun.js (stockage). Utilisé par seance.js via window.Repos.
//
//  Le minuteur repose sur une heure de fin (et non sur un décompte) :
//  il reste juste si l'écran se verrouille, et survit à un rechargement.
// ════════════════════════════════════════════════

(function () {
  const DUREES = [60, 90, 120, 180, 0];   // 0 = minuteur désactivé
  const CLE_DUREE = "repos_duree";
  const CLE_FIN = "repos_fin";

  let duree = DUREES.includes(lireStockage(CLE_DUREE, 90)) ? lireStockage(CLE_DUREE, 90) : 90;
  let fin = null;          // timestamp (ms) de fin du repos en cours
  let total = 0;           // durée du repos en cours, pour la barre de progression
  let intervalle = null;
  let audio = null;

  const barre = document.getElementById("repos-bar");
  const affichage = document.getElementById("repos-temps");
  const progression = document.getElementById("repos-progress");
  const libelle = document.getElementById("repos-label");
  const boutonReglage = document.getElementById("btn-repos-duree");

  function format(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function majReglage() {
    boutonReglage.textContent = duree ? `⏲ Repos ${duree} s` : "⏲ Repos off";
    boutonReglage.setAttribute("aria-label",
      duree ? `Durée de repos : ${duree} secondes. Toucher pour changer.` : "Minuteur de repos désactivé. Toucher pour l'activer.");
  }

  function afficher(visible) {
    barre.classList.toggle("hidden", !visible);
    document.body.classList.toggle("repos-actif", visible);
  }

  function tick() {
    const restant = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
    affichage.textContent = format(restant);
    progression.style.width = (total ? (restant / total) * 100 : 0) + "%";
    if (restant === 0) terminer();
  }

  function lancer() {
    clearInterval(intervalle);
    ecrireStockage(CLE_FIN, fin);
    libelle.textContent = "Repos";
    barre.classList.remove("repos-fini");
    afficher(true);
    tick();
    intervalle = setInterval(tick, 250);
  }

  // Le son doit être « débloqué » pendant un geste de l'utilisateur (règle des navigateurs)
  function preparerSon() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
    } catch (e) { audio = null; }
  }

  function bip() {
    if (!audio) return;
    try {
      [0, 0.22, 0.44].forEach((decalage, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.frequency.value = i === 2 ? 1320 : 880;
        gain.gain.setValueAtTime(0.0001, audio.currentTime + decalage);
        gain.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + decalage + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + decalage + 0.18);
        osc.connect(gain).connect(audio.destination);
        osc.start(audio.currentTime + decalage);
        osc.stop(audio.currentTime + decalage + 0.2);
      });
    } catch (e) { /* le son est un bonus, jamais bloquant */ }
  }

  function terminer() {
    clearInterval(intervalle);
    intervalle = null;
    fin = null;
    try { localStorage.removeItem(CLE_FIN); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    bip();
    libelle.textContent = "C'est reparti 💪";
    affichage.textContent = "0:00";
    progression.style.width = "0%";
    barre.classList.add("repos-fini");
    setTimeout(() => { if (!fin) afficher(false); }, 4000);
  }

  window.Repos = {
    // Appelé à chaque série validée
    demarrer() {
      if (!duree) return;
      preparerSon();
      total = duree;
      fin = Date.now() + duree * 1000;
      lancer();
    },

    // Reprise après rechargement de la page (séance restaurée)
    reprendre() {
      const sauvegarde = lireStockage(CLE_FIN, null);
      if (typeof sauvegarde !== "number" || sauvegarde <= Date.now()) {
        try { localStorage.removeItem(CLE_FIN); } catch (e) {}
        return;
      }
      fin = sauvegarde;
      total = Math.max(duree, Math.ceil((fin - Date.now()) / 1000));
      lancer();
    },

    arreter() {
      clearInterval(intervalle);
      intervalle = null;
      fin = null;
      try { localStorage.removeItem(CLE_FIN); } catch (e) {}
      afficher(false);
    },

    ajuster(secondes) {
      if (!fin) return;
      fin = Math.max(Date.now() + 1000, fin + secondes * 1000);
      total = Math.max(total, Math.ceil((fin - Date.now()) / 1000));
      ecrireStockage(CLE_FIN, fin);
      tick();
    },
  };

  // Réglage de la durée : chaque toucher passe à la valeur suivante
  boutonReglage.addEventListener("click", () => {
    duree = DUREES[(DUREES.indexOf(duree) + 1) % DUREES.length];
    ecrireStockage(CLE_DUREE, duree);
    majReglage();
  });

  document.getElementById("btn-repos-moins").addEventListener("click", () => Repos.ajuster(-15));
  document.getElementById("btn-repos-plus").addEventListener("click", () => Repos.ajuster(15));
  document.getElementById("btn-repos-passer").addEventListener("click", () => Repos.arreter());

  // Au retour sur l'onglet, on resynchronise immédiatement l'affichage
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && fin) tick();
  });

  majReglage();
})();

// ════════════════════════════════════════════════
//  SPORT+ — accueil.js
//  Tableau de bord : avatar, pseudo, pièces, séance du jour, chiffres clés.
//  Dépend de commun.js et pieces.js.
// ════════════════════════════════════════════════

(function () {
  const $ = id => document.getElementById(id);
  // Même seuil que seance.js : au-delà, une séance non terminée est abandonnée
  const DUREE_MAX_REPRISE_MS = 6 * 60 * 60 * 1000;

  function salutation() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Bonjour,";
    if (h >= 12 && h < 18) return "Bon après-midi,";
    if (h >= 18 && h < 22) return "Bonsoir,";
    return "Bonne nuit,";
  }

  function lirePseudo() {
    try { return localStorage.getItem("pseudo") || ""; } catch (e) { return ""; }
  }

  function majProfil() {
    const pseudo = lirePseudo();
    $("profil-salut").textContent = pseudo ? salutation() : "Bienvenue !";
    $("profil-nom").textContent = pseudo || "Choisis ton pseudo";
    $("profil-nom").classList.toggle("vide", !pseudo);
    $("profil-solde").textContent = Pieces.solde();
  }

  // ── Bouton principal : démarrer, ou reprendre une séance en cours ──
  function majBoutonPrincipal() {
    const enCours = lireStockage("seance_en_cours", null);
    const actif = enCours && Array.isArray(enCours.exercices) && enCours.exercices.length
      && typeof enCours.debut === "number" && Date.now() - enCours.debut < DUREE_MAX_REPRISE_MS;
    if (actif) {
      const minutes = Math.max(1, Math.round((Date.now() - enCours.debut) / 60000));
      $("btn-demarrer-texte").textContent = `Reprendre ma séance (${minutes} min)`;
      $("btn-demarrer").classList.add("reprise");
    }
  }

  // ── Séance programmée aujourd'hui ──
  function majPrevue() {
    const today = todayStr();
    const planning = lireStockage("planning", []);
    const seance = (Array.isArray(planning) ? planning : []).find(p => seanceTombeLe(p, today));
    if (!seance) return;
    $("prevue").classList.remove("hidden");
    $("prevue-nom").textContent = seance.nom;
    const exos = seance.exercices || [];
    $("prevue-exos").textContent = exos.length
      ? exos.slice(0, 3).join(" · ") + (exos.length > 3 ? ` · +${exos.length - 3}` : "")
      : "Exercices libres";
    $("prevue-btn").addEventListener("click", () => {
      if (exos.length) ecrireStockage("seance_preloaded", exos);
      location.href = "seance.html";
    });
  }

  // ── Chiffres clés ──
  function majChiffres() {
    const historique = lireStockage("historique", []);
    const liste = Array.isArray(historique) ? historique : [];
    const lundi = new Date();
    lundi.setHours(0, 0, 0, 0);
    lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
    $("stat-semaine").textContent = liste.filter(s => new Date(s.date) >= lundi).length;
    $("stat-serie").textContent = joursConsecutifs(liste);
    $("stat-total").textContent = liste.length;
  }

  // ── Pseudo (fenêtre d'édition) ──
  function ouvrirPseudo() {
    $("pseudo-input").value = lirePseudo();
    $("pseudo-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("pseudo-input").focus(), 50);
  }

  function fermerPseudo() {
    $("pseudo-modal").classList.add("hidden");
    document.body.style.overflow = "";
    $("pseudo-edit-btn").focus();
  }

  function sauvegarderPseudo() {
    const val = $("pseudo-input").value.trim();
    if (!val) { $("pseudo-input").focus(); return; }
    try { localStorage.setItem("pseudo", val); } catch (e) {}
    fermerPseudo();
    majProfil();
  }

  $("pseudo-edit-btn").addEventListener("click", ouvrirPseudo);
  $("profil-nom").addEventListener("click", () => { if (!lirePseudo()) ouvrirPseudo(); });
  $("pseudo-fermer").addEventListener("click", fermerPseudo);
  $("pseudo-annuler").addEventListener("click", fermerPseudo);
  $("pseudo-valider").addEventListener("click", sauvegarderPseudo);
  $("pseudo-input").addEventListener("keydown", e => { if (e.key === "Enter") sauvegarderPseudo(); });
  $("pseudo-modal").addEventListener("click", e => { if (e.target === $("pseudo-modal")) fermerPseudo(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("pseudo-modal").classList.contains("hidden")) fermerPseudo();
  });

  majProfil();
  majBoutonPrincipal();
  majPrevue();
  majChiffres();
})();

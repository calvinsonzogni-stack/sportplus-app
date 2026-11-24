// ════════════════════════════════════════════════
//  SPORT+ — accueil.js
//  Tableau de bord : salutation, semaine en cours, séance du jour
//  (en cours, prévue au planning ou libre), objectif et volume.
//  Dépend de commun.js et pieces.js.
// ════════════════════════════════════════════════

(function () {
  const $ = id => document.getElementById(id);
  // Même seuil que seance.js : au-delà, une séance non terminée est abandonnée
  const DUREE_MAX_REPRISE_MS = 6 * 60 * 60 * 1000;
  const OBJECTIF_DEFAUT = 3;
  const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
  const JOURS_LONGS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  const historique = (() => {
    const h = lireStockage("historique", []);
    return Array.isArray(h) ? h : [];
  })();

  function salutation() {
    const h = new Date().getHours();
    if (h >= 5 && h < 18) return "Bonjour,";
    if (h >= 18 && h < 22) return "Bonsoir,";
    return "Bonne nuit,";
  }

  function lirePseudo() {
    try { return localStorage.getItem("pseudo") || ""; } catch (e) { return ""; }
  }

  // Lundi 0 h de la semaine contenant « date »
  function lundiDe(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  // Volume d'une séance : somme charge × répétitions (le poids du corps compte pour 0)
  function volumeSeance(seance) {
    return (seance.exercices || []).reduce((total, exo) =>
      total + (exo.series || []).reduce((t, s) =>
        t + (Number(s.reps) || 0) * (Number(s.charge) || 0), 0), 0);
  }

  function formatVolume(kg) {
    if (kg >= 1000) return `${(kg / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} t`;
    return `${Math.round(kg).toLocaleString("fr-FR")} kg`;
  }

  // ── Salutation, salle, pièces ──
  function majProfil() {
    const pseudo = lirePseudo();
    const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    $("salut-date").textContent = date.charAt(0).toUpperCase() + date.slice(1);
    $("profil-salut").textContent = pseudo ? salutation() : "Bienvenue !";
    $("profil-nom").textContent = pseudo || "Choisis ton pseudo";
    $("profil-nom").classList.toggle("vide", !pseudo);
    $("profil-solde").textContent = Pieces.solde().toLocaleString("fr-FR");
    const salle = lireStockage("salle", null);
    $("profil-salle-nom").textContent = salle && salle.nom ? salle.nom : "Choisir ma salle";
    $("profil-salle").classList.toggle("vide", !(salle && salle.nom));
  }

  // ── Semaine : un rond par jour, coché s'il y a eu une séance ──
  function majSemaine() {
    const jours = new Set(historique.map(s => dateVersStr(new Date(s.date))));
    const lundi = lundiDe(new Date());
    const aujourdhui = todayStr();
    const coche = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    $("jours").innerHTML = JOURS.map((lettre, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      const cle = dateVersStr(d);
      const fait = jours.has(cle);
      const etat = fait ? "séance faite" : (cle === aujourdhui ? "aujourd'hui" : "pas de séance");
      return `<li class="jour-rond ${fait ? "fait" : ""} ${cle === aujourdhui ? "auj" : ""}" aria-label="${JOURS_LONGS[i]} : ${etat}">
        <span class="rond">${fait ? coche : ""}</span><span aria-hidden="true">${lettre}</span></li>`;
    }).join("");
    const serie = joursConsecutifs(historique);
    $("stat-serie").textContent = serie;
    $("stat-serie-label").textContent = serie > 1 ? "jours d'affilée" : "jour d'affilée";
  }

  // ── Séance du jour ──
  function vignettes(noms) {
    const exos = noms.map(n => infosExercice(n)).filter(Boolean).slice(0, 3);
    $("jour-vignettes").innerHTML = exos.map(e =>
      `<img src="assets/images/${encodeURI(e.image)}" alt="" loading="lazy">`).join("");
    $("jour-vignettes").hidden = !exos.length;
  }

  function majSeanceDuJour() {
    const nbExos = n => `${n} exercice${n > 1 ? "s" : ""}`;

    // 1. Une séance est en cours : on propose de la reprendre
    const enCours = lireStockage("seance_en_cours", null);
    const actif = enCours && Array.isArray(enCours.exercices) && enCours.exercices.length
      && typeof enCours.debut === "number" && Date.now() - enCours.debut < DUREE_MAX_REPRISE_MS;
    if (actif) {
      const minutes = Math.max(1, Math.round((Date.now() - enCours.debut) / 60000));
      $("jour-etiquette").textContent = "En cours";
      $("jour-titre").textContent = "Séance en cours";
      $("jour-meta").textContent = `${nbExos(enCours.exercices.length)} · commencée il y a ${minutes} min`;
      vignettes(enCours.exercices.map(e => e.nom));
      $("btn-demarrer-texte").textContent = "Reprendre la séance";
      $("btn-demarrer").classList.add("reprise");
      return;
    }

    // 2. Une séance est prévue aujourd'hui au planning
    const planning = lireStockage("planning", []);
    const prevue = (Array.isArray(planning) ? planning : []).find(p => seanceTombeLe(p, todayStr()));
    if (prevue) {
      const exos = prevue.exercices || [];
      $("jour-etiquette").textContent = "Prévue aujourd'hui";
      $("jour-titre").textContent = prevue.nom;
      $("jour-meta").textContent = exos.length ? nbExos(exos.length) : "Exercices libres";
      vignettes(exos);
      $("btn-demarrer-texte").textContent = "Commencer la séance";
      $("btn-demarrer").addEventListener("click", () => {
        if (exos.length) ecrireStockage("seance_preloaded", exos);
      });
      return;
    }

    // 3. Rien de prévu : séance libre, avec un rappel de la dernière
    $("jour-etiquette").textContent = "Aujourd'hui";
    $("jour-titre").textContent = "Séance libre";
    const derniere = historique.reduce((a, s) => (!a || new Date(s.date) > new Date(a.date) ? s : a), null);
    if (derniere) {
      const ecart = ecartJours(dateVersStr(new Date(derniere.date)), todayStr());
      const quand = ecart === 0 ? "aujourd'hui" : ecart === 1 ? "hier" : `il y a ${ecart} jours`;
      $("jour-meta").textContent = `Dernière séance ${quand} · ${nbExos((derniere.exercices || []).length)}`;
      vignettes((derniere.exercices || []).map(e => e.nom));
    } else {
      $("jour-meta").textContent = `Compose ta séance parmi ${EXERCICES_DB.length} exercices`;
      $("jour-vignettes").hidden = true;
    }
  }

  // ── Objectif de la semaine ──
  function majObjectif() {
    const lundi = lundiDe(new Date());
    const faites = historique.filter(s => new Date(s.date) >= lundi).length;
    const objectif = Math.max(1, parseInt(lireStockage("objectif_semaine", OBJECTIF_DEFAUT), 10) || OBJECTIF_DEFAUT);
    $("stat-semaine").textContent = faites;
    $("stat-objectif").textContent = objectif;
    const pct = Math.min(100, Math.round((faites / objectif) * 100));
    $("anneau-plein").style.strokeDasharray = `${pct} 100`;
    $("anneau-plein").classList.toggle("atteint", faites >= objectif);
  }

  // ── Volume : cette semaine, évolution, courbe des 8 dernières semaines ──
  function majVolume() {
    const lundi = lundiDe(new Date());
    const semaines = Array.from({ length: 8 }, (_, i) => {
      const debut = new Date(lundi);
      debut.setDate(lundi.getDate() - 7 * (7 - i));
      const fin = new Date(debut);
      fin.setDate(debut.getDate() + 7);
      return historique.filter(s => { const d = new Date(s.date); return d >= debut && d < fin; })
        .reduce((t, s) => t + volumeSeance(s), 0);
    });
    const actuelle = semaines[7], precedente = semaines[6];
    $("volume-semaine").textContent = formatVolume(actuelle);
    if (precedente > 0 && actuelle > 0) {
      const evol = Math.round(((actuelle - precedente) / precedente) * 100);
      $("volume-evol").textContent = `${evol >= 0 ? "+" : "−"}${Math.abs(evol)} %`;
      $("volume-evol").classList.toggle("baisse", evol < 0);
    }
    const max = Math.max(...semaines);
    if (max > 0) {
      const pts = semaines.map((v, i) => `${(i * 118 / 7 + 1).toFixed(1)},${(27 - (v / max) * 24).toFixed(1)}`);
      $("volume-courbe").innerHTML = `<polyline points="${pts.join(" ")}"/>`;
      $("volume-aide").hidden = true;
    } else {
      $("volume-courbe").hidden = true;
    }
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
  majSemaine();
  majSeanceDuJour();
  majObjectif();
  majVolume();
})();

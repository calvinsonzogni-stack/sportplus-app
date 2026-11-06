// ════════════════════════════════════════════════
//  SPORT+ — seance.js
//  Flux : Sélection → Séance active → Historique
//  Dépend de commun.js (EXERCICES_DB, stockage)
// ════════════════════════════════════════════════

// ── État de l'application ───────────────────────
let exercicesSelectionnes = []; // noms des exos choisis
let seanceData = [];            // [{ nom, muscle, series: [{ reps, charge, validee }] }]
let timerInterval = null;
let timerSeconds = 0;
let debutSeance = null;          // timestamp (ms) du lancement, sert au chrono
let exosTermines = 0;

// La séance en cours est sauvegardée à chaque action : un rechargement de page,
// un verrouillage du téléphone ou un onglet fermé ne fait plus perdre la séance.
const CLE_SEANCE_EN_COURS = "seance_en_cours";
// Au-delà, on considère la séance abandonnée plutôt que de la reprendre
const DUREE_MAX_REPRISE_MS = 6 * 60 * 60 * 1000;

// ── Initialisation ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Une séance en cours est prioritaire : la présélection éventuelle
  // (planning / bibliothèque) reste en attente pour la prochaine séance.
  const reprise = restaurerSeanceEnCours();

  if (!reprise) {
    // Précharger les exercices depuis le planning si disponibles
    const exos = lireStockage("seance_preloaded", null);
    if (Array.isArray(exos) && exos.length > 0) {
      exercicesSelectionnes = exos.filter(nom => EXERCICES_DB.some(e => e.nom === nom));
    }
    try { localStorage.removeItem("seance_preloaded"); } catch (e) {}
  }

  genererGrille("all");
  initFiltres();
  mettreAJourBarre();

  // Overlay + filtres du modal modifier séance
  const overlayModif = document.getElementById("modal-modif");
  if (overlayModif) {
    overlayModif.addEventListener("click", e => {
      if (e.target === overlayModif) fermerModalModif();
    });
  }
  document.querySelectorAll(".modif-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modif-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderModifGrille(btn.dataset.muscle);
    });
  });

  // Échap ferme le modal de modification
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !document.getElementById("modal-modif").classList.contains("hidden")) {
      fermerModalModif();
    }
  });
});

// ────────────────────────────────────────────────
//  ÉTAPE 1 — SÉLECTION
// ────────────────────────────────────────────────

function genererGrille(muscle) {
  const grid = document.getElementById("exercices-grid");
  grid.innerHTML = "";

  const liste = muscle === "all"
    ? EXERCICES_DB
    : EXERCICES_DB.filter(e => e.muscle === muscle);

  liste.forEach(exo => {
    const isSelected = exercicesSelectionnes.includes(exo.nom);
    const card = document.createElement("div");
    card.className = "exo-card" + (isSelected ? " selected" : "");
    card.setAttribute("data-nom", exo.nom);
    card.setAttribute("data-muscle", exo.muscle);

    card.innerHTML = `
      <div class="exo-card-image">
        <img src="assets/images/${exo.image}" alt="${exo.nom}" loading="lazy"
             onerror="this.src='assets/images/placeholder.svg'">
        <div class="exo-card-overlay"></div>
        <div class="exo-check-badge">✓</div>
      </div>
      <div class="exo-card-body">
        <h3>${exo.nom}</h3>
        <span class="muscle-tag">${MUSCLE_LABELS[exo.muscle]}</span>
      </div>
    `;

    card.addEventListener("click", () => toggleExercice(exo.nom, card));
    grid.appendChild(card);
  });
}

function toggleExercice(nom, card) {
  const idx = exercicesSelectionnes.indexOf(nom);
  if (idx === -1) {
    exercicesSelectionnes.push(nom);
    card.classList.add("selected");
  } else {
    exercicesSelectionnes.splice(idx, 1);
    card.classList.remove("selected");
  }
  mettreAJourBarre();
}

function mettreAJourBarre() {
  const count = exercicesSelectionnes.length;
  document.getElementById("selection-count").textContent = count;

  const bar = document.getElementById("selection-bar");
  const btn = document.getElementById("btn-letsgo");

  if (count > 0) {
    bar.classList.add("visible");
    btn.disabled = false;
  } else {
    bar.classList.remove("visible");
    btn.disabled = true;
  }
}

function initFiltres() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      genererGrille(btn.dataset.muscle);
    });
  });
}

// ────────────────────────────────────────────────
//  TRANSITION — LANCER LA SÉANCE
// ────────────────────────────────────────────────

function lancerSeance() {
  if (exercicesSelectionnes.length === 0) return;

  // Construire la structure de la séance (charge pré-remplie avec le dernier max)
  seanceData = exercicesSelectionnes.map(nom => {
    const exo = EXERCICES_DB.find(e => e.nom === nom);
    return {
      nom,
      muscle: exo ? exo.muscle : "",
      series: [{ reps: "", charge: chargeInitiale(nom), validee: false }],
    };
  });

  exosTermines = 0;
  debutSeance = Date.now();
  sauvegarderSeanceEnCours();

  afficherSeanceActive();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Bascule l'affichage sur l'étape 2 à partir de l'état courant
function afficherSeanceActive() {
  // Masquer étape 1, afficher étape 2
  document.getElementById("step-selection").classList.add("hidden");
  const stepSeance = document.getElementById("step-seance");
  stepSeance.classList.remove("hidden");
  stepSeance.classList.add("fade-in");

  // Mettre à jour les compteurs
  majCompteurs();

  // Lancer le chrono
  demarrerTimer();

  // Rendre la séance
  renderSeance();
  majZoneFin();
}

// ────────────────────────────────────────────────
//  PERSISTANCE DE LA SÉANCE EN COURS
// ────────────────────────────────────────────────

function sauvegarderSeanceEnCours() {
  ecrireStockage(CLE_SEANCE_EN_COURS, { debut: debutSeance, exercices: seanceData });
}

function effacerSeanceEnCours() {
  try { localStorage.removeItem(CLE_SEANCE_EN_COURS); } catch (e) {}
}

function restaurerSeanceEnCours() {
  const sauvegarde = lireStockage(CLE_SEANCE_EN_COURS, null);
  const valide = sauvegarde
    && Array.isArray(sauvegarde.exercices) && sauvegarde.exercices.length > 0
    && typeof sauvegarde.debut === "number"
    && Date.now() - sauvegarde.debut < DUREE_MAX_REPRISE_MS;

  if (!valide) {
    effacerSeanceEnCours();
    return false;
  }

  seanceData = sauvegarde.exercices;
  debutSeance = sauvegarde.debut;
  exercicesSelectionnes = seanceData.map(e => e.nom);
  exosTermines = seanceData.filter(e => e.termine).length;

  afficherSeanceActive();
  Repos.reprendre();
  showToast("Séance en cours reprise 💪", "success");
  return true;
}

// ────────────────────────────────────────────────
//  ÉTAPE 2 — RENDU SÉANCE ACTIVE
// ────────────────────────────────────────────────

function renderSeance() {
  const body = document.getElementById("seance-body");
  body.innerHTML = "";

  seanceData.forEach((exo, exoIdx) => {
    const card = document.createElement("div");
    card.className = "seance-exo-card" + (exo.termine ? " exo-done" : "");
    card.id = `exo-card-${exoIdx}`;

    card.innerHTML = `
      <div class="seance-exo-header">
        <div class="seance-exo-title">
          <span class="seance-exo-num">${exoIdx + 1}</span>
          <div>
            <h2>${exo.nom}</h2>
            <span class="muscle-tag-small">${MUSCLE_LABELS[exo.muscle] || exo.muscle}</span>
          </div>
        </div>
        <div class="exo-status-badge" id="status-${exoIdx}">
          ${exo.termine ? '<span class="badge-done">✓ Terminé</span>' : '<span class="badge-progress">En cours</span>'}
        </div>
      </div>

      <!-- Rappel du record (pleine largeur, sous l'en-tête) -->
      ${rappelRecord(exo, exoIdx)}

      <!-- Tableau des séries -->
      <div class="series-table ${estPoidsDeCorps(exo.nom) ? "poids-du-corps" : ""}">
        <div class="series-table-header">
          <span>Série</span>
          <span>${uniteReps(exo.nom) === "s" ? "Secondes" : "Reps"}</span>
          ${estPoidsDeCorps(exo.nom) ? "" : "<span>Charge (kg)</span>"}
          <span></span>
        </div>
        <div class="series-rows" id="series-rows-${exoIdx}">
          ${renderSeries(exoIdx, exo.series)}
        </div>
      </div>

      <!-- Ajouter une série -->
      ${!exo.termine ? `
      <div class="series-actions">
        <button class="btn-add-serie" onclick="ajouterSerie(${exoIdx})">
          + Ajouter une série
        </button>
        <button class="btn-valider-exo" onclick="validerExercice(${exoIdx})" id="btn-valider-${exoIdx}">
          ✓ Exercice terminé
        </button>
      </div>` : ""}
    `;

    body.appendChild(card);
  });
}

function renderSeries(exoIdx, series) {
  const pdc = estPoidsDeCorps(seanceData[exoIdx].nom);
  const secondes = uniteReps(seanceData[exoIdx].nom) === "s";
  return series.map((serie, sIdx) => `
    <div class="serie-row ${serie.validee ? "serie-validee" : ""}" id="serie-row-${exoIdx}-${sIdx}">
      <span class="serie-num">${sIdx + 1}</span>
      <input
        type="number"
        class="serie-input reps-input"
        placeholder="${secondes ? "30" : "12"}"
        min="1"
        inputmode="numeric"
        aria-label="${secondes ? "Secondes" : "Répétitions"}, série ${sIdx + 1}"
        value="${serie.reps}"
        ${serie.validee ? "disabled" : ""}
        oninput="updateSerie(${exoIdx}, ${sIdx}, 'reps', this.value)"
      >
      ${pdc ? "" : `<input
        type="number"
        class="serie-input charge-input"
        placeholder="kg"
        min="0"
        step="0.5"
        inputmode="decimal"
        aria-label="Charge en kg, série ${sIdx + 1}"
        value="${serie.charge}"
        ${serie.validee ? "disabled" : ""}
        oninput="updateSerie(${exoIdx}, ${sIdx}, 'charge', this.value)"
      >`}
      ${!serie.validee ? `
        <button class="btn-valider-serie" onclick="validerSerie(${exoIdx}, ${sIdx})" title="Valider cette série">
          ✓
        </button>
      ` : `<span class="serie-check">✓</span>`}
    </div>
  `).join("");
}

// ────────────────────────────────────────────────
//  LOGIQUE SÉRIES
// ────────────────────────────────────────────────

function updateSerie(exoIdx, sIdx, champ, valeur) {
  seanceData[exoIdx].series[sIdx][champ] = valeur;
  sauvegarderSeanceEnCours();
}

function validerSerie(exoIdx, sIdx) {
  const serie = seanceData[exoIdx].series[sIdx];

  const exo = seanceData[exoIdx];
  const pdc = estPoidsDeCorps(exo.nom);
  const secondes = uniteReps(exo.nom) === "s";

  // Vérification : au moins les reps (ou la durée pour le gainage)
  if (!serie.reps || parseInt(serie.reps) < 1) {
    showToast(secondes ? "Entre la durée tenue (en secondes) avant de valider 👀"
                       : "Entre le nombre de répétitions avant de valider 👀", "warning");
    return;
  }

  serie.validee = true;
  // Poids du corps : pas de charge, même si une ancienne valeur traînait
  if (pdc) serie.charge = "";

  // Record battu ? On compare au maximum enregistré AVANT cette série :
  // la charge, ou les répétitions pour un exercice au poids du corps.
  // Récompense une seule fois par exercice et par séance.
  const valeur = pdc ? (parseInt(serie.reps) || 0) : (parseFloat(serie.charge) || 0);
  const unite = pdc ? (secondes ? "s" : "reps") : "kg";
  const ancienMax = parseFloat(lireStockage("perfs", {})[exo.nom]) || 0;
  const record = ancienMax > 0 && valeur > ancienMax;
  if (record && !exo.recordRecompense) {
    exo.recordRecompense = true;
    Pieces.gagner(GAINS.record, `Record : ${exo.nom} (${valeur} ${unite})`,
      { texte: `Nouveau record !\n${exo.nom} : ${valeur} ${unite}` });
  }
  sauvegarderSeanceEnCours();
  Repos.demarrer();

  // Mettre à jour la perf (charge max, ou reps max au poids du corps)
  if (valeur > 0) {
    sauvegarderPerf(exo.nom, valeur);
  }

  // Re-render la ligne
  const row = document.getElementById(`serie-row-${exoIdx}-${sIdx}`);
  if (row) {
    row.outerHTML = `
      <div class="serie-row serie-validee" id="serie-row-${exoIdx}-${sIdx}">
        <span class="serie-num">${sIdx + 1}</span>
        <input type="number" class="serie-input reps-input" value="${serie.reps}" disabled>
        ${pdc ? "" : `<input type="number" class="serie-input charge-input" value="${serie.charge || ''}" placeholder="-" disabled>`}
        <span class="serie-check">✓</span>
      </div>
    `;
  }

  // Le record a déjà son animation : pas de toast par-dessus
  majBulleRecord(exoIdx);
  if (!record) showToast(`Série ${sIdx + 1} validée ! 💪`, "success");
}

function ajouterSerie(exoIdx) {
  const exo = seanceData[exoIdx];
  exo.series.push({ reps: "", charge: chargeInitiale(exo.nom), validee: false });
  sauvegarderSeanceEnCours();

  // Re-render uniquement les rows
  const rowsContainer = document.getElementById(`series-rows-${exoIdx}`);
  if (rowsContainer) {
    rowsContainer.innerHTML = renderSeries(exoIdx, exo.series);
    // Scroll vers la nouvelle série
    const lastRow = rowsContainer.lastElementChild;
    if (lastRow) lastRow.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function validerExercice(exoIdx) {
  const exo = seanceData[exoIdx];
  const seriesValides = exo.series.filter(s => s.validee);

  if (seriesValides.length === 0) {
    showToast("Valide au moins une série avant de terminer cet exercice !", "warning");
    return;
  }

  exo.termine = true;
  exosTermines++;
  sauvegarderSeanceEnCours();

  // Mettre à jour le compteur global
  majCompteurs();

  // Animer la carte
  const card = document.getElementById(`exo-card-${exoIdx}`);
  if (card) {
    card.classList.add("exo-done");

    // Remplacer le statut + retirer les boutons d'action
    const statusBadge = document.getElementById(`status-${exoIdx}`);
    if (statusBadge) statusBadge.innerHTML = '<span class="badge-done">✓ Terminé</span>';

    const actions = card.querySelector(".series-actions");
    if (actions) actions.remove();
  }

  showToast(`${exo.nom} terminé ! 🔥`, "success");

  // Si tous les exos sont terminés, afficher le bouton final
  if (exosTermines === seanceData.length) {
    setTimeout(() => {
      majZoneFin();
      document.getElementById("finish-zone").scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  } else {
    // Scroll vers le prochain exercice
    const prochainCard = document.getElementById(`exo-card-${exoIdx + 1}`);
    if (prochainCard) {
      setTimeout(() => prochainCard.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }
}

// ────────────────────────────────────────────────
//  PERFORMANCES
// ────────────────────────────────────────────────

// Perf d'un exercice : charge max (kg), ou répétitions max au poids du corps
function sauvegarderPerf(nomExercice, valeur) {
  const perfs = lireStockage("perfs", {});
  const actuelle = parseFloat(perfs[nomExercice]) || 0;
  if (parseFloat(valeur) > actuelle) {
    perfs[nomExercice] = String(valeur);
    ecrireStockage("perfs", perfs);
  }
}

// Charge pré-remplie pour une nouvelle série : le dernier max, sauf au poids du corps
function chargeInitiale(nom) {
  if (estPoidsDeCorps(nom)) return "";
  const perfs = lireStockage("perfs", {});
  return perfs[nom] ? parseFloat(perfs[nom]) : "";
}

// Meilleure série enregistrée pour une valeur max donnée : les reps faites
// à cette charge (ou la série qui a établi le max de reps) et sa date.
// Cherche d'abord dans la séance en cours, puis dans l'historique.
function serieDuMax(exo, max, pdc) {
  const valeurDe = s => pdc ? (parseInt(s.reps) || 0) : (parseFloat(s.charge) || 0);
  const enCours = exo.series.filter(s => s.validee && valeurDe(s) === max);
  if (enCours.length) return { reps: Math.max(...enCours.map(s => parseInt(s.reps) || 0)), date: null };

  let meilleure = null;
  lireStockage("historique", []).forEach(seance => (seance.exercices || []).forEach(e => {
    if (e.nom !== exo.nom) return;
    (e.series || []).forEach(serie => {
      if (valeurDe(serie) !== max) return;
      const reps = parseInt(serie.reps) || 0;
      if (!meilleure || reps > meilleure.reps || (reps === meilleure.reps && seance.date > meilleure.date)) {
        meilleure = { reps, date: seance.date };
      }
    });
  }));
  return meilleure;
}

// Bulle de rappel du record sur chaque exercice de la séance :
// « 🏆 Ton max : 100 kg × 5 », puis « 🔥 Nouveau max » une fois battu.
function rappelRecord(exo, exoIdx) {
  const pdc = estPoidsDeCorps(exo.nom);
  const unite = pdc ? uniteReps(exo.nom) : "kg";
  const max = parseFloat(lireStockage("perfs", {})[exo.nom]) || 0;
  let contenu;

  if (!max) {
    contenu = `🏆 Première fois : ta 1re série sera ton record`;
  } else {
    const serie = serieDuMax(exo, max, pdc);
    // Le détail « × reps » n'a de sens que pour une charge
    const detail = !pdc && serie && serie.reps ? ` × ${serie.reps}` : "";
    const date = !exo.recordRecompense && serie && serie.date
      ? ` <small>(${new Date(serie.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })})</small>` : "";
    contenu = exo.recordRecompense
      ? `🔥 Nouveau max : <strong>${max} ${unite}${detail}</strong>`
      : `🏆 Ton max : <strong>${max} ${unite}${detail}</strong>${date}`;
  }
  return `<span class="bulle-record ${exo.recordRecompense ? "battu" : ""}" id="bulle-record-${exoIdx}">${contenu}</span>`;
}

function majBulleRecord(exoIdx) {
  const bulle = document.getElementById(`bulle-record-${exoIdx}`);
  if (bulle) bulle.outerHTML = rappelRecord(seanceData[exoIdx], exoIdx);
}

// ────────────────────────────────────────────────
//  TERMINER LA SÉANCE → HISTORIQUE
// ────────────────────────────────────────────────

let seanceTerminee = false;

function terminerSeance() {
  // Un double appui ne doit ni dupliquer la séance ni payer deux fois
  if (seanceTerminee) return;
  seanceTerminee = true;
  arreterTimer();
  Repos.arreter();

  // Construire l'objet séance pour l'historique
  const seanceComplete = {
    date: new Date().toISOString(),
    duree: timerSeconds,
    exercices: seanceData.map(exo => {
      const pdc = estPoidsDeCorps(exo.nom);
      const validees = exo.series.filter(s => s.validee);
      return {
        nom: exo.nom,
        muscle: exo.muscle,
        ...(pdc ? { poidsDeCorps: true } : {}),
        series: validees.map(s => ({
          reps: parseInt(s.reps) || 0,
          charge: pdc ? 0 : (parseFloat(s.charge) || 0),
        })),
        // Charge max de la séance (0 au poids du corps) et répétitions max
        chargeMax: pdc ? 0 : Math.max(0, ...validees.map(s => parseFloat(s.charge) || 0)),
        repsMax: Math.max(0, ...validees.map(s => parseInt(s.reps) || 0)),
      };
    }).filter(e => e.series.length > 0), // Ne garder que les exos avec au moins 1 série validée
  };

  // Sauvegarder dans l'historique
  const historique = lireStockage("historique", []);
  historique.push(seanceComplete);
  ecrireStockage("historique", historique);
  effacerSeanceEnCours();

  // Afficher le modal de fin
  const totalSeries = seanceComplete.exercices.reduce((acc, e) => acc + e.series.length, 0);
  const dureeStr = formatDuree(timerSeconds);
  document.getElementById("modal-summary").innerHTML =
    `<strong>${seanceComplete.exercices.length} exercice(s)</strong>, <strong>${totalSeries} série(s)</strong> en <strong>${dureeStr}</strong>. C'est dans les livres ! 💪`;

  // Pièces gagnées (affichées dans le modal, sans animation par-dessus)
  const gain = Pieces.gainFinSeance(totalSeries);
  const records = seanceData.filter(e => e.recordRecompense).length;
  Pieces.gagner(gain, "Séance terminée", { celebrer: false });
  document.getElementById("modal-gain").innerHTML =
    `${PIECE_SVG}<span>+${gain} pièces</span>` +
    (records ? `<small>+ ${records * GAINS.record} pour ${records} record(s) battu(s) pendant la séance</small>` : "");

  document.getElementById("modal-fin").classList.remove("hidden");
  document.getElementById("modal-fin").classList.add("fade-in");
}

// ────────────────────────────────────────────────
//  UTILITAIRES
// ────────────────────────────────────────────────

// Le chrono est calculé à partir de l'heure de début : il reste juste même si
// le navigateur suspend l'onglet (écran verrouillé, appli en arrière-plan).
function demarrerTimer() {
  arreterTimer();
  const tick = () => {
    timerSeconds = Math.max(0, Math.floor((Date.now() - debutSeance) / 1000));
    document.getElementById("seance-timer").textContent = "⏱ " + formatDuree(timerSeconds);
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function arreterTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function formatDuree(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

function updateProgressBar() {
  const pct = seanceData.length > 0 ? (exosTermines / seanceData.length) * 100 : 0;
  document.getElementById("global-progress-fill").style.width = pct + "%";
}

function majCompteurs() {
  document.getElementById("total-exo-count").textContent = seanceData.length;
  document.getElementById("current-exo-index").textContent = Math.min(exosTermines + 1, seanceData.length);
  updateProgressBar();
}

// Le bouton de fin n'est visible que si tous les exercices sont terminés
// (y compris après un ajout / retrait via « Modifier »).
function majZoneFin() {
  const finZone = document.getElementById("finish-zone");
  const toutFini = seanceData.length > 0 && exosTermines === seanceData.length;
  finZone.classList.toggle("hidden", !toutFini);
  finZone.classList.toggle("fade-in", toutFini);
}

// Toast notifications
let toastTimeout = null;
function showToast(message, type = "success") {
  let toast = document.getElementById("toast-notif");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notif";
    document.body.appendChild(toast);
  }

  clearTimeout(toastTimeout);
  toast.className = `toast toast-${type} toast-show`;
  toast.textContent = message;

  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast-show");
  }, 2800);
}

// ────────────────────────────────────────────────
//  MODIFIER LA SÉANCE EN COURS
// ────────────────────────────────────────────────

let modifSelectionTemp = []; // état temporaire pendant la modif

function ouvrirModalModif() {
  // Initialiser la sélection temp depuis seanceData actuelle
  modifSelectionTemp = seanceData.map(e => e.nom);

  // Réinitialiser les filtres
  document.querySelectorAll(".modif-filter-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.muscle === "all"));

  renderModifGrille("all");
  document.getElementById("modal-modif").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function fermerModalModif() {
  document.getElementById("modal-modif").classList.add("hidden");
  document.body.style.overflow = "";
}

function renderModifGrille(muscle) {
  const grid = document.getElementById("modif-exo-grid");
  if (!grid) return;

  const liste = muscle === "all"
    ? EXERCICES_DB
    : EXERCICES_DB.filter(e => e.muscle === muscle);

  // Exercices déjà terminés — intouchables
  const exosTerminesList = seanceData
    .filter(e => e.termine)
    .map(e => e.nom);

  grid.innerHTML = liste.map(exo => {
    const estSelectionne = modifSelectionTemp.includes(exo.nom);
    const estTermine     = exosTerminesList.includes(exo.nom);

    return `
      <div class="modif-exo-card ${estSelectionne ? "selected" : ""} ${estTermine ? "locked" : ""}"
           onclick="${estTermine ? "" : `toggleModifExo('${exo.nom.replace(/'/g, "\\'")}')`}">
        <div class="modif-exo-img">
          <img src="assets/images/${exo.image}" alt="${exo.nom}" loading="lazy"
               onerror="this.src='assets/images/placeholder.svg'">
          <div class="modif-check-badge">${estTermine ? "🔒" : "✓"}</div>
        </div>
        <div class="modif-exo-info">
          <span class="modif-exo-nom">${exo.nom}</span>
          <span class="modif-exo-muscle">${MUSCLE_LABELS[exo.muscle]}</span>
        </div>
      </div>`;
  }).join("");
}

function toggleModifExo(nom) {
  const idx = modifSelectionTemp.indexOf(nom);
  if (idx === -1) {
    modifSelectionTemp.push(nom);
  } else {
    modifSelectionTemp.splice(idx, 1);
  }

  // Mettre à jour visuellement la carte sans re-render complet
  const activeFilter = document.querySelector(".modif-filter-btn.active");
  renderModifGrille(activeFilter ? activeFilter.dataset.muscle : "all");
}

function appliquerModif() {
  if (modifSelectionTemp.length === 0) {
    showToast("Sélectionne au moins un exercice !", "warning");
    return;
  }

  // Exercices terminés — on les garde tels quels
  const exosTerminesData = seanceData.filter(e => e.termine);
  const nomsTermines     = exosTerminesData.map(e => e.nom);

  // Nouveaux exercices à ajouter (pas encore dans seanceData)
  const nomsActuels = seanceData.map(e => e.nom);
  const aAjouter    = modifSelectionTemp.filter(nom => !nomsActuels.includes(nom));

  // Exercices à retirer (dans seanceData mais plus dans la sélection, et non terminés)
  const aRetirer    = seanceData.filter(e => !modifSelectionTemp.includes(e.nom) && !e.termine);

  // Construire le nouveau seanceData
  // 1. Garder les exos terminés en premier (ordre préservé)
  // 2. Garder les exos en cours sélectionnés (ordre préservé)
  // 3. Ajouter les nouveaux à la fin
  const enCoursGardes = seanceData.filter(e =>
    !e.termine && modifSelectionTemp.includes(e.nom)
  );

  const nouveaux = aAjouter.map(nom => {
    const exo = EXERCICES_DB.find(e => e.nom === nom);
    return {
      nom,
      muscle: exo ? exo.muscle : "",
      series: [{ reps: "", charge: chargeInitiale(nom), validee: false }],
      termine: false,
    };
  });

  seanceData = [...exosTerminesData, ...enCoursGardes, ...nouveaux];

  // Recalculer exosTermines
  exosTermines = seanceData.filter(e => e.termine).length;
  sauvegarderSeanceEnCours();

  // Mettre à jour les compteurs
  majCompteurs();

  // Re-render la séance
  renderSeance();
  majZoneFin();

  fermerModalModif();

  const msg = [];
  if (aAjouter.length > 0)  msg.push(`+${aAjouter.length} ajouté(s)`);
  if (aRetirer.length > 0)  msg.push(`-${aRetirer.length} retiré(s)`);
  if (msg.length > 0) showToast(msg.join(" · ") + " ✓", "success");
  else showToast("Séance inchangée", "success");
}

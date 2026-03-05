// ════════════════════════════════════════════════
//  SPORT+ — seance.js
//  Flux : Sélection → Séance active → Historique
// ════════════════════════════════════════════════

// ── Base de données des exercices ──────────────
const EXERCICES_DB = [
  // PECTORAUX
  { nom: "Développé Couché",     muscle: "pectoraux", image: "developpe-couche.jpg" },
  { nom: "Développé Incliné",    muscle: "pectoraux", image: "developpe-incline.jpg" },
  { nom: "Développé Décliné",    muscle: "pectoraux", image: "developpe-decline.jpg" },
  { nom: "Développé Haltères",   muscle: "pectoraux", image: "developpe-halteres.jpg" },
  { nom: "Écarté Couché",        muscle: "pectoraux", image: "ecarte-couche.jpg" },
  { nom: "Écarté Incliné",       muscle: "pectoraux", image: "ecarte-incline.jpg" },
  { nom: "Pompes",               muscle: "pectoraux", image: "pompes.png" },
  { nom: "Pompes Inclinées",     muscle: "pectoraux", image: "pompes-inclinees.jpg" },
  { nom: "Dips Pectoraux",       muscle: "pectoraux", image: "dips-pectoraux.jpg" },
  { nom: "Pull Over",            muscle: "pectoraux", image: "pull-over.jpg" },
  { nom: "Pec Deck",             muscle: "pectoraux", image: "pec-deck.jpg" },
  { nom: "Cable Crossover",      muscle: "pectoraux", image: "cable-crossover.jpg" },
  // DOS
  { nom: "Tractions",            muscle: "dos", image: "tractions.jpg" },
  { nom: "Tractions Pronation",  muscle: "dos", image: "tractions-pronation.jpg" },
  { nom: "Tractions Supination", muscle: "dos", image: "tractions-supination.jpg" },
  { nom: "Rowing Barre",         muscle: "dos", image: "rowing-barre.jpg" },
  { nom: "Rowing Haltères",      muscle: "dos", image: "rowing-halteres.jpg" },
  { nom: "Rowing T-Barre",       muscle: "dos", image: "rowing-t-barre.jpg" },
  { nom: "Tirage Horizontal",    muscle: "dos", image: "tirage-horizontal.jpg" },
  { nom: "Tirage Vertical",      muscle: "dos", image: "tirage-vertical.jpg" },
  { nom: "Tirage Poitrine",      muscle: "dos", image: "tirage-poitrine.jpg" },
  { nom: "Tirage Nuque",         muscle: "dos", image: "tirage-nuque.jpg" },
  { nom: "Soulevé de Terre",     muscle: "dos", image: "souleve-de-terre.jpg" },
  { nom: "Soulevé de Terre Roumain", muscle: "dos", image: "souleve-de-terre-roumain.jpg" },
  { nom: "Shrugs",               muscle: "dos", image: "shrugs.jpg" },
  { nom: "Face Pull",            muscle: "dos", image: "face-pull.jpg" },
  // ÉPAULES
  { nom: "Développé Militaire",          muscle: "epaules", image: "placeholder.svg" },
  { nom: "Développé Haltères Assis",     muscle: "epaules", image: "placeholder.svg" },
  { nom: "Élévations Latérales",         muscle: "epaules", image: "placeholder.svg" },
  { nom: "Élévations Frontales",         muscle: "epaules", image: "placeholder.svg" },
  { nom: "Oiseau Haltères",              muscle: "epaules", image: "placeholder.svg" },
  { nom: "Oiseau Poulie",                muscle: "epaules", image: "placeholder.svg" },
  { nom: "Rowing Menton",                muscle: "epaules", image: "placeholder.svg" },
  { nom: "Arnold Press",                 muscle: "epaules", image: "placeholder.svg" },
  { nom: "Élévations Latérales Câble",   muscle: "epaules", image: "placeholder.svg" },
  // BRAS
  { nom: "Curl Barre",           muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Haltères",        muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Marteau",         muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Pupitre",         muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Incliné",         muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Concentration",   muscle: "bras", image: "placeholder.svg" },
  { nom: "Curl Cable",           muscle: "bras", image: "placeholder.svg" },
  { nom: "Dips Triceps",         muscle: "bras", image: "placeholder.svg" },
  { nom: "Extension Nuque",      muscle: "bras", image: "placeholder.svg" },
  { nom: "Barre au Front",       muscle: "bras", image: "placeholder.svg" },
  { nom: "Extension Poulie Haute", muscle: "bras", image: "placeholder.svg" },
  { nom: "Kickback Haltères",    muscle: "bras", image: "placeholder.svg" },
  { nom: "Diamond Push-ups",     muscle: "bras", image: "placeholder.svg" },
  // JAMBES
  { nom: "Squat",                muscle: "jambes", image: "Squats.jpeg" },
  { nom: "Squat Avant",          muscle: "jambes", image: "placeholder.svg" },
  { nom: "Squat Bulgare",        muscle: "jambes", image: "placeholder.svg" },
  { nom: "Presse à Cuisses",     muscle: "jambes", image: "placeholder.svg" },
  { nom: "Leg Extension",        muscle: "jambes", image: "placeholder.svg" },
  { nom: "Fentes Avant",         muscle: "jambes", image: "placeholder.svg" },
  { nom: "Fentes Marchées",      muscle: "jambes", image: "placeholder.svg" },
  { nom: "Hack Squat",           muscle: "jambes", image: "placeholder.svg" },
  { nom: "Leg Curl",             muscle: "jambes", image: "placeholder.svg" },
  { nom: "Leg Curl Debout",      muscle: "jambes", image: "placeholder.svg" },
  { nom: "Good Morning",         muscle: "jambes", image: "placeholder.svg" },
  { nom: "Hip Thrust",           muscle: "jambes", image: "placeholder.svg" },
  { nom: "Mollets Debout",       muscle: "jambes", image: "placeholder.svg" },
  { nom: "Mollets Assis",        muscle: "jambes", image: "placeholder.svg" },
  { nom: "Mollets Presse",       muscle: "jambes", image: "placeholder.svg" },
  // ABDOMINAUX
  { nom: "Crunch",               muscle: "abdos", image: "placeholder.svg" },
  { nom: "Crunch Obliques",      muscle: "abdos", image: "placeholder.svg" },
  { nom: "Relevé de Jambes",     muscle: "abdos", image: "placeholder.svg" },
  { nom: "Planche",              muscle: "abdos", image: "placeholder.svg" },
  { nom: "Planche Latérale",     muscle: "abdos", image: "placeholder.svg" },
  { nom: "Mountain Climbers",    muscle: "abdos", image: "placeholder.svg" },
  { nom: "Russian Twist",        muscle: "abdos", image: "placeholder.svg" },
  { nom: "Bicycle Crunch",       muscle: "abdos", image: "placeholder.svg" },
  { nom: "Ab Wheel",             muscle: "abdos", image: "placeholder.svg" },
  { nom: "Hanging Leg Raise",    muscle: "abdos", image: "placeholder.svg" },
  { nom: "Cable Crunch",         muscle: "abdos", image: "placeholder.svg" },
  { nom: "Sit-ups",              muscle: "abdos", image: "placeholder.svg" },
];

const MUSCLE_LABELS = {
  pectoraux: "Pectoraux",
  dos:       "Dos",
  epaules:   "Épaules",
  bras:      "Bras",
  jambes:    "Jambes",
  abdos:     "Abdominaux",
};

// ── État de l'application ───────────────────────
let exercicesSelectionnes = []; // noms des exos choisis
let seanceData = [];            // [{ nom, muscle, series: [{ reps, charge, validee }] }]
let timerInterval = null;
let timerSeconds = 0;
let exosTermines = 0;

// ── Initialisation ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  genererGrille("all");
  initFiltres();
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

  // Récupérer les perfs sauvegardées pour pré-remplir la charge
  const perfs = JSON.parse(localStorage.getItem("perfs")) || {};

  // Construire la structure de la séance
  seanceData = exercicesSelectionnes.map(nom => {
    const exo = EXERCICES_DB.find(e => e.nom === nom);
    const dernierPoids = perfs[nom] ? parseFloat(perfs[nom]) : "";
    return {
      nom,
      muscle: exo ? exo.muscle : "",
      series: [{ reps: "", charge: dernierPoids, validee: false }],
    };
  });

  // Masquer étape 1, afficher étape 2
  document.getElementById("step-selection").classList.add("hidden");
  const stepSeance = document.getElementById("step-seance");
  stepSeance.classList.remove("hidden");
  stepSeance.classList.add("fade-in");

  // Mettre à jour les compteurs
  document.getElementById("total-exo-count").textContent = seanceData.length;
  document.getElementById("current-exo-index").textContent = 1;
  updateProgressBar();

  // Lancer le chrono
  demarrerTimer();

  // Rendre la séance
  renderSeance();

  window.scrollTo({ top: 0, behavior: "smooth" });
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

      <!-- Tableau des séries -->
      <div class="series-table">
        <div class="series-table-header">
          <span>Série</span>
          <span>Reps</span>
          <span>Charge (kg)</span>
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
  return series.map((serie, sIdx) => `
    <div class="serie-row ${serie.validee ? "serie-validee" : ""}" id="serie-row-${exoIdx}-${sIdx}">
      <span class="serie-num">${sIdx + 1}</span>
      <input
        type="number"
        class="serie-input reps-input"
        placeholder="12"
        min="1"
        value="${serie.reps}"
        ${serie.validee ? "disabled" : ""}
        oninput="updateSerie(${exoIdx}, ${sIdx}, 'reps', this.value)"
      >
      <input
        type="number"
        class="serie-input charge-input"
        placeholder="kg"
        min="0"
        step="0.5"
        value="${serie.charge}"
        ${serie.validee ? "disabled" : ""}
        oninput="updateSerie(${exoIdx}, ${sIdx}, 'charge', this.value)"
      >
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
}

function validerSerie(exoIdx, sIdx) {
  const serie = seanceData[exoIdx].series[sIdx];

  // Vérification : au moins les reps
  if (!serie.reps || parseInt(serie.reps) < 1) {
    showToast("Entre le nombre de répétitions avant de valider 👀", "warning");
    return;
  }

  serie.validee = true;

  // Sauvegarder la charge dans les perfs si renseignée
  if (serie.charge && parseFloat(serie.charge) > 0) {
    sauvegarderPerf(seanceData[exoIdx].nom, serie.charge);
  }

  // Re-render la ligne
  const row = document.getElementById(`serie-row-${exoIdx}-${sIdx}`);
  if (row) {
    row.outerHTML = `
      <div class="serie-row serie-validee" id="serie-row-${exoIdx}-${sIdx}">
        <span class="serie-num">${sIdx + 1}</span>
        <input type="number" class="serie-input reps-input" value="${serie.reps}" disabled>
        <input type="number" class="serie-input charge-input" value="${serie.charge || '-'}" disabled>
        <span class="serie-check">✓</span>
      </div>
    `;
  }

  showToast(`Série ${sIdx + 1} validée ! 💪`, "success");
}

function ajouterSerie(exoIdx) {
  const exo = seanceData[exoIdx];
  const perfs = JSON.parse(localStorage.getItem("perfs")) || {};
  const dernierPoids = perfs[exo.nom] ? parseFloat(perfs[exo.nom]) : "";

  exo.series.push({ reps: "", charge: dernierPoids, validee: false });

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

  // Mettre à jour le compteur global
  document.getElementById("current-exo-index").textContent = Math.min(exosTermines + 1, seanceData.length);
  updateProgressBar();

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
      const finZone = document.getElementById("finish-zone");
      finZone.classList.remove("hidden");
      finZone.classList.add("fade-in");
      finZone.scrollIntoView({ behavior: "smooth", block: "center" });
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

function sauvegarderPerf(nomExercice, charge) {
  const perfs = JSON.parse(localStorage.getItem("perfs")) || {};
  // On garde la charge la plus élevée de la séance
  const chargeActuelle = parseFloat(perfs[nomExercice]) || 0;
  if (parseFloat(charge) > chargeActuelle) {
    perfs[nomExercice] = String(charge);
    localStorage.setItem("perfs", JSON.stringify(perfs));
  }
}

// ────────────────────────────────────────────────
//  TERMINER LA SÉANCE → HISTORIQUE
// ────────────────────────────────────────────────

function terminerSeance() {
  arreterTimer();

  // Construire l'objet séance pour l'historique
  const seanceComplete = {
    date: new Date().toISOString(),
    duree: timerSeconds,
    exercices: seanceData.map(exo => ({
      nom: exo.nom,
      muscle: exo.muscle,
      series: exo.series
        .filter(s => s.validee)
        .map(s => ({
          reps: parseInt(s.reps) || 0,
          charge: parseFloat(s.charge) || 0,
        })),
      // Charge max de la séance pour cet exo
      chargeMax: Math.max(0, ...exo.series.filter(s => s.validee && s.charge).map(s => parseFloat(s.charge) || 0)),
    })).filter(e => e.series.length > 0), // Ne garder que les exos avec au moins 1 série validée
  };

  // Sauvegarder dans l'historique
  const historique = JSON.parse(localStorage.getItem("historique")) || [];
  historique.push(seanceComplete);
  localStorage.setItem("historique", JSON.stringify(historique));

  // Afficher le modal de fin
  const totalSeries = seanceComplete.exercices.reduce((acc, e) => acc + e.series.length, 0);
  const dureeStr = formatDuree(timerSeconds);
  document.getElementById("modal-summary").innerHTML =
    `<strong>${seanceComplete.exercices.length} exercice(s)</strong>, <strong>${totalSeries} série(s)</strong> en <strong>${dureeStr}</strong>. C'est dans les livres ! 💪`;

  document.getElementById("modal-fin").classList.remove("hidden");
  document.getElementById("modal-fin").classList.add("fade-in");
}

function resetApp() {
  exercicesSelectionnes = [];
  seanceData = [];
  timerSeconds = 0;
  exosTermines = 0;
  arreterTimer();
  // Recharger la page proprement
  window.location.href = "seance.html";
}

// ────────────────────────────────────────────────
//  UTILITAIRES
// ────────────────────────────────────────────────

function demarrerTimer() {
  timerInterval = setInterval(() => {
    timerSeconds++;
    document.getElementById("seance-timer").textContent = "⏱ " + formatDuree(timerSeconds);
  }, 1000);
}

function arreterTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function formatDuree(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function updateProgressBar() {
  const pct = seanceData.length > 0 ? (exosTermines / seanceData.length) * 100 : 0;
  document.getElementById("global-progress-fill").style.width = pct + "%";
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

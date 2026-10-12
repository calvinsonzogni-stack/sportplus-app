// ════════════════════════════════════════════════
//  SPORT+ — planning.js
//  Dépend de commun.js (EXERCICES_DB, dates, stockage)
// ════════════════════════════════════════════════

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS  = ["Janvier","Février","Mars","Avril","Mai","Juin",
               "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ── État ────────────────────────────────────────
let planning = lireStockage("planning", []); // [{ id, nom, date "YYYY-MM-DD", exercices[], recurrence "once"|"weekly" }]
let currentYear  = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let selectedExos = [];
let recurrence   = "once";

// ── CALENDRIER ──────────────────────────────────
function renderCalendar() {
  document.getElementById("cal-month-label").textContent =
    MOIS[currentMonth] + " " + currentYear;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  // En-têtes jours
  JOURS.forEach(j => {
    const h = document.createElement("div");
    h.className = "cal-day-header";
    h.textContent = j;
    grid.appendChild(h);
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  // Lundi = 0 en index
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = todayStr();

  // Cases vides avant le 1er
  for (let i = 0; i < startOffset; i++) {
    const blank = document.createElement("div");
    blank.className = "cal-day cal-day-empty";
    grid.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(currentYear, currentMonth, d);
    const seancesDuJour = getSeancesPourDate(dateStr);
    const isToday = dateStr === today;
    const isPast  = dateStr < today;

    const cell = document.createElement("div");
    cell.className = "cal-day" +
      (isToday ? " cal-today" : "") +
      (isPast  ? " cal-past"  : "") +
      (seancesDuJour.length > 0 ? " cal-has-seance" : "");

    cell.innerHTML = `
      <span class="cal-day-num">${d}</span>
      ${seancesDuJour.length > 0
        ? `<div class="cal-dots">${seancesDuJour.map(s =>
            `<span class="cal-dot" title="${echapperHtml(s.nom)}"></span>`
          ).join("")}</div>`
        : ""}
    `;

    if (!isPast) {
      cell.addEventListener("click", () => ouvrirModal(dateStr));
    }
    grid.appendChild(cell);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});
document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});

// ── MODAL ───────────────────────────────────────
function ouvrirModal(dateStr) {
  selectedDate = dateStr;
  selectedExos = [];
  recurrence = "once";

  // Afficher la date formatée
  const d = new Date(dateStr + "T12:00:00");
  document.getElementById("modal-date-display").textContent =
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Reset champs
  document.getElementById("seance-nom").value = "";
  document.querySelectorAll(".recurrence-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.value === "once");
  });

  updateExoCount();
  renderModalExos("all");
  document.querySelectorAll(".modal-filter-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.muscle === "all");
  });

  document.getElementById("modal-create").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function fermerModal() {
  document.getElementById("modal-create").classList.add("hidden");
  document.body.style.overflow = "";
}

// Fermer en cliquant l'overlay
document.getElementById("modal-create").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-create")) fermerModal();
});

// Récurrence
document.querySelectorAll(".recurrence-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    recurrence = btn.dataset.value;
    document.querySelectorAll(".recurrence-btn").forEach(b =>
      b.classList.toggle("active", b === btn));
  });
});

// Filtres exercices dans le modal
document.querySelectorAll(".modal-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modal-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderModalExos(btn.dataset.muscle);
  });
});

function renderModalExos(muscle) {
  const grid = document.getElementById("modal-exo-grid");
  const liste = muscle === "all" ? EXERCICES_DB : EXERCICES_DB.filter(e => e.muscle === muscle);

  grid.innerHTML = liste.map(exo => {
    const selected = selectedExos.includes(exo.nom);
    return `
      <div class="modal-exo-card ${selected ? "selected" : ""}"
           onclick="toggleModalExo('${exo.nom.replace(/'/g, "\\'")}', this)">
        <div class="modal-exo-img-wrap">
          <img src="assets/images/${exo.image}" alt="${exo.nom}" loading="lazy"
               onerror="this.src='assets/images/placeholder.svg'">
          <div class="modal-exo-img-overlay"></div>
          <div class="modal-exo-check-badge">✓</div>
        </div>
        <div class="modal-exo-info">
          <span class="modal-exo-nom">${exo.nom}</span>
          <span class="modal-exo-muscle">${MUSCLE_LABELS[exo.muscle]}</span>
        </div>
      </div>`;
  }).join("");
}

function toggleModalExo(nom, el) {
  const idx = selectedExos.indexOf(nom);
  if (idx === -1) { selectedExos.push(nom); el.classList.add("selected"); }
  else { selectedExos.splice(idx, 1); el.classList.remove("selected"); }
  updateExoCount();
}

function updateExoCount() {
  document.getElementById("modal-exo-count").textContent =
    `(${selectedExos.length} sélectionné${selectedExos.length > 1 ? "s" : ""})`;
}

// ── SAUVEGARDER ─────────────────────────────────
function sauvegarderSeanceProgrammee() {
  const nom = document.getElementById("seance-nom").value.trim();

  if (!nom) {
    document.getElementById("seance-nom").focus();
    document.getElementById("seance-nom").style.borderColor = "#ff4444";
    setTimeout(() => document.getElementById("seance-nom").style.borderColor = "", 1500);
    return;
  }

  const entry = {
    id: Date.now(),
    nom,
    date: selectedDate,
    exercices: [...selectedExos],
    recurrence,
  };

  planning.push(entry);
  ecrireStockage("planning", planning);

  fermerModal();
  renderCalendar();
  renderListeProgrammees();
}

// ── LISTE DES SÉANCES PROGRAMMÉES ───────────────
function renderListeProgrammees() {
  const liste = document.getElementById("liste-programmees");
  const today = todayStr();

  // Récupérer toutes les occurrences effectives (one-shot + récurrentes à venir)
  const entries = getSeancesAVenir();

  if (!entries.length) {
    liste.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📆</div>
        <h3>Aucune séance programmée</h3>
        <p>Clique sur un jour du calendrier pour programmer ta prochaine séance.</p>
      </div>`;
    return;
  }

  liste.innerHTML = entries.map(entry => {
    const d = new Date(entry.date + "T12:00:00");
    const dateStr = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const isToday = entry.date === today;

    return `
      <div class="programmee-card ${isToday ? "programmee-today" : ""}">
        <div class="programmee-left">
          <div class="programmee-date">
            ${isToday ? '<span class="today-badge">Aujourd\'hui</span>' : ""}
            <span class="programmee-date-label">${dateStr}</span>
            ${entry.recurrence === "weekly" ? '<span class="recurrence-badge">🔁 Hebdo</span>' : ""}
          </div>
          <div class="programmee-nom">${echapperHtml(entry.nom)}</div>
          ${entry.exercices.length > 0
            ? `<div class="programmee-exos">${entry.exercices.slice(0, 4).map(e =>
                `<span class="exo-pill">${echapperHtml(e)}</span>`).join("")}
                ${entry.exercices.length > 4
                  ? `<span class="exo-pill exo-pill-more">+${entry.exercices.length - 4}</span>`
                  : ""
                }</div>`
            : '<p class="no-exos">Exercices libres</p>'
          }
        </div>
        <div class="programmee-actions">
          ${isToday
            ? `<button class="btn-lancer" onclick="lancerDepuisPlanning(${entry.id})">▶ Lancer</button>`
            : ""
          }
          <button class="btn-edit-prog" onclick="ouvrirModalEditPlanning(${entry.id})" title="Modifier les exercices" aria-label="Modifier les exercices">✏️</button>
          <button class="btn-supprimer-prog" onclick="supprimerProgrammee(${entry.id})" title="Supprimer" aria-label="Supprimer cette séance programmée">🗑️</button>
        </div>
      </div>`;
  }).join("");
}

function getSeancesAVenir() {
  const today = todayStr();
  const results = [];

  planning.forEach(entry => {
    if (entry.recurrence === "once") {
      if (entry.date >= today) results.push(entry);
    } else if (entry.recurrence === "weekly") {
      // Générer les 8 prochaines occurrences à partir d'aujourd'hui
      // (et non à partir de la date de création, sinon la séance disparaît après 8 semaines)
      const baseDate = new Date(entry.date + "T12:00:00");
      const semainesEcoulees = Math.max(0, Math.ceil(ecartJours(entry.date, today) / 7));
      for (let i = semainesEcoulees; i < semainesEcoulees + 8; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i * 7);
        results.push({ ...entry, date: dateVersStr(d) });
      }
    }
  });

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

function getSeancesPourDate(dateStr) {
  return planning.filter(entry => seanceTombeLe(entry, dateStr));
}

function supprimerProgrammee(id) {
  if (!confirm("Supprimer cette séance programmée ?")) return;
  planning = planning.filter(e => e.id !== id);
  ecrireStockage("planning", planning);
  renderCalendar();
  renderListeProgrammees();
}

function lancerDepuisPlanning(id) {
  const entry = planning.find(e => e.id === id)
    || getSeancesAVenir().find(e => e.id === id);
  if (!entry) return;
  if (entry.exercices.length > 0) {
    ecrireStockage("seance_preloaded", entry.exercices);
  }
  window.location.href = "seance.html";
}

// ── INIT ────────────────────────────────────────
renderCalendar();
renderListeProgrammees();

// ────────────────────────────────────────────────
//  ÉDITER LES EXERCICES D'UNE SÉANCE PLANIFIÉE
// ────────────────────────────────────────────────

let editPlanningId    = null;
let editExosTemp      = [];

function ouvrirModalEditPlanning(id) {
  editPlanningId = id;
  const entry = planning.find(e => e.id === id);
  if (!entry) return;

  editExosTemp = [...(entry.exercices || [])];

  // Reset filtres
  document.querySelectorAll(".edit-filter-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.muscle === "all"));

  renderEditGrille("all");
  updateEditExoCount();
  document.getElementById("modal-edit-planning").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function fermerModalEditPlanning() {
  document.getElementById("modal-edit-planning").classList.add("hidden");
  document.body.style.overflow = "";
}

// Clic overlay pour fermer
document.getElementById("modal-edit-planning").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-edit-planning")) fermerModalEditPlanning();
});

// Filtres
document.querySelectorAll(".edit-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".edit-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderEditGrille(btn.dataset.muscle);
  });
});

function renderEditGrille(muscle) {
  const grid = document.getElementById("edit-exo-grid");
  const liste = muscle === "all" ? EXERCICES_DB : EXERCICES_DB.filter(e => e.muscle === muscle);

  grid.innerHTML = liste.map(exo => {
    const selected = editExosTemp.includes(exo.nom);
    return `
      <div class="modal-exo-card ${selected ? "selected" : ""}"
           onclick="toggleEditExo('${exo.nom.replace(/'/g, "\\'")}')">
        <div class="modal-exo-img-wrap">
          <img src="assets/images/${exo.image}" alt="${exo.nom}" loading="lazy"
               onerror="this.src='assets/images/placeholder.svg'">
          <div class="modal-exo-img-overlay"></div>
          <div class="modal-exo-check-badge">✓</div>
        </div>
        <div class="modal-exo-info">
          <span class="modal-exo-nom">${exo.nom}</span>
          <span class="modal-exo-muscle">${MUSCLE_LABELS[exo.muscle]}</span>
        </div>
      </div>`;
  }).join("");
}

function toggleEditExo(nom) {
  const idx = editExosTemp.indexOf(nom);
  if (idx === -1) editExosTemp.push(nom);
  else editExosTemp.splice(idx, 1);

  const activeFilter = document.querySelector(".edit-filter-btn.active");
  renderEditGrille(activeFilter ? activeFilter.dataset.muscle : "all");
  updateEditExoCount();
}

function updateEditExoCount() {
  document.getElementById("edit-exo-count").textContent =
    `(${editExosTemp.length} sélectionné${editExosTemp.length > 1 ? "s" : ""})`;
}

function sauvegarderEditPlanning() {
  const idx = planning.findIndex(e => e.id === editPlanningId);
  if (idx === -1) return;

  planning[idx].exercices = [...editExosTemp];
  ecrireStockage("planning", planning);

  fermerModalEditPlanning();
  renderCalendar();
  renderListeProgrammees();
}

// Échap ferme le modal ouvert
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!document.getElementById("modal-create").classList.contains("hidden")) fermerModal();
  if (!document.getElementById("modal-edit-planning").classList.contains("hidden")) fermerModalEditPlanning();
});

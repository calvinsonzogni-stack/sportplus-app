// ════════════════════════════════════════════════
//  SPORT+ — planning.js
// ════════════════════════════════════════════════

const EXERCICES_DB = [
  { nom: "Développé Couché",           muscle: "pectoraux", image: "developpe-couche.jpg" },
  { nom: "Développé Incliné",          muscle: "pectoraux", image: "developpe-incline.jpg" },
  { nom: "Développé Décliné",          muscle: "pectoraux", image: "developpe-decline.jpg" },
  { nom: "Développé Haltères",         muscle: "pectoraux", image: "developpe-halteres.jpg" },
  { nom: "Écarté Couché",              muscle: "pectoraux", image: "ecarte-couche.jpg" },
  { nom: "Écarté Incliné",             muscle: "pectoraux", image: "ecarte-incline.jpg" },
  { nom: "Pompes",                     muscle: "pectoraux", image: "pompes.png" },
  { nom: "Pompes Inclinées",           muscle: "pectoraux", image: "pompes-inclinees.jpg" },
  { nom: "Dips Pectoraux",             muscle: "pectoraux", image: "dips-pectoraux.jpg" },
  { nom: "Pull Over",                  muscle: "pectoraux", image: "pull-over.jpg" },
  { nom: "Pec Deck",                   muscle: "pectoraux", image: "pec-deck.jpg" },
  { nom: "Cable Crossover",            muscle: "pectoraux", image: "cable-crossover.jpg" },
  { nom: "Tractions",                  muscle: "dos",       image: "tractions.jpg" },
  { nom: "Tractions Pronation",        muscle: "dos",       image: "tractions-pronation.jpg" },
  { nom: "Tractions Supination",       muscle: "dos",       image: "tractions-supination.jpg" },
  { nom: "Rowing Barre",               muscle: "dos",       image: "rowing-barre.jpg" },
  { nom: "Rowing Haltères",            muscle: "dos",       image: "rowing-halteres.jpg" },
  { nom: "Rowing T-Barre",             muscle: "dos",       image: "rowing-t-barre.jpg" },
  { nom: "Tirage Horizontal",          muscle: "dos",       image: "tirage-horizontal.jpg" },
  { nom: "Tirage Vertical",            muscle: "dos",       image: "tirage-vertical.jpg" },
  { nom: "Tirage Poitrine",            muscle: "dos",       image: "tirage-poitrine.jpg" },
  { nom: "Tirage Nuque",               muscle: "dos",       image: "tirage-nuque.jpg" },
  { nom: "Soulevé de Terre",           muscle: "dos",       image: "souleve-de-terre.jpg" },
  { nom: "Soulevé de Terre Roumain",   muscle: "dos",       image: "souleve-de-terre-roumain.jpg" },
  { nom: "Shrugs",                     muscle: "dos",       image: "shrugs.jpg" },
  { nom: "Face Pull",                  muscle: "dos",       image: "face-pull.jpg" },
  { nom: "Développé Militaire",        muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Développé Haltères Assis",   muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Élévations Latérales",       muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Élévations Frontales",       muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Oiseau Haltères",            muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Oiseau Poulie",              muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Rowing Menton",              muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Arnold Press",               muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Élévations Latérales Câble", muscle: "epaules",   image: "placeholder.svg" },
  { nom: "Curl Barre",                 muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Haltères",              muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Marteau",               muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Pupitre",               muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Incliné",               muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Concentration",         muscle: "bras",      image: "placeholder.svg" },
  { nom: "Curl Cable",                 muscle: "bras",      image: "placeholder.svg" },
  { nom: "Dips Triceps",               muscle: "bras",      image: "placeholder.svg" },
  { nom: "Extension Nuque",            muscle: "bras",      image: "placeholder.svg" },
  { nom: "Barre au Front",             muscle: "bras",      image: "placeholder.svg" },
  { nom: "Extension Poulie Haute",     muscle: "bras",      image: "placeholder.svg" },
  { nom: "Kickback Haltères",          muscle: "bras",      image: "placeholder.svg" },
  { nom: "Diamond Push-ups",           muscle: "bras",      image: "placeholder.svg" },
  { nom: "Squat",                      muscle: "jambes",    image: "Squats.jpeg" },
  { nom: "Squat Avant",                muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Squat Bulgare",              muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Presse à Cuisses",           muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Leg Extension",              muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Fentes Avant",               muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Fentes Marchées",            muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Hack Squat",                 muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Leg Curl",                   muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Leg Curl Debout",            muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Good Morning",               muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Hip Thrust",                 muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Mollets Debout",             muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Mollets Assis",              muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Mollets Presse",             muscle: "jambes",    image: "placeholder.svg" },
  { nom: "Crunch",                     muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Crunch Obliques",            muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Relevé de Jambes",           muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Planche",                    muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Planche Latérale",           muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Mountain Climbers",          muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Russian Twist",              muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Bicycle Crunch",             muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Ab Wheel",                   muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Hanging Leg Raise",          muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Cable Crunch",               muscle: "abdos",     image: "placeholder.svg" },
  { nom: "Sit-ups",                    muscle: "abdos",     image: "placeholder.svg" },
];

const MUSCLE_LABELS = {
  pectoraux: "Pectoraux", dos: "Dos", epaules: "Épaules",
  bras: "Bras", jambes: "Jambes", abdos: "Abdominaux",
};

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS  = ["Janvier","Février","Mars","Avril","Mai","Juin",
               "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ── État ────────────────────────────────────────
let planning = JSON.parse(localStorage.getItem("planning")) || []; // [{ id, nom, date "YYYY-MM-DD", exercices[], recurrence "once"|"weekly" }]
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
            `<span class="cal-dot" title="${s.nom}"></span>`
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
  localStorage.setItem("planning", JSON.stringify(planning));

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
          <div class="programmee-nom">${entry.nom}</div>
          ${entry.exercices.length > 0
            ? `<div class="programmee-exos">${entry.exercices.slice(0, 4).map(e =>
                `<span class="exo-pill">${e}</span>`).join("")}
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
          <button class="btn-edit-prog" onclick="ouvrirModalEditPlanning(${entry.id})" title="Modifier les exercices">✏️</button>
          <button class="btn-supprimer-prog" onclick="supprimerProgrammee(${entry.id})">🗑️</button>
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
      // Générer les 8 prochaines occurrences
      const baseDate = new Date(entry.date + "T12:00:00");
      for (let i = 0; i < 8; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i * 7);
        const ds = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
        if (ds >= today) {
          results.push({ ...entry, date: ds });
        }
      }
    }
  });

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

function getSeancesPourDate(dateStr) {
  const results = [];
  planning.forEach(entry => {
    if (entry.recurrence === "once" && entry.date === dateStr) {
      results.push(entry);
    } else if (entry.recurrence === "weekly") {
      const base = new Date(entry.date + "T12:00:00");
      const target = new Date(dateStr + "T12:00:00");
      const diff = Math.round((target - base) / 86400000);
      if (diff >= 0 && diff % 7 === 0) results.push(entry);
    }
  });
  return results;
}

function supprimerProgrammee(id) {
  if (!confirm("Supprimer cette séance programmée ?")) return;
  planning = planning.filter(e => e.id !== id);
  localStorage.setItem("planning", JSON.stringify(planning));
  renderCalendar();
  renderListeProgrammees();
}

function lancerDepuisPlanning(id) {
  const entry = planning.find(e => e.id === id)
    || getSeancesAVenir().find(e => e.id === id);
  if (!entry) return;
  if (entry.exercices.length > 0) {
    localStorage.setItem("seance_preloaded", JSON.stringify(entry.exercices));
  }
  window.location.href = "seance.html";
}

// ── UTILITAIRES ─────────────────────────────────
function todayStr() {
  const d = new Date();
  return formatDate(d.getFullYear(), d.getMonth(), d.getDate());
}
function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
  localStorage.setItem("planning", JSON.stringify(planning));

  fermerModalEditPlanning();
  renderCalendar();
  renderListeProgrammees();
}

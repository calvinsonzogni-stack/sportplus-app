// ════════════════════════════════════════════════
//  SPORT+ — historique.js
// ════════════════════════════════════════════════

let historique = JSON.parse(localStorage.getItem("historique")) || [];

const MUSCLE_LABELS = {
  pectoraux: "Pectoraux",
  dos:       "Dos",
  epaules:   "Épaules",
  bras:      "Bras",
  jambes:    "Jambes",
  abdos:     "Abdominaux",
};

// ── STATS RAPIDES ───────────────────────────────
function calculerStats() {
  document.getElementById("total-seances").textContent = historique.length;
  document.getElementById("streak").textContent = calculerStreak();

  const favori = trouverExerciceFavori();
  const el = document.getElementById("exercice-favori");
  el.textContent = favori || "-";
  // Tronquer si trop long
  if (favori && favori.length > 12) {
    el.style.fontSize = "16px";
  }

  document.getElementById("progression-mois").textContent = calculerProgressionMois();
}

function calculerStreak() {
  if (!historique.length) return 0;
  const sorted = [...historique].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let refDate = new Date();
  refDate.setHours(0, 0, 0, 0);
  for (const seance of sorted) {
    const d = new Date(seance.date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((refDate - d) / 86400000);
    if (diff === streak || (streak === 0 && diff === 0)) { streak++; refDate = d; }
    else break;
  }
  return streak;
}

function trouverExerciceFavori() {
  const cnt = {};
  historique.forEach(s => s.exercices.forEach(e => { cnt[e.nom] = (cnt[e.nom] || 0) + 1; }));
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function calculerProgressionMois() {
  const debut = new Date(); debut.setDate(1); debut.setHours(0, 0, 0, 0);
  const seancesMois = historique.filter(s => new Date(s.date) >= debut);
  if (seancesMois.length < 2) return "0%";
  const first = seancesMois[0];
  const last  = seancesMois[seancesMois.length - 1];
  let total = 0, count = 0;
  last.exercices.forEach(exo => {
    const prev = first.exercices.find(e => e.nom === exo.nom);
    if (prev && prev.chargeMax > 0 && exo.chargeMax > 0) {
      total += ((exo.chargeMax - prev.chargeMax) / prev.chargeMax) * 100;
      count++;
    }
  });
  if (!count) return "0%";
  const moy = Math.round(total / count);
  return (moy >= 0 ? "+" : "") + moy + "%";
}

// ── RECORDS PERSONNELS ──────────────────────────

// Calcule les records à partir de tout l'historique
function calculerRecords() {
  const records = {}; // { nomExo: { chargeMax, muscle, nbFois, derniereDate } }

  historique.forEach(seance => {
    seance.exercices.forEach(exo => {
      const chargeMax = exo.chargeMax
        || (exo.series ? Math.max(0, ...exo.series.map(s => parseFloat(s.charge) || 0)) : 0)
        || (exo.poids ? parseFloat(exo.poids) : 0);

      if (!records[exo.nom]) {
        records[exo.nom] = {
          chargeMax: chargeMax,
          muscle: exo.muscle || "",
          nbFois: 1,
          derniereDate: seance.date,
        };
      } else {
        if (chargeMax > records[exo.nom].chargeMax) records[exo.nom].chargeMax = chargeMax;
        records[exo.nom].nbFois++;
        if (new Date(seance.date) > new Date(records[exo.nom].derniereDate)) {
          records[exo.nom].derniereDate = seance.date;
        }
      }
    });
  });

  return records;
}

function afficherRecords(muscleFilter = "all") {
  const grid = document.getElementById("records-grid");
  const records = calculerRecords();
  const entries = Object.entries(records);

  if (!entries.length) {
    grid.innerHTML = `
      <div class="records-empty">
        <span>🏆</span>
        <p>Tes records apparaîtront ici après ta première séance !</p>
      </div>`;
    return;
  }

  const filtered = muscleFilter === "all"
    ? entries
    : entries.filter(([, r]) => r.muscle === muscleFilter);

  if (!filtered.length) {
    grid.innerHTML = `<div class="records-empty"><span>🔍</span><p>Aucun record pour ce groupe musculaire.</p></div>`;
    return;
  }

  // Trier par charge max décroissante
  filtered.sort((a, b) => b[1].chargeMax - a[1].chargeMax);

  grid.innerHTML = filtered.map(([nom, record], idx) => {
    const dateStr = new Date(record.derniereDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    const muscleLabel = MUSCLE_LABELS[record.muscle] || record.muscle || "—";
    const isPodium = idx < 3;

    return `
      <div class="record-card ${isPodium ? "record-podium" : ""}">
        <div class="record-top">
          <div class="record-exo-info">
            <span class="record-nom">${nom}</span>
            <span class="record-muscle-tag">${muscleLabel}</span>
          </div>
          ${isPodium ? `<span class="podium-badge">${["🥇","🥈","🥉"][idx]}</span>` : ""}
        </div>
        <div class="record-charge">
          ${record.chargeMax > 0
            ? `<span class="charge-value">${record.chargeMax}</span><span class="charge-unit">kg</span>`
            : `<span class="charge-bodyweight">Poids de corps</span>`
          }
        </div>
        <div class="record-meta">
          <span>🔁 ${record.nbFois} fois pratiqué</span>
          <span>📅 ${dateStr}</span>
        </div>
      </div>`;
  }).join("");
}

function initRecordFilters() {
  document.querySelectorAll(".record-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".record-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      afficherRecords(btn.dataset.muscle);
    });
  });
}

// ── GRAPHIQUES ──────────────────────────────────
function populateExerciceSelect() {
  const select = document.getElementById("exercice-select");
  const exercices = new Set();
  historique.forEach(s => s.exercices.forEach(e => exercices.add(e.nom)));
  // Trier alphabétiquement
  [...exercices].sort().forEach(nom => {
    const opt = document.createElement("option");
    opt.value = nom;
    opt.textContent = nom;
    select.appendChild(opt);
  });
  select.addEventListener("change", () => creerGraphiqueEvolution(select.value));
}

let evolutionChart = null;
function creerGraphiqueEvolution(nomExo) {
  const ctx = document.getElementById("evolution-chart").getContext("2d");
  if (evolutionChart) evolutionChart.destroy();
  if (!nomExo) return;

  const points = [];
  historique
    .filter(s => s.exercices.some(e => e.nom === nomExo))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(s => {
      const exo = s.exercices.find(e => e.nom === nomExo);
      if (!exo) return;
      const charge = exo.chargeMax
        || (exo.series ? Math.max(0, ...exo.series.map(s => parseFloat(s.charge) || 0)) : null)
        || (exo.poids ? parseFloat(exo.poids) : null);
      if (charge !== null && charge > 0) {
        points.push({
          label: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          y: charge,
        });
      }
    });

  evolutionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: "Charge max (kg)",
        data: points.map(p => p.y),
        borderColor: "#00ff88",
        backgroundColor: "rgba(0,255,136,0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#00ff88",
        pointBorderColor: "#0a0a0a",
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#888", font: { size: 13 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} kg` } },
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "#1e1e1e" }, ticks: { color: "#666", callback: v => v + " kg" } },
        x: { grid: { display: false }, ticks: { color: "#666" } },
      },
    },
  });
}

let frequenceChart = null;
function creerGraphiqueFrequence() {
  const ctx = document.getElementById("frequence-chart").getContext("2d");
  if (frequenceChart) frequenceChart.destroy();

  const semaines = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    lundi.setHours(0, 0, 0, 0);
    const key = lundi.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    semaines[key] = 0;
  }
  historique.forEach(s => {
    const d = new Date(s.date);
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    lundi.setHours(0, 0, 0, 0);
    const key = lundi.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    if (key in semaines) semaines[key]++;
  });

  frequenceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(semaines),
      datasets: [{
        label: "Séances",
        data: Object.values(semaines),
        backgroundColor: "rgba(0,255,136,0.4)",
        borderColor: "#00ff88",
        borderWidth: 2,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#888", font: { size: 13 } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#1e1e1e" }, ticks: { color: "#666", stepSize: 1 } },
        x: { grid: { display: false }, ticks: { color: "#666" } },
      },
    },
  });
}

// ── LISTE HISTORIQUE ────────────────────────────
function formatDuree(s) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function afficherHistorique() {
  const liste = document.getElementById("liste-historique");

  if (!historique.length) {
    liste.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Aucune séance enregistrée</h3>
        <p>Commence à t'entraîner et tes séances apparaîtront ici !</p>
        <a href="seance.html" class="btn-primary">Créer ma première séance</a>
      </div>`;
    return;
  }

  const sorted = [...historique].sort((a, b) => new Date(b.date) - new Date(a.date));

  liste.innerHTML = sorted.map(seance => {
    const dateStr = new Date(seance.date).toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    const dureeStr = formatDuree(seance.duree);
    const totalSeries = seance.exercices.reduce((acc, e) => acc + (e.series?.length || 1), 0);
    const realIdx = historique.indexOf(seance);

    return `
      <div class="seance-card">
        <div class="seance-header">
          <div class="seance-date-block">
            <span class="date-icon">📅</span>
            <div>
              <span class="date-label">${dateStr}</span>
              <div class="seance-badges">
                <span class="seance-badge">${seance.exercices.length} exercice(s)</span>
                <span class="seance-badge">${totalSeries} série(s)</span>
                ${dureeStr ? `<span class="seance-badge seance-badge-timer">⏱ ${dureeStr}</span>` : ""}
              </div>
            </div>
          </div>
          <button class="btn-delete" onclick="supprimerSeance(${realIdx})">🗑️</button>
        </div>
        <div class="exercices-list">
          ${seance.exercices.map(exo => renderExoHistorique(exo)).join("")}
        </div>
      </div>`;
  }).join("");
}

function renderExoHistorique(exo) {
  if (exo.series && exo.series.length > 0) {
    const seriesHtml = exo.series.map((s, i) =>
      `<span class="serie-pill">${i + 1}. ${s.reps} reps${s.charge ? " × " + s.charge + " kg" : ""}</span>`
    ).join("");
    return `
      <div class="exercice-item exercice-item-rich">
        <div class="exercice-nom">${exo.nom}</div>
        <div class="exercice-series">${seriesHtml}</div>
        ${exo.chargeMax > 0 ? `<div class="exercice-poids">Max : ${exo.chargeMax} kg</div>` : ""}
      </div>`;
  }
  return `
    <div class="exercice-item">
      <span class="exercice-nom">${exo.nom}</span>
      <span class="exercice-poids">${exo.poids ? exo.poids + " kg" : "—"}</span>
    </div>`;
}

function supprimerSeance(index) {
  if (confirm("Supprimer cette séance ?")) {
    historique.splice(index, 1);
    localStorage.setItem("historique", JSON.stringify(historique));
    location.reload();
  }
}

function clearHistory() {
  if (confirm("⚠️ Supprimer tout l'historique ? Cette action est irréversible.")) {
    localStorage.removeItem("historique");
    location.reload();
  }
}

// ── INIT ────────────────────────────────────────
calculerStats();
afficherRecords();
initRecordFilters();
populateExerciceSelect();
creerGraphiqueFrequence();
afficherHistorique();

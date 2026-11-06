// ════════════════════════════════════════════════
//  SPORT+ — historique.js
//  Dépend de commun.js (MUSCLE_LABELS, dates, stockage)
// ════════════════════════════════════════════════

let historique = lireStockage("historique", []);

// ── STATS RAPIDES ───────────────────────────────
function calculerStats() {
  document.getElementById("total-seances").textContent = historique.length;
  document.getElementById("streak").textContent = joursConsecutifs(historique);

  const favori = trouverExerciceFavori();
  const el = document.getElementById("exercice-favori");
  el.textContent = favori || "-";
  // Tronquer si trop long
  if (favori && favori.length > 12) {
    el.style.fontSize = "16px";
  }

  document.getElementById("progression-mois").textContent = calculerProgressionMois();
}


function trouverExerciceFavori() {
  const cnt = {};
  historique.forEach(s => s.exercices.forEach(e => { cnt[e.nom] = (cnt[e.nom] || 0) + 1; }));
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

// Performance d'un exercice dans une séance : la charge max (kg), ou les
// répétitions max (ou secondes, pour le gainage) au poids du corps
function perfExo(exo) {
  const pdc = exo.poidsDeCorps || estPoidsDeCorps(exo.nom);
  if (pdc) {
    const reps = exo.repsMax || (exo.series ? Math.max(0, ...exo.series.map(s => parseInt(s.reps) || 0)) : 0);
    return { valeur: reps, unite: uniteReps(exo.nom), pdc: true };
  }
  const charge = exo.chargeMax
    || (exo.series ? Math.max(0, ...exo.series.map(s => parseFloat(s.charge) || 0)) : 0)
    || (exo.poids ? parseFloat(exo.poids) : 0);
  return { valeur: charge, unite: "kg", pdc: false };
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
    const avant = prev ? perfExo(prev).valeur : 0;
    const apres = perfExo(exo).valeur;
    if (avant > 0 && apres > 0) {
      total += ((apres - avant) / avant) * 100;
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
  const records = {}; // { nomExo: { valeur, unite, pdc, muscle, nbFois, derniereDate } }

  historique.forEach(seance => {
    seance.exercices.forEach(exo => {
      const { valeur, unite, pdc } = perfExo(exo);

      if (!records[exo.nom]) {
        records[exo.nom] = {
          valeur, unite, pdc,
          muscle: exo.muscle || "",
          nbFois: 1,
          derniereDate: seance.date,
        };
      } else {
        if (valeur > records[exo.nom].valeur) records[exo.nom].valeur = valeur;
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

  // Charges d'abord (du plus lourd au plus léger), puis le poids du corps
  // (du plus de répétitions au moins) : comparer des kg et des reps n'a pas de sens.
  filtered.sort((a, b) => (a[1].pdc - b[1].pdc) || (b[1].valeur - a[1].valeur));

  grid.innerHTML = filtered.map(([nom, record], idx) => {
    const dateStr = new Date(record.derniereDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    const muscleLabel = MUSCLE_LABELS[record.muscle] || record.muscle || "—";
    // Podium = les 3 plus grosses charges (les records au poids du corps n'y entrent pas)
    const isPodium = !record.pdc && idx < 3;

    return `
      <div class="record-card ${isPodium ? "record-podium" : ""}">
        <div class="record-top">
          <div class="record-exo-info">
            <span class="record-nom">${echapperHtml(nom)}</span>
            <span class="record-muscle-tag">${muscleLabel}</span>
          </div>
          ${isPodium ? `<span class="podium-badge">${["🥇","🥈","🥉"][idx]}</span>` : ""}
        </div>
        <div class="record-charge">
          ${record.valeur > 0
            ? `<span class="charge-value">${record.valeur}</span> <span class="charge-unit">${record.unite}</span>`
            : `<span class="charge-bodyweight">—</span>`
          }
          ${record.pdc ? `<span class="charge-bodyweight">Poids du corps</span>` : ""}
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

// Chart.js est embarqué localement ; on vérifie quand même sa présence
// pour que les stats et la liste s'affichent même si le script n'a pas chargé.
function chartDisponible() {
  return typeof Chart !== "undefined";
}

// Couleurs des graphiques : celles du thème (theme.css)
function couleurTheme(nom, defaut) {
  return getComputedStyle(document.documentElement).getPropertyValue(nom).trim() || defaut;
}
const ROUGE = couleurTheme("--accent", "#e10600");
const ROUGE_RGB = couleurTheme("--accent-rgb", "225, 6, 0");

let evolutionChart = null;
function creerGraphiqueEvolution(nomExo) {
  if (!chartDisponible()) return;
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
      const { valeur } = perfExo(exo);
      if (valeur > 0) {
        points.push({
          label: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          y: valeur,
        });
      }
    });

  // Poids du corps : on suit les répétitions max (ou la durée), pas une charge
  const pdc = estPoidsDeCorps(nomExo);
  const unite = pdc ? uniteReps(nomExo) : "kg";
  const libelle = !pdc ? "Charge max (kg)" : unite === "s" ? "Durée max (s)" : "Répétitions max";

  evolutionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [{
        label: libelle,
        data: points.map(p => p.y),
        borderColor: ROUGE,
        backgroundColor: `rgba(${ROUGE_RGB},0.12)`,
        borderWidth: 2.5,
        pointBackgroundColor: ROUGE,
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
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} ${unite}` } },
      },
      scales: {
        y: { beginAtZero: false, grid: { color: "#1e1e1e" }, ticks: { color: "#666", callback: v => `${v} ${unite}` } },
        x: { grid: { display: false }, ticks: { color: "#666" } },
      },
    },
  });
}

let frequenceChart = null;
function creerGraphiqueFrequence() {
  if (!chartDisponible()) return;
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
        backgroundColor: `rgba(${ROUGE_RGB},0.45)`,
        borderColor: ROUGE,
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
          <button class="btn-delete" onclick="supprimerSeance(${realIdx})" title="Supprimer" aria-label="Supprimer cette séance">🗑️</button>
        </div>
        <div class="exercices-list">
          ${seance.exercices.map(exo => renderExoHistorique(exo)).join("")}
        </div>
      </div>`;
  }).join("");
}

function renderExoHistorique(exo) {
  if (exo.series && exo.series.length > 0) {
    const { valeur, unite, pdc } = perfExo(exo);
    const seriesHtml = exo.series.map((s, i) =>
      `<span class="serie-pill">${i + 1}. ${s.reps} ${pdc ? unite : "reps"}${!pdc && s.charge ? " × " + s.charge + " kg" : ""}</span>`
    ).join("");
    return `
      <div class="exercice-item exercice-item-rich">
        <div class="exercice-nom">${echapperHtml(exo.nom)}</div>
        <div class="exercice-series">${seriesHtml}</div>
        ${valeur > 0 ? `<div class="exercice-poids">Max : ${valeur} ${unite}</div>` : ""}
      </div>`;
  }
  return `
    <div class="exercice-item">
      <span class="exercice-nom">${echapperHtml(exo.nom)}</span>
      <span class="exercice-poids">${exo.poids ? exo.poids + " kg" : "—"}</span>
    </div>`;
}

function supprimerSeance(index) {
  if (confirm("Supprimer cette séance ?")) {
    historique.splice(index, 1);
    ecrireStockage("historique", historique);
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
afficherHistorique();
populateExerciceSelect();
creerGraphiqueFrequence();

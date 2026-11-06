// ════════════════════════════════════════════════
//  SPORT+ — commun.js
//  Utilitaires partagés par toutes les pages (stockage, dates, sécurité).
//  À charger après donnees-exercices.js et AVANT les scripts propres à chaque page.
// ════════════════════════════════════════════════

// ── Stockage local ──────────────────────────────
// Une donnée corrompue ou un stockage indisponible (navigation privée)
// ne doit jamais faire planter une page : on retombe sur la valeur par défaut.
function lireStockage(cle, defaut) {
  try {
    const brut = localStorage.getItem(cle);
    return brut === null ? defaut : JSON.parse(brut);
  } catch (e) {
    return defaut;
  }
}

function ecrireStockage(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch (e) {
    console.warn("Sport+ : impossible d'enregistrer « " + cle + " »", e);
  }
}

// ── Sécurité ────────────────────────────────────
// Tout texte saisi par l'utilisateur passe par ici avant d'être injecté en HTML.
function echapperHtml(texte) {
  return String(texte ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Dates (format local "YYYY-MM-DD") ───────────
function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function dateVersStr(date) {
  return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayStr() {
  return dateVersStr(new Date());
}

// Écart en jours entre deux dates "YYYY-MM-DD" (midi pour ignorer les changements d'heure)
function ecartJours(depuisStr, jusquaStr) {
  const a = new Date(depuisStr + "T12:00:00");
  const b = new Date(jusquaStr + "T12:00:00");
  return Math.round((b - a) / 86400000);
}

// Une séance programmée a-t-elle lieu ce jour-là ?
function seanceTombeLe(entry, dateStr) {
  if (entry.recurrence === "weekly") {
    const diff = ecartJours(entry.date, dateStr);
    return diff >= 0 && diff % 7 === 0;
  }
  return entry.date === dateStr;
}

// Nombre de jours consécutifs avec au moins une séance, en remontant depuis
// aujourd'hui (ou depuis hier : la série n'est pas perdue tant que la journée n'est pas finie).
function joursConsecutifs(historique) {
  const jours = new Set((historique || []).map(s => dateVersStr(new Date(s.date))));
  const curseur = new Date();
  curseur.setHours(12, 0, 0, 0);
  if (!jours.has(dateVersStr(curseur))) curseur.setDate(curseur.getDate() - 1);

  let streak = 0;
  while (jours.has(dateVersStr(curseur))) {
    streak++;
    curseur.setDate(curseur.getDate() - 1);
  }
  return streak;
}

// ── Migration des données ───────────────────────
// Met à niveau les données enregistrées par d'anciennes versions, étape par
// étape (data_version). Rejouée aussi après l'import d'une vieille sauvegarde.
(function migrerDonnees() {
  const VERSION = 2;
  const version = lireStockage("data_version", 0);
  if (version >= VERSION) return;

  const historique = lireStockage("historique", []);
  const planning = lireStockage("planning", []);
  const perfs = lireStockage("perfs", {});
  const histOk = Array.isArray(historique);
  const perfsOk = perfs && typeof perfs === "object" && !Array.isArray(perfs);

  // v1 : noms d'exercices corrigés, pour que historique, records et planning restent cohérents
  if (version < 1) {
    const RENOMMAGES = { "Dips triceps": "Dips Triceps" };
    const renommer = nom => RENOMMAGES[nom] || nom;
    if (histOk) historique.forEach(s => (s.exercices || []).forEach(e => { e.nom = renommer(e.nom); }));
    if (Array.isArray(planning)) planning.forEach(p => { p.exercices = (p.exercices || []).map(renommer); });
    if (perfsOk) {
      Object.keys(RENOMMAGES).forEach(ancien => {
        if (ancien in perfs) {
          const nouveau = RENOMMAGES[ancien];
          perfs[nouveau] = String(Math.max(parseFloat(perfs[ancien]) || 0, parseFloat(perfs[nouveau]) || 0));
          delete perfs[ancien];
        }
      });
    }
  }

  // v2 : exercices au poids du corps → la « perf » devient le nombre de
  // répétitions max (au lieu d'une charge), recalculé depuis l'historique
  if (version < 2 && perfsOk) {
    EXERCICES_DB.filter(e => e.poidsDeCorps).forEach(e => {
      let max = 0;
      if (histOk) historique.forEach(s => (s.exercices || []).forEach(x => {
        if (x.nom === e.nom) (x.series || []).forEach(serie => { max = Math.max(max, parseInt(serie.reps) || 0); });
      }));
      if (max > 0) perfs[e.nom] = String(max);
      else delete perfs[e.nom];
    });
  }

  if (histOk) ecrireStockage("historique", historique);
  if (Array.isArray(planning)) ecrireStockage("planning", planning);
  if (perfsOk) ecrireStockage("perfs", perfs);
  ecrireStockage("data_version", VERSION);
})();

// ── Appli installable / hors ligne ──────────────
// Le service worker (sw.js) garde l'appli en cache pour l'utiliser sans réseau.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(e =>
      console.warn("Sport+ : mode hors ligne indisponible", e));
  });
}

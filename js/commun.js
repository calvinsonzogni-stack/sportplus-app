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

// ── Icônes au trait (même style que la barre d'onglets) ──
// Utilisées à la place des émojis, pour un rendu plus sobre.
const ICONES = {
  haltere:    '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  calendrier: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  flamme:     '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2 2s-1-3 1-7z"/>',
  tendance:   '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  repetition: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  horloge:    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
  corbeille:  '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  recherche:  '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  trophee:    '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
  boite:      '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',
};
function icone(nom, classe = "") {
  return `<svg class="icone ${classe}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom] || ""}</svg>`;
}

// ── Vidéos TikTok d'un exercice ─────────────────
// Remplit un lien <a class="btn-tiktok"> vers la page du hashtag de
// l'exercice (voir HASHTAGS_EXERCICES) ; masqué si l'exercice n'en a pas.
function majLienTikTok(lien, nomExercice) {
  const tiktok = typeof tiktokExercice === "function" ? tiktokExercice(nomExercice) : null;
  lien.hidden = !tiktok;
  if (!tiktok) return;
  lien.href = tiktok.url;
  lien.setAttribute("aria-label", `Voir les vidéos TikTok #${tiktok.tag} (s'ouvre dans TikTok)`);
  lien.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M10 9v6l5-3z" fill="currentColor" stroke="none"/></svg>
    <span class="btn-tiktok-texte">Vidéos TikTok</span>
    <span class="btn-tiktok-tag">#${echapperHtml(tiktok.tag)}</span>`;
}

// ── Image d'un exercice (animée si deux positions) ──
// Avec image2, les deux positions du mouvement se succèdent en fondu :
// l'animation joue au survol, quand l'exercice est sélectionné, ou en
// continu dans un conteneur .anim-auto (voir css/theme.css).
function imageExercice(exo, classe = "") {
  const repli = `onerror="this.src='assets/images/placeholder.svg'"`;
  const principale = `<img src="assets/images/${exo.image}" alt="${echapperHtml(exo.nom)}" class="${classe}" loading="lazy" ${repli}>`;
  if (!exo.image2) return principale;
  return `<span class="anim-exo">${principale}<img src="assets/images/${exo.image2}" alt="" aria-hidden="true" class="anim-frame2 ${classe}" loading="lazy"></span>`;
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

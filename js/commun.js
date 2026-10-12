// ════════════════════════════════════════════════
//  SPORT+ — commun.js
//  Données et utilitaires partagés par toutes les pages.
//  À charger AVANT les scripts propres à chaque page.
// ════════════════════════════════════════════════

// ── Base de données des exercices (source unique) ──
const EXERCICES_DB = [
  // PECTORAUX
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
  // DOS
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
  // ÉPAULES
  { nom: "Développé Militaire",        muscle: "epaules",   image: "Développé Militaire.jpeg" },
  { nom: "Développé Haltères Assis",   muscle: "epaules",   image: "Développé Haltères Assis.jpg" },
  { nom: "Élévations Latérales",       muscle: "epaules",   image: "Élévations Latérales.jpg" },
  { nom: "Élévations Frontales",       muscle: "epaules",   image: "Élévations Frontales.jpg" },
  { nom: "Oiseau Haltères",            muscle: "epaules",   image: "Oiseau Haltères.webp" },
  { nom: "Oiseau Poulie",              muscle: "epaules",   image: "Oiseau Poulie.jpg" },
  { nom: "Rowing Menton",              muscle: "epaules",   image: "Rowing Menton.avif" },
  { nom: "Arnold Press",               muscle: "epaules",   image: "Arnold Press.webp" },
  { nom: "Élévations Latérales Câble", muscle: "epaules",   image: "Élévations Latérales Câble.webp" },
  // BRAS
  { nom: "Curl Barre",                 muscle: "bras",      image: "Curl Barre.webp" },
  { nom: "Curl Haltères",              muscle: "bras",      image: "Curl Haltères.webp" },
  { nom: "Curl Marteau",               muscle: "bras",      image: "Curl Marteau.webp" },
  { nom: "Curl Pupitre",               muscle: "bras",      image: "Curl Pupitre.jpeg" },
  { nom: "Curl Incliné",               muscle: "bras",      image: "Curl Incliné.webp" },
  { nom: "Curl Concentration",         muscle: "bras",      image: "Curl Concentration.webp" },
  { nom: "Curl Cable",                 muscle: "bras",      image: "Curl Cable.jpg" },
  { nom: "Dips Triceps",               muscle: "bras",      image: "Dips triceps.jpeg" },
  { nom: "Extension Nuque",            muscle: "bras",      image: "Extension Nuque.webp" },
  { nom: "Barre au Front",             muscle: "bras",      image: "Barre au Front.jpg" },
  { nom: "Extension Poulie Haute",     muscle: "bras",      image: "Extension Poulie Haute.jpeg" },
  { nom: "Kickback Haltères",          muscle: "bras",      image: "Kickback Haltères.jpg" },
  { nom: "Diamond Push-ups",           muscle: "bras",      image: "Diamond Push-ups.jpg" },
  // JAMBES
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
  // ABDOMINAUX
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
  pectoraux: "Pectoraux",
  dos:       "Dos",
  epaules:   "Épaules",
  bras:      "Bras",
  jambes:    "Jambes",
  abdos:     "Abdominaux",
};

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

// ── Migration des données ───────────────────────
// Corrige les noms d'exercices enregistrés par d'anciennes versions
// pour que l'historique, les records et le planning restent cohérents.
(function migrerDonnees() {
  const VERSION = 1;
  if (lireStockage("data_version", 0) >= VERSION) return;

  const RENOMMAGES = { "Dips triceps": "Dips Triceps" };
  const renommer = nom => RENOMMAGES[nom] || nom;

  const historique = lireStockage("historique", []);
  if (Array.isArray(historique)) {
    historique.forEach(s => (s.exercices || []).forEach(e => { e.nom = renommer(e.nom); }));
    ecrireStockage("historique", historique);
  }

  const planning = lireStockage("planning", []);
  if (Array.isArray(planning)) {
    planning.forEach(p => { p.exercices = (p.exercices || []).map(renommer); });
    ecrireStockage("planning", planning);
  }

  const perfs = lireStockage("perfs", {});
  if (perfs && typeof perfs === "object") {
    Object.keys(RENOMMAGES).forEach(ancien => {
      if (ancien in perfs) {
        const nouveau = RENOMMAGES[ancien];
        perfs[nouveau] = String(Math.max(parseFloat(perfs[ancien]) || 0, parseFloat(perfs[nouveau]) || 0));
        delete perfs[ancien];
      }
    });
    ecrireStockage("perfs", perfs);
  }

  ecrireStockage("data_version", VERSION);
})();

// ════════════════════════════════════════════════
//  SPORT+ — donnees-exercices.js
//  Liste des exercices (source unique), sans aucun effet de bord :
//  chargée par toutes les pages ET par le service worker (sw.js),
//  qui en déduit les images à garder hors ligne.
//  Pour ajouter un exercice : une ligne ici + son image dans assets/images/.
//
//  poidsDeCorps : exercice sans charge → on ne suit que les répétitions
//  (record = répétitions max). mesure "secondes" : exercice tenu (gainage),
//  le champ répétitions contient alors une durée en secondes.
// ════════════════════════════════════════════════

const EXERCICES_DB = [
  // PECTORAUX
  { nom: "Développé Couché",           muscle: "pectoraux", image: "developpe-couche.jpg" },
  { nom: "Développé Incliné",          muscle: "pectoraux", image: "developpe-incline.jpg" },
  { nom: "Développé Décliné",          muscle: "pectoraux", image: "developpe-decline.jpg" },
  { nom: "Développé Haltères",         muscle: "pectoraux", image: "developpe-halteres.jpg" },
  { nom: "Écarté Couché",              muscle: "pectoraux", image: "ecarte-couche.jpg" },
  { nom: "Écarté Incliné",             muscle: "pectoraux", image: "ecarte-incline.jpg" },
  { nom: "Pompes",                     muscle: "pectoraux", image: "pompes.png", poidsDeCorps: true },
  { nom: "Pompes Inclinées",           muscle: "pectoraux", image: "pompes-inclinees.jpg", poidsDeCorps: true },
  { nom: "Dips Pectoraux",             muscle: "pectoraux", image: "dips-pectoraux.jpg", poidsDeCorps: true },
  { nom: "Pull Over",                  muscle: "pectoraux", image: "pull-over.jpg" },
  { nom: "Pec Deck",                   muscle: "pectoraux", image: "pec-deck.jpg" },
  { nom: "Cable Crossover",            muscle: "pectoraux", image: "cable-crossover.jpg" },
  // DOS
  { nom: "Tractions",                  muscle: "dos",       image: "tractions.jpg", poidsDeCorps: true },
  { nom: "Tractions Pronation",        muscle: "dos",       image: "tractions-pronation.jpg", poidsDeCorps: true },
  { nom: "Tractions Supination",       muscle: "dos",       image: "tractions-supination.jpg", poidsDeCorps: true },
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
  { nom: "Dips Triceps",               muscle: "bras",      image: "Dips triceps.jpeg", poidsDeCorps: true },
  { nom: "Extension Nuque",            muscle: "bras",      image: "Extension Nuque.webp" },
  { nom: "Barre au Front",             muscle: "bras",      image: "Barre au Front.jpg" },
  { nom: "Extension Poulie Haute",     muscle: "bras",      image: "Extension Poulie Haute.jpeg" },
  { nom: "Kickback Haltères",          muscle: "bras",      image: "Kickback Haltères.jpg" },
  { nom: "Diamond Push-ups",           muscle: "bras",      image: "Diamond Push-ups.jpg", poidsDeCorps: true },
  // JAMBES
  { nom: "Squat",                      muscle: "jambes",    image: "Squats.jpeg" },
  { nom: "Squat Avant",                muscle: "jambes",    image: "squat-avant.jpg" },
  { nom: "Squat Bulgare",              muscle: "jambes",    image: "squat-bulgare.jpg" },
  { nom: "Presse à Cuisses",           muscle: "jambes",    image: "presse-a-cuisses.jpg" },
  { nom: "Leg Extension",              muscle: "jambes",    image: "leg-extension.jpg" },
  { nom: "Fentes Avant",               muscle: "jambes",    image: "fentes-avant.jpg" },
  { nom: "Fentes Marchées",            muscle: "jambes",    image: "fentes-marchees.jpg" },
  { nom: "Hack Squat",                 muscle: "jambes",    image: "hack-squat.jpg" },
  { nom: "Leg Curl",                   muscle: "jambes",    image: "leg-curl.jpg" },
  { nom: "Leg Curl Debout",            muscle: "jambes",    image: "leg-curl-debout.jpg" },
  { nom: "Good Morning",               muscle: "jambes",    image: "good-morning.jpg" },
  { nom: "Hip Thrust",                 muscle: "jambes",    image: "hip-thrust.jpg" },
  { nom: "Mollets Debout",             muscle: "jambes",    image: "mollets-debout.jpg" },
  { nom: "Mollets Assis",              muscle: "jambes",    image: "mollets-assis.jpg" },
  { nom: "Mollets Presse",             muscle: "jambes",    image: "mollets-presse.jpg" },
  // ABDOMINAUX
  { nom: "Crunch",                     muscle: "abdos",     image: "crunch.jpg", poidsDeCorps: true },
  { nom: "Crunch Obliques",            muscle: "abdos",     image: "crunch-obliques.jpg", poidsDeCorps: true },
  { nom: "Relevé de Jambes",           muscle: "abdos",     image: "releve-de-jambes.jpg", poidsDeCorps: true },
  { nom: "Planche",                    muscle: "abdos",     image: "planche.jpg", poidsDeCorps: true, mesure: "secondes" },
  { nom: "Planche Latérale",           muscle: "abdos",     image: "planche-laterale.jpg", poidsDeCorps: true, mesure: "secondes" },
  { nom: "Mountain Climbers",          muscle: "abdos",     image: "mountain-climbers.jpg", poidsDeCorps: true },
  { nom: "Russian Twist",              muscle: "abdos",     image: "russian-twist.jpg", poidsDeCorps: true },
  { nom: "Bicycle Crunch",             muscle: "abdos",     image: "bicycle-crunch.jpg", poidsDeCorps: true },
  { nom: "Ab Wheel",                   muscle: "abdos",     image: "ab-wheel.jpg", poidsDeCorps: true },
  { nom: "Hanging Leg Raise",          muscle: "abdos",     image: "hanging-leg-raise.jpg", poidsDeCorps: true },
  { nom: "Cable Crunch",               muscle: "abdos",     image: "cable-crunch.jpg" },
  { nom: "Sit-ups",                    muscle: "abdos",     image: "sit-ups.jpg", poidsDeCorps: true },
];

const MUSCLE_LABELS = {
  pectoraux: "Pectoraux",
  dos:       "Dos",
  epaules:   "Épaules",
  bras:      "Bras",
  jambes:    "Jambes",
  abdos:     "Abdominaux",
};

// ── Exercices au poids du corps ─────────────────
function infosExercice(nom) {
  return EXERCICES_DB.find(e => e.nom === nom) || null;
}

function estPoidsDeCorps(nom) {
  const exo = infosExercice(nom);
  return !!(exo && exo.poidsDeCorps);
}

// Unité de la performance au poids du corps : « reps » ou « s » (gainage)
function uniteReps(nom) {
  const exo = infosExercice(nom);
  return exo && exo.mesure === "secondes" ? "s" : "reps";
}

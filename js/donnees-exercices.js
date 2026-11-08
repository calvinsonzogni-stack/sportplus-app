// ════════════════════════════════════════════════
//  SPORT+ — donnees-exercices.js
//  Liste des exercices (source unique), sans aucun effet de bord :
//  chargée par toutes les pages ET par le service worker (sw.js),
//  qui en déduit les images à garder hors ligne.
//  Pour ajouter un exercice : une ligne ici + son image dans assets/images/.
//  image2 (facultatif) : 2e position du mouvement ; les deux images
//  alternent pour animer l'exercice (voir css/theme.css, .anim-exo).
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
  { nom: "Chest Press (machine)",          muscle: "pectoraux",  image: "chest-press-machine.jpg", image2: "chest-press-machine-2.jpg" },
  { nom: "Chest Press Incliné (machine)",  muscle: "pectoraux",  image: "chest-press-incline-machine.jpg", image2: "chest-press-incline-machine-2.jpg" },
  { nom: "Développé Couché Smith",         muscle: "pectoraux",  image: "developpe-couche-smith.jpg", image2: "developpe-couche-smith-2.jpg" },
  { nom: "Développé Incliné Haltères",     muscle: "pectoraux",  image: "developpe-incline-halteres.jpg", image2: "developpe-incline-halteres-2.jpg" },
  { nom: "Développé Poulie Debout",        muscle: "pectoraux",  image: "developpe-poulie-debout.jpg", image2: "developpe-poulie-debout-2.jpg" },
  { nom: "Développé Incliné Poulie",       muscle: "pectoraux",  image: "developpe-incline-poulie.jpg", image2: "developpe-incline-poulie-2.jpg" },
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
  { nom: "Soulevé de Terre Roumain",   muscle: "dos",       image: "souleve-de-terre-roumain.jpg", image2: "souleve-de-terre-roumain-2.jpg" },
  { nom: "Shrugs",                     muscle: "dos",       image: "shrugs.jpg" },
  { nom: "Face Pull",                  muscle: "dos",       image: "face-pull.jpg" },
  { nom: "Tirage Prise Serrée",            muscle: "dos",        image: "tirage-prise-serree.jpg", image2: "tirage-prise-serree-2.jpg" },
  { nom: "Tirage Bras Tendus",             muscle: "dos",        image: "tirage-bras-tendus.jpg", image2: "tirage-bras-tendus-2.jpg" },
  { nom: "Low Row (machine)",              muscle: "dos",        image: "low-row-machine.jpg", image2: "low-row-machine-2.jpg" },
  { nom: "High Row (machine)",             muscle: "dos",        image: "high-row-machine.jpg", image2: "high-row-machine-2.jpg" },
  { nom: "Rowing Unilatéral Poulie",       muscle: "dos",        image: "rowing-unilateral-poulie.jpg", image2: "rowing-unilateral-poulie-2.jpg" },
  { nom: "Extensions Lombaires",           muscle: "dos",        image: "extensions-lombaires.jpg", image2: "extensions-lombaires-2.jpg", poidsDeCorps: true },
  { nom: "Shrugs Haltères",                muscle: "dos",        image: "shrugs-halteres.jpg", image2: "shrugs-halteres-2.jpg" },
  { nom: "Tirage Poulie Unilatéral",       muscle: "dos",        image: "tirage-poulie-unilateral.jpg", image2: "tirage-poulie-unilateral-2.jpg" },
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
  { nom: "Shoulder Press (machine)",       muscle: "epaules",    image: "shoulder-press-machine.jpg", image2: "shoulder-press-machine-2.jpg" },
  { nom: "Développé Épaules Smith",        muscle: "epaules",    image: "developpe-epaules-smith.jpg", image2: "developpe-epaules-smith-2.jpg" },
  { nom: "Développé Épaules Poulie",       muscle: "epaules",    image: "developpe-epaules-poulie.jpg", image2: "developpe-epaules-poulie-2.jpg" },
  { nom: "Oiseau Machine (Delts)",         muscle: "epaules",    image: "oiseau-machine-delts.jpg", image2: "oiseau-machine-delts-2.jpg" },
  { nom: "Pec Deck Inversé Poulie",        muscle: "epaules",    image: "pec-deck-inverse-poulie.jpg", image2: "pec-deck-inverse-poulie-2.jpg" },
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
  { nom: "Curl Machine",                   muscle: "bras",       image: "curl-machine.jpg", image2: "curl-machine-2.jpg" },
  { nom: "Curl Pupitre Machine",           muscle: "bras",       image: "curl-pupitre-machine.jpg", image2: "curl-pupitre-machine-2.jpg" },
  { nom: "Extension Triceps Machine",      muscle: "bras",       image: "extension-triceps-machine.jpg", image2: "extension-triceps-machine-2.jpg" },
  { nom: "Triceps Poulie Barre",           muscle: "bras",       image: "triceps-poulie-barre.jpg", image2: "triceps-poulie-barre-2.jpg" },
  { nom: "Triceps Poulie Corde",           muscle: "bras",       image: "triceps-poulie-corde.jpg", image2: "triceps-poulie-corde-2.jpg" },
  { nom: "Extension Corde Nuque",          muscle: "bras",       image: "extension-corde-nuque.jpg", image2: "extension-corde-nuque-2.jpg" },
  { nom: "Curl Barre EZ",                  muscle: "bras",       image: "curl-barre-ez.jpg", image2: "curl-barre-ez-2.jpg" },
  { nom: "Curl Inversé",                   muscle: "bras",       image: "curl-inverse.jpg", image2: "curl-inverse-2.jpg" },
  { nom: "Curl Poignets",                  muscle: "bras",       image: "curl-poignets.jpg", image2: "curl-poignets-2.jpg" },
  { nom: "Développé Couché Prise Serrée",  muscle: "bras",       image: "developpe-couche-prise-serree.jpg", image2: "developpe-couche-prise-serree-2.jpg" },
  { nom: "Curl Pupitre Poulie",            muscle: "bras",       image: "curl-pupitre-poulie.jpg", image2: "curl-pupitre-poulie-2.jpg" },
  // JAMBES
  { nom: "Squat",                      muscle: "jambes",    image: "Squats.jpeg" },
  { nom: "Squat Avant",                muscle: "jambes",    image: "squat-avant.jpg", image2: "squat-avant-2.jpg" },
  { nom: "Squat Bulgare",              muscle: "jambes",    image: "squat-bulgare.jpg", image2: "squat-bulgare-2.jpg" },
  { nom: "Presse à Cuisses",           muscle: "jambes",    image: "presse-a-cuisses.jpg", image2: "presse-a-cuisses-2.jpg" },
  { nom: "Leg Extension",              muscle: "jambes",    image: "leg-extension.jpg", image2: "leg-extension-2.jpg" },
  { nom: "Fentes Avant",               muscle: "jambes",    image: "fentes-avant.jpg", image2: "fentes-avant-2.jpg" },
  { nom: "Fentes Marchées",            muscle: "jambes",    image: "fentes-marchees.jpg", image2: "fentes-marchees-2.jpg" },
  { nom: "Hack Squat",                 muscle: "jambes",    image: "hack-squat.jpg", image2: "hack-squat-2.jpg" },
  { nom: "Leg Curl",                   muscle: "jambes",    image: "leg-curl.jpg", image2: "leg-curl-2.jpg" },
  { nom: "Leg Curl Debout",            muscle: "jambes",    image: "leg-curl-debout.jpg", image2: "leg-curl-debout-2.jpg" },
  { nom: "Good Morning",               muscle: "jambes",    image: "good-morning.jpg", image2: "good-morning-2.jpg" },
  { nom: "Hip Thrust",                 muscle: "jambes",    image: "hip-thrust.jpg", image2: "hip-thrust-2.jpg" },
  { nom: "Mollets Debout",             muscle: "jambes",    image: "mollets-debout.jpg", image2: "mollets-debout-2.jpg" },
  { nom: "Mollets Assis",              muscle: "jambes",    image: "mollets-assis.jpg", image2: "mollets-assis-2.jpg" },
  { nom: "Mollets Presse",             muscle: "jambes",    image: "mollets-presse.jpg", image2: "mollets-presse-2.jpg" },
  { nom: "Leg Curl Assis",                 muscle: "jambes",     image: "leg-curl-assis.jpg", image2: "leg-curl-assis-2.jpg" },
  { nom: "Abducteurs (machine)",           muscle: "jambes",     image: "abducteurs-machine.jpg", image2: "abducteurs-machine-2.jpg" },
  { nom: "Adducteurs (machine)",           muscle: "jambes",     image: "adducteurs-machine.jpg", image2: "adducteurs-machine-2.jpg" },
  { nom: "Squat Smith",                    muscle: "jambes",     image: "squat-smith.jpg", image2: "squat-smith-2.jpg" },
  { nom: "Goblet Squat",                   muscle: "jambes",     image: "goblet-squat.jpg", image2: "goblet-squat-2.jpg" },
  { nom: "Soulevé de Terre Sumo",          muscle: "jambes",     image: "souleve-de-terre-sumo.jpg", image2: "souleve-de-terre-sumo-2.jpg" },
  { nom: "Step-Up Haltères",               muscle: "jambes",     image: "step-up-halteres.jpg", image2: "step-up-halteres-2.jpg" },
  { nom: "Fentes Arrière",                 muscle: "jambes",     image: "fentes-arriere.jpg", image2: "fentes-arriere-2.jpg" },
  { nom: "Kickback Fessier Poulie",        muscle: "jambes",     image: "kickback-fessier-poulie.jpg", image2: "kickback-fessier-poulie-2.jpg" },
  { nom: "Pont Fessier Barre",             muscle: "jambes",     image: "pont-fessier-barre.jpg", image2: "pont-fessier-barre-2.jpg" },
  { nom: "Kettlebell Swing",               muscle: "jambes",     image: "kettlebell-swing.jpg", image2: "kettlebell-swing-2.jpg" },
  { nom: "Mollets Smith",                  muscle: "jambes",     image: "mollets-smith.jpg", image2: "mollets-smith-2.jpg" },
  // ABDOMINAUX
  { nom: "Crunch",                     muscle: "abdos",     image: "crunch.jpg", image2: "crunch-2.jpg", poidsDeCorps: true },
  { nom: "Crunch Obliques",            muscle: "abdos",     image: "crunch-obliques.jpg", image2: "crunch-obliques-2.jpg", poidsDeCorps: true },
  { nom: "Relevé de Jambes",           muscle: "abdos",     image: "releve-de-jambes.jpg", image2: "releve-de-jambes-2.jpg", poidsDeCorps: true },
  { nom: "Planche",                    muscle: "abdos",     image: "planche.jpg", image2: "planche-2.jpg", poidsDeCorps: true, mesure: "secondes" },
  { nom: "Planche Latérale",           muscle: "abdos",     image: "planche-laterale.jpg", image2: "planche-laterale-2.jpg", poidsDeCorps: true, mesure: "secondes" },
  { nom: "Mountain Climbers",          muscle: "abdos",     image: "mountain-climbers.jpg", image2: "mountain-climbers-2.jpg", poidsDeCorps: true },
  { nom: "Russian Twist",              muscle: "abdos",     image: "russian-twist.jpg", image2: "russian-twist-2.jpg", poidsDeCorps: true },
  { nom: "Bicycle Crunch",             muscle: "abdos",     image: "bicycle-crunch.jpg", image2: "bicycle-crunch-2.jpg", poidsDeCorps: true },
  { nom: "Ab Wheel",                   muscle: "abdos",     image: "ab-wheel.jpg", image2: "ab-wheel-2.jpg", poidsDeCorps: true },
  { nom: "Hanging Leg Raise",          muscle: "abdos",     image: "hanging-leg-raise.jpg", image2: "hanging-leg-raise-2.jpg", poidsDeCorps: true },
  { nom: "Cable Crunch",               muscle: "abdos",     image: "cable-crunch.jpg", image2: "cable-crunch-2.jpg" },
  { nom: "Sit-ups",                    muscle: "abdos",     image: "sit-ups.jpg", image2: "sit-ups-2.jpg", poidsDeCorps: true },
  { nom: "Crunch Machine",                 muscle: "abdos",      image: "crunch-machine.jpg", image2: "crunch-machine-2.jpg" },
  { nom: "Bûcheron Poulie",                muscle: "abdos",      image: "bucheron-poulie.jpg", image2: "bucheron-poulie-2.jpg" },
  { nom: "Relevé de Genoux (chaise romaine)", muscle: "abdos",      image: "releve-de-genoux-chaise-romaine.jpg", image2: "releve-de-genoux-chaise-romaine-2.jpg", poidsDeCorps: true },
  { nom: "Dead Bug",                       muscle: "abdos",      image: "dead-bug.jpg", image2: "dead-bug-2.jpg", poidsDeCorps: true },
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

// ════════════════════════════════════════════════
//  SPORT+ — donnees-salles.js
//  Classements des plus grandes chaînes de salles de sport et
//  reconnaissance des enseignes dans les résultats de recherche.
//  Données sans effet de bord, lues par profil.js.
//
//  Les chiffres viennent de sources publiques (voir SOURCES_CLASSEMENTS) ;
//  ils varient selon les sources et changent vite : à mettre à jour
//  chaque année.
// ════════════════════════════════════════════════

// Monde : classement par nombre d'adhérents (2025)
const CLASSEMENT_MONDE = [
  { nom: "Planet Fitness",   pays: "États-Unis",     adherents: 20800000, detail: "≈ 2 700 clubs" },
  { nom: "HILEFIT",          pays: "Chine",          adherents: 17000000, detail: "1re chaîne chinoise" },
  { nom: "Purpose Brands",   pays: "États-Unis",     adherents: 6198000,  detail: "Anytime Fitness, Orangetheory…" },
  { nom: "Basic-Fit",        pays: "Pays-Bas",       adherents: 5800000,  detail: "1re chaîne européenne" },
  { nom: "Smart Fit",        pays: "Brésil",         adherents: 5210000,  detail: "1re chaîne d'Amérique latine" },
  { nom: "Crunch Fitness",   pays: "États-Unis",     adherents: 3780000,  detail: "" },
  { nom: "PureGym",          pays: "Royaume-Uni",    adherents: 2329000,  detail: "" },
  { nom: "EoS Fitness",      pays: "États-Unis",     adherents: 2000000,  detail: "" },
  { nom: "RSG Group",        pays: "Allemagne",      adherents: 1785000,  detail: "McFit, Gold's Gym, John Reed…" },
  { nom: "Life Time",        pays: "États-Unis",     adherents: 1600000,  detail: "" },
];

// France : classement par nombre de clubs (toutes les enseignes ne publient
// pas leur nombre d'adhérents ; on l'indique quand il est connu)
const CLASSEMENT_FRANCE = [
  { nom: "Basic-Fit",         clubs: 900, adherents: null,    detail: "≈ 48 % du marché des chaînes" },
  { nom: "L'Orange Bleue",    clubs: 380, adherents: null,    detail: "" },
  { nom: "Keepcool",          clubs: 300, adherents: null,    detail: "Avec Neoness : 500 000 adhérents" },
  { nom: "Fitness Park",      clubs: 300, adherents: 1400000, detail: "Adhérents revendiqués (tout le réseau)" },
  { nom: "L'Appart Fitness",  clubs: 110, adherents: null,    detail: "" },
  { nom: "On Air",            clubs: 96,  adherents: 400000,  detail: "" },
  { nom: "Vita Liberté",      clubs: 60,  adherents: null,    detail: "Chiffre plus ancien, à confirmer" },
  { nom: "Magic Form",        clubs: 52,  adherents: null,    detail: "" },
  { nom: "Gigafit",           clubs: 48,  adherents: null,    detail: "" },
  { nom: "Neoness",           clubs: 29,  adherents: null,    detail: "Groupe Keepcool" },
];

const SOURCES_CLASSEMENTS = {
  monde: {
    texte: "Classement des opérateurs par adhérents, 2025 (Men's Fitness). Les chiffres varient selon les sources.",
    liens: [
      { titre: "Men's Fitness – Top 10 Gym Chains by Members", url: "https://www.mensfitness.com/news/top-10-gym-chains-by-members-no-10-makes-the-most-money" },
    ],
  },
  france: {
    texte: "Nombre de clubs en France présenté au salon Fitness Challenges (2025), complété des chiffres publiés par les enseignes.",
    liens: [
      { titre: "Liberfit – Retour sur le salon Fitness Challenges", url: "https://liberfit.fr/2025/retour-sur-le-salon-fitness-challenges-tendances-et-chiffres-cles-des-salles-de-sport/" },
      { titre: "Fitness Challenges – Classement 2026 des réseaux", url: "https://fitness-challenges.com/classement-2026-reseaux-fitness-top-15-en-france/" },
    ],
  },
};

// Reconnaissance des enseignes dans les noms de salles (OpenStreetMap).
// rang : sert à classer les salles « des plus grandes enseignes » d'abord.
const ENSEIGNES = [
  { nom: "Basic-Fit",        motif: /basic.?fit/i },
  { nom: "Fitness Park",     motif: /fitness.?park/i },
  { nom: "L'Orange Bleue",   motif: /orange.?bleue/i },
  { nom: "Keepcool",         motif: /keep.?cool/i },
  { nom: "On Air",           motif: /\bon.?air\b/i },
  { nom: "L'Appart Fitness", motif: /appart.?fitness/i },
  { nom: "Neoness",          motif: /neoness/i },
  { nom: "Magic Form",       motif: /magic.?form/i },
  { nom: "Gigafit",          motif: /giga.?fit/i },
  { nom: "Vita Liberté",     motif: /vita.?libert/i },
  { nom: "Planet Fitness",   motif: /planet.?fitness/i },
  { nom: "Anytime Fitness",  motif: /anytime.?fitness/i },
  { nom: "Smart Fit",        motif: /smart.?fit/i },
  { nom: "PureGym",          motif: /pure.?gym/i },
  { nom: "Crunch Fitness",   motif: /crunch/i },
  { nom: "McFit",            motif: /mc.?fit/i },
  { nom: "Gold's Gym",       motif: /gold'?s.?gym/i },
  { nom: "Snap Fitness",     motif: /snap.?fitness/i },
  { nom: "Orangetheory",     motif: /orange.?theory/i },
];

// Enseigne reconnue + son rang dans les classements (France d'abord, puis monde)
function infosEnseigne(texte) {
  const enseigne = ENSEIGNES.find(e => e.motif.test(texte || ""));
  if (!enseigne) return null;
  const rangFrance = CLASSEMENT_FRANCE.findIndex(c => c.nom === enseigne.nom);
  const groupe = { "Anytime Fitness": "Purpose Brands", "Orangetheory": "Purpose Brands", "McFit": "RSG Group", "Gold's Gym": "RSG Group" }[enseigne.nom];
  const rangMonde = CLASSEMENT_MONDE.findIndex(c => c.nom === (groupe || enseigne.nom));
  return {
    nom: enseigne.nom,
    rangFrance: rangFrance >= 0 ? rangFrance + 1 : null,
    rangMonde: rangMonde >= 0 ? rangMonde + 1 : null,
  };
}

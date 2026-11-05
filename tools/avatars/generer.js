// Génère assets/avatars/<avatar>-<tenue>.svg à partir du catalogue
// js/donnees-avatars.js (source unique, aussi utilisée par l'appli).
// Usage : cd tools/avatars && npm install && npm run generer

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createAvatar } = require("@dicebear/core");
const { avataaars } = require("@dicebear/collection");

const RACINE = path.resolve(__dirname, "../..");
const SORTIE = path.join(RACINE, "assets/avatars");

// Charge le catalogue tel que l'appli le voit
const contexte = {};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(path.join(RACINE, "js/donnees-avatars.js"), "utf8") +
  "\nthis.AVATARS = AVATARS; this.imageAvatar = imageAvatar;", contexte);
const { AVATARS, imageAvatar } = contexte;

// Par défaut : rien d'aléatoire, seules les options du catalogue comptent
const NEUTRE = { accessoriesProbability: 0, facialHairProbability: 0, topProbability: 100 };

fs.mkdirSync(SORTIE, { recursive: true });
const attendus = new Set();
for (const perso of AVATARS) {
  for (const tenue of perso.tenues) {
    const svg = createAvatar(avataaars, {
      seed: `${perso.id}-${tenue.id}`,
      ...NEUTRE,
      ...perso.apparence,
      ...tenue.options,
    }).toString();
    const fichier = path.join(RACINE, imageAvatar(perso.id, tenue.id));
    fs.writeFileSync(fichier, svg);
    attendus.add(path.basename(fichier));
  }
}
// Supprime les images d'avatars retirés du catalogue
for (const f of fs.readdirSync(SORTIE)) {
  if (f.endsWith(".svg") && !attendus.has(f)) fs.unlinkSync(path.join(SORTIE, f));
}
console.log(`${attendus.size} avatars générés dans assets/avatars/`);

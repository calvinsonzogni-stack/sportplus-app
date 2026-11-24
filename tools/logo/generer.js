// Génère les icônes de l'appli à partir du symbole assets/icons/logo.svg.
// Usage (Playwright installé) : node tools/logo/generer.js
//
//  - icon-192.png, icon-512.png, favicon-48.png : coins arrondis (usage « any »)
//  - icon-maskable-512.png : fond plein, symbole dans la zone sûre (Android
//    découpe l'icône en rond, goutte, carré arrondi…)
//  - apple-touch-icon.png (180) : fond plein, l'iPhone arrondit lui-même
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RACINE = path.resolve(__dirname, "../..");
const ICONES = path.join(RACINE, "assets/icons");
const symbole = fs.readFileSync(path.join(ICONES, "logo.svg"), "utf8")
  .replace(/<\/?svg[^>]*>/g, "").replace(/<!--[\s\S]*?-->/g, "").trim();

// Fond : dégradé sombre vertical et fin liseré clair (comme sur la planche validée)
function icone({ arrondi, echelle }) {
  const rx = arrondi ? 22.5 : 0;
  const marge = (100 - 100 * echelle) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d1d21"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient></defs>
    <rect width="100" height="100" rx="${rx}" fill="url(#f)"/>
    ${arrondi ? `<rect x=".5" y=".5" width="99" height="99" rx="${rx - .5}" fill="none" stroke="#fff" stroke-opacity=".07"/>` : ""}
    <g transform="translate(${marge} ${marge}) scale(${echelle})" fill="#ea3a2f">${symbole}</g>
  </svg>`;
}

const SORTIES = [
  { fichier: "icon-512.png", taille: 512, arrondi: true, echelle: 0.72 },
  { fichier: "icon-192.png", taille: 192, arrondi: true, echelle: 0.72 },
  { fichier: "favicon-48.png", taille: 48, arrondi: true, echelle: 0.82 },
  { fichier: "icon-maskable-512.png", taille: 512, arrondi: false, echelle: 0.58 },
  { fichier: "apple-touch-icon.png", taille: 180, arrondi: false, echelle: 0.7 },
];

(async () => {
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage();
  for (const s of SORTIES) {
    await page.setViewportSize({ width: s.taille, height: s.taille });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${s.taille}px;height:${s.taille}px}</style>${icone(s)}`);
    await page.screenshot({ path: path.join(ICONES, s.fichier), omitBackground: true });
    console.log("✓", s.fichier, `${s.taille}×${s.taille}`);
  }
  await navigateur.close();
})();

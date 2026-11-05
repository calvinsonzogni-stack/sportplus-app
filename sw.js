// ════════════════════════════════════════════════
//  SPORT+ — sw.js (service worker)
//  Rend l'appli utilisable sans réseau, à la salle :
//  - à l'installation, met en cache toutes les pages, styles, scripts
//    et images d'exercices ;
//  - ensuite, pages / CSS / JS : réseau d'abord (pour recevoir les mises à
//    jour), cache si le réseau ne répond pas en 3 s ;
//  - images : cache d'abord (elles ne changent quasiment jamais).
//
//  À chaque modification des fichiers de l'appli, incrémenter VERSION :
//  l'ancien cache est alors supprimé et tout est re-téléchargé.
// ════════════════════════════════════════════════

const VERSION = "sportplus-v1";
const DELAI_RESEAU_MS = 3000;

// Fournit EXERCICES_DB : la liste des images vient de la même source que l'appli
importScripts("js/donnees-exercices.js");

const FICHIERS_APPLI = [
  "./",
  "index.html", "seance.html", "planning.html", "historique.html", "exercices.html", "perfs.html",
  "manifest.webmanifest",
  "css/acceuille.css", "css/exercices.css", "css/historique.css", "css/mobile.css",
  "css/perfs.css", "css/planning.css", "css/seance.css",
  "js/donnees-exercices.js", "js/commun.js", "js/nav.js", "js/notif-planning.js",
  "js/exercices.js", "js/historique.js", "js/perfs.js", "js/planning.js", "js/seance.js",
  "js/repos.js", "js/sauvegarde.js",
  "js/vendor/chart.umd.min.js",
  "assets/images/placeholder.svg",
  "assets/icons/icon-192.png", "assets/icons/favicon-48.png", "assets/icons/apple-touch-icon.png",
];

const IMAGES_EXERCICES = [...new Set(EXERCICES_DB.map(e => "assets/images/" + e.image))];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // L'appli elle-même doit être complète, sinon l'installation échoue (et sera retentée)
    await cache.addAll(FICHIERS_APPLI);
    // Une image manquante ne doit pas bloquer l'installation
    await Promise.allSettled(IMAGES_EXERCICES.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter(n => n.startsWith("sportplus-") && n !== VERSION).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const requete = event.request;
  if (requete.method !== "GET") return;
  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  if (requete.destination === "image") {
    event.respondWith(cacheDabord(requete));
  } else {
    event.respondWith(reseauDabord(requete));
  }
});

async function cacheDabord(requete) {
  const enCache = await caches.match(requete, { ignoreSearch: true });
  if (enCache) return enCache;
  const reponse = await fetch(requete);
  if (reponse.ok) (await caches.open(VERSION)).put(requete, reponse.clone());
  return reponse;
}

async function reseauDabord(requete) {
  const cache = await caches.open(VERSION);
  try {
    const reponse = await Promise.race([
      fetch(requete),
      new Promise((_, rejeter) => setTimeout(() => rejeter(new Error("délai dépassé")), DELAI_RESEAU_MS)),
    ]);
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch (erreur) {
    const enCache = await cache.match(requete, { ignoreSearch: true });
    if (enCache) return enCache;
    // Page jamais visitée et pas de réseau : on retombe sur l'accueil
    if (requete.mode === "navigate") {
      const accueil = await cache.match("index.html");
      if (accueil) return accueil;
    }
    throw erreur;
  }
}

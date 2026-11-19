// ════════════════════════════════════════════════
//  SPORT+ — profil.js
//  Page « Mon profil » : pseudo, salle de sport (recherche autour de soi
//  via OpenStreetMap) et classements des plus grandes chaînes.
//  Dépend de commun.js, donnees-salles.js.
// ════════════════════════════════════════════════

(function () {
  const $ = id => document.getElementById(id);
  const CLE_SALLE = "salle";

  // OpenStreetMap : Nominatim (ville → coordonnées) et Overpass (salles autour).
  // Deux serveurs Overpass : si le premier ne répond pas, on essaie le second.
  const NOMINATIM = "https://nominatim.openstreetmap.org/search";
  const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
  const DELAI_MS = 20000;
  const MAX_RESULTATS = 30;

  let resultats = [];      // dernières salles trouvées
  let tri = "distance";

  // ── Pseudo ──────────────────────────────────
  function lirePseudo() {
    try { return localStorage.getItem("pseudo") || ""; } catch (e) { return ""; }
  }
  $("champ-pseudo").value = lirePseudo();
  $("form-pseudo").addEventListener("submit", e => {
    e.preventDefault();
    const val = $("champ-pseudo").value.trim();
    if (!val) { $("pseudo-statut").textContent = "Entre un pseudo d'au moins un caractère."; return; }
    try { localStorage.setItem("pseudo", val); } catch (err) {}
    $("pseudo-statut").textContent = "✓ Pseudo enregistré";
  });

  // ── Salle actuelle ──────────────────────────
  function lireSalle() {
    const s = lireStockage(CLE_SALLE, null);
    return s && typeof s.nom === "string" ? s : null;
  }

  function badgeEnseigne(enseigne) {
    if (!enseigne) return "";
    const rang = enseigne.rangFrance ? `n°${enseigne.rangFrance} en France`
      : enseigne.rangMonde ? `n°${enseigne.rangMonde} mondial` : "";
    return `<span class="badge-enseigne">${echapperHtml(enseigne.nom)}${rang ? ` · ${rang}` : ""}</span>`;
  }

  function majSalleActuelle() {
    const s = lireSalle();
    if (!s) {
      $("salle-actuelle").innerHTML = `<p class="vide">Aucune salle choisie pour l'instant. Cherche-la ci-dessous 👇</p>`;
      return;
    }
    $("salle-actuelle").innerHTML = `
      <div class="carte-salle choisie">
        <div class="carte-salle-infos">
          <p class="carte-salle-nom">📍 ${echapperHtml(s.nom)}</p>
          ${badgeEnseigne(s.enseigne ? infosEnseigne(s.enseigne) : null)}
          ${s.adresse ? `<p class="carte-salle-adresse">${echapperHtml(s.adresse)}</p>` : ""}
        </div>
        <button type="button" class="btn-lien" id="btn-retirer-salle">Retirer</button>
      </div>`;
    $("btn-retirer-salle").addEventListener("click", () => {
      try { localStorage.removeItem(CLE_SALLE); } catch (e) {}
      majSalleActuelle();
      afficherResultats();
    });
  }

  function choisirSalle(salle) {
    ecrireStockage(CLE_SALLE, {
      nom: salle.nom,
      enseigne: salle.enseigne ? salle.enseigne.nom : null,
      adresse: salle.adresse || "",
      lat: salle.lat ?? null,
      lon: salle.lon ?? null,
      osm: salle.osm || null,
      choisieLe: new Date().toISOString(),
    });
    majSalleActuelle();
    afficherResultats();
    $("salle-actuelle").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ── Recherche ───────────────────────────────
  function statut(texte, erreur = false) {
    $("recherche-statut").textContent = texte;
    $("recherche-statut").classList.toggle("erreur", erreur);
  }

  async function avecDelai(url, options = {}) {
    const controle = new AbortController();
    const minuteur = setTimeout(() => controle.abort(), DELAI_MS);
    try {
      const rep = await fetch(url, { ...options, signal: controle.signal });
      if (!rep.ok) throw new Error("HTTP " + rep.status);
      return await rep.json();
    } finally {
      clearTimeout(minuteur);
    }
  }

  function distanceKm(lat1, lon1, lat2, lon2) {
    const rad = x => x * Math.PI / 180;
    const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(a));
  }

  function adresseOSM(t) {
    const rue = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
    const ville = [t["addr:postcode"], t["addr:city"]].filter(Boolean).join(" ");
    return [rue, ville].filter(Boolean).join(", ");
  }

  async function chercherSalles(lat, lon, lieu) {
    if (!navigator.onLine) { statut("Pas de connexion internet : la recherche de salles a besoin du réseau.", true); return; }
    const rayon = parseInt($("rayon").value, 10);
    statut(`Recherche des salles dans un rayon de ${rayon / 1000} km${lieu ? ` autour de ${lieu}` : ""}…`);
    $("resultats").innerHTML = "";

    const requete = `[out:json][timeout:25];
      (nwr["leisure"="fitness_centre"](around:${rayon},${lat},${lon});
       nwr["leisure"="sports_centre"]["sport"~"fitness|bodybuilding"](around:${rayon},${lat},${lon}););
      out center tags 150;`;
    let donnees = null;
    for (const serveur of OVERPASS) {
      try {
        donnees = await avecDelai(serveur, { method: "POST", body: "data=" + encodeURIComponent(requete),
          headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        break;
      } catch (e) { /* serveur suivant */ }
    }
    if (!donnees) { statut("Le service de recherche ne répond pas pour le moment. Réessaie dans un instant.", true); return; }

    const vus = new Set();
    resultats = (donnees.elements || []).map(el => {
      const t = el.tags || {};
      const nom = t.name || t.brand;
      const elLat = el.lat ?? (el.center && el.center.lat);
      const elLon = el.lon ?? (el.center && el.center.lon);
      if (!nom || elLat == null) return null;
      return {
        nom,
        enseigne: infosEnseigne([t.name, t.brand, t.operator].filter(Boolean).join(" ")),
        adresse: adresseOSM(t),
        lat: elLat, lon: elLon,
        distance: distanceKm(lat, lon, elLat, elLon),
        osm: `${el.type}/${el.id}`,
      };
    }).filter(s => {
      if (!s) return false;
      // Une même salle peut être cartographiée deux fois (point + bâtiment)
      const cle = s.nom.toLowerCase() + "|" + s.lat.toFixed(3) + "|" + s.lon.toFixed(3);
      if (vus.has(cle)) return false;
      vus.add(cle);
      return true;
    });

    if (!resultats.length) {
      statut(`Aucune salle trouvée à moins de ${rayon / 1000} km. Essaie un rayon plus grand.`);
      return;
    }
    statut(`${resultats.length} salle(s) trouvée(s)${lieu ? ` autour de ${lieu}` : ""}.`);
    afficherResultats();
  }

  function rangTri(s) {
    if (!s.enseigne) return 1000;
    return s.enseigne.rangFrance || (s.enseigne.rangMonde ? 100 + s.enseigne.rangMonde : 500);
  }

  function afficherResultats() {
    if (!resultats.length) return;
    const actuelle = lireSalle();
    const liste = [...resultats].sort(tri === "enseigne"
      ? (a, b) => rangTri(a) - rangTri(b) || a.distance - b.distance
      : (a, b) => a.distance - b.distance).slice(0, MAX_RESULTATS);

    $("resultats").innerHTML = liste.map((s, i) => {
      const estMienne = actuelle && actuelle.osm && actuelle.osm === s.osm;
      const dist = s.distance < 1 ? `${Math.round(s.distance * 1000)} m` : `${s.distance.toFixed(1).replace(".", ",")} km`;
      return `
        <li class="carte-salle ${estMienne ? "choisie" : ""}">
          <div class="carte-salle-infos">
            <p class="carte-salle-nom">${echapperHtml(s.nom)}</p>
            ${badgeEnseigne(s.enseigne)}
            <p class="carte-salle-adresse">${s.adresse ? echapperHtml(s.adresse) + " · " : ""}${dist}</p>
          </div>
          ${estMienne
            ? `<span class="ma-salle">✓ Ma salle</span>`
            : `<button type="button" class="btn-secondaire btn-choisir" data-index="${resultats.indexOf(s)}">C'est ma salle</button>`}
        </li>`;
    }).join("");
  }

  $("resultats").addEventListener("click", e => {
    const btn = e.target.closest(".btn-choisir");
    if (btn) choisirSalle(resultats[+btn.dataset.index]);
  });

  $("btn-autour").addEventListener("click", () => {
    if (!("geolocation" in navigator)) { statut("Ton appareil ne permet pas la localisation : cherche par ville.", true); return; }
    statut("Localisation en cours…");
    navigator.geolocation.getCurrentPosition(
      pos => chercherSalles(pos.coords.latitude, pos.coords.longitude, "toi"),
      err => statut(err.code === 1
        ? "Localisation refusée. Tu peux chercher par ville juste en dessous."
        : "Impossible de te localiser. Cherche par ville juste en dessous.", true),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  });

  $("form-ville").addEventListener("submit", async e => {
    e.preventDefault();
    const q = $("champ-ville").value.trim();
    if (!q) return;
    if (!navigator.onLine) { statut("Pas de connexion internet : la recherche de salles a besoin du réseau.", true); return; }
    statut(`Recherche de « ${q} »…`);
    try {
      const lieux = await avecDelai(`${NOMINATIM}?format=jsonv2&limit=1&accept-language=fr&q=${encodeURIComponent(q)}`);
      if (!lieux.length) { statut(`Lieu introuvable : « ${q} ». Vérifie l'orthographe.`, true); return; }
      const lieu = lieux[0];
      chercherSalles(parseFloat(lieu.lat), parseFloat(lieu.lon), (lieu.name || q));
    } catch (err) {
      statut("Le service de recherche ne répond pas pour le moment. Réessaie dans un instant.", true);
    }
  });

  $("rayon").addEventListener("change", () => { resultats = []; $("resultats").innerHTML = ""; statut("Rayon modifié : relance la recherche."); });

  document.querySelectorAll(".tri-btn").forEach(btn => btn.addEventListener("click", () => {
    tri = btn.dataset.tri;
    document.querySelectorAll(".tri-btn").forEach(b => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    afficherResultats();
  }));

  $("form-manuel").addEventListener("submit", e => {
    e.preventDefault();
    const nom = $("champ-manuel").value.trim();
    if (!nom) return;
    const enseigne = infosEnseigne(nom);
    choisirSalle({ nom, enseigne, adresse: "", osm: null });
    $("champ-manuel").value = "";
  });

  // ── Classements ─────────────────────────────
  const nombre = n => n.toLocaleString("fr-FR");
  const millions = n => n >= 1e6 ? `${(n / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : nombre(n);

  function afficherClassement(type) {
    const monde = type === "monde";
    $("classement-critere").textContent = monde
      ? "Classées par nombre d'adhérents."
      : "Classées par nombre de clubs en France (toutes les enseignes ne publient pas leur nombre d'adhérents).";
    const liste = monde ? CLASSEMENT_MONDE : CLASSEMENT_FRANCE;
    const salle = lireSalle();
    $("classement").innerHTML = liste.map((c, i) => {
      const chiffre = monde ? `${millions(c.adherents)} adhérents` : `${nombre(c.clubs)} clubs`;
      const second = monde ? c.pays : (c.adherents ? `${millions(c.adherents)} adhérents` : "");
      const mienne = salle && salle.enseigne && (salle.enseigne === c.nom ||
        (infosEnseigne(salle.enseigne) && monde && CLASSEMENT_MONDE.indexOf(c) + 1 === infosEnseigne(salle.enseigne).rangMonde));
      return `
        <li class="classement-ligne ${mienne ? "mienne" : ""}">
          <span class="classement-rang">${i + 1}</span>
          <div class="classement-infos">
            <p class="classement-nom">${echapperHtml(c.nom)}${mienne ? ` <span class="ma-salle">Ta salle</span>` : ""}</p>
            <p class="classement-detail">${[second, c.detail].filter(Boolean).map(echapperHtml).join(" · ")}</p>
          </div>
          <span class="classement-chiffre">${chiffre}</span>
        </li>`;
    }).join("");
    const src = SOURCES_CLASSEMENTS[type];
    $("classement-sources").innerHTML = `${echapperHtml(src.texte)} Sources : ` +
      src.liens.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${echapperHtml(l.titre)}</a>`).join(", ") + ".";
  }

  document.querySelectorAll(".onglet").forEach(o => o.addEventListener("click", () => {
    document.querySelectorAll(".onglet").forEach(x => {
      x.classList.toggle("active", x === o);
      x.setAttribute("aria-selected", String(x === o));
    });
    afficherClassement(o.dataset.classement);
  }));

  majSalleActuelle();
  afficherClassement("monde");
})();

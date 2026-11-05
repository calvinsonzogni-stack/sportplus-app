// ════════════════════════════════════════════════
//  SPORT+ — pieces.js
//  Monnaie de l'appli (pièces) et collection d'avatars.
//  Dépend de commun.js et donnees-avatars.js. Chargé sur toutes les pages.
//
//  On gagne des pièces :
//  - en terminant une séance (base + bonus par série validée, plafonné) ;
//  - en validant une série qui bat son record sur un exercice
//    (une fois par exercice et par séance).
//  On les dépense dans la boutique (avatars et tenues).
// ════════════════════════════════════════════════

const GAINS = {
  finSeanceBase: 30,
  finSeanceParSerie: 2,
  finSeanceMax: 60,
  record: 25,
  bienvenue: 100,
  seancePassee: 30,   // bonus rétroactif pour l'historique existant
};

const PIECE_SVG = `<svg class="ico-piece" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="11" fill="#b37f00"/>
  <circle cx="12" cy="11" r="10" fill="#ffb800"/>
  <circle cx="12" cy="11" r="7" fill="none" stroke="#b37f00" stroke-width="1.5"/>
  <path d="M12 7.5v7M8.5 11h7" stroke="#b37f00" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

const Pieces = (function () {
  const CLE_SOLDE = "pieces";
  const CLE_JOURNAL = "pieces_journal";
  const TAILLE_JOURNAL = 100;

  function solde() {
    const s = lireStockage(CLE_SOLDE, 0);
    return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
  }

  function journaliser(montant, raison) {
    const journal = lireStockage(CLE_JOURNAL, []);
    const liste = Array.isArray(journal) ? journal : [];
    liste.unshift({ date: new Date().toISOString(), montant, raison });
    ecrireStockage(CLE_JOURNAL, liste.slice(0, TAILLE_JOURNAL));
  }

  // Animation centrale « +25 🪙 » avec petites pièces qui jaillissent
  function celebrer(montant, texte) {
    const pop = document.createElement("div");
    pop.className = "gain-pop";
    pop.setAttribute("role", "status");
    pop.innerHTML = `${PIECE_SVG}
      <div class="gain-montant">+${montant}</div>
      <div class="gain-texte">${echapperHtml(texte)}</div>`;
    for (let i = 0; i < 10; i++) {
      const eclat = document.createElement("span");
      eclat.className = "gain-eclat";
      const angle = (Math.PI * 2 * i) / 10;
      eclat.style.setProperty("--dx", `${Math.round(Math.cos(angle) * 110)}px`);
      eclat.style.setProperty("--dy", `${Math.round(Math.sin(angle) * 90 - 20)}px`);
      eclat.style.animationDelay = `${i * 25}ms`;
      pop.appendChild(eclat);
    }
    document.querySelectorAll(".gain-pop").forEach(el => el.remove());
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 2300);
    if (navigator.vibrate) navigator.vibrate(60);
  }

  // Le compteur de l'en-tête défile jusqu'au nouveau solde
  function animerEntete(depuis, vers) {
    const el = document.getElementById("solde-pieces");
    const chip = el && el.closest(".solde-chip");
    if (!el) return;
    if (chip) { chip.classList.remove("gain"); void chip.offsetWidth; chip.classList.add("gain"); }
    const debut = performance.now(), duree = 900;
    const etape = t => {
      const p = Math.min(1, (t - debut) / duree);
      el.textContent = Math.round(depuis + (vers - depuis) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(etape);
    };
    requestAnimationFrame(etape);
  }

  return {
    solde,

    // celebrer : false pour un gain affiché autrement (ex. modal de fin de séance)
    gagner(montant, raison, { celebrer: avecAnimation = true, texte = raison } = {}) {
      montant = Math.floor(montant);
      if (!(montant > 0)) return solde();
      const avant = solde();
      const apres = avant + montant;
      ecrireStockage(CLE_SOLDE, apres);
      journaliser(montant, raison);
      if (avecAnimation) celebrer(montant, texte);
      animerEntete(avant, apres);
      return apres;
    },

    // Renvoie false (sans rien débiter) si le solde est insuffisant
    depenser(montant, raison) {
      const avant = solde();
      if (montant > avant) return false;
      ecrireStockage(CLE_SOLDE, avant - montant);
      journaliser(-montant, raison);
      majEntete();
      return true;
    },

    // Gain de fin de séance selon le nombre de séries validées
    gainFinSeance(nbSeries) {
      return Math.min(GAINS.finSeanceMax, GAINS.finSeanceBase + GAINS.finSeanceParSerie * nbSeries);
    },

    celebrer,
  };
})();

// ── Collection d'avatars ────────────────────────
const Collection = (function () {
  const CLE = "avatars";
  const DEFAUT = { possedes: { recrue: ["base"] }, equipe: { perso: "recrue", tenue: "base" } };

  function lire() {
    const c = lireStockage(CLE, null);
    if (!c || typeof c.possedes !== "object" || !c.equipe) return JSON.parse(JSON.stringify(DEFAUT));
    // L'avatar offert est toujours possédé
    if (!Array.isArray(c.possedes.recrue)) c.possedes.recrue = ["base"];
    return c;
  }

  const trouverPerso = id => AVATARS.find(p => p.id === id);
  const trouverTenue = (perso, id) => perso && perso.tenues.find(t => t.id === id);

  return {
    perso: trouverPerso,
    tenue: trouverTenue,

    possedePerso: id => Array.isArray(lire().possedes[id]),
    possedeTenue: (persoId, tenueId) => (lire().possedes[persoId] || []).includes(tenueId),

    prixPerso: perso => (perso.offert ? 0 : RARETES[perso.rarete].prixAvatar),
    prixTenue: tenue => RARETES[tenue.rarete].prixTenue,

    equipe() {
      const e = lire().equipe;
      const perso = trouverPerso(e.perso);
      // Catalogue modifié depuis : on retombe sur l'avatar offert
      if (!perso || !trouverTenue(perso, e.tenue)) return { perso: "recrue", tenue: "base" };
      return e;
    },

    // Débloque l'avatar avec sa tenue de base. Renvoie false si pas assez de pièces.
    acheterPerso(id) {
      const perso = trouverPerso(id);
      const c = lire();
      if (!perso || c.possedes[id]) return false;
      if (!Pieces.depenser(this.prixPerso(perso), `Avatar : ${perso.nom}`)) return false;
      c.possedes[id] = ["base"];
      c.equipe = { perso: id, tenue: "base" };
      ecrireStockage(CLE, c);
      majEntete();
      return true;
    },

    acheterTenue(persoId, tenueId) {
      const perso = trouverPerso(persoId);
      const tenue = trouverTenue(perso, tenueId);
      const c = lire();
      if (!tenue || !c.possedes[persoId] || c.possedes[persoId].includes(tenueId)) return false;
      if (!Pieces.depenser(this.prixTenue(tenue), `Tenue : ${perso.nom} – ${tenue.nom}`)) return false;
      c.possedes[persoId].push(tenueId);
      c.equipe = { perso: persoId, tenue: tenueId };
      ecrireStockage(CLE, c);
      majEntete();
      return true;
    },

    equiper(persoId, tenueId) {
      const c = lire();
      if (!(c.possedes[persoId] || []).includes(tenueId)) return false;
      c.equipe = { perso: persoId, tenue: tenueId };
      ecrireStockage(CLE, c);
      majEntete();
      return true;
    },

    imageEquipee() {
      const e = this.equipe();
      return imageAvatar(e.perso, e.tenue);
    },
  };
})();

// ── En-tête : solde + avatar équipé ─────────────
function majEntete() {
  const solde = document.getElementById("solde-pieces");
  if (solde) solde.textContent = Pieces.solde();
  document.querySelectorAll("[data-avatar-equipe]").forEach(img => {
    img.src = Collection.imageEquipee();
  });
  const chip = document.querySelector(".solde-chip");
  if (chip) chip.setAttribute("aria-label", `${Pieces.solde()} pièces – ouvrir la boutique`);
}

// ── Bonus de bienvenue (une seule fois) ─────────
// Les séances déjà enregistrées avant l'arrivée des pièces rapportent
// aussi : personne ne repart de zéro.
(function bonusDeDepart() {
  if (lireStockage("pieces", null) !== null) return;
  const historique = lireStockage("historique", []);
  const nb = Array.isArray(historique) ? historique.length : 0;
  ecrireStockage("pieces", 0);
  Pieces.gagner(GAINS.bienvenue, "Bonus de bienvenue", { celebrer: false });
  if (nb) Pieces.gagner(nb * GAINS.seancePassee, `${nb} séance(s) déjà réalisée(s)`, { celebrer: false });
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", majEntete);
} else {
  majEntete();
}

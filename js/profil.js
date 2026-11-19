// ════════════════════════════════════════════════
//  SPORT+ — profil.js
//  Page « Mon profil » : pseudo et salle de sport, choisie parmi les
//  plus grandes enseignes (classements France et monde).
//  Dépend de commun.js, donnees-salles.js.
// ════════════════════════════════════════════════

(function () {
  const $ = id => document.getElementById(id);
  const CLE_SALLE = "salle";
  let classementAffiche = "france";

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

  // ── Salle ───────────────────────────────────
  function lireSalle() {
    const s = lireStockage(CLE_SALLE, null);
    return s && typeof s.nom === "string" ? s : null;
  }

  function badgeEnseigne(enseigne) {
    if (!enseigne) return "";
    const rang = enseigne.rangFrance ? `n°${enseigne.rangFrance} en France`
      : enseigne.rangMonde ? `n°${enseigne.rangMonde} mondial` : "";
    return rang ? `<span class="badge-enseigne">${rang}</span>` : "";
  }

  function majSalleActuelle() {
    const s = lireSalle();
    if (!s) {
      $("salle-actuelle").innerHTML = `<p class="vide">Aucune salle choisie pour l'instant. Touche ton enseigne dans la liste 👇</p>`;
      return;
    }
    $("salle-actuelle").innerHTML = `
      <div class="carte-salle choisie">
        <div class="carte-salle-infos">
          <p class="carte-salle-nom">📍 ${echapperHtml(s.nom)}</p>
          ${badgeEnseigne(infosEnseigne(s.enseigne || s.nom))}
        </div>
        <button type="button" class="btn-lien" id="btn-retirer-salle">Retirer</button>
      </div>`;
    $("btn-retirer-salle").addEventListener("click", () => {
      try { localStorage.removeItem(CLE_SALLE); } catch (e) {}
      rafraichir();
    });
  }

  function choisirSalle(nom, enseigne) {
    ecrireStockage(CLE_SALLE, { nom, enseigne: enseigne || null, choisieLe: new Date().toISOString() });
    rafraichir();
    $("salle-actuelle").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // La ligne correspond-elle à la salle choisie ? (même enseigne, ou même
  // groupe dans le classement mondial : McFit → RSG Group)
  function estMienne(c, monde) {
    const s = lireSalle();
    if (!s || !s.enseigne) return false;
    if (s.enseigne === c.nom) return true;
    const infos = infosEnseigne(s.enseigne);
    return !!(monde && infos && CLASSEMENT_MONDE.indexOf(c) + 1 === infos.rangMonde);
  }

  // ── Classements = liste de choix ────────────
  const nombre = n => n.toLocaleString("fr-FR");
  const millions = n => n >= 1e6 ? `${(n / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : nombre(n);

  function afficherClassement(type) {
    classementAffiche = type;
    const monde = type === "monde";
    $("classement-critere").textContent = (monde
      ? "Classées par nombre d'adhérents."
      : "Classées par nombre de clubs en France (toutes les enseignes ne publient pas leur nombre d'adhérents).")
      + " Touche ton enseigne pour la choisir.";
    const liste = monde ? CLASSEMENT_MONDE : CLASSEMENT_FRANCE;
    $("classement").innerHTML = liste.map((c, i) => {
      const chiffre = monde ? `${millions(c.adherents)} adhérents` : `${nombre(c.clubs)} clubs`;
      const second = monde ? c.pays : (c.adherents ? `${millions(c.adherents)} adhérents` : "");
      const mienne = estMienne(c, monde);
      return `
        <li>
          <button type="button" class="classement-ligne ${mienne ? "mienne" : ""}" data-index="${i}" aria-pressed="${mienne}">
            <span class="classement-rang">${i + 1}</span>
            <span class="classement-infos">
              <span class="classement-nom">${echapperHtml(c.nom)}${mienne ? ` <span class="ma-salle">✓ Ma salle</span>` : ""}</span>
              <span class="classement-detail">${[second, c.detail].filter(Boolean).map(echapperHtml).join(" · ")}</span>
            </span>
            <span class="classement-chiffre">${chiffre}</span>
          </button>
        </li>`;
    }).join("");
    const src = SOURCES_CLASSEMENTS[type];
    $("classement-sources").innerHTML = `${echapperHtml(src.texte)} Sources : ` +
      src.liens.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${echapperHtml(l.titre)}</a>`).join(", ") + ".";
  }

  $("classement").addEventListener("click", e => {
    const ligne = e.target.closest(".classement-ligne");
    if (!ligne) return;
    const c = (classementAffiche === "monde" ? CLASSEMENT_MONDE : CLASSEMENT_FRANCE)[+ligne.dataset.index];
    choisirSalle(c.nom, c.nom);
  });

  document.querySelectorAll(".onglet").forEach(o => o.addEventListener("click", () => {
    document.querySelectorAll(".onglet").forEach(x => {
      x.classList.toggle("active", x === o);
      x.setAttribute("aria-selected", String(x === o));
    });
    afficherClassement(o.dataset.classement);
  }));

  // Salle hors classement : saisie libre (l'enseigne est reconnue si possible)
  $("form-manuel").addEventListener("submit", e => {
    e.preventDefault();
    const nom = $("champ-manuel").value.trim();
    if (!nom) return;
    const enseigne = infosEnseigne(nom);
    choisirSalle(nom, enseigne ? enseigne.nom : null);
    $("champ-manuel").value = "";
    e.target.closest("details").open = false;
  });

  function rafraichir() {
    majSalleActuelle();
    afficherClassement(classementAffiche);
  }

  rafraichir();
})();

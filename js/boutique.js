// ════════════════════════════════════════════════
//  SPORT+ — boutique.js
//  Catalogue d'avatars, aperçu des tenues, achat et équipement.
//  Dépend de donnees-avatars.js et pieces.js (Pieces, Collection).
// ════════════════════════════════════════════════

(function () {
  const DELAI_CONFIRMATION_MS = 4000;

  let filtre = "tous";
  let fichePerso = null;      // avatar ouvert dans la fiche
  let ficheTenue = null;      // tenue sélectionnée (aperçu)
  let attenteConfirmation = null;

  const $ = id => document.getElementById(id);

  // ── Vitrine (avatar équipé) ───────────────────
  function majVitrine() {
    const e = Collection.equipe();
    const perso = Collection.perso(e.perso);
    const tenue = Collection.tenue(perso, e.tenue);
    $("vitrine-nom").textContent = perso.nom;
    $("vitrine-tenue").textContent = tenue.nom;
    $("vitrine-solde").textContent = Pieces.solde();
    majEntete();
  }

  // ── Catalogue ─────────────────────────────────
  function etatPerso(perso) {
    const e = Collection.equipe();
    if (e.perso === perso.id) return "equipe";
    if (Collection.possedePerso(perso.id)) return "debloque";
    return "verrouille";
  }

  function majCatalogue() {
    const solde = Pieces.solde();
    const liste = AVATARS.filter(p => {
      const etat = etatPerso(p);
      if (filtre === "debloques") return etat !== "verrouille";
      if (filtre === "verrouilles") return etat === "verrouille";
      return true;
    });

    if (!liste.length) {
      $("catalogue").innerHTML = `<p class="catalogue-vide">${
        filtre === "verrouilles" ? "Tu as débloqué tous les avatars. Respect 🏆" : "Aucun avatar ici pour l'instant."}</p>`;
      return;
    }

    $("catalogue").innerHTML = liste.map(perso => {
      const etat = etatPerso(perso);
      const e = Collection.equipe();
      const tenueAffichee = etat === "equipe" ? e.tenue : "base";
      const nbTenues = perso.tenues.filter(t => Collection.possedeTenue(perso.id, t.id)).length;
      const prix = Collection.prixPerso(perso);
      let pied;
      if (etat === "equipe") pied = `<span class="carte-etat equipe">✓ Équipé</span>`;
      else if (etat === "debloque") pied = `<span class="carte-etat">${nbTenues}/${perso.tenues.length} tenues</span>`;
      else pied = `<span class="carte-prix ${prix > solde ? "trop-cher" : ""}">${PIECE_SVG}${prix}</span>`;

      return `
        <button type="button" class="carte rarete-${perso.rarete} ${etat}" data-perso="${perso.id}"
                aria-label="${echapperHtml(perso.nom)}, ${RARETES[perso.rarete].label}${etat === "verrouille" ? `, ${prix} pièces` : ""}">
          <span class="carte-image">
            <img src="${imageAvatar(perso.id, tenueAffichee)}" alt="" loading="lazy" width="140" height="140">
            ${etat === "verrouille" ? `<span class="carte-cadenas" aria-hidden="true">🔒</span>` : ""}
          </span>
          <span class="carte-nom">${echapperHtml(perso.nom)}</span>
          <span class="badge-rarete">${RARETES[perso.rarete].label}</span>
          ${pied}
        </button>`;
    }).join("");
  }

  // ── Fiche d'un avatar ─────────────────────────
  function ouvrirFiche(persoId) {
    fichePerso = Collection.perso(persoId);
    const e = Collection.equipe();
    ficheTenue = e.perso === persoId ? e.tenue : "base";
    annulerConfirmation();
    majFiche();
    $("fiche").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    $("fiche-action").focus();
  }

  function fermerFiche() {
    $("fiche").classList.add("hidden");
    document.body.style.overflow = "";
    annulerConfirmation();
    const carte = fichePerso && document.querySelector(`.carte[data-perso="${fichePerso.id}"]`);
    if (carte) carte.focus();
    fichePerso = null;
  }

  function majFiche() {
    const perso = fichePerso;
    const tenue = Collection.tenue(perso, ficheTenue);

    $("fiche-image").src = imageAvatar(perso.id, tenue.id);
    $("fiche-image").alt = `${perso.nom} – ${tenue.nom}`;
    $("fiche-apercu").className = `fiche-apercu rarete-${tenue.rarete}`;
    $("fiche-nom").textContent = perso.nom;
    $("fiche-rarete").textContent = RARETES[perso.rarete].label;
    $("fiche-rarete").className = `badge-rarete rarete-${perso.rarete}`;
    $("fiche-tenue-nom").innerHTML =
      `Tenue : <strong>${echapperHtml(tenue.nom)}</strong> <span class="badge-rarete rarete-${tenue.rarete}">${RARETES[tenue.rarete].label}</span>`;

    $("fiche-tenues").innerHTML = perso.tenues.map(t => {
      const possedee = Collection.possedeTenue(perso.id, t.id);
      const etiquette = possedee ? "✓" : t.id === "base" ? "Incluse" : `${PIECE_SVG}${Collection.prixTenue(t)}`;
      return `
        <button type="button" role="listitem" class="tenue rarete-${t.rarete} ${t.id === ficheTenue ? "selectionnee" : ""} ${possedee ? "possedee" : ""}"
                data-tenue="${t.id}" aria-pressed="${t.id === ficheTenue}" aria-label="${echapperHtml(t.nom)}, ${RARETES[t.rarete].label}">
          <img src="${imageAvatar(perso.id, t.id)}" alt="" width="64" height="64">
          <span class="tenue-etiquette">${etiquette}</span>
        </button>`;
    }).join("");

    majAction();
  }

  // Bouton principal : débloquer / acheter / équiper selon la situation
  function majAction() {
    const perso = fichePerso;
    const tenue = Collection.tenue(perso, ficheTenue);
    const bouton = $("fiche-action");
    const aide = $("fiche-aide");
    const solde = Pieces.solde();
    const e = Collection.equipe();
    bouton.disabled = false;
    bouton.className = "fiche-action";
    aide.textContent = "";

    if (!Collection.possedePerso(perso.id)) {
      const prix = Collection.prixPerso(perso);
      if (prix > solde) {
        bouton.disabled = true;
        bouton.innerHTML = `Il te manque ${PIECE_SVG} ${prix - solde}`;
        aide.textContent = "Termine des séances et bats tes records pour gagner des pièces.";
      } else {
        bouton.innerHTML = attenteConfirmation ? `Confirmer : ${PIECE_SVG} ${prix}` : `Débloquer ${PIECE_SVG} ${prix}`;
        if (attenteConfirmation) bouton.classList.add("confirmation");
      }
      if (tenue.id !== "base") aide.textContent = "Aperçu : cette tenue s'achète une fois l'avatar débloqué (tenue de base incluse).";
      return;
    }

    if (Collection.possedeTenue(perso.id, tenue.id)) {
      if (e.perso === perso.id && e.tenue === tenue.id) {
        bouton.disabled = true;
        bouton.textContent = "✓ Équipé";
      } else {
        bouton.textContent = "Équiper";
      }
      return;
    }

    const prix = Collection.prixTenue(tenue);
    if (prix > solde) {
      bouton.disabled = true;
      bouton.innerHTML = `Il te manque ${PIECE_SVG} ${prix - solde}`;
    } else {
      bouton.innerHTML = attenteConfirmation ? `Confirmer : ${PIECE_SVG} ${prix}` : `Acheter la tenue ${PIECE_SVG} ${prix}`;
      if (attenteConfirmation) bouton.classList.add("confirmation");
    }
  }

  function annulerConfirmation() {
    clearTimeout(attenteConfirmation);
    attenteConfirmation = null;
  }

  function action() {
    const perso = fichePerso;
    const tenue = Collection.tenue(perso, ficheTenue);
    const possedePerso = Collection.possedePerso(perso.id);

    // Simple équipement
    if (possedePerso && Collection.possedeTenue(perso.id, tenue.id)) {
      Collection.equiper(perso.id, tenue.id);
      apresChangement();
      return;
    }

    // Achat en deux temps : un premier appui demande confirmation
    if (!attenteConfirmation) {
      attenteConfirmation = setTimeout(() => { attenteConfirmation = null; if (fichePerso) majAction(); }, DELAI_CONFIRMATION_MS);
      majAction();
      return;
    }
    annulerConfirmation();

    const ok = possedePerso ? Collection.acheterTenue(perso.id, tenue.id) : Collection.acheterPerso(perso.id);
    if (!ok) { majAction(); return; }
    // L'achat d'un avatar équipe sa tenue de base : on l'affiche
    if (!possedePerso) ficheTenue = "base";
    celebrerDeblocage(perso, Collection.tenue(perso, ficheTenue), !possedePerso);
    apresChangement();
  }

  function apresChangement() {
    majVitrine();
    majCatalogue();
    majJournal();
    if (fichePerso) majFiche();
  }

  // Animation de déblocage : l'avatar apparaît en grand
  function celebrerDeblocage(perso, tenue, nouvelAvatar) {
    const pop = document.createElement("div");
    pop.className = `gain-pop deblocage rarete-${tenue.rarete}`;
    pop.setAttribute("role", "status");
    pop.innerHTML = `
      <img src="${imageAvatar(perso.id, tenue.id)}" alt="" width="120" height="120">
      <div class="gain-montant">${nouvelAvatar ? "Nouvel avatar !" : "Nouvelle tenue !"}</div>
      <div class="gain-texte">${echapperHtml(perso.nom)} – ${echapperHtml(tenue.nom)}</div>`;
    document.querySelectorAll(".gain-pop").forEach(el => el.remove());
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 2300);
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  }

  // ── Aide + journal ────────────────────────────
  function majAide() {
    $("aide-liste").innerHTML = `
      <li>${PIECE_SVG}<span><strong>${GAINS.finSeanceBase} à ${GAINS.finSeanceMax} pièces</strong> par séance terminée (+${GAINS.finSeanceParSerie} par série validée)</span></li>
      <li>${PIECE_SVG}<span><strong>${GAINS.record} pièces</strong> quand tu bats ton record de charge sur un exercice</span></li>`;
  }

  function majJournal() {
    const journal = lireStockage("pieces_journal", []);
    $("journal-liste").innerHTML = (Array.isArray(journal) && journal.length ? journal.slice(0, 15) : []).map(j => `
      <li>
        <span>${echapperHtml(j.raison)}<small>${new Date(j.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</small></span>
        <strong class="${j.montant < 0 ? "negatif" : ""}">${j.montant > 0 ? "+" : ""}${j.montant}</strong>
      </li>`).join("") || "<li>Aucune transaction pour l'instant.</li>";
  }

  // ── Événements ────────────────────────────────
  document.querySelectorAll(".filtre").forEach(btn => {
    btn.addEventListener("click", () => {
      filtre = btn.dataset.filtre;
      document.querySelectorAll(".filtre").forEach(b => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      majCatalogue();
    });
  });

  $("catalogue").addEventListener("click", e => {
    const carte = e.target.closest(".carte");
    if (carte) ouvrirFiche(carte.dataset.perso);
  });

  $("fiche-tenues").addEventListener("click", e => {
    const t = e.target.closest(".tenue");
    if (!t) return;
    ficheTenue = t.dataset.tenue;
    annulerConfirmation();
    majFiche();
  });

  $("fiche-action").addEventListener("click", action);
  $("fiche-fermer").addEventListener("click", fermerFiche);
  $("fiche").addEventListener("click", e => { if (e.target === $("fiche")) fermerFiche(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("fiche").classList.contains("hidden")) fermerFiche();
  });

  majVitrine();
  majCatalogue();
  majAide();
  majJournal();
})();

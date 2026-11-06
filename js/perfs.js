// ════════════════════════════════════════════════
//  SPORT+ — perfs.js
//  Dépend de commun.js (EXERCICES_DB, MUSCLE_LABELS, stockage)
// ════════════════════════════════════════════════

// Récupérer les performances sauvegardées
let perfs = lireStockage("perfs", {});

// Fonction pour afficher les exercices
function afficherExercices() {
  const grid = document.getElementById("perfs-grid");
  grid.innerHTML = "";

  EXERCICES_DB.forEach((exercice, idx) => {
    const poids = perfs[exercice.nom] || "";
    const inputId = `poids-${idx}`;
    // Poids du corps : on note les répétitions max (ou la durée), pas une charge
    const pdc = !!exercice.poidsDeCorps;
    const secondes = exercice.mesure === "secondes";
    const libelle = !pdc ? "Poids utilisé (kg)" : secondes ? "Durée max (secondes)" : "Répétitions max";

    const card = document.createElement("div");
    card.className = "perf-card";
    card.innerHTML = `
      <div class="perf-header">
        <h3>${exercice.nom}</h3>
        <span class="muscle-tag">${MUSCLE_LABELS[exercice.muscle]}</span>
      </div>
      <div class="perf-input-group">
        <label for="${inputId}">${libelle}</label>
        <input
          type="number"
          id="${inputId}"
          value="${echapperHtml(poids)}"
          placeholder="${!pdc ? "Ex: 50" : secondes ? "Ex: 60" : "Ex: 20"}"
          step="${pdc ? 1 : 0.5}"
          inputmode="${pdc ? "numeric" : "decimal"}"
          min="0"
        >
      </div>
      <button class="save-btn">
        💾 Sauvegarder
      </button>
    `;
    const btn = card.querySelector(".save-btn");
    btn.addEventListener("click", () => sauvegarderPoids(exercice, card.querySelector("input"), btn));
    grid.appendChild(card);
  });
}

// Fonction pour sauvegarder un poids
function sauvegarderPoids(exercice, input, btn) {
  const valeur = input.value;
  // Poids du corps : un nombre entier de répétitions (ou de secondes)
  const valide = exercice.poidsDeCorps
    ? Number.isInteger(Number(valeur)) && Number(valeur) >= 1
    : valeur !== "" && parseFloat(valeur) >= 0;

  if (valide) {
    perfs[exercice.nom] = valeur;
    ecrireStockage("perfs", perfs);

    // Animation de confirmation
    const originalText = btn.innerHTML;
    btn.innerHTML = "✓ Sauvegardé !";
    btn.style.background = "var(--accent)";
    btn.style.color = "#fff";

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  } else {
    alert(exercice.poidsDeCorps ? "Entre un nombre entier de répétitions (1 ou plus)." : "Entre un poids valide (en kg).");
  }
}

// Afficher les exercices au chargement
afficherExercices();

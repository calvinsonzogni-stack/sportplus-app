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

    const card = document.createElement("div");
    card.className = "perf-card";
    card.innerHTML = `
      <div class="perf-header">
        <h3>${exercice.nom}</h3>
        <span class="muscle-tag">${MUSCLE_LABELS[exercice.muscle]}</span>
      </div>
      <div class="perf-input-group">
        <label for="${inputId}">Poids utilisé (kg)</label>
        <input
          type="number"
          id="${inputId}"
          value="${echapperHtml(poids)}"
          placeholder="Ex: 50"
          step="0.5"
          min="0"
        >
      </div>
      <button class="save-btn">
        💾 Sauvegarder
      </button>
    `;
    const btn = card.querySelector(".save-btn");
    btn.addEventListener("click", () => sauvegarderPoids(exercice.nom, card.querySelector("input"), btn));
    grid.appendChild(card);
  });
}

// Fonction pour sauvegarder un poids
function sauvegarderPoids(nomExercice, input, btn) {
  const poids = input.value;

  if (poids && parseFloat(poids) >= 0) {
    perfs[nomExercice] = poids;
    ecrireStockage("perfs", perfs);

    // Animation de confirmation
    const originalText = btn.innerHTML;
    btn.innerHTML = "✓ Sauvegardé !";
    btn.style.background = "#00ff88";
    btn.style.color = "#000";

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1500);
  } else {
    alert("Veuillez entrer un poids valide");
  }
}

// Afficher les exercices au chargement
afficherExercices();

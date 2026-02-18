// Liste des exercices disponibles (synchronisée avec exercices.js)
const exercices = [
  // PECTORAUX
  { nom: "Développé Couché", muscle: "Pectoraux" },
  { nom: "Développé Incliné", muscle: "Pectoraux" },
  { nom: "Développé Décliné", muscle: "Pectoraux" },
  { nom: "Développé Haltères", muscle: "Pectoraux" },
  { nom: "Écarté Couché", muscle: "Pectoraux" },
  { nom: "Écarté Incliné", muscle: "Pectoraux" },
  { nom: "Pompes", muscle: "Pectoraux" },
  { nom: "Pompes Inclinées", muscle: "Pectoraux" },
  { nom: "Dips Pectoraux", muscle: "Pectoraux" },
  { nom: "Pull Over", muscle: "Pectoraux" },
  { nom: "Pec Deck", muscle: "Pectoraux" },
  { nom: "Cable Crossover", muscle: "Pectoraux" },

  // DOS
  { nom: "Tractions", muscle: "Dos" },
  { nom: "Tractions Pronation", muscle: "Dos" },
  { nom: "Tractions Supination", muscle: "Dos" },
  { nom: "Rowing Barre", muscle: "Dos" },
  { nom: "Rowing Haltères", muscle: "Dos" },
  { nom: "Rowing T-Barre", muscle: "Dos" },
  { nom: "Tirage Horizontal", muscle: "Dos" },
  { nom: "Tirage Vertical", muscle: "Dos" },
  { nom: "Tirage Poitrine", muscle: "Dos" },
  { nom: "Tirage Nuque", muscle: "Dos" },
  { nom: "Soulevé de Terre", muscle: "Dos" },
  { nom: "Soulevé de Terre Roumain", muscle: "Dos" },
  { nom: "Shrugs", muscle: "Dos" },
  { nom: "Face Pull", muscle: "Dos" },

  // ÉPAULES
  { nom: "Développé Militaire", muscle: "Épaules" },
  { nom: "Développé Haltères Assis", muscle: "Épaules" },
  { nom: "Élévations Latérales", muscle: "Épaules" },
  { nom: "Élévations Frontales", muscle: "Épaules" },
  { nom: "Oiseau Haltères", muscle: "Épaules" },
  { nom: "Oiseau Poulie", muscle: "Épaules" },
  { nom: "Rowing Menton", muscle: "Épaules" },
  { nom: "Arnold Press", muscle: "Épaules" },
  { nom: "Élévations Latérales Câble", muscle: "Épaules" },

  // BRAS
  { nom: "Curl Barre", muscle: "Bras" },
  { nom: "Curl Haltères", muscle: "Bras" },
  { nom: "Curl Marteau", muscle: "Bras" },
  { nom: "Curl Pupitre", muscle: "Bras" },
  { nom: "Curl Incliné", muscle: "Bras" },
  { nom: "Curl Concentration", muscle: "Bras" },
  { nom: "Curl Cable", muscle: "Bras" },
  { nom: "Dips Triceps", muscle: "Bras" },
  { nom: "Extension Nuque", muscle: "Bras" },
  { nom: "Barre au Front", muscle: "Bras" },
  { nom: "Extension Poulie Haute", muscle: "Bras" },
  { nom: "Kickback Haltères", muscle: "Bras" },
  { nom: "Extension Haltère Nuque", muscle: "Bras" },
  { nom: "Diamond Push-ups", muscle: "Bras" },

  // JAMBES
  { nom: "Squat", muscle: "Jambes" },
  { nom: "Squat Avant", muscle: "Jambes" },
  { nom: "Squat Bulgare", muscle: "Jambes" },
  { nom: "Presse à Cuisses", muscle: "Jambes" },
  { nom: "Leg Extension", muscle: "Jambes" },
  { nom: "Fentes Avant", muscle: "Jambes" },
  { nom: "Fentes Marchées", muscle: "Jambes" },
  { nom: "Hack Squat", muscle: "Jambes" },
  { nom: "Leg Curl", muscle: "Jambes" },
  { nom: "Leg Curl Debout", muscle: "Jambes" },
  { nom: "Good Morning", muscle: "Jambes" },
  { nom: "Hip Thrust", muscle: "Jambes" },
  { nom: "Mollets Debout", muscle: "Jambes" },
  { nom: "Mollets Assis", muscle: "Jambes" },
  { nom: "Mollets Presse", muscle: "Jambes" },

  // ABDOMINAUX
  { nom: "Crunch", muscle: "Abdominaux" },
  { nom: "Crunch Obliques", muscle: "Abdominaux" },
  { nom: "Relevé de Jambes", muscle: "Abdominaux" },
  { nom: "Planche", muscle: "Abdominaux" },
  { nom: "Planche Latérale", muscle: "Abdominaux" },
  { nom: "Mountain Climbers", muscle: "Abdominaux" },
  { nom: "Russian Twist", muscle: "Abdominaux" },
  { nom: "Bicycle Crunch", muscle: "Abdominaux" },
  { nom: "Ab Wheel", muscle: "Abdominaux" },
  { nom: "Hanging Leg Raise", muscle: "Abdominaux" },
  { nom: "Cable Crunch", muscle: "Abdominaux" },
  { nom: "Sit-ups", muscle: "Abdominaux" }
];

// Récupérer les performances sauvegardées
let perfs = JSON.parse(localStorage.getItem("perfs")) || {};

// Fonction pour afficher les exercices
function afficherExercices() {
  const grid = document.getElementById("perfs-grid");
  grid.innerHTML = "";

  exercices.forEach(exercice => {
    const poids = perfs[exercice.nom] || "";
    
    const card = document.createElement("div");
    card.className = "perf-card";
    card.innerHTML = `
      <div class="perf-header">
        <h3>${exercice.nom}</h3>
        <span class="muscle-tag">${exercice.muscle}</span>
      </div>
      <div class="perf-input-group">
        <label for="poids-${exercice.nom}">Poids utilisé (kg)</label>
        <input 
          type="number" 
          id="poids-${exercice.nom}" 
          value="${poids}" 
          placeholder="Ex: 50"
          step="0.5"
          min="0"
        >
      </div>
      <button class="save-btn" onclick="sauvegarderPoids('${exercice.nom}')">
        💾 Sauvegarder
      </button>
    `;
    grid.appendChild(card);
  });
}

// Fonction pour sauvegarder un poids
function sauvegarderPoids(nomExercice) {
  const input = document.getElementById(`poids-${nomExercice}`);
  const poids = input.value;

  if (poids && parseFloat(poids) >= 0) {
    perfs[nomExercice] = poids;
    localStorage.setItem("perfs", JSON.stringify(perfs));
    
    // Animation de confirmation
    const btn = event.target;
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

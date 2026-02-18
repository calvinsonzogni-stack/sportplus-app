// Base de données complète des exercices
const exercices = [
  // PECTORAUX
  { nom: "Développé Couché", muscle: "pectoraux", image: "developpe-couche.jpg" },
  { nom: "Développé Incliné", muscle: "pectoraux", image: "developpe-incline.jpg" },
  { nom: "Développé Décliné", muscle: "pectoraux", image: "developpe-decline.jpg" },
  { nom: "Développé Haltères", muscle: "pectoraux", image: "developpe-halteres.jpg" },
  { nom: "Écarté Couché", muscle: "pectoraux", image: "ecarte-couche.jpg" },
  { nom: "Écarté Incliné", muscle: "pectoraux", image: "ecarte-incline.jpg" },
  { nom: "Pompes", muscle: "pectoraux", image: "pompes.png" },
  { nom: "Pompes Inclinées", muscle: "pectoraux", image: "pompes-inclinees.jpg" },
  { nom: "Dips Pectoraux", muscle: "pectoraux", image: "dips-pectoraux.jpg" },
  { nom: "Pull Over", muscle: "pectoraux", image: "pull-over.jpg" },
  { nom: "Pec Deck", muscle: "pectoraux", image: "pec-deck.jpg" },
  { nom: "Cable Crossover", muscle: "pectoraux", image: "cable-crossover.jpg" },

  // DOS
  { nom: "Tractions", muscle: "dos", image: "tractions.jpg" },
  { nom: "Tractions Pronation", muscle: "dos", image: "tractions-pronation.jpg" },
  { nom: "Tractions Supination", muscle: "dos", image: "tractions-supination.jpg" },
  { nom: "Rowing Barre", muscle: "dos", image: "rowing-barre.jpg" },
  { nom: "Rowing Haltères", muscle: "dos", image: "rowing-halteres.jpg" },
  { nom: "Rowing T-Barre", muscle: "dos", image: "rowing-t-barre.jpg" },
  { nom: "Tirage Horizontal", muscle: "dos", image: "tirage-horizontal.jpg" },
  { nom: "Tirage Vertical", muscle: "dos", image: "tirage-vertical.jpg" },
  { nom: "Tirage Poitrine", muscle: "dos", image: "tirage-poitrine.jpg" },
  { nom: "Tirage Nuque", muscle: "dos", image: "tirage-nuque.jpg" },
  { nom: "Soulevé de Terre", muscle: "dos", image: "souleve-de-terre.jpg" },
  { nom: "Soulevé de Terre Roumain", muscle: "dos", image: "souleve-de-terre-roumain.jpg" },
  { nom: "Shrugs", muscle: "dos", image: "shrugs.jpg" },
  { nom: "Face Pull", muscle: "dos", image: "face-pull.jpg" },

  // ÉPAULES
  { nom: "Développé Militaire", muscle: "epaules", image: "developpe-militaire.jpg" },
  { nom: "Développé Haltères Assis", muscle: "epaules", image: "developpe-halteres-assis.jpg" },
  { nom: "Élévations Latérales", muscle: "epaules", image: "elevations-laterales.jpg" },
  { nom: "Élévations Frontales", muscle: "epaules", image: "elevations-frontales.jpg" },
  { nom: "Oiseau Haltères", muscle: "epaules", image: "oiseau-halteres.jpg" },
  { nom: "Oiseau Poulie", muscle: "epaules", image: "oiseau-poulie.jpg" },
  { nom: "Rowing Menton", muscle: "epaules", image: "rowing-menton.jpg" },
  { nom: "Arnold Press", muscle: "epaules", image: "arnold-press.jpg" },
  { nom: "Élévations Latérales Câble", muscle: "epaules", image: "elevations-laterales-cable.jpg" },

  // BRAS - Biceps
  { nom: "Curl Barre", muscle: "bras", image: "curl-barre.jpg" },
  { nom: "Curl Haltères", muscle: "bras", image: "curl-halteres.jpg" },
  { nom: "Curl Marteau", muscle: "bras", image: "curl-marteau.jpg" },
  { nom: "Curl Pupitre", muscle: "bras", image: "curl-pupitre.jpg" },
  { nom: "Curl Incliné", muscle: "bras", image: "curl-incline.jpg" },
  { nom: "Curl Concentration", muscle: "bras", image: "curl-concentration.jpg" },
  { nom: "Curl Cable", muscle: "bras", image: "curl-cable.jpg" },
  
  // BRAS - Triceps
  { nom: "Dips Triceps", muscle: "bras", image: "dips-triceps.jpg" },
  { nom: "Extension Nuque", muscle: "bras", image: "extension-nuque.jpg" },
  { nom: "Barre au Front", muscle: "bras", image: "barre-au-front.jpg" },
  { nom: "Extension Poulie Haute", muscle: "bras", image: "extension-poulie-haute.jpg" },
  { nom: "Kickback Haltères", muscle: "bras", image: "kickback-halteres.jpg" },
  { nom: "Extension Haltère Nuque", muscle: "bras", image: "extension-haltere-nuque.jpg" },
  { nom: "Diamond Push-ups", muscle: "bras", image: "diamond-pushups.jpg" },

  // JAMBES - Quadriceps
  { nom: "Squat", muscle: "jambes", image: "Squats.jpeg" },
  { nom: "Squat Avant", muscle: "jambes", image: "squat-avant.jpg" },
  { nom: "Squat Bulgare", muscle: "jambes", image: "squat-bulgare.jpg" },
  { nom: "Presse à Cuisses", muscle: "jambes", image: "presse-cuisses.jpg" },
  { nom: "Leg Extension", muscle: "jambes", image: "leg-extension.jpg" },
  { nom: "Fentes Avant", muscle: "jambes", image: "fentes-avant.jpg" },
  { nom: "Fentes Marchées", muscle: "jambes", image: "fentes-marchees.jpg" },
  { nom: "Hack Squat", muscle: "jambes", image: "hack-squat.jpg" },
  
  // JAMBES - Ischio-jambiers
  { nom: "Leg Curl", muscle: "jambes", image: "leg-curl.jpg" },
  { nom: "Leg Curl Debout", muscle: "jambes", image: "leg-curl-debout.jpg" },
  { nom: "Good Morning", muscle: "jambes", image: "good-morning.jpg" },
  { nom: "Hip Thrust", muscle: "jambes", image: "hip-thrust.jpg" },
  
  // JAMBES - Mollets
  { nom: "Mollets Debout", muscle: "jambes", image: "mollets-debout.jpg" },
  { nom: "Mollets Assis", muscle: "jambes", image: "mollets-assis.jpg" },
  { nom: "Mollets Presse", muscle: "jambes", image: "mollets-presse.jpg" },

  // ABDOMINAUX
  { nom: "Crunch", muscle: "abdos", image: "crunch.jpg" },
  { nom: "Crunch Obliques", muscle: "abdos", image: "crunch-obliques.jpg" },
  { nom: "Relevé de Jambes", muscle: "abdos", image: "releve-jambes.jpg" },
  { nom: "Planche", muscle: "abdos", image: "planche.jpg" },
  { nom: "Planche Latérale", muscle: "abdos", image: "planche-laterale.jpg" },
  { nom: "Mountain Climbers", muscle: "abdos", image: "mountain-climbers.jpg" },
  { nom: "Russian Twist", muscle: "abdos", image: "russian-twist.jpg" },
  { nom: "Bicycle Crunch", muscle: "abdos", image: "bicycle-crunch.jpg" },
  { nom: "Ab Wheel", muscle: "abdos", image: "ab-wheel.jpg" },
  { nom: "Hanging Leg Raise", muscle: "abdos", image: "hanging-leg-raise.jpg" },
  { nom: "Cable Crunch", muscle: "abdos", image: "cable-crunch.jpg" },
  { nom: "Sit-ups", muscle: "abdos", image: "sit-ups.jpg" }
];

// Générer les cartes d'exercices
function genererExercices() {
  const grid = document.getElementById("exercices-grid");
  grid.innerHTML = "";

  exercices.forEach(exercice => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-muscle", exercice.muscle);
    
    card.innerHTML = `
      <div class="card-image-container">
        <img src="assets/images/${exercice.image}" alt="${exercice.nom}" class="card-image" onerror="this.src='assets/images/placeholder.svg'">
        <div class="image-overlay"></div>
      </div>
      <div class="card-content">
        <h3>${exercice.nom}</h3>
        <p class="muscle-tag">${capitalizeFirstLetter(exercice.muscle)}</p>
        <button class="add-btn" onclick="addExercice('${exercice.nom}')">
          <span class="btn-icon">+</span>
          <span class="btn-text">Ajouter</span>
        </button>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Filtre par muscle
const filterMuscle = document.getElementById("filter-muscle");

filterMuscle.addEventListener("change", () => {
  const selectedMuscle = filterMuscle.value;
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const muscle = card.getAttribute("data-muscle");

    if (selectedMuscle === "all" || muscle === selectedMuscle) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Ajouter un exercice à la séance
function addExercice(nom) {
  let seance = JSON.parse(localStorage.getItem("seance")) || [];

  // Éviter les doublons
  if (!seance.includes(nom)) {
    seance.push(nom);
    localStorage.setItem("seance", JSON.stringify(seance));
    
    // Animation de confirmation
    showNotification(nom + " ajouté à ta séance 💪");
  } else {
    showNotification("Cet exercice est déjà dans ta séance 😉", "warning");
  }
}

// Notification personnalisée
function showNotification(message, type = "success") {
  // Supprimer toute notification existante
  const existingNotif = document.querySelector(".notification");
  if (existingNotif) {
    existingNotif.remove();
  }

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);

  // Animation d'entrée
  setTimeout(() => {
    notif.classList.add("show");
  }, 10);

  // Retrait après 3 secondes
  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => {
      notif.remove();
    }, 300);
  }, 3000);
}

// Initialisation
genererExercices();

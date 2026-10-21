// ════════════════════════════════════════════════
//  SPORT+ — exercices.js
//  Dépend de commun.js (EXERCICES_DB, stockage)
// ════════════════════════════════════════════════

// Générer les cartes d'exercices
function genererExercices() {
  const grid = document.getElementById("exercices-grid");
  grid.innerHTML = "";

  EXERCICES_DB.forEach(exercice => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-muscle", exercice.muscle);
    
    card.innerHTML = `
      <div class="card-image-container">
        <img src="assets/images/${exercice.image}" alt="${exercice.nom}" class="card-image" loading="lazy" onerror="this.src='assets/images/placeholder.svg'">
        <div class="image-overlay"></div>
      </div>
      <div class="card-content">
        <h3>${exercice.nom}</h3>
        <p class="muscle-tag">${MUSCLE_LABELS[exercice.muscle]}</p>
        <button class="add-btn">
          <span class="btn-icon">+</span>
          <span class="btn-text">Ajouter</span>
        </button>
      </div>
    `;
    card.querySelector(".add-btn").addEventListener("click", () => addExercice(exercice.nom));

    grid.appendChild(card);
  });
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

// Ajouter un exercice à la prochaine séance : il sera présélectionné
// à l'ouverture de « Créer ma séance » (même mécanisme que le planning).
function addExercice(nom) {
  const seance = lireStockage("seance_preloaded", []);

  // Éviter les doublons
  if (!seance.includes(nom)) {
    seance.push(nom);
    ecrireStockage("seance_preloaded", seance);

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

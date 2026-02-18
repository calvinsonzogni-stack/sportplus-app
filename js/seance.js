const liste = document.getElementById("liste-seance");
let seance = JSON.parse(localStorage.getItem("seance")) || [];
let perfs = JSON.parse(localStorage.getItem("perfs")) || {};

function afficherSeance() {
  liste.innerHTML = "";

  if (seance.length === 0) {
    liste.innerHTML = '<li style="list-style:none; text-align:center; color:#ccc;">Aucun exercice pour le moment. Ajoute des exercices depuis la page Exercices !</li>';
    return;
  }

  seance.forEach((exo, index) => {
    const li = document.createElement("li");
    const poids = perfs[exo] ? `<span class="poids-info">💪 ${perfs[exo]} kg</span>` : '<span class="poids-info-vide">Poids non défini</span>';
    
    li.innerHTML = `
      <div class="exercice-info">
        <span class="exercice-nom">${exo}</span>
        ${poids}
      </div>
      <button class="delete-btn" onclick="supprimerExo(${index})">❌</button>
    `;
    liste.appendChild(li);
  });
}

function supprimerExo(index) {
  seance.splice(index, 1);
  localStorage.setItem("seance", JSON.stringify(seance));
  afficherSeance();
}

function sauvegarderSeance(event) {
  if (seance.length === 0) {
    alert("Ta séance est vide ! Ajoute des exercices depuis la page Exercices.");
    return;
  }

  // Créer l'objet séance avec les exercices et leurs poids
  const seanceComplete = {
    date: new Date().toISOString(),
    exercices: seance.map(nomExo => ({
      nom: nomExo,
      poids: perfs[nomExo] || null
    }))
  };

  // Récupérer l'historique existant
  let historique = JSON.parse(localStorage.getItem("historique")) || [];
  
  // Ajouter la nouvelle séance
  historique.push(seanceComplete);
  
  // Sauvegarder
  localStorage.setItem("historique", JSON.stringify(historique));

  // Vider la séance actuelle
  seance = [];
  localStorage.setItem("seance", JSON.stringify(seance));
  
  // Animation de confirmation
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = "✅ Séance sauvegardée !";
  btn.style.background = "#00ff88";
  
  setTimeout(() => {
    alert("🎉 Séance sauvegardée dans l'historique !\n\nVa voir ton historique pour suivre ta progression.");
    window.location.href = "historique.html";
  }, 800);
}

afficherSeance();

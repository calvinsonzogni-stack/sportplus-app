// Récupération des données
let historique = JSON.parse(localStorage.getItem("historique")) || [];
let perfs = JSON.parse(localStorage.getItem("perfs")) || {};

// Fonction pour calculer les stats rapides
function calculerStats() {
  const totalSeances = historique.length;
  document.getElementById("total-seances").textContent = totalSeances;

  // Calculer le streak (jours consécutifs)
  const streak = calculerStreak();
  document.getElementById("streak").textContent = streak;

  // Exercice favori
  const exerciceFavori = trouverExerciceFavori();
  document.getElementById("exercice-favori").textContent = exerciceFavori || "-";

  // Progression ce mois
  const progression = calculerProgressionMois();
  document.getElementById("progression-mois").textContent = progression;
}

function calculerStreak() {
  if (historique.length === 0) return 0;

  // Trier par date décroissante
  const sorted = [...historique].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let seance of sorted) {
    const seanceDate = new Date(seance.date);
    seanceDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate - seanceDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak || (streak === 0 && diffDays === 0)) {
      streak++;
      currentDate = seanceDate;
    } else {
      break;
    }
  }
  
  return streak;
}

function trouverExerciceFavori() {
  const compteur = {};
  historique.forEach(seance => {
    seance.exercices.forEach(exo => {
      compteur[exo.nom] = (compteur[exo.nom] || 0) + 1;
    });
  });

  let max = 0;
  let favori = "";
  for (let [nom, count] of Object.entries(compteur)) {
    if (count > max) {
      max = count;
      favori = nom;
    }
  }
  return favori;
}

function calculerProgressionMois() {
  const maintenant = new Date();
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  
  const seancesMois = historique.filter(s => new Date(s.date) >= debutMois);
  
  if (seancesMois.length < 2) return "0%";

  // Calculer la progression moyenne des poids
  const premiereSeance = seancesMois[0];
  const derniereSeance = seancesMois[seancesMois.length - 1];
  
  let totalProg = 0;
  let count = 0;

  premiereSeance.exercices.forEach(exo1 => {
    const exo2 = derniereSeance.exercices.find(e => e.nom === exo1.nom);
    if (exo2 && exo1.poids && exo2.poids) {
      const prog = ((parseFloat(exo2.poids) - parseFloat(exo1.poids)) / parseFloat(exo1.poids)) * 100;
      totalProg += prog;
      count++;
    }
  });

  if (count === 0) return "0%";
  return (totalProg / count).toFixed(1) + "%";
}

// Graphique d'évolution des poids
let evolutionChart = null;

function populateExerciceSelect() {
  const select = document.getElementById("exercice-select");
  const exercices = new Set();
  
  historique.forEach(seance => {
    seance.exercices.forEach(exo => {
      exercices.add(exo.nom);
    });
  });

  exercices.forEach(nom => {
    const option = document.createElement("option");
    option.value = nom;
    option.textContent = nom;
    select.appendChild(option);
  });

  // Sélectionner le premier exercice par défaut
  if (exercices.size > 0) {
    select.selectedIndex = 1;
    creerGraphiqueEvolution(Array.from(exercices)[0]);
  }
}

function creerGraphiqueEvolution(exerciceNom) {
  const ctx = document.getElementById("evolution-chart");
  
  // Filtrer les données pour cet exercice
  const donnees = [];
  historique.forEach(seance => {
    const exo = seance.exercices.find(e => e.nom === exerciceNom);
    if (exo && exo.poids) {
      donnees.push({
        date: new Date(seance.date),
        poids: parseFloat(exo.poids)
      });
    }
  });

  // Trier par date
  donnees.sort((a, b) => a.date - b.date);

  if (evolutionChart) {
    evolutionChart.destroy();
  }

  evolutionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: donnees.map(d => d.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
      datasets: [{
        label: 'Poids (kg)',
        data: donnees.map(d => d.poids),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#00ff88',
        pointBorderColor: '#0f0f0f',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#00ff88',
          bodyColor: '#fff',
          borderColor: '#00ff88',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' kg';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: '#333'
          },
          ticks: {
            color: '#ccc',
            callback: function(value) {
              return value + ' kg';
            }
          }
        },
        x: {
          grid: {
            color: '#333'
          },
          ticks: {
            color: '#ccc'
          }
        }
      }
    }
  });
}

document.getElementById("exercice-select").addEventListener("change", (e) => {
  if (e.target.value) {
    creerGraphiqueEvolution(e.target.value);
  }
});

// Graphique de fréquence
function creerGraphiqueFrequence() {
  const ctx = document.getElementById("frequence-chart");
  
  // Calculer le nombre de séances par semaine (4 dernières semaines)
  const semaines = {};
  const maintenant = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const debut = new Date(maintenant);
    debut.setDate(debut.getDate() - (debut.getDay() + 7 * i));
    debut.setHours(0, 0, 0, 0);
    
    const fin = new Date(debut);
    fin.setDate(fin.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    
    const label = `S${i === 0 ? '' : '-' + i}`;
    semaines[label] = historique.filter(s => {
      const date = new Date(s.date);
      return date >= debut && date <= fin;
    }).length;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(semaines),
      datasets: [{
        label: 'Séances',
        data: Object.values(semaines),
        backgroundColor: '#00ff88',
        borderRadius: 8,
        barThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#00ff88',
          bodyColor: '#fff',
          borderColor: '#00ff88',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' séance' + (context.parsed.y > 1 ? 's' : '');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#333'
          },
          ticks: {
            color: '#ccc',
            stepSize: 1
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#ccc'
          }
        }
      }
    }
  });
}

// Afficher l'historique des séances
function afficherHistorique() {
  const liste = document.getElementById("liste-historique");
  
  if (historique.length === 0) {
    liste.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Aucune séance enregistrée</h3>
        <p>Commence à t'entraîner et tes séances apparaîtront ici !</p>
        <a href="seance.html" class="btn-primary">Créer ma première séance</a>
      </div>
    `;
    return;
  }

  // Trier par date décroissante
  const sorted = [...historique].sort((a, b) => new Date(b.date) - new Date(a.date));

  liste.innerHTML = sorted.map((seance, index) => {
    const date = new Date(seance.date);
    const dateStr = date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
      <div class="seance-card">
        <div class="seance-header">
          <div class="seance-date">
            <span class="date-icon">📅</span>
            <span>${dateStr}</span>
          </div>
          <button class="btn-delete" onclick="supprimerSeance(${historique.indexOf(seance)})">
            🗑️ Supprimer
          </button>
        </div>
        <div class="exercices-list">
          ${seance.exercices.map(exo => `
            <div class="exercice-item">
              <span class="exercice-nom">${exo.nom}</span>
              <span class="exercice-poids">${exo.poids ? exo.poids + ' kg' : 'Poids non défini'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function supprimerSeance(index) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
    historique.splice(index, 1);
    localStorage.setItem("historique", JSON.stringify(historique));
    location.reload();
  }
}

function clearHistory() {
  if (confirm("⚠️ ATTENTION : Cela supprimera TOUT votre historique. Cette action est irréversible. Continuer ?")) {
    localStorage.removeItem("historique");
    location.reload();
  }
}

// Initialisation
calculerStats();
populateExerciceSelect();
creerGraphiqueFrequence();
afficherHistorique();

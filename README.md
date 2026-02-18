# Sport+ 🏋️

Application web pour créer et suivre ses séances de musculation.

## Fonctionnalités

- **Bibliothèque d'exercices** : Plus de 100 exercices classés par groupe musculaire
- **Création de séances** : Compose ta séance personnalisée
- **Suivi des performances** : Enregistre tes poids pour chaque exercice
- **Historique** : Visualise ta progression avec des graphiques
- **Statistiques** : Suivi des séries consécutives, exercice favori, etc.

## Structure du projet

```
sport-plus/
├── index.html           # Page d'accueil
├── exercices.html       # Liste des exercices
├── seance.html          # Création de séance
├── perfs.html           # Enregistrement des performances
├── historique.html      # Historique et statistiques
├── css/                 # Fichiers de styles
│   ├── acceuille.css
│   ├── exercices.css
│   ├── seance.css
│   ├── perfs.css
│   └── historique.css
├── js/                  # Scripts JavaScript
│   ├── exercices.js
│   ├── seance.js
│   ├── perfs.js
│   └── historique.js
└── assets/
    └── images/          # Images des exercices
```

## Technologies utilisées

- HTML5
- CSS3
- JavaScript (Vanilla)
- Chart.js (pour les graphiques)
- LocalStorage (pour la persistance des données)

## Déploiement sur Netlify

1. Connecte ton dépôt GitHub à Netlify
2. Configure le build :
   - Build command : (laisser vide)
   - Publish directory : `/`
3. Déploie !

Le site est 100% statique et ne nécessite aucun backend.

## Développement local

Ouvre simplement `index.html` dans ton navigateur ou utilise un serveur local :

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server
```

## Notes

- Les données sont stockées localement dans le navigateur (LocalStorage)
- Aucune connexion internet requise après le premier chargement
- Compatible avec tous les navigateurs modernes

---

Créé avec 💪 pour les passionnés de musculation

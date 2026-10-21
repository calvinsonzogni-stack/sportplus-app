# Sport+ 🏋️

Application web pour créer et suivre ses séances de musculation.

## Fonctionnalités

- **Bibliothèque d'exercices** : 75 exercices classés par groupe musculaire
- **Création de séances** : Compose ta séance, saisis tes séries (reps × charge) avec chrono
- **Reprise automatique** : une séance en cours survit à un rechargement ou à l'écran verrouillé
- **Planning** : Programme tes séances (ponctuelles ou hebdomadaires) avec rappel le jour J
- **Suivi des performances** : La charge max de chaque exercice est retenue et pré-remplie
- **Historique** : Visualise ta progression avec des graphiques
- **Statistiques** : Jours consécutifs, exercice favori, records personnels

## Structure du projet

```
sport-plus/
├── index.html           # Page d'accueil
├── seance.html          # Création + suivi de la séance en cours
├── planning.html        # Calendrier des séances programmées
├── historique.html      # Historique et statistiques
├── exercices.html       # Bibliothèque d'exercices (page secondaire)
├── perfs.html           # Saisie manuelle des charges (page secondaire)
├── css/                 # Un fichier par page + mobile.css (commun)
├── js/
│   ├── commun.js        # Liste des exercices + utilitaires partagés (à charger en premier)
│   ├── nav.js           # Menu hamburger
│   ├── notif-planning.js# Rappel « séance prévue aujourd'hui »
│   ├── <page>.js        # Logique propre à chaque page
│   └── vendor/          # Chart.js 4.4.0 (MIT), embarqué pour fonctionner hors ligne
└── assets/
    └── images/          # Images des exercices
```

## Technologies utilisées

- HTML5
- CSS3
- JavaScript (Vanilla)
- Chart.js 4.4.0 (graphiques, copie locale dans `js/vendor/`)
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
- Aucune dépendance externe : tout est servi par le site lui-même
- Pour ajouter un exercice, il suffit de l'ajouter dans `EXERCICES_DB` (`js/commun.js`) : toutes les pages le voient
- Compatible avec tous les navigateurs modernes

---

Créé avec 💪 pour les passionnés de musculation

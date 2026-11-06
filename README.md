# Sport+ 🏋️

Application web pour créer et suivre ses séances de musculation.
Direction artistique rouge & noir, pensée pour le téléphone (barre d'onglets en bas).

## Fonctionnalités

- **Bibliothèque d'exercices** : 75 exercices classés par groupe musculaire
- **Création de séances** : Compose ta séance, saisis tes séries (reps × charge) avec chrono
- **Minuteur de repos** : démarre à chaque série validée (60 / 90 / 120 / 180 s ou désactivé), vibration et bip à la fin
- **Reprise automatique** : une séance en cours survit à un rechargement ou à l'écran verrouillé
- **Planning** : Programme tes séances (ponctuelles ou hebdomadaires) avec rappel le jour J
- **Suivi des performances** : La charge max de chaque exercice est retenue et pré-remplie
- **Historique** : Visualise ta progression avec des graphiques
- **Statistiques** : Jours consécutifs, exercice favori, records personnels
- **Pièces** 🪙 : gagnées en terminant une séance et en battant ses records
- **Boutique** : 8 avatars à débloquer, chacun avec 4 tenues, prix selon la rareté
- **Sauvegarde** : export / import de toutes les données dans un fichier (page Historique)
- **Appli installable et hors ligne** : « Ajouter à l'écran d'accueil », puis utilisable sans réseau à la salle

## Structure du projet

```
sport-plus/
├── index.html           # Page d'accueil
├── seance.html          # Création + suivi de la séance en cours
├── planning.html        # Calendrier des séances programmées
├── historique.html      # Historique et statistiques
├── boutique.html        # Boutique d'avatars et de tenues
├── exercices.html       # Bibliothèque d'exercices (page secondaire)
├── perfs.html           # Saisie manuelle des charges (page secondaire)
├── manifest.webmanifest # Nom, icônes et couleurs de l'appli installée
├── sw.js                # Service worker : cache pour le mode hors ligne
├── css/                 # Un fichier par page + mobile.css + theme.css (couleurs, en-tête,
│                        #   navigation, pièces — chargé en dernier sur chaque page)
├── js/
│   ├── donnees-exercices.js # Liste des exercices (source unique, lue aussi par sw.js)
│   ├── donnees-avatars.js   # Catalogue de la boutique : avatars, tenues, raretés, prix
│   ├── commun.js        # Utilitaires partagés + enregistrement du service worker
│   ├── pieces.js        # Monnaie, gains, collection d'avatars, solde dans l'en-tête
│   ├── accueil.js       # Tableau de bord (page d'accueil)
│   ├── boutique.js      # Boutique : aperçu, achat, équipement
│   ├── nav.js           # Menu hamburger
│   ├── notif-planning.js# Rappel « séance prévue aujourd'hui »
│   ├── repos.js         # Minuteur de repos (page séance)
│   ├── sauvegarde.js    # Export / import des données (page historique)
│   ├── <page>.js        # Logique propre à chaque page
│   └── vendor/          # Chart.js 4.4.0 (MIT), embarqué pour fonctionner hors ligne
├── tools/avatars/       # Script de génération des avatars (développement uniquement)
└── assets/
    ├── avatars/         # Avatars générés (SVG), voir CREDITS.md
    ├── icons/           # Icônes de l'appli (écran d'accueil, favicon)
    └── images/          # Images des exercices (sources : voir CREDITS.md)
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
- Pour ajouter un exercice, il suffit de l'ajouter dans `EXERCICES_DB` (`js/donnees-exercices.js`) : toutes les pages le voient, et son image est automatiquement gardée hors ligne

## Pièces et boutique

| Action | Gain |
|---|---|
| Terminer une séance | 30 pièces + 2 par série validée (60 max) |
| Battre son record sur un exercice (charge, ou répétitions au poids du corps) | 25 pièces (une fois par exercice et par séance) |
| Première ouverture | 100 pièces de bienvenue + 30 par séance déjà enregistrée |

| Rareté | Avatar | Tenue |
|---|---|---|
| Commun | 150 | 100 |
| Rare | 400 | 200 |
| Épique | 800 | 400 |
| Légendaire | 1 500 | 800 |

Exercices au poids du corps (pompes, dips, tractions, abdos…) : marqués `poidsDeCorps`
dans `js/donnees-exercices.js` ; on n'y saisit que les répétitions (les planches : en
secondes, `mesure: "secondes"`) et le record porte sur le maximum de répétitions.

Chaque avatar inclut sa tenue de base ; « La Recrue » est offerte. Les valeurs se
règlent dans `GAINS` (`js/pieces.js`) et `RARETES` (`js/donnees-avatars.js`).
Pour ajouter un avatar ou une tenue : voir `tools/avatars/README.md`.

## Mode hors ligne : une règle à retenir

À chaque mise en ligne de modifications, **incrémenter `VERSION` dans `sw.js`**
(`sportplus-v1` → `sportplus-v2`…). Les pages, styles et scripts se mettent à jour
même sans ça (ils passent par le réseau en priorité), mais c'est ce qui force le
téléphone à recharger tout le cache, images comprises, et à supprimer l'ancien.

Si un nouveau fichier CSS ou JS est ajouté, l'ajouter aussi à `FICHIERS_APPLI` dans `sw.js`.
- Compatible avec tous les navigateurs modernes

---

Créé avec 💪 pour les passionnés de musculation

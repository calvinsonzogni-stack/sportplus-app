# Génération des avatars de la boutique

Les images `assets/avatars/*.svg` sont générées à partir du catalogue
`js/donnees-avatars.js` (avatars, tenues, apparence), avec la bibliothèque
[DiceBear](https://www.dicebear.com), style **avataaars** de
[Pablo Stanley](https://avataaars.com/), libre pour usage personnel et commercial.

```bash
cd tools/avatars
npm install
npm run generer
```

Ce dossier n'est utile qu'en développement : l'appli n'en dépend pas, elle
utilise les SVG déjà générés.

Après une modification, penser à incrémenter `VERSION` dans `sw.js`
pour que les téléphones téléchargent les nouvelles images.

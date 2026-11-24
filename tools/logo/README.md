# Icônes de l'appli

Le symbole Sport+ (« L'Élan », version A) est dessiné une seule fois dans
`assets/icons/logo.svg`. Ce script en tire toutes les icônes PNG :

```bash
node tools/logo/generer.js     # nécessite Playwright (npm install -g playwright)
```

| Fichier | Taille | Usage |
|---|---|---|
| `icon-192.png`, `icon-512.png` | 192, 512 | Icône de l'appli installée (coins arrondis) |
| `icon-maskable-512.png` | 512 | Android : fond plein, symbole dans la zone sûre |
| `apple-touch-icon.png` | 180 | iPhone : fond plein, iOS arrondit lui-même |
| `favicon-48.png` | 48 | Onglet du navigateur |

Après une modification, incrémenter `VERSION` dans `sw.js`.

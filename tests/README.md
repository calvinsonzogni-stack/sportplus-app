# Tests

Tests de bout en bout dans un vrai navigateur (Chromium, via Playwright).

```bash
npm install -g playwright      # une fois
npx playwright install chromium  # une fois (si Chromium n'est pas déjà là)
bash tests/lancer.sh
```

- `regression.test.js` : les parcours principaux (séance, records et pièces,
  poids du corps, bulle du max, minuteur de repos, reprise après rechargement,
  boutique, planning, historique, sauvegarde, animations, installation, hors ligne).
- `calendrier.test.js` : ajout des séances au calendrier (contenu du fichier .ics, lien
  Google Agenda, parcours sur ordinateur, iPhone et Android).
- `profil.test.js` : profil, pseudo, choix de la salle dans les classements.

Chaque ligne affiche `PASS` ou `FAIL`. Le script s'arrête en erreur si un test échoue.
Les captures d'écran vont dans un dossier temporaire (affiché à la fin).

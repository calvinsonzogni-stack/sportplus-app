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
- `profil.test.js` : profil, recherche de salle (OpenStreetMap **simulé**, donc
  sans dépendre du réseau) et classements.

Chaque ligne affiche `PASS` ou `FAIL`. Le script s'arrête en erreur si un test échoue.
Les captures d'écran vont dans un dossier temporaire (affiché à la fin).

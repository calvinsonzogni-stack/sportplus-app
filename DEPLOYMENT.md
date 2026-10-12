# Guide de déploiement sur Netlify 🚀

## Méthode 1 : Déploiement via GitHub (Recommandé)

### Étape 1 : Préparer le dépôt Git

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit - Sport+ application"
```

### Étape 2 : Créer un dépôt GitHub

1. Va sur [GitHub](https://github.com) et crée un nouveau dépôt
2. Nomme-le `sport-plus` (ou autre nom de ton choix)
3. Ne coche pas "Initialize with README" (on a déjà les fichiers)

### Étape 3 : Pousser le code sur GitHub

```bash
git remote add origin https://github.com/TON-USERNAME/sport-plus.git
git branch -M main
git push -u origin main
```

### Étape 4 : Déployer sur Netlify

1. Va sur [Netlify](https://www.netlify.com)
2. Clique sur "Add new site" > "Import an existing project"
3. Choisis "GitHub"
4. Sélectionne ton dépôt `sport-plus`
5. Configuration du build :
   - **Build command** : (laisser vide)
   - **Publish directory** : `/` ou `.`
6. Clique sur "Deploy site"

✅ Ton site sera en ligne en quelques secondes !

---

## Méthode 2 : Déploiement par glisser-déposer (Plus simple)

### Option A : Via l'interface Netlify

1. Va sur [Netlify](https://app.netlify.com/drop)
2. Glisse-dépose le dossier complet du projet
3. Ton site sera déployé instantanément !

### Option B : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Déployer
netlify deploy --prod
```

Suis les instructions à l'écran et sélectionne le dossier actuel.

---

## Configuration post-déploiement

### Personnaliser le nom du site

1. Va dans les paramètres du site sur Netlify
2. Section "Site details" > "Change site name"
3. Choisis un nom disponible (ex: `mon-sport-plus.netlify.app`)

### Ajouter un domaine personnalisé (Optionnel)

1. Section "Domain management"
2. "Add custom domain"
3. Suis les instructions pour configurer ton DNS

---

## Vérifications après déploiement

✅ **Checklist** :
- [ ] Page d'accueil charge correctement
- [ ] Navigation entre les pages fonctionne
- [ ] Les images s'affichent
- [ ] Le localStorage fonctionne (ajoute un exercice et vérifie)
- [ ] Les graphiques s'affichent sur la page Historique

---

## Résolution de problèmes

### Les images ne s'affichent pas
- Vérifie que le dossier `assets/images` est bien présent
- Vérifie les chemins dans le code (ils doivent être relatifs : `assets/images/...`)

### Une page renvoie 404
- Le site n'est pas une SPA : chaque page est un vrai fichier `.html`
- Vérifie que l'URL correspond bien à un fichier existant (ex : `/planning.html`)

### Le site ne se met pas à jour
- Va dans "Deploys" et déclenche un nouveau déploiement
- CSS et JS sont revalidés à chaque visite (voir `netlify.toml`) : un simple rechargement suffit

---

## Ressources utiles

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Netlify Support](https://answers.netlify.com/)

Bon déploiement ! 💪🚀

// ════════════════════════════════════════════════
//  SPORT+ — sauvegarde.js
//  Export / import de toutes les données de l'appli dans un fichier.
//  Tout vit dans le navigateur (localStorage) : sans sauvegarde, changer de
//  téléphone ou vider le cache efface l'historique.
//  Dépend de commun.js. Utilisé sur la page historique.
// ════════════════════════════════════════════════

(function () {
  const FORMAT = "sportplus-sauvegarde";
  const VERSION_FORMAT = 1;
  // Données de l'utilisateur. Les états temporaires (séance en cours, repos…)
  // ne sont volontairement pas sauvegardés.
  const CLES = ["historique", "perfs", "planning", "pseudo", "repos_duree", "data_version",
                "pieces", "pieces_journal", "avatars"];
  const CLE_DERNIER_EXPORT = "derniere_sauvegarde";
  // Contrôle du type de chaque donnée avant d'écrire quoi que ce soit
  const VALIDATEURS = {
    historique: v => Array.isArray(JSON.parse(v)),
    planning:   v => Array.isArray(JSON.parse(v)),
    perfs:      v => { const o = JSON.parse(v); return o !== null && typeof o === "object" && !Array.isArray(o); },
    pseudo:     v => v.length <= 100,
    repos_duree: v => Number.isFinite(JSON.parse(v)),
    data_version: v => Number.isFinite(JSON.parse(v)),
    pieces:     v => { const n = JSON.parse(v); return Number.isInteger(n) && n >= 0; },
    pieces_journal: v => Array.isArray(JSON.parse(v)),
    avatars:    v => { const o = JSON.parse(v); return o && typeof o.possedes === "object" && o.equipe && typeof o.equipe.perso === "string"; },
  };

  const statut = document.getElementById("sauvegarde-statut");
  const champFichier = document.getElementById("sauvegarde-fichier");

  function lireBrut(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }

  function majStatut() {
    const nbSeances = (lireStockage("historique", []) || []).length;
    const nbProgrammees = (lireStockage("planning", []) || []).length;
    const dernier = lireBrut(CLE_DERNIER_EXPORT);
    const dateTxt = dernier
      ? new Date(dernier).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : null;
    statut.textContent =
      `${nbSeances} séance(s) enregistrée(s), ${nbProgrammees} séance(s) programmée(s). ` +
      (dateTxt ? `Dernière sauvegarde : ${dateTxt}.` : "Aucune sauvegarde pour l'instant.");
  }

  function exporter() {
    const donnees = {};
    CLES.forEach(cle => {
      const v = lireBrut(cle);
      if (v !== null) donnees[cle] = v;
    });
    const contenu = JSON.stringify({ format: FORMAT, version: VERSION_FORMAT, date: new Date().toISOString(), donnees }, null, 2);
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([contenu], { type: "application/json" }));
    lien.download = `sportplus-sauvegarde-${todayStr()}.json`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(lien.href), 1000);

    try { localStorage.setItem(CLE_DERNIER_EXPORT, new Date().toISOString()); } catch (e) {}
    majStatut();
  }

  // Renvoie les données à écrire, ou lève une erreur au message lisible
  function valider(texte) {
    let fichier;
    try { fichier = JSON.parse(texte); } catch (e) { throw new Error("Ce fichier n'est pas une sauvegarde Sport+ (JSON illisible)."); }
    if (!fichier || fichier.format !== FORMAT || typeof fichier.donnees !== "object") {
      throw new Error("Ce fichier n'est pas une sauvegarde Sport+.");
    }
    if (fichier.version > VERSION_FORMAT) {
      throw new Error("Cette sauvegarde vient d'une version plus récente de Sport+.");
    }
    const aEcrire = {};
    for (const cle of CLES) {
      if (!(cle in fichier.donnees)) continue;
      const v = fichier.donnees[cle];
      let ok = false;
      try { ok = typeof v === "string" && VALIDATEURS[cle](v); } catch (e) { ok = false; }
      if (!ok) throw new Error(`Sauvegarde abîmée : la donnée « ${cle} » est invalide. Rien n'a été modifié.`);
      aEcrire[cle] = v;
    }
    if (!Object.keys(aEcrire).length) throw new Error("Cette sauvegarde est vide.");
    return { aEcrire, date: fichier.date };
  }

  function importer(fichier) {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      let resultat;
      try {
        resultat = valider(String(lecteur.result));
      } catch (e) {
        alert(e.message);
        return;
      }
      const nb = resultat.aEcrire.historique ? JSON.parse(resultat.aEcrire.historique).length : 0;
      const quand = resultat.date ? new Date(resultat.date).toLocaleDateString("fr-FR") : "date inconnue";
      if (!confirm(`Restaurer cette sauvegarde du ${quand} (${nb} séance(s)) ?\n\nTes données actuelles sur cet appareil seront remplacées.`)) return;

      // Copie de l'état actuel : en cas d'échec d'écriture, on le remet tel quel
      const avant = {};
      CLES.forEach(cle => { avant[cle] = lireBrut(cle); });
      try {
        CLES.forEach(cle => localStorage.removeItem(cle));
        Object.entries(resultat.aEcrire).forEach(([cle, v]) => localStorage.setItem(cle, v));
      } catch (e) {
        try {
          CLES.forEach(cle => avant[cle] === null ? localStorage.removeItem(cle) : localStorage.setItem(cle, avant[cle]));
        } catch (e2) {}
        alert("Impossible d'écrire les données sur cet appareil (stockage plein ou désactivé). Rien n'a été modifié.");
        return;
      }
      // Recharger : les migrations de commun.js s'appliquent aux données importées
      location.reload();
    };
    lecteur.onerror = () => alert("Impossible de lire ce fichier.");
    lecteur.readAsText(fichier);
  }

  document.getElementById("btn-exporter").addEventListener("click", exporter);
  document.getElementById("btn-importer").addEventListener("click", () => champFichier.click());
  champFichier.addEventListener("change", () => {
    if (champFichier.files[0]) importer(champFichier.files[0]);
    champFichier.value = "";
  });

  majStatut();
})();

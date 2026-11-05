// ════════════════════════════════════════════════
//  SPORT+ — installer.js
//  Carte « Installer Sport+ » de l'accueil : met l'appli sur l'écran
//  d'accueil du téléphone.
//  - Android / Chrome / Edge : ouvre la fenêtre d'installation du système ;
//  - iPhone / iPad : Apple ne permet pas d'installer depuis la page,
//    on affiche les gestes à faire (Partager → Sur l'écran d'accueil) ;
//  - autres navigateurs : indications via le menu du navigateur.
//  Masquée si l'appli est déjà installée ou si l'utilisateur l'a refusée.
// ════════════════════════════════════════════════

(function () {
  const CLE_MASQUE = "installation_masquee";
  const carte = document.getElementById("installer");
  const guide = document.getElementById("guide-install");
  if (!carte || !guide) return;

  let invite = null;   // événement beforeinstallprompt (Android / Chrome)

  const dejaInstallee = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const estIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);   // iPad récent
  const estMobile = () => /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) || estIOS();
  const masquee = () => { try { return localStorage.getItem(CLE_MASQUE) === "1"; } catch (e) { return false; } };

  function majCarte() {
    const pertinent = invite || estMobile();
    carte.classList.toggle("hidden", dejaInstallee() || masquee() || !pertinent);
  }

  function ouvrirGuide() {
    guide.querySelector("[data-guide='ios']").classList.toggle("hidden", !estIOS());
    guide.querySelector("[data-guide='autre']").classList.toggle("hidden", estIOS());
    guide.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    guide.querySelector(".guide-ok").focus();
  }

  function fermerGuide() {
    guide.classList.add("hidden");
    document.body.style.overflow = "";
    document.getElementById("btn-installer").focus();
  }

  // Chrome / Edge / Android : le navigateur propose l'installation
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    invite = e;
    majCarte();
  });

  window.addEventListener("appinstalled", () => {
    invite = null;
    carte.classList.add("hidden");
  });

  document.getElementById("btn-installer").addEventListener("click", async () => {
    if (!invite) { ouvrirGuide(); return; }
    invite.prompt();
    const { outcome } = await invite.userChoice;
    invite = null;
    if (outcome === "accepted") carte.classList.add("hidden");
  });

  document.getElementById("btn-installer-plus-tard").addEventListener("click", () => {
    try { localStorage.setItem(CLE_MASQUE, "1"); } catch (e) {}
    carte.classList.add("hidden");
  });

  guide.querySelector(".guide-ok").addEventListener("click", fermerGuide);
  guide.addEventListener("click", e => { if (e.target === guide) fermerGuide(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !guide.classList.contains("hidden")) fermerGuide();
  });

  majCarte();
})();

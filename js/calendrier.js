// ════════════════════════════════════════════════
//  SPORT+ — calendrier.js
//  Ajout des séances programmées au calendrier du téléphone :
//   - fichier iCalendar (.ics), compris par le calendrier Apple,
//     Google Agenda, Samsung, Outlook… ;
//   - lien « Google Agenda » pré-rempli pour Android.
//  Pas de rappel (choix de l'utilisateur), pas de synchronisation :
//  c'est un ajout ponctuel, l'appli n'a pas de serveur.
//  Sans effet de bord : utilisé par planning.js.
// ════════════════════════════════════════════════

const Calendrier = (function () {
  const DUREE_DEFAUT_MIN = 60;

  function plateforme() {
    const ua = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "autre";
  }

  // ── Dates ──
  const deux = n => String(n).padStart(2, "0");
  // "2026-11-25" → "20261125"
  const jourIcs = dateStr => dateStr.replace(/-/g, "");
  // Date locale → "20261125T183000" (heure « flottante » : celle du téléphone)
  const heureLocaleIcs = d =>
    `${d.getFullYear()}${deux(d.getMonth() + 1)}${deux(d.getDate())}T${deux(d.getHours())}${deux(d.getMinutes())}00`;
  const horodatageUtc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Début et fin d'une séance : heure précise si renseignée, sinon journée entière
  function bornes(entry) {
    if (entry.heure && /^\d{2}:\d{2}$/.test(entry.heure)) {
      const debut = new Date(`${entry.date}T${entry.heure}:00`);
      const duree = Number(entry.duree) > 0 ? Number(entry.duree) : DUREE_DEFAUT_MIN;
      return { journee: false, debut, fin: new Date(debut.getTime() + duree * 60000) };
    }
    const lendemain = new Date(entry.date + "T12:00:00");
    lendemain.setDate(lendemain.getDate() + 1);
    return { journee: true, debutJour: entry.date, finJour: dateVersStr(lendemain) };
  }

  function titre(entry) {
    return `Sport+ · ${entry.nom}`;
  }

  function description(entry) {
    const exos = entry.exercices || [];
    return exos.length ? `Exercices : ${exos.join(", ")}` : "Exercices libres";
  }

  // ── iCalendar (RFC 5545) ──
  // Échappement des textes : \ ; , et retours à la ligne
  const echapperIcs = t => String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

  // Lignes de 75 octets maximum, suite précédée d'un espace (sans couper un caractère)
  function plier(ligne) {
    const enc = new TextEncoder();
    if (enc.encode(ligne).length <= 75) return ligne;
    const morceaux = [];
    let courant = "", taille = 0, limite = 75;
    for (const car of ligne) {
      const t = enc.encode(car).length;
      if (taille + t > limite) {
        morceaux.push(courant);
        courant = ""; taille = 0; limite = 74; // la ligne suivante commence par un espace
      }
      courant += car; taille += t;
    }
    morceaux.push(courant);
    return morceaux.join("\r\n ");
  }

  function evenement(entry, maintenant) {
    const b = bornes(entry);
    const lignes = [
      "BEGIN:VEVENT",
      `UID:sportplus-${entry.id}@sportplus.app`,
      `DTSTAMP:${horodatageUtc(maintenant)}`,
      ...(b.journee
        ? [`DTSTART;VALUE=DATE:${jourIcs(b.debutJour)}`, `DTEND;VALUE=DATE:${jourIcs(b.finJour)}`]
        : [`DTSTART:${heureLocaleIcs(b.debut)}`, `DTEND:${heureLocaleIcs(b.fin)}`]),
      ...(entry.recurrence === "weekly" ? ["RRULE:FREQ=WEEKLY"] : []),
      `SUMMARY:${echapperIcs(titre(entry))}`,
      `DESCRIPTION:${echapperIcs(description(entry))}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ];
    return lignes;
  }

  function genererIcs(entries, maintenant = new Date()) {
    const lignes = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sport+//Planning//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...entries.flatMap(e => evenement(e, maintenant)),
      "END:VCALENDAR",
    ];
    return lignes.map(plier).join("\r\n") + "\r\n";
  }

  // ── Google Agenda ──
  function lienGoogle(entry) {
    const b = bornes(entry);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: titre(entry),
      details: description(entry),
      dates: b.journee
        ? `${jourIcs(b.debutJour)}/${jourIcs(b.finJour)}`
        : `${heureLocaleIcs(b.debut)}/${heureLocaleIcs(b.fin)}`,
    });
    if (!b.journee) {
      try { params.set("ctz", Intl.DateTimeFormat().resolvedOptions().timeZone); } catch (e) {}
    }
    if (entry.recurrence === "weekly") params.set("recur", "RRULE:FREQ=WEEKLY");
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  // ── Ouvrir le fichier .ics ──
  // iPhone : Safari affiche directement « Ajouter au calendrier ».
  // Ailleurs : téléchargement du fichier, que le calendrier ouvre.
  function ouvrirIcs(entries) {
    const ics = genererIcs(entries);
    if (plateforme() === "ios") {
      location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
      return;
    }
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = entries.length === 1
      ? `sport-plus-${entries[0].nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "seance"}.ics`
      : "sport-plus-seances.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return { plateforme, genererIcs, lienGoogle, ouvrirIcs };
})();

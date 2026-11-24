// Ajout des séances programmées au calendrier du téléphone (.ics + Google Agenda)
const { chromium } = require('playwright');
const fs = require('fs');
const B = process.env.SPORTPLUS_URL || 'http://localhost:8085/';
const OUT = process.env.SPORTPLUS_CAPTURES || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';

// Programme une séance le 15 du mois prochain via le formulaire du planning
async function programmer(p, { nom, heure, duree, hebdo }) {
  await p.click('#next-month');
  await p.locator('.cal-day:not(.cal-day-empty)', { hasText: /^\s*15\s*$/ }).click();
  await p.fill('#seance-nom', nom);
  if (heure) await p.fill('#seance-heure', heure);
  if (duree) await p.selectOption('#seance-duree', String(duree));
  if (hebdo) await p.click('.recurrence-btn[data-value="weekly"]');
  await p.click('#modal-exo-grid .modal-exo-card >> nth=0');
  await p.click('#modal-exo-grid .modal-exo-card >> nth=1');
  await p.click('#modal-create .modal-btn.primary');
}

(async () => {
  const b = await chromium.launch();

  // ── 1. Contenu du fichier .ics et du lien Google
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', acceptDownloads: true, timezoneId: 'Europe/Paris' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(B + 'planning.html');
  await p.evaluate(() => localStorage.clear());
  await p.reload();

  const r = await p.evaluate(() => {
    const hebdo = { id: 1, nom: 'Push, épaules; bras', date: '2026-12-01', heure: '18:30', duree: 90, recurrence: 'weekly',
      exercices: ['Développé Couché', 'Élévations Latérales', 'Dips Triceps', 'Curl Barre', 'Extension Poulie Haute', 'Squat Bulgare'] };
    const journee = { id: 2, nom: 'Jambes', date: '2026-12-31', heure: '', duree: 60, recurrence: 'once', exercices: [] };
    return {
      ics: Calendrier.genererIcs([hebdo, journee], new Date('2026-11-24T10:00:00Z')),
      g1: Calendrier.lienGoogle(hebdo), g2: Calendrier.lienGoogle(journee),
    };
  });
  const lignes = r.ics.split('\r\n');
  ok(r.ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n') && r.ics.endsWith('END:VCALENDAR\r\n') && !/[^\r]\n/.test(r.ics), 'ics: valid envelope, CRLF line endings');
  ok((r.ics.match(/BEGIN:VEVENT/g) || []).length === 2, 'ics: one event per session');
  ok(r.ics.includes('DTSTART:20261201T183000\r\nDTEND:20261201T200000'), 'ics: time and duration (18:30 + 1 h 30)');
  ok(r.ics.includes('RRULE:FREQ=WEEKLY'), 'ics: weekly session repeats every week');
  ok(r.ics.includes('DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101'), 'ics: no time → all-day event (year rollover ok)');
  ok(r.ics.includes('SUMMARY:Sport+ · Push\\, épaules\\; bras'), 'ics: title with escaped , and ;');
  ok(!r.ics.includes('VALARM'), 'ics: no reminder (as requested)');
  ok(r.ics.includes('UID:sportplus-1@sportplus.app'), 'ics: stable identifier per session');
  ok(lignes.every(l => new TextEncoder().encode(l).length <= 75) && lignes.some(l => l.startsWith(' ')), 'ics: long lines folded to 75 bytes');
  const deplie = r.ics.replace(/\r\n /g, '');
  ok(deplie.includes('DESCRIPTION:Exercices : Développé Couché\\, Élévations Latérales\\, Dips Triceps\\, Curl Barre\\, Extension Poulie Haute\\, Squat Bulgare'), 'ics: exercises in description, intact after unfolding');
  const u1 = new URL(r.g1), u2 = new URL(r.g2);
  ok(u1.host === 'calendar.google.com' && u1.searchParams.get('action') === 'TEMPLATE' && u1.searchParams.get('dates') === '20261201T183000/20261201T200000'
     && u1.searchParams.get('recur') === 'RRULE:FREQ=WEEKLY' && u1.searchParams.get('ctz') === 'Europe/Paris' && u1.searchParams.get('text') === 'Sport+ · Push, épaules; bras', 'Google link: title, time, time zone, weekly');
  ok(u2.searchParams.get('dates') === '20261231/20270101' && !u2.searchParams.has('recur') && !u2.searchParams.has('ctz'), 'Google link: all-day, one-off');

  // ── 2. Parcours sur ordinateur : programmer → proposition → fichier téléchargé
  await programmer(p, { nom: 'Push day', heure: '18:30', duree: 90, hebdo: true });
  ok(await p.locator('#modal-calendrier:not(.hidden)').count() === 1 && (await p.textContent('#calendrier-titre')).includes('Séance programmée'), 'after programming: calendar proposed');
  ok((await p.textContent('#calendrier-liste')).includes('18 h 30') && (await p.textContent('#calendrier-liste')).includes('chaque'), 'proposal shows time and weekly repetition');
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('planning'))[0]);
  ok(saved.heure === '18:30' && saved.duree === 90, 'time and duration saved with the session');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#calendrier-actions [data-action="ics"]')]);
  const f = OUT + '/seance.ics'; await dl.saveAs(f);
  const contenu = fs.readFileSync(f, 'utf8');
  ok(dl.suggestedFilename() === 'sport-plus-push-day.ics' && contenu.includes('SUMMARY:Sport+ · Push day') && contenu.includes('RRULE:FREQ=WEEKLY'), 'desktop: .ics file downloaded with the session');
  await p.waitForTimeout(400);
  ok(await p.locator('#modal-calendrier.hidden').count() === 1, 'window closes after adding');
  ok((await p.textContent('#liste-programmees')).includes('18 h 30'), 'planned list shows the time');
  ok(await p.locator('#btn-calendrier-tout.hidden').count() === 1, '"add all" hidden with a single session');

  // Deuxième séance : « Plus tard », puis « Tout ajouter »
  await p.goto(B + 'planning.html');
  await programmer(p, { nom: 'Jambes' });
  await p.click('#calendrier-plus-tard');
  ok(await p.locator('#btn-calendrier-tout:not(.hidden)').count() === 1, '"add all" shown with 2 sessions');
  await p.click('#btn-calendrier-tout');
  ok(await p.locator('#calendrier-liste .calendrier-item').count() === 2 && (await p.textContent('#calendrier-liste')).includes('journée entière'), '"add all": both sessions listed (no time → whole day)');
  const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#calendrier-actions [data-action="ics"]')]);
  const f2 = OUT + '/seances.ics'; await dl2.saveAs(f2);
  ok((fs.readFileSync(f2, 'utf8').match(/BEGIN:VEVENT/g) || []).length === 2, '"add all": one file with both sessions');
  // Bouton calendrier sur une carte
  await p.waitForTimeout(400);
  await p.click('#liste-programmees [aria-label^="Ajouter Jambes"] >> nth=0');
  ok(await p.locator('#calendrier-liste .calendrier-item').count() === 1 && (await p.textContent('#calendrier-titre')) === 'Ajouter à mon calendrier', 'calendar button on a planned session');
  await p.keyboard.press('Escape');
  ok(await p.locator('#modal-calendrier.hidden').count() === 1, 'Escape closes the window');
  await p.screenshot({ path: OUT + '/planning-calendrier.png' });
  ok(errs.length === 0, 'no page errors (' + errs.join(' | ') + ')');
  await ctx.close();

  // ── 3. iPhone : bouton « Ajouter au calendrier » (fichier .ics)
  const ios = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA_IPHONE });
  const qi = await ios.newPage();
  await qi.goto(B + 'planning.html');
  await qi.evaluate(() => localStorage.clear()); await qi.reload();
  await programmer(qi, { nom: 'Push day', heure: '07:15' });
  ok(await qi.evaluate(() => Calendrier.plateforme()) === 'ios', 'iPhone detected');
  ok((await qi.textContent('#calendrier-actions [data-action="ics"]')).trim() === 'Ajouter au calendrier' && await qi.locator('#calendrier-actions [data-action]').count() === 1 && await qi.locator('.btn-google').count() === 0, 'iPhone: single "Ajouter au calendrier" button (Apple calendar)');
  ok(await qi.getAttribute('#calendrier-actions .lien-test-calendrier', 'href') === 'test-calendrier.html', 'iPhone: link to the test page of other methods');
  // Le fichier servi par l'appli (service worker) : vraie adresse en text/calendar
  await qi.goto(B + 'test-calendrier.html');
  await qi.waitForFunction(() => !document.getElementById('etat').textContent.includes('Vérification'), null, { timeout: 15000 });
  const rep = await qi.evaluate(async () => { const h = document.getElementById('m-a').getAttribute('href'); const r = await fetch(h); return { ct: r.headers.get('Content-Type'), t: await r.text() }; });
  ok(rep.ct.startsWith('text/calendar') && rep.t.includes('SUMMARY:Sport+ · Test calendrier') && (await qi.textContent('#etat')).startsWith('✓'), 'test page: app serves a real calendar file');
  ok(await qi.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'iPhone: no horizontal overflow');
  await qi.screenshot({ path: OUT + '/calendrier-iphone.png' });
  await ios.close();

  // ── 4. Android : Google Agenda pré-rempli + fichier .ics en secours
  const and = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block', userAgent: UA_ANDROID });
  const qa = await and.newPage();
  await qa.goto(B + 'planning.html');
  await qa.evaluate(() => localStorage.clear()); await qa.reload();
  await programmer(qa, { nom: 'Pull day', heure: '19:00', hebdo: true });
  const lien = await qa.getAttribute('#calendrier-actions a[data-action="google"]', 'href');
  ok(lien && new URL(lien).searchParams.get('text') === 'Sport+ · Pull day' && new URL(lien).searchParams.get('recur') === 'RRULE:FREQ=WEEKLY', 'Android: "Ajouter à Google Agenda" pre-filled');
  ok(await qa.locator('#calendrier-actions [data-action="ics"]').count() === 1, 'Android: .ics file for other calendars');
  ok(await qa.getAttribute('#calendrier-actions a[data-action="google"]', 'target') === '_blank', 'Google Agenda opens outside the app');
  await qa.screenshot({ path: OUT + '/calendrier-android.png' });
  await and.close();

  await b.close();
})();

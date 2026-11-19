// Régression : parcours principaux de l'appli, de bout en bout.
// À lancer après chaque modification (voir tests/README.md).
const { chromium } = require('playwright');
const fs = require('fs');
const B = process.env.SPORTPLUS_URL || 'http://localhost:8085/';
const OUT = process.env.SPORTPLUS_CAPTURES || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const jour = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const PAGES = ['index', 'seance', 'planning', 'historique', 'boutique', 'profil', 'exercices', 'perfs'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [], bad = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('response', r => r.status() >= 400 && bad.push(r.status() + ' ' + decodeURIComponent(r.url())));
  p.on('dialog', d => d.accept());
  const solde = () => p.evaluate(() => Pieces.solde());
  const passerRepos = () => p.click('#btn-repos-passer').catch(() => {});

  // ── 1. Toutes les pages : chargement, barre d'onglets, pas de débordement
  await p.goto(B + 'index.html'); await p.evaluate(() => localStorage.clear());
  for (const pg of PAGES) {
    await p.goto(B + pg + '.html');
    const debord = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(debord <= 0 && await p.locator('#nav a').count() === 5, `${pg}: loads, 5 tabs, no horizontal overflow`);
  }
  const nav = await p.locator('#nav').boundingBox();
  ok(nav.y + nav.height >= 843, 'mobile tab bar pinned to the bottom');

  // ── 2. Données de départ (migration, bonus)
  await p.goto(B + 'index.html');
  await p.evaluate(({ j1, j2, j3 }) => {
    localStorage.clear();
    localStorage.setItem('perfs', JSON.stringify({ 'Squat': '80', 'Pompes': '10' }));
    localStorage.setItem('historique', JSON.stringify([
      { date: j3, duree: 600, exercices: [{ nom: 'Squat', muscle: 'jambes', series: [{ reps: 8, charge: 80 }], chargeMax: 80 }] },
      { date: j2, duree: 600, exercices: [{ nom: 'Pompes', muscle: 'pectoraux', series: [{ reps: 20, charge: 0 }], chargeMax: 0 }] },
      { date: j1, duree: 600, exercices: [{ nom: 'Squat', muscle: 'jambes', series: [{ reps: 5, charge: 80 }], chargeMax: 80 }] },
    ]));
  }, { j1: jour(0).toISOString(), j2: jour(-1).toISOString(), j3: jour(-2).toISOString() });
  await p.reload();
  ok(await solde() === 190, 'welcome bonus: 100 + 3 past sessions × 30');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('perfs'))['Pompes']) === '20', 'migration: bodyweight perf = max reps from history');
  ok((await p.textContent('#stat-serie')) === '3', 'home: 3 consecutive days');

  // ── 3. Séance complète
  await p.goto(B + 'seance.html');
  await p.click('.exo-card[data-nom="Squat"]');
  await p.click('.exo-card[data-nom="Pompes"]');
  ok(await p.$eval('.exo-card[data-nom="Pompes"] .anim-exo, .exo-card[data-nom="Pompes"] img', () => true), 'selection grid shows exercise images');
  await p.click('#btn-letsgo');
  ok((await p.textContent('#exo-card-0 .bulle-record')).includes('Ton max : 80 kg'), 'record bubble: "Ton max : 80 kg"');
  ok(await p.locator('#exo-card-1 .charge-input').count() === 0, 'bodyweight exercise: no load column');
  // Série au-dessus du record → +25
  await p.fill('#serie-row-0-0 .reps-input', '6');
  await p.fill('#serie-row-0-0 .charge-input', '85');
  await p.click('#serie-row-0-0 .btn-valider-serie');
  ok(await solde() === 215 && (await p.textContent('.gain-pop')).includes('Squat : 85 kg'), 'record beaten: +25 coins with animation');
  ok((await p.textContent('#exo-card-0 .bulle-record')).includes('Nouveau max : 85 kg'), 'bubble turns into "Nouveau max"');
  ok(await p.locator('#repos-bar:not(.hidden)').count() === 1, 'rest timer starts after a set');
  await passerRepos();
  ok(await p.locator('#repos-bar.hidden').count() === 1, 'rest timer: "Passer" stops it');
  // Poids du corps : record en reps
  await p.fill('#serie-row-1-0 .reps-input', '22');
  await p.click('#serie-row-1-0 .btn-valider-serie');
  ok(await solde() === 240 && (await p.textContent('.gain-pop')).includes('Pompes : 22 reps'), 'bodyweight record in reps: +25');
  // Rechargement : la séance reprend
  await p.reload();
  ok(await p.locator('#step-seance:not(.hidden)').count() === 1 && (await p.inputValue('#serie-row-0-0 .charge-input')) === '85', 'session restored after reload');
  await passerRepos();
  // Démo animée
  await p.click('#exo-card-1 .exo-vignette');
  ok(await p.locator('#modal-demo:not(.hidden)').count() === 1, 'exercise demo opens from thumbnail');
  await p.keyboard.press('Escape');
  for (const i of [0, 1]) await p.click(`#btn-valider-${i}`);
  await p.waitForTimeout(600);
  await p.locator('.btn-douche').dblclick();
  await p.waitForTimeout(800);
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('historique')).length) === 4, 'session saved once (double tap guarded)');
  ok(await solde() === 274 && (await p.textContent('#modal-gain')).includes('+34'), 'end of session: 30 + 2 × 2 sets = +34');
  await p.screenshot({ path: OUT + '/regression-fin.png' });

  // ── 4. Historique
  await p.goto(B + 'historique.html');
  ok((await p.textContent('#streak')) === '3' && await p.locator('.seance-card').count() === 4, 'history: streak and list');
  ok((await p.locator('.record-card', { hasText: 'Pompes' }).textContent()).includes('22 reps'), 'bodyweight record shown in reps');
  ok(await p.evaluate(() => typeof Chart !== 'undefined'), 'charts library loaded locally');

  // ── 5. Boutique
  await p.goto(B + 'boutique.html');
  await p.click('.carte[data-perso="coach"]');
  await p.click('#fiche-action');
  ok(await solde() === 274, 'shop: first tap only asks confirmation');
  await p.click('#fiche-action');
  ok(await solde() === 124 && await p.evaluate(() => Collection.equipe().perso) === 'coach', 'shop: purchase confirmed and equipped');
  await p.keyboard.press('Escape');

  // ── 6. Planning
  await p.goto(B + 'planning.html');
  await p.evaluate(d => localStorage.setItem('planning', JSON.stringify([{ id: 9, nom: 'Push', date: d, exercices: ['Pompes', 'Dips Triceps'], recurrence: 'weekly' }])), dateStr(jour(-70)));
  await p.reload();
  ok(await p.locator('.programmee-card').count() === 8, 'planning: weekly session keeps 8 upcoming dates');
  await p.click('.programmee-today .btn-lancer');
  await p.waitForURL(/seance/);
  ok((await p.textContent('#selection-count')) === '2', 'launch from planning preselects its exercises');

  // ── 7. Sauvegarde (export → import)
  await p.goto(B + 'historique.html');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#btn-exporter')]);
  const f = OUT + '/regression-sauvegarde.json'; await dl.saveAs(f);
  await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.setInputFiles('#sauvegarde-fichier', f);
  await p.waitForLoadState('load'); await p.waitForTimeout(600);
  ok(await solde() === 124 && await p.evaluate(() => JSON.parse(localStorage.getItem('historique')).length) === 4, 'backup: export then import restores everything');

  // ── 8. Animation et accessibilité
  await p.goto(B + 'seance.html');
  await p.evaluate(() => localStorage.removeItem('seance_preloaded'));
  await p.reload();
  const sel = '.exo-card[data-nom="Chest Press (machine)"]';
  await p.click(sel);
  ok(await p.$eval(sel + ' .anim-frame2', el => getComputedStyle(el).animationName) === 'mouvementExo', 'selected exercise animates');
  await p.emulateMedia({ reducedMotion: 'reduce' });
  ok(await p.$eval(sel + ' .anim-frame2', el => getComputedStyle(el).animationName) === 'none', 'reduced motion respected');
  await p.emulateMedia({ reducedMotion: 'no-preference' });

  ok(bad.length === 0, 'no missing file (' + bad.slice(0, 3).join(', ') + ')');
  ok(errs.length === 0, 'no page error (' + errs.slice(0, 2).join(' | ') + ')');
  await ctx.close();

  // ── 9. Installation (iPhone) et hors ligne
  const iphone = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' });
  const ip = await iphone.newPage();
  await ip.goto(B + 'index.html');
  await ip.click('#btn-installer');
  ok(await ip.locator('#guide-install:not(.hidden) [data-guide="ios"]:not(.hidden)').count() === 1, 'iPhone: install guide');
  await iphone.close();

  const hl = await b.newContext({ viewport: { width: 390, height: 844 } });
  const q = await hl.newPage();
  await q.goto(B + 'index.html');
  await q.evaluate(async () => { await navigator.serviceWorker.ready; });
  await q.waitForTimeout(3000);
  await hl.setOffline(true);
  let horsLigne = true;
  for (const pg of PAGES) { await q.goto(B + pg + '.html'); horsLigne = horsLigne && (await q.title()).startsWith('Sport+'); }
  ok(horsLigne, 'offline: every page opens without network');
  await b.close();
})();

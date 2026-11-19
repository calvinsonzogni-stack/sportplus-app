// Profil : pseudo, choix de la salle parmi les plus grandes enseignes
const { chromium } = require('playwright');
const fs = require('fs');
const B = process.env.SPORTPLUS_URL || 'http://localhost:8085/';
const OUT = process.env.SPORTPLUS_CAPTURES || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [], externes = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  p.on('request', r => { if (!r.url().startsWith(B)) externes.push(r.url()); });
  const salle = () => p.evaluate(() => JSON.parse(localStorage.getItem('salle')));
  const ligne = nom => p.locator('#classement .classement-ligne').filter({ has: p.locator('.classement-nom', { hasText: nom }) });

  await p.goto(B + 'index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
  ok((await p.textContent('#profil-salle')).includes('Choisir ma salle'), 'home: "Choisir ma salle" when none chosen');
  await p.click('#profil-salle');
  await p.waitForURL(/profil\.html/);

  // ── Classements
  ok(await p.locator('.onglet.active').getAttribute('data-classement') === 'france', 'France ranking shown first');
  ok(await p.locator('#classement .classement-ligne').count() === 10 && (await p.textContent('#classement li >> nth=0')).includes('900 clubs'), 'France: 10 chains, Basic-Fit 900 clubs first');
  ok((await p.textContent('#classement-critere')).includes('nombre de clubs') && (await p.textContent('#classement-critere')).includes('Touche ton enseigne'), 'criterion and how to choose explained');
  ok((await p.textContent('#classement-sources')).includes('Liberfit'), 'France ranking cites its sources');
  await p.click('.onglet[data-classement="monde"]');
  ok(await p.locator('#classement .classement-ligne').count() === 10 && (await p.textContent('#classement li >> nth=0')).includes('20,8 M adhérents'), 'world: 10 chains, Planet Fitness 20,8 M first');
  ok((await p.textContent('#classement-sources')).includes("Men's Fitness"), 'world ranking cites its source');
  ok(await p.locator('#btn-autour, #form-ville, #resultats').count() === 0, 'no location search any more');

  // ── Pseudo
  await p.fill('#champ-pseudo', 'Calvin'); await p.click('#form-pseudo button');
  ok(await p.evaluate(() => localStorage.getItem('pseudo')) === 'Calvin', 'pseudo saved from profile');

  // ── Choix dans le classement France
  await p.click('.onglet[data-classement="france"]');
  await ligne("L'Orange Bleue").click();
  let s = await salle();
  ok(s.nom === "L'Orange Bleue" && s.enseigne === "L'Orange Bleue", 'tap a chain: saved as my gym');
  ok((await p.textContent('#salle-actuelle')).includes("L'Orange Bleue") && (await p.textContent('#salle-actuelle')).includes('n°2 en France'), 'current gym shown with its rank');
  ok(await p.locator('#classement .classement-ligne.mienne').count() === 1 && (await ligne("L'Orange Bleue").getAttribute('aria-pressed')) === 'true', 'chosen line marked (visually and for screen readers)');
  await p.screenshot({ path: OUT + '/profil-france.png' });

  // ── Changer pour une chaîne présente dans les deux classements
  await ligne('Basic-Fit').click();
  ok((await salle()).nom === 'Basic-Fit' && await p.locator('#classement .mienne').count() === 1, 'changing gym replaces the previous one');
  await p.click('.onglet[data-classement="monde"]');
  ok(await ligne('Basic-Fit').evaluate(el => el.classList.contains('mienne')), 'same chain highlighted in the world ranking');

  // ── Choix dans le classement mondial
  await ligne('Planet Fitness').click();
  ok((await salle()).nom === 'Planet Fitness' && (await p.textContent('#salle-actuelle')).includes('n°1 mondial'), 'choose from world ranking: rank shown');

  // ── Saisie manuelle (enseigne reconnue → groupe surligné)
  await p.click('.manuel summary'); await p.fill('#champ-manuel', 'McFit Berlin'); await p.click('#form-manuel button');
  s = await salle();
  ok(s.nom === 'McFit Berlin' && s.enseigne === 'McFit', 'manual entry recognises the chain');
  ok(await ligne('RSG Group').evaluate(el => el.classList.contains('mienne')), 'its group (RSG) highlighted in the world ranking');
  await p.click('.manuel summary'); await p.fill('#champ-manuel', '<img src=x onerror="window.__xss=1">Club'); await p.click('#form-manuel button');
  ok(await p.evaluate(() => window.__xss) === undefined && (await p.textContent('#salle-actuelle')).includes('<img'), 'manual name escaped (no injection)');
  await p.click('.manuel summary'); await p.fill('#champ-manuel', 'Keepcool Nîmes Gare'); await p.click('#form-manuel button');

  // ── Retirer
  await p.click('#btn-retirer-salle');
  ok(await salle() === null && await p.locator('#classement .mienne').count() === 0, 'remove gym');
  await p.click('.onglet[data-classement="france"]');
  await ligne('Keepcool').click();

  // ── Accueil et sauvegarde
  await p.goto(B + 'index.html');
  ok((await p.textContent('#profil-salle')).includes('Keepcool'), 'home shows the chosen gym');
  await p.goto(B + 'historique.html');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#btn-exporter')]);
  const f = OUT + '/sauvegarde.json'; await dl.saveAs(f);
  ok(JSON.parse(JSON.parse(fs.readFileSync(f, 'utf8')).donnees.salle).nom === 'Keepcool', 'backup includes the gym');

  // ── Mise en page, confidentialité
  await p.goto(B + 'profil.html');
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no horizontal overflow on profile (390 px)');
  await p.setViewportSize({ width: 320, height: 700 });
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no horizontal overflow at 320 px');
  await p.screenshot({ path: OUT + '/profil-320.png', fullPage: true });
  ok(externes.length === 0, 'no request leaves the site (' + externes.slice(0, 2).join(', ') + ')');
  ok(errs.length === 0, 'no page errors (' + errs.slice(0, 2).join(' | ') + ')');
  await b.close();
})();

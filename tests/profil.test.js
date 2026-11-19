// Profil : salle de sport (recherche OpenStreetMap simulée) + classements.
// Les appels à OpenStreetMap sont simulés (page.route) : le test ne dépend pas du réseau.
const { chromium } = require('playwright');
const fs = require('fs');
const B = process.env.SPORTPLUS_URL || 'http://localhost:8085/';
const OUT = process.env.SPORTPLUS_CAPTURES || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const NIMES = { latitude: 43.8367, longitude: 4.3601 };
const OVERPASS = { elements: [
  { type: 'node', id: 1, lat: 43.8380, lon: 4.3610, tags: { leisure: 'fitness_centre', name: 'Basic-Fit Nîmes Centre', brand: 'Basic-Fit', 'addr:housenumber': '12', 'addr:street': 'Boulevard Victor Hugo', 'addr:postcode': '30000', 'addr:city': 'Nîmes' } },
  { type: 'way', id: 2, center: { lat: 43.8381, lon: 4.3611 }, tags: { leisure: 'fitness_centre', name: 'Basic-Fit Nîmes Centre' } },          // doublon (bâtiment)
  { type: 'way', id: 3, center: { lat: 43.8200, lon: 4.3900 }, tags: { leisure: 'fitness_centre', name: 'Fitness Park Nîmes', 'addr:city': 'Nîmes' } },
  { type: 'node', id: 4, lat: 43.8370, lon: 4.3605, tags: { leisure: 'fitness_centre', name: 'Gym Club du Gard' } },                         // la plus proche, indépendante
  { type: 'node', id: 5, lat: 43.8500, lon: 4.3400, tags: { leisure: 'fitness_centre', name: "L'Orange Bleue Nîmes Ouest" } },
  { type: 'node', id: 6, lat: 43.8450, lon: 4.3700, tags: { leisure: 'fitness_centre' } },                                                    // sans nom : ignorée
  { type: 'node', id: 7, lat: 43.8300, lon: 4.3500, tags: { leisure: 'fitness_centre', name: '<img src=x onerror="window.__xss=1">Salle Pirate' } },
  { type: 'node', id: 8, lat: 43.8600, lon: 4.3200, tags: { leisure: 'sports_centre', sport: 'fitness', name: 'Anytime Fitness Nîmes' } },
]};

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', geolocation: NIMES, permissions: ['geolocation'], acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  let overpassMode = 'ok', overpassAppels = 0, nominatimQ = null;
  await ctx.route('**/api/interpreter', route => {
    overpassAppels++;
    if (overpassMode === 'panne') return route.fulfill({ status: 504, body: 'timeout' });
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(OVERPASS) });
  });
  await ctx.route('**/nominatim.openstreetmap.org/**', route => {
    nominatimQ = new URL(route.request().url()).searchParams.get('q');
    const trouve = nominatimQ.toLowerCase().includes('nîmes');
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(trouve ? [{ lat: '43.8367', lon: '4.3601', name: 'Nîmes' }] : []) });
  });

  await p.goto(B + 'index.html'); await p.evaluate(() => localStorage.clear()); await p.reload();
  ok((await p.textContent('#profil-salle')).includes('Choisir ma salle'), 'home: "Choisir ma salle" when none chosen');
  await p.click('#profil-salle');
  await p.waitForURL(/profil\.html/);

  // ── Classements
  ok(await p.locator('#classement .classement-ligne').count() === 10, 'world ranking: 10 chains');
  ok((await p.textContent('#classement .classement-ligne >> nth=0')).includes('Planet Fitness') && (await p.textContent('#classement .classement-ligne >> nth=0')).includes('20,8 M adhérents'), 'world #1: Planet Fitness, 20,8 M members');
  ok((await p.textContent('#classement-sources')).includes("Men's Fitness"), 'world ranking cites its source');
  await p.click('.onglet[data-classement="france"]');
  ok(await p.locator('#classement .classement-ligne').count() === 10 && (await p.textContent('#classement .classement-ligne >> nth=0')).includes('900 clubs'), 'France ranking: 10 chains, Basic-Fit 900 clubs first');
  ok((await p.textContent('#classement-critere')).includes('nombre de clubs'), 'France ranking explains its criterion');
  await p.screenshot({ path: OUT + '/classement.png', fullPage: false });

  // ── Pseudo
  await p.fill('#champ-pseudo', 'Calvin'); await p.click('#form-pseudo button');
  ok(await p.evaluate(() => localStorage.getItem('pseudo')) === 'Calvin', 'pseudo saved from profile');

  // ── Autour de moi
  await p.click('#btn-autour');
  await p.waitForSelector('#resultats .carte-salle');
  const noms = await p.$$eval('#resultats .carte-salle-nom', els => els.map(e => e.textContent.trim()));
  ok(noms.length === 6, `6 gyms listed (duplicate and unnamed removed): ${noms.length}`);
  ok(noms[0] === 'Gym Club du Gard', 'sorted by distance: closest first');
  ok(await p.evaluate(() => window.__xss) === undefined && noms.some(n => n.includes('<img')), 'gym names from the map are escaped (no injection)');
  ok((await p.textContent('#resultats')).includes('Basic-Fit · n°1 en France') && (await p.textContent('#resultats')).includes('Anytime Fitness · n°3 mondial'), 'chains recognised with their rank');
  ok((await p.textContent('#resultats')).includes('12 Boulevard Victor Hugo, 30000 Nîmes'), 'address shown');
  await p.click('.tri-btn[data-tri="enseigne"]');
  const noms2 = await p.$$eval('#resultats .carte-salle-nom', els => els.map(e => e.textContent.trim()));
  ok(noms2[0] === 'Basic-Fit Nîmes Centre' && noms2[1] === 'L\'Orange Bleue Nîmes Ouest' && noms2[2] === 'Fitness Park Nîmes', 'sort "plus grandes enseignes": Basic-Fit, L\'Orange Bleue, Fitness Park first');
  await p.screenshot({ path: OUT + '/resultats.png' });

  // Choisir sa salle
  await p.locator('#resultats .carte-salle', { hasText: 'Basic-Fit Nîmes Centre' }).locator('.btn-choisir').click();
  const salle = await p.evaluate(() => JSON.parse(localStorage.getItem('salle')));
  ok(salle.nom === 'Basic-Fit Nîmes Centre' && salle.enseigne === 'Basic-Fit' && salle.osm === 'node/1', 'gym saved in profile');
  ok((await p.textContent('#salle-actuelle')).includes('Basic-Fit Nîmes Centre') && await p.locator('#resultats .ma-salle').count() === 1, 'current gym shown and marked in list');
  await p.click('.onglet[data-classement="france"]');
  ok(await p.locator('#classement .classement-ligne.mienne', { hasText: 'Basic-Fit' }).count() === 1, 'ranking highlights "Ta salle"');
  await p.screenshot({ path: OUT + '/ma-salle.png' });

  // ── Recherche par ville + erreurs
  await p.fill('#champ-ville', 'Nîmes'); await p.click('#form-ville button');
  await p.waitForFunction(() => document.querySelector('#recherche-statut').textContent.includes('autour de Nîmes'));
  ok(nominatimQ === 'Nîmes' && await p.locator('#resultats .carte-salle').count() === 6, 'city search works');
  await p.fill('#champ-ville', 'Zzzville'); await p.click('#form-ville button');
  await p.waitForFunction(() => document.querySelector('#recherche-statut').textContent.includes('introuvable'));
  ok(true, 'unknown city: clear message');
  overpassMode = 'panne'; overpassAppels = 0;
  await p.click('#btn-autour');
  await p.waitForFunction(() => document.querySelector('#recherche-statut').textContent.includes('ne répond pas'));
  ok(overpassAppels === 2, 'map service down: backup server tried, then clear error');
  overpassMode = 'ok';

  // Saisie manuelle
  await p.click('.manuel summary'); await p.fill('#champ-manuel', 'Keepcool Nîmes Gare'); await p.click('#form-manuel button');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('salle')).enseigne) === 'Keepcool', 'manual entry recognises the chain');

  // ── Localisation refusée
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const q = await ctx2.newPage();
  await q.goto(B + 'profil.html');
  await q.evaluate(() => { navigator.geolocation.getCurrentPosition = (ok, err) => err({ code: 1 }); });
  await q.click('#btn-autour');
  ok((await q.textContent('#recherche-statut')).includes('chercher par ville'), 'location refused: suggests city search');
  await ctx2.close();

  // ── Accueil et sauvegarde
  await p.goto(B + 'index.html');
  ok((await p.textContent('#profil-salle')).includes('Keepcool Nîmes Gare'), 'home shows the chosen gym');
  await p.goto(B + 'historique.html');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#btn-exporter')]);
  const f = OUT + '/sauvegarde.json'; await dl.saveAs(f);
  ok(JSON.parse(JSON.parse(fs.readFileSync(f, 'utf8')).donnees.salle).nom === 'Keepcool Nîmes Gare', 'backup includes the gym');

  // ── Mise en page
  await p.goto(B + 'profil.html');
  ok(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, 'no horizontal overflow on profile (390 px)');
  const vraies = errs.filter(e => !e.includes('status of 504'));  // 504 = panne simulée volontairement
  ok(vraies.length === 0, 'no page errors (' + vraies.slice(0, 2).join(' | ') + ')');
  await b.close();
})();

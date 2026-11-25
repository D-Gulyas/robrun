// Aktualisiert data/map-data.js aus der öffentlichen Wiki-Seite.
// Nutzung:  node tools/update-data.mjs            (lädt die Seite live)
//           node tools/update-data.mjs page.html  (liest eine gespeicherte Seite)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://wikily.gg/rob-run/interactive-map';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const html = process.argv[2]
  ? fs.readFileSync(process.argv[2], 'utf8')
  : await (await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 robrun-map-updater' } })).text();

// Next.js-Flight-Daten zusammensetzen
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
let all = '', m;
while ((m = re.exec(html))) all += JSON.parse(m[1]);
if (!all) throw new Error('Keine Kartendaten gefunden – hat sich die Seite geändert?');

function getRow(id) {
  let p = all.search(new RegExp('(?<![0-9a-f])' + id + ':T[0-9a-f]+,'));
  let key = id + ':';
  if (p < 0) { key = '\n' + id + ':'; p = all.indexOf(key); }
  if (p < 0) return null;
  const s = p + key.length;
  if (all[s] === 'T') {
    const c = all.indexOf(',', s);
    const len = parseInt(all.slice(s + 1, c), 16);
    return Buffer.from(all.slice(c + 1, c + 1 + len + 200), 'utf8').subarray(0, len).toString('utf8');
  }
  const e = all.indexOf('\n', s);
  return all.slice(s, e < 0 ? undefined : e);
}

const anchor = all.indexOf('"points":{"names"');
let props = null;
for (let s = anchor; s > 0 && !props; s--) {
  if (all[s] !== '{') continue;
  let depth = 0, inStr = false, esc = false, e = -1;
  for (let k = s; k < all.length; k++) {
    const c = all[k];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true; else if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { e = k; break; } }
  }
  if (e > anchor) { try { const o = JSON.parse(all.slice(s, e + 1)); if (o.points) props = o; } catch { /* weiter */ } }
}
if (!props) throw new Error('Marker-Objekt nicht gefunden');

const H = props.height;
const P = props.points;
const col = c => (Array.isArray(c) ? i => c[i] : i => c.values[c.index ? c.index[i] : i]);
const F = Object.fromEntries(Object.keys(P).map(k => [k, col(P[k])]));
const r1 = v => Math.round(v * 10) / 10;

const popups = {};
const points = [];
for (let i = 0; i < P.x.length; i++) {
  let pop = F.popupData(i);
  if (typeof pop === 'string' && /^\$[0-9a-f]+$/.test(pop)) {
    const ref = pop.slice(1);
    if (!(ref in popups)) {
      const raw = JSON.parse(getRow(ref));
      popups[ref] = (raw.counts || []).map(c => [c.name, c.quantity]);
    }
    pop = ref;
  } else pop = undefined;
  const cat = F.categories(i);
  points.push({
    id: `${cat}-${F.ordinals(i)}`,
    c: cat,
    n: F.names(i),
    x: r1(F.x(i)),
    y: r1(H - F.y(i)), // Wiki zählt y von unten, wir von oben
    s: F.sublabels(i) || undefined,
    d: F.descriptions(i) || undefined,
    w: F.hrefs(i) ? 'https://wikily.gg' + F.hrefs(i) : undefined,
    p: pop,
  });
}

const data = {
  source: SOURCE,
  updated: new Date().toISOString().slice(0, 10),
  size: props.width,
  areas: props.labels.map(l => ({ t: l.text, x: l.x, y: r1(H - l.y) })),
  categories: props.categories.map(c => ({ slug: c.slug, en: c.label, group: c.group, hidden: !!c.defaultHidden })),
  popups,
  points,
};
const out = path.join(root, 'data', 'map-data.js');
fs.writeFileSync(out, '/* Automatisch erzeugt von tools/update-data.mjs – nicht von Hand bearbeiten. */\nwindow.MAP_DATA = ' + JSON.stringify(data) + ';\n');
console.log(`OK: ${points.length} Marker, ${data.categories.length} Kategorien, ` +
  `${points.filter(p => p.c === 'trash').length} Mülltonnen -> ${path.relative(root, out)}`);

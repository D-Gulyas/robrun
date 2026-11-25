/* ROB RUN – Interaktive Karte von Looty Bay */
(() => {
  'use strict';

  const D = window.MAP_DATA;
  const T = window.I18N;
  const SCALE = D.size / 512;           // Pixel der Originalkarte pro Karteneinheit (Zoom 0)
  const GROUP_ORDER = ['Places', 'Services', 'Security and clans', 'Containers', 'Loot spots'];
  const TRASH = 'trash';

  // ---------- Hilfsfunktionen ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, def) { try { const v = localStorage.getItem('rr.' + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) { try { localStorage.setItem('rr.' + k, JSON.stringify(v)); } catch { /* privat-Modus */ } },
  };
  const toLatLng = (x, y) => L.latLng(-y / SCALE, x / SCALE);
  const fromLatLng = ll => ({ x: Math.round(ll.lng * SCALE), y: Math.round(-ll.lat * SCALE) });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // ---------- Kategorien ----------
  const cats = {};
  for (const c of D.categories) {
    const [de, icon, color, collectible] = T.categories[c.slug] || [c.en, '📍', '#9fb'];
    cats[c.slug] = { ...c, de, icon, color, collectible: !!collectible, markers: [], layer: L.layerGroup() };
  }

  // ---------- Zustand ----------
  const defaults = D.categories.filter(c => !c.hidden).map(c => c.slug).concat(TRASH);
  const enabled = new Set(store.get('cats', defaults));
  const done = new Set(store.get('done', []));
  let hideDone = store.get('hideDone', false);
  let route = null;                      // { ids: [...], line }
  const routeOrder = new Map();
  let focusId = null;

  // ---------- Karte ----------
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0, maxZoom: 6, zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 90,
    zoomControl: false, attributionControl: true,
    maxBounds: L.latLngBounds([[-512 - 80, -80], [80, 512 + 80]]), maxBoundsViscosity: 0.8,
  });
  map.attributionControl.setPrefix(false).addAttribution('Kartendaten: <a href="' + esc(D.source) + '" target="_blank" rel="noopener">wikily.gg</a> · Karte © ROB RUN');

  L.tileLayer('tiles/{z}/{x}/{y}.webp', {
    tileSize: 512, minNativeZoom: 0, maxNativeZoom: 3, noWrap: true,
    bounds: L.latLngBounds([[-512, 0], [0, 512]]),
  }).addTo(map);

  const cityBounds = L.latLngBounds(D.points.map(p => toLatLng(p.x, p.y))).pad(0.08);
  map.fitBounds(cityBounds);

  // Viertel-Namen
  const areaLayer = L.layerGroup(D.areas.map(a => L.marker(toLatLng(a.x, a.y), {
    interactive: false, keyboard: false,
    icon: L.divIcon({ className: 'area-label', html: esc(a.t), iconSize: null }),
  }))).addTo(map);

  // ---------- Marker ----------
  const byId = new Map();

  function pinClass(m) {
    const c = cats[m.c];
    const cls = ['pin'];
    if (m.c === TRASH) cls.push('trash');
    else if (c.group === 'Places') cls.push('place');
    else if (m.c === 'cupboard') cls.push('small');
    if (done.has(m.id)) cls.push('done');
    if (focusId === m.id) cls.push('focus');
    return cls.join(' ');
  }
  function makeIcon(m) {
    const c = cats[m.c];
    const n = routeOrder.get(m.id);
    return L.divIcon({
      className: 'pin-wrap', iconSize: [0, 0],
      html: `<div class="${pinClass(m)}" style="--c:${c.color}" title="${esc(m.title)}">${c.icon}${n ? `<span class="order">${n}</span>` : ''}</div>`,
    });
  }
  const refreshIcon = m => m.marker.setIcon(makeIcon(m));

  for (const p of D.points) {
    const c = cats[p.c];
    if (!c) continue;
    const m = {
      ...p,
      title: T.names[p.n] || p.n,
      cat: c,
    };
    m.marker = L.marker(toLatLng(p.x, p.y), { icon: makeIcon(m), riseOnHover: true, keyboard: true, title: m.title });
    m.marker.bindPopup(() => popupHtml(m), { maxWidth: 340, minWidth: 250, autoPanPaddingTopLeft: [40, 60], autoPanPaddingBottomRight: [70, 40] });
    m.marker.on('popupopen', () => { history.replaceState(null, '', '#m=' + m.id); });
    m.marker.on('popupclose', () => { if (location.hash === '#m=' + m.id) history.replaceState(null, '', location.pathname + location.search); });
    c.markers.push(m);
    byId.set(m.id, m);
  }
  // Mülltonnen nummerieren, damit man sie im Spiel/Chat benennen kann
  cats[TRASH].markers.forEach((m, i) => { m.title = `Mülltonne #${i + 1}`; m.no = i + 1; });

  function popupHtml(m) {
    const c = m.cat;
    const desc = m.d ? (T.descriptions[m.d] || m.d) : '';
    const tags = [];
    tags.push(`<span>${esc(T.groups[c.group]?.de || c.group)}</span>`);
    if (m.s) tags.push(`<span>${esc(T.sublabels[m.s] || m.s)}</span>`);
    if (m.c === TRASH) tags.push('<span class="green">Zivilist ✓</span>', '<span class="green">spawnt immer</span>');
    if (routeOrder.has(m.id)) tags.push(`<span class="green">Route-Stopp ${routeOrder.get(m.id)}</span>`);
    if (done.has(m.id)) tags.push('<span class="green">geleert ✓</span>');

    let body = '';
    if (m.c === TRASH) {
      body += `<p class="pp-desc">Frei zugängliche Tonne auf der Straße – auch als Zivilist ohne Einbruch plünderbar.</p>
        <div class="pp-grid">
          <span>Inhalt</span><b>9–18× Müll</b>
          <span>Griffe</span><b>9</b>
          <span>Verkaufspreis</span><b>≈ $10 / Stück</b>
          <span>Hehler-Bonus</span><b>bis +50 %</b>
        </div>`;
    } else if (desc) {
      body += `<p class="pp-desc">${esc(desc)}</p>`;
    }
    const pop = m.p && D.popups[m.p];
    if (pop && pop.length) {
      body += `<div class="pp-sub">Im Gebäude</div><div class="pp-grid">${pop.map(([k, v]) =>
        `<span>${esc(T.contents[k] || k)}</span><b>${esc(v)}</b>`).join('')}</div>`;
    }

    const acts = [];
    if (c.collectible) {
      acts.push(done.has(m.id)
        ? `<button class="btn" data-act="undone" data-id="${m.id}">↺ Wieder offen</button>`
        : `<button class="btn primary" data-act="done" data-id="${m.id}">✓ ${m.c === TRASH ? 'Geleert' : 'Geplündert'}</button>`);
    }
    if (m.c === TRASH) acts.push(`<button class="btn" data-act="next" data-id="${m.id}">➜ Nächste</button>`);
    acts.push(`<button class="btn" data-act="link" data-id="${m.id}">🔗 Link</button>`);
    if (m.w) acts.push(`<a class="btn" href="${esc(m.w)}" target="_blank" rel="noopener">Wiki ↗</a>`);

    return `<div class="pp-head"><div class="dot" style="--c:${c.color}">${c.icon}</div>
        <div><h4>${esc(m.title)}</h4><small>${esc(c.de)}${m.title !== m.n ? ' · ' + esc(m.n) : ''}</small></div></div>
      <div class="pp-tags">${tags.join('')}</div>${body}
      <div class="pp-actions">${acts.join('')}</div>
      <div class="pp-coords">x ${Math.round(m.x)} · y ${Math.round(m.y)}</div>`;
  }

  // ---------- Sichtbarkeit ----------
  function applyCategory(slug) {
    const c = cats[slug];
    const on = enabled.has(slug);
    if (on) {
      for (const m of c.markers) {
        const hide = hideDone && done.has(m.id);
        if (hide) c.layer.removeLayer(m.marker); else c.layer.addLayer(m.marker);
      }
      if (!map.hasLayer(c.layer)) c.layer.addTo(map);
    } else if (map.hasLayer(c.layer)) {
      map.removeLayer(c.layer);
    }
    document.querySelectorAll(`.cat[data-slug="${slug}"]`).forEach(el => {
      el.classList.toggle('off', !on);
      el.setAttribute('aria-pressed', on);
    });
    if (slug === TRASH) {
      $('#trashToggle').checked = on;
      if (!on) clearRoute();
    }
  }
  function setCat(slug, on, save = true) {
    if (on) enabled.add(slug); else enabled.delete(slug);
    applyCategory(slug);
    if (save) { store.set('cats', [...enabled]); updateGroupCounts(); markPreset(); }
  }
  function setMany(slugs, on) {
    slugs.forEach(s => setCat(s, on, false));
    store.set('cats', [...enabled]); updateGroupCounts(); markPreset();
  }

  // ---------- Seitenleiste: Gruppen ----------
  const collapsed = new Set(store.get('collapsed', ['Containers', 'Loot spots']));
  const groupsEl = $('#groups');
  for (const g of GROUP_ORDER) {
    const list = Object.values(cats).filter(c => c.group === g);
    if (!list.length) continue;
    const total = list.reduce((s, c) => s + c.markers.length, 0);
    const el = document.createElement('section');
    el.className = 'group' + (collapsed.has(g) ? ' collapsed' : '');
    el.dataset.group = g;
    el.innerHTML = `
      <div class="group-head" role="button" tabindex="0" aria-expanded="${!collapsed.has(g)}">
        <span>${T.groups[g]?.icon || ''}</span><h3>${esc(T.groups[g]?.de || g)}</h3>
        <span class="count" data-count></span>
        <button class="mini" data-all="1" title="Alle einblenden">alle</button>
        <button class="mini" data-all="0" title="Alle ausblenden">keine</button>
        <span class="caret">▾</span>
      </div>
      <div class="cats">${list.sort((a, b) => a.de.localeCompare(b.de, 'de')).map(c => `
        <div class="cat" data-slug="${c.slug}" role="button" tabindex="0" aria-pressed="false" style="--c:${c.color}">
          <span class="dot">${c.icon}</span><span class="name">${esc(c.de)}</span><span class="n">${c.markers.length}</span>
        </div>`).join('')}</div>`;
    el.dataset.total = total;
    groupsEl.appendChild(el);

    const head = $('.group-head', el);
    const toggleCollapse = () => {
      el.classList.toggle('collapsed');
      const isC = el.classList.contains('collapsed');
      head.setAttribute('aria-expanded', !isC);
      if (isC) collapsed.add(g); else collapsed.delete(g);
      store.set('collapsed', [...collapsed]);
    };
    head.addEventListener('click', e => {
      const b = e.target.closest('[data-all]');
      if (b) { e.stopPropagation(); setMany(list.map(c => c.slug), b.dataset.all === '1'); return; }
      toggleCollapse();
    });
    head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapse(); } });
  }
  groupsEl.addEventListener('click', e => {
    const el = e.target.closest('.cat');
    if (el) setCat(el.dataset.slug, !enabled.has(el.dataset.slug));
  });
  groupsEl.addEventListener('keydown', e => {
    const el = e.target.closest('.cat');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setCat(el.dataset.slug, !enabled.has(el.dataset.slug)); }
  });

  function updateGroupCounts() {
    document.querySelectorAll('.group').forEach(el => {
      const list = Object.values(cats).filter(c => c.group === el.dataset.group);
      const shown = list.filter(c => enabled.has(c.slug)).reduce((s, c) => s + c.markers.length, 0);
      $('[data-count]', el).textContent = `${shown}/${el.dataset.total}`;
    });
  }

  // ---------- Ansichten ----------
  const allSlugs = Object.keys(cats);
  const bySlugGroup = g => allSlugs.filter(s => cats[s].group === g);
  const presets = {
    civil: [...bySlugGroup('Services'), TRASH],
    default: defaults,
    robber: [...bySlugGroup('Places'), ...bySlugGroup('Security and clans'), ...bySlugGroup('Containers'),
      ...bySlugGroup('Loot spots').filter(s => s !== TRASH), 'fence', 'smugglers-van'],
    all: allSlugs,
    none: [],
  };
  function markPreset() {
    const cur = [...enabled].sort().join();
    document.querySelectorAll('[data-preset]').forEach(b => {
      b.classList.toggle('active', [...new Set(presets[b.dataset.preset])].sort().join() === cur);
    });
  }
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const want = new Set(presets[b.dataset.preset]);
    allSlugs.forEach(s => setCat(s, want.has(s), false));
    store.set('cats', [...enabled]); updateGroupCounts(); markPreset();
    if (b.dataset.preset === 'civil') toast('Zivilist-Ansicht: Mülltonnen & Dienste');
  }));

  // ---------- Mülltonnen ----------
  const trashMarkers = cats[TRASH].markers;
  function updateTrash() {
    const n = trashMarkers.length;
    const d = trashMarkers.filter(m => done.has(m.id)).length;
    $('#trashLeft').textContent = n - d;
    $('#trashDone').textContent = d;
    $('#trashBar').style.width = (n ? (d / n) * 100 : 0) + '%';
    $('#hideDoneBtn').classList.toggle('on', hideDone);
    $('#hideDoneBtn').textContent = hideDone ? '👁 Geleerte zeigen' : '👁 Geleerte ausblenden';
  }

  function setDone(id, val) {
    const m = byId.get(id);
    if (!m) return;
    if (val) done.add(id); else done.delete(id);
    store.set('done', [...done]);
    refreshIcon(m);
    applyCategory(m.c);
    updateTrash();
    if (m.c === TRASH && route) buildRoute(val ? m : null, true);
  }

  function centerPoint() { return fromLatLng(map.getCenter()); }

  function nearestOpen(from, exclude) {
    let best = null, bd = Infinity;
    for (const m of trashMarkers) {
      if (done.has(m.id) || m.id === exclude) continue;
      const d = dist(from, m);
      if (d < bd) { bd = d; best = m; }
    }
    return best;
  }

  // Nächster-Nachbar-Tour + 2-opt-Verbesserung
  function planTour(start, pts) {
    if (!pts.length) return [];
    const rest = pts.slice();
    const tour = [];
    let cur = start;
    while (rest.length) {
      let bi = 0, bd = Infinity;
      rest.forEach((p, i) => { const d = dist(cur, p); if (d < bd) { bd = d; bi = i; } });
      cur = rest.splice(bi, 1)[0];
      tour.push(cur);
    }
    const path = [start, ...tour];
    let improved = true, guard = 0;
    while (improved && guard++ < 60) {
      improved = false;
      for (let i = 1; i < path.length - 2; i++) {
        for (let k = i + 1; k < path.length - 1; k++) {
          const a = path[i - 1], b = path[i], c = path[k], d = path[k + 1];
          if (dist(a, c) + dist(b, d) < dist(a, b) + dist(c, d) - 0.01) {
            path.splice(i, k - i + 1, ...path.slice(i, k + 1).reverse());
            improved = true;
          }
        }
      }
    }
    return path.slice(1);
  }

  function clearRoute() {
    if (!route) return;
    map.removeLayer(route.line);
    route = null;
    const ids = [...routeOrder.keys()];
    routeOrder.clear();
    ids.forEach(id => refreshIcon(byId.get(id)));
    $('#routeBtn').classList.remove('on');
    $('#routeBtn').textContent = '🧭 Route planen';
  }

  function buildRoute(from, quiet) {
    const open = trashMarkers.filter(m => !done.has(m.id));
    clearRoute();
    if (!open.length) { toast('Alle Mülltonnen geleert 🎉'); return; }
    const startRef = from || centerPoint();
    const first = nearestOpen(startRef) || open[0];
    const tour = [first, ...planTour(first, open.filter(m => m !== first))];
    tour.forEach((m, i) => routeOrder.set(m.id, i + 1));
    tour.forEach(refreshIcon);
    const line = L.polyline(tour.map(m => toLatLng(m.x, m.y)), {
      color: '#ffd34d', weight: 4, opacity: 0.95, className: 'route-line', interactive: false,
    }).addTo(map);
    route = { ids: tour.map(m => m.id), line };
    $('#routeBtn').classList.add('on');
    $('#routeBtn').textContent = '✕ Route aus';
    if (!quiet) {
      map.flyToBounds(line.getBounds().pad(0.15), { duration: 0.6 });
      toast(`Route mit ${tour.length} Tonnen – Start bei Nr. 1`);
    }
  }

  function goNext(fromId) {
    if (!enabled.has(TRASH)) setCat(TRASH, true);
    let target = null;
    if (route) target = route.ids.map(id => byId.get(id)).find(m => !done.has(m.id) && m.id !== fromId);
    if (!target) {
      const ref = fromId ? byId.get(fromId) : (focusId && byId.get(focusId)?.c === TRASH ? byId.get(focusId) : centerPoint());
      target = nearestOpen(ref, fromId);
    }
    if (!target) { toast('Keine offenen Mülltonnen mehr 🎉'); return; }
    focusMarker(target, true);
  }

  $('#trashToggle').addEventListener('change', e => setCat(TRASH, e.target.checked));
  $('#routeBtn').addEventListener('click', () => {
    if (route) { clearRoute(); return; }
    if (!enabled.has(TRASH)) setCat(TRASH, true);
    buildRoute();
  });
  $('#nextBtn').addEventListener('click', () => goNext());
  $('#hideDoneBtn').addEventListener('click', () => {
    hideDone = !hideDone;
    store.set('hideDone', hideDone);
    allSlugs.forEach(applyCategory);
    updateTrash();
  });
  $('#resetTrashBtn').addEventListener('click', () => {
    const ids = trashMarkers.filter(m => done.has(m.id));
    if (!ids.length) { toast('Es ist noch keine Tonne als geleert markiert.'); return; }
    if (!confirm(`${ids.length} geleerte Mülltonnen wieder auf „offen“ setzen?`)) return;
    ids.forEach(m => { done.delete(m.id); refreshIcon(m); });
    store.set('done', [...done]);
    applyCategory(TRASH); updateTrash();
    if (route) buildRoute(null, true);
    toast('Mülltonnen zurückgesetzt');
  });

  // ---------- Fokus / Deep-Link ----------
  function focusMarker(m, open = true, instant = false) {
    if (!enabled.has(m.c)) setCat(m.c, true);
    if (hideDone && done.has(m.id)) { hideDone = false; store.set('hideDone', false); allSlugs.forEach(applyCategory); updateTrash(); }
    const prev = focusId && byId.get(focusId);
    focusId = m.id;
    if (prev) refreshIcon(prev);
    refreshIcon(m);
    const z = Math.max(map.getZoom(), 3.5);
    if (instant) {
      map.setView(m.marker.getLatLng(), z, { animate: false });
      if (open) m.marker.openPopup();
    } else {
      map.flyTo(m.marker.getLatLng(), z, { duration: 0.6 });
      if (open) map.once('moveend', () => m.marker.openPopup());
    }
    closeSidebarMobile();
  }

  map.getContainer().addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.dataset.id;
    const m = byId.get(id);
    switch (b.dataset.act) {
      case 'done':
        setDone(id, true);
        if (m.c === TRASH) { toast(`${m.title} geleert ✓`); goNext(id); } else m.marker.setPopupContent(popupHtml(m));
        break;
      case 'undone':
        setDone(id, false); m.marker.setPopupContent(popupHtml(m)); break;
      case 'next': goNext(id); break;
      case 'link': {
        const url = location.href.split('#')[0] + '#m=' + id;
        (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => toast('Link kopiert'), () => prompt('Link kopieren:', url));
        break;
      }
      case 'pin-save': savePin(b); break;
      case 'pin-del': deletePin(b.dataset.id); break;
    }
  });

  function openFromHash(instant) {
    const h = new URLSearchParams(location.hash.slice(1));
    const m = h.get('m') && byId.get(h.get('m'));
    if (m && !m.marker.isPopupOpen()) focusMarker(m, true, instant === true);
  }
  window.addEventListener('hashchange', () => openFromHash());

  // ---------- Suche ----------
  const searchEl = $('#search');
  const resultsEl = $('#results');
  const index = [...byId.values()].map(m => ({
    m, text: norm([m.title, m.n, m.cat.de, m.cat.en, m.d && (T.descriptions[m.d] || ''), m.d, m.s && T.sublabels[m.s]].join(' ')),
  }));
  let sel = -1, current = [];

  function runSearch() {
    const q = norm(searchEl.value.trim());
    if (!q) { resultsEl.hidden = true; current = []; return; }
    const words = q.split(/\s+/);
    const catHits = Object.values(cats).filter(c => words.every(w => norm(c.de + ' ' + c.en).includes(w)))
      .map(c => ({ type: 'cat', c }));
    const mHits = index.filter(e => words.every(w => e.text.includes(w)));
    // Bei vielen gleichartigen Treffern Kategorie zuerst, Einzeltreffer danach (begrenzt)
    const markerHits = mHits.slice(0, 40).map(e => ({ type: 'm', m: e.m }));
    current = [...catHits, ...markerHits];
    sel = current.length ? 0 : -1;
    resultsEl.innerHTML = current.length ? current.map((r, i) => r.type === 'cat'
      ? `<li role="option" data-i="${i}" aria-selected="${i === sel}"><span>${r.c.icon}</span><div><b>${esc(r.c.de)}</b><small>Kategorie · ${r.c.markers.length} Marker – alle anzeigen</small></div></li>`
      : `<li role="option" data-i="${i}" aria-selected="${i === sel}"><span>${r.m.cat.icon}</span><div>${esc(r.m.title)}<small>${esc(r.m.cat.de)}${r.m.s ? ' · ' + esc(T.sublabels[r.m.s] || r.m.s) : ''}${done.has(r.m.id) ? ' · ✓' : ''}</small></div></li>`).join('')
      + (mHits.length > 40 ? `<li class="empty">… und ${mHits.length - 40} weitere</li>` : '')
      : '<li class="empty">Keine Treffer</li>';
    resultsEl.hidden = false;
  }
  function pick(i) {
    const r = current[i];
    if (!r) return;
    resultsEl.hidden = true;
    searchEl.blur();
    if (r.type === 'cat') {
      setCat(r.c.slug, true);
      map.flyToBounds(L.latLngBounds(r.c.markers.map(m => m.marker.getLatLng())).pad(0.2), { duration: 0.6, maxZoom: 4 });
      toast(`${r.c.de}: ${r.c.markers.length} Marker`);
      closeSidebarMobile();
    } else focusMarker(r.m, true);
  }
  searchEl.addEventListener('input', runSearch);
  searchEl.addEventListener('focus', runSearch);
  searchEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!current.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + current.length) % current.length;
      resultsEl.querySelectorAll('li[data-i]').forEach(li => li.setAttribute('aria-selected', +li.dataset.i === sel));
      resultsEl.querySelector(`li[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
    else if (e.key === 'Escape') { searchEl.value = ''; resultsEl.hidden = true; searchEl.blur(); }
  });
  resultsEl.addEventListener('mousedown', e => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
  searchEl.addEventListener('blur', () => setTimeout(() => { resultsEl.hidden = true; }, 120));

  // ---------- Eigene Markierungen ----------
  let pins = store.get('pins', []);
  const pinLayer = L.layerGroup().addTo(map);
  function renderPins() {
    pinLayer.clearLayers();
    const list = $('#myPins');
    list.innerHTML = pins.length ? '' : '<li class="muted" style="cursor:default">Noch keine.</li>';
    for (const p of pins) {
      const mk = L.marker(toLatLng(p.x, p.y), {
        icon: L.divIcon({ className: 'pin-wrap', iconSize: [0, 0], html: '<div class="pin mine">📌</div>' }),
      }).bindPopup(`<div class="pp-head"><div class="dot" style="--c:#ffd34d">📌</div><div><h4>Eigene Notiz</h4><small>x ${p.x} · y ${p.y}</small></div></div>
        <p class="pp-desc">${esc(p.text)}</p><div class="pp-actions"><button class="btn" data-act="pin-del" data-id="${p.id}">🗑 Löschen</button></div>`);
      pinLayer.addLayer(mk);
      const li = document.createElement('li');
      li.innerHTML = `<span>📌 ${esc(p.text)}</span><button title="Löschen" data-del="${p.id}">✕</button>`;
      li.addEventListener('click', e => {
        if (e.target.dataset.del) { deletePin(e.target.dataset.del); return; }
        map.flyTo(mk.getLatLng(), Math.max(map.getZoom(), 3.5), { duration: 0.5 });
        map.once('moveend', () => mk.openPopup());
        closeSidebarMobile();
      });
      list.appendChild(li);
    }
  }
  function savePin(btn) {
    const box = btn.closest('.pp-note');
    const text = $('textarea', box).value.trim();
    if (!text) { $('textarea', box).focus(); return; }
    pins.push({ id: 'p' + Date.now().toString(36), x: +box.dataset.x, y: +box.dataset.y, text: text.slice(0, 300) });
    store.set('pins', pins);
    map.closePopup();
    renderPins();
    toast('Markierung gespeichert');
  }
  function deletePin(id) {
    pins = pins.filter(p => p.id !== id);
    store.set('pins', pins);
    map.closePopup();
    renderPins();
  }
  map.on('contextmenu', e => {
    const { x, y } = fromLatLng(e.latlng);
    L.popup({ minWidth: 240 }).setLatLng(e.latlng).setContent(`
      <div class="pp-note" data-x="${x}" data-y="${y}">
        <div class="pp-head"><div class="dot" style="--c:#ffd34d">📌</div><div><h4>Neue Markierung</h4><small>x ${x} · y ${y}</small></div></div>
        <textarea maxlength="300" placeholder="Notiz, z. B. „Auto parken“"></textarea>
        <div class="pp-actions"><button class="btn primary" data-act="pin-save">Speichern</button></div>
      </div>`).openOn(map);
    setTimeout(() => $('.pp-note textarea')?.focus(), 50);
  });

  // ---------- Werkzeuge ----------
  $('#zoomIn').addEventListener('click', () => map.zoomIn());
  $('#zoomOut').addEventListener('click', () => map.zoomOut());
  $('#fitBtn').addEventListener('click', () => map.flyToBounds(cityBounds, { duration: 0.6 }));
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => toast('Vollbild nicht verfügbar'));
  };
  $('#fullBtn').addEventListener('click', toggleFull);
  let labelsOn = store.get('labels', true);
  const applyLabels = () => {
    if (labelsOn) areaLayer.addTo(map); else map.removeLayer(areaLayer);
    $('#labelsBtn').classList.toggle('on', labelsOn);
  };
  $('#labelsBtn').addEventListener('click', () => { labelsOn = !labelsOn; store.set('labels', labelsOn); applyLabels(); });
  const sizeEl = $('#sizeRange');
  const applySize = v => { map.getContainer().style.setProperty('--ms', v); };
  sizeEl.value = store.get('size', 1);
  applySize(sizeEl.value);
  sizeEl.addEventListener('input', () => { applySize(sizeEl.value); store.set('size', +sizeEl.value); });

  // Marker skalieren leicht mit dem Zoom
  const zoomScale = () => map.getContainer().style.setProperty('--zs', Math.min(1.25, Math.max(0.7, 0.55 + map.getZoom() * 0.14)));
  map.on('zoomend', zoomScale); zoomScale();

  const coordsEl = $('#coords');
  map.on('mousemove', e => { const p = fromLatLng(e.latlng); coordsEl.textContent = `x ${p.x} · y ${p.y}`; });

  // Mobil
  const sidebar = $('#sidebar');
  function closeSidebarMobile() { sidebar.classList.remove('open'); }
  $('#openSidebar').addEventListener('click', () => sidebar.classList.add('open'));
  $('#closeSidebar').addEventListener('click', closeSidebarMobile);

  // Tastatur
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.key === '/') { e.preventDefault(); sidebar.classList.add('open'); searchEl.focus(); }
    else if (k === 't') setCat(TRASH, !enabled.has(TRASH));
    else if (k === 'r') $('#routeBtn').click();
    else if (k === 'n') goNext();
    else if (k === 'f') toggleFull();
    else if (e.key === 'Escape') { map.closePopup(); closeSidebarMobile(); }
  });

  // ---------- Start ----------
  $('#srcLink').href = D.source;
  $('#updated').textContent = new Date(D.updated).toLocaleDateString('de-DE');
  $('#stat').textContent = `${byId.size} Marker · ${allSlugs.length} Kategorien · ${trashMarkers.length} Mülltonnen`;
  allSlugs.forEach(applyCategory);
  updateGroupCounts();
  markPreset();
  updateTrash();
  applyLabels();
  renderPins();
  // Nach dem ersten Layout einpassen (Containergröße steht dann sicher fest), danach Deep-Link öffnen
  requestAnimationFrame(() => setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(cityBounds, { animate: false });
    openFromHash(true);
  }, 0));
})();

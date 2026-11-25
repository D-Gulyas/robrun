/* ROB RUN – Blaupausen-Viewer */
(() => {
  'use strict';

  const DOCS = window.BLAUPAUSEN || [];
  const byCode = Object.fromEntries(DOCS.map(d => [d.code, d]));
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); // Länge bleibt gleich → Trefferpositionen passen
  const ZOOMS = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5];

  let current = null;       // aktuelles Dokument
  let pageIdx = 0;
  let zoomI = 3;
  let ticking = false;

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // ---------- Tabs & Karten ----------
  $('#docTabs').innerHTML = DOCS.map(d =>
    `<button class="doc-tab" data-doc="${d.code}" style="--c:${d.color}"><span>${d.icon} ${esc(d.title)}</span></button>`).join('');
  $('#docTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-doc]');
    if (b) location.hash = b.dataset.doc;
  });

  $('#cards').innerHTML = DOCS.map(d => `
    <a class="card" href="#${d.code}" style="--c:${d.color}">
      <div class="card-cover"><img src="covers/${d.code}.webp?v=1" alt="" draggable="false" width="1200" height="500"
        onerror="this.onerror=null;this.src='${d.pages[0].img}';this.classList.add('page-fallback')"></div>
      <div class="card-body">
        <div class="card-sub">${esc(d.sub)}</div>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.desc)}</p>
        <div class="card-meta">
          <span class="pill">${d.pages.length} Seiten</span>
          <span class="pill">${d.chapters.length} Kapitel</span>
          ${d.stand ? `<span class="pill">Stand ${esc(d.stand)}</span>` : ''}
        </div>
        <div class="card-foot">
          <span class="card-go">Dossier öffnen →</span>
          <span class="card-icon" aria-hidden="true">${d.icon}</span>
        </div>
      </div>
    </a>`).join('');

  // ---------- Lesemodus ----------
  const stage = $('#stage');
  const pagesEl = $('#pages');

  function openDoc(code, page = 0, chapter = null) {
    const d = byCode[code];
    if (!d) return showHome();
    const fresh = current !== d;
    current = d;
    document.body.style.setProperty('--c', d.color);
    $('#home').hidden = true;
    $('#reader').hidden = false;
    document.querySelectorAll('.doc-tab').forEach(t => t.classList.toggle('active', t.dataset.doc === code));
    document.title = `${d.title} – ROB RUN Blaupausen`;

    if (fresh) {
      $('#sideIcon').textContent = d.icon;
      $('#sideSub').textContent = d.sub;
      $('#sideTitle').textContent = d.title;
      $('#sideMeta').textContent = `${d.pages.length} Seiten${d.stand ? ' · Stand ' + d.stand : ''}`;
      $('#toc').innerHTML = d.chapters.map((c, i) =>
        `<li><button data-ch="${i}"><b>${c.n}</b><span>${esc(c.t)}</span><small>S. ${c.page + 1}</small></button></li>`).join('');
      $('#thumbs').innerHTML = d.pages.map((p, i) =>
        `<button class="thumb" data-page="${i}" aria-label="Seite ${i + 1}"><img src="${p.img}" alt="" loading="lazy" draggable="false"><span>${i + 1}</span></button>`).join('');
      pagesEl.innerHTML = d.pages.map((p, i) =>
        `<div class="page" data-i="${i}" id="p${i + 1}"><span class="page-no">${i + 1} / ${d.pages.length}</span>
          <img src="${p.img}" alt="${esc(d.title)} – Seite ${i + 1}" ${i > 1 ? 'loading="lazy"' : ''} draggable="false" width="${p.w}" height="${p.h}"></div>`).join('');
      $('#pageAll').textContent = d.pages.length;
      stage.scrollTop = 0;
      $('#side').scrollTop = 0;
    }
    requestAnimationFrame(() => {
      if (chapter != null) goChapter(chapter, !fresh);
      else if (page > 0 || !fresh) goPage(page, !fresh);
      update();
    });
    $('#side').classList.remove('open');
  }

  function showHome() {
    current = null;
    $('#home').hidden = false;
    $('#reader').hidden = true;
    document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
    document.body.style.removeProperty('--c');
    document.title = 'ROB RUN – Blaupausen';
    window.scrollTo(0, 0);
  }

  const pageEls = () => pagesEl.querySelectorAll('.page');

  function goPage(i, smooth = true, flash = false) {
    const el = pageEls()[Math.max(0, Math.min(i, current.pages.length - 1))];
    if (!el) return;
    stage.scrollTo({ top: el.offsetTop - 16, behavior: smooth ? 'smooth' : 'auto' });
    if (flash) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
  }
  function goChapter(i, smooth = true) {
    const c = current.chapters[i];
    const el = pageEls()[c.page];
    if (!el) return;
    stage.scrollTo({ top: el.offsetTop + c.y * el.offsetHeight - 24, behavior: smooth ? 'smooth' : 'auto' });
  }

  function update() {
    ticking = false;
    if (!current) return;
    const mid = stage.scrollTop + stage.clientHeight * 0.35;
    const els = [...pageEls()];
    let idx = 0;
    els.forEach((el, i) => { if (el.offsetTop <= mid) idx = i; });
    if (idx !== pageIdx || !$('.thumb.active')) {
      pageIdx = idx;
      document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
      history.replaceState(null, '', `#${current.code}/${idx + 1}`);
    }
    $('#pageNow').textContent = idx + 1;
    // aktives Kapitel
    const pos = stage.scrollTop + 120;
    let ch = 0;
    current.chapters.forEach((c, i) => {
      const el = els[c.page];
      if (el && el.offsetTop + c.y * el.offsetHeight <= pos) ch = i;
    });
    document.querySelectorAll('.toc button').forEach((b, i) => b.classList.toggle('active', i === ch));
    const max = stage.scrollHeight - stage.clientHeight;
    $('#progress').style.width = (max > 0 ? (stage.scrollTop / max) * 100 : 100) + '%';
  }
  stage.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(update));

  $('#toc').addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) { goChapter(+b.dataset.ch); $('#side').classList.remove('open'); } });
  $('#thumbs').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) { goPage(+b.dataset.page); $('#side').classList.remove('open'); } });
  $('#prevBtn').addEventListener('click', () => goPage(pageIdx - 1));
  $('#nextBtn').addEventListener('click', () => goPage(pageIdx + 1));
  $('#sideBtn').addEventListener('click', () => $('#side').classList.toggle('open'));

  // ---------- Zoom ----------
  function setZoom(i) {
    if (!current) return;
    const ratio = stage.scrollTop / Math.max(1, stage.scrollHeight);
    zoomI = Math.max(0, Math.min(ZOOMS.length - 1, i));
    pagesEl.style.setProperty('--zoom', ZOOMS[zoomI]);
    $('#zoomFit').textContent = Math.round(ZOOMS[zoomI] * 100) + ' %';
    stage.style.scrollBehavior = 'auto';
    stage.scrollTop = ratio * stage.scrollHeight;
    if (ZOOMS[zoomI] > 1) stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
    stage.style.scrollBehavior = '';
    update();
  }
  $('#zoomIn').addEventListener('click', () => setZoom(zoomI + 1));
  $('#zoomOut').addEventListener('click', () => setZoom(zoomI - 1));
  $('#zoomFit').addEventListener('click', () => setZoom(3));
  stage.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setZoom(zoomI + (e.deltaY < 0 ? 1 : -1));
  }, { passive: false });

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => toast('Vollbild nicht verfügbar'));
  };
  $('#fullBtn').addEventListener('click', toggleFull);

  // ---------- Volltextsuche ----------
  const searchEl = $('#search');
  const resultsEl = $('#results');
  const index = DOCS.flatMap(d => d.pages.map((p, i) => ({ d, i, text: p.text, low: norm(p.text) })));
  let hits = [], sel = -1;

  function snippet(text, at, q) {
    const s = Math.max(0, at - 50), e = Math.min(text.length, at + q.length + 70);
    return (s > 0 ? '… ' : '') + esc(text.slice(s, at)) + '<mark>' + esc(text.slice(at, at + q.length)) + '</mark>' + esc(text.slice(at + q.length, e)) + (e < text.length ? ' …' : '');
  }
  function runSearch() {
    const q = norm(searchEl.value.trim());
    if (q.length < 2) { resultsEl.hidden = true; hits = []; return; }
    hits = [];
    for (const e of index) {
      let at = e.low.indexOf(q), n = 0;
      while (at >= 0 && n < 2) { hits.push({ ...e, at }); n++; at = e.low.indexOf(q, at + q.length + 40); }
    }
    sel = hits.length ? 0 : -1;
    resultsEl.innerHTML = hits.length ? hits.slice(0, 40).map((h, k) => `
      <li data-k="${k}" aria-selected="${k === sel}" style="--c:${h.d.color}">
        <div class="r-head">${h.d.icon} ${esc(h.d.title)} · Seite ${h.i + 1}</div>
        <div class="r-snip">${snippet(h.text, h.at, q)}</div></li>`).join('')
      : '<li class="empty">Keine Treffer</li>';
    resultsEl.hidden = false;
  }
  function pick(k) {
    const h = hits[k];
    if (!h) return;
    resultsEl.hidden = true; searchEl.blur();
    if (current !== h.d) { location.hash = `${h.d.code}/${h.i + 1}`; setTimeout(() => flashPage(h.i), 400); }
    else { goPage(h.i, true, true); }
  }
  const flashPage = i => { const el = pageEls()[i]; if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } };
  searchEl.addEventListener('input', runSearch);
  searchEl.addEventListener('focus', runSearch);
  searchEl.addEventListener('blur', () => setTimeout(() => { resultsEl.hidden = true; }, 150));
  searchEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!hits.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + Math.min(hits.length, 40)) % Math.min(hits.length, 40);
      resultsEl.querySelectorAll('li[data-k]').forEach(li => li.setAttribute('aria-selected', +li.dataset.k === sel));
      resultsEl.querySelector(`li[data-k="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { e.preventDefault(); pick(sel); }
    else if (e.key === 'Escape') { searchEl.value = ''; resultsEl.hidden = true; searchEl.blur(); }
  });
  resultsEl.addEventListener('mousedown', e => { const li = e.target.closest('li[data-k]'); if (li) { e.preventDefault(); pick(+li.dataset.k); } });

  // ---------- Tastatur ----------
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) { e.preventDefault(); toast('Nur zum Ansehen – Speichern & Drucken sind deaktiviert'); return; }
    if (e.target.matches('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); searchEl.focus(); return; }
    if (!current) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goPage(pageIdx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goPage(pageIdx - 1); }
    else if (e.key === '+' || e.key === '=') setZoom(zoomI + 1);
    else if (e.key === '-') setZoom(zoomI - 1);
    else if (e.key === '0') setZoom(3);
    else if (e.key.toLowerCase() === 'f') toggleFull();
    else if (e.key === 'Escape') { if (!document.fullscreenElement) location.hash = ''; }
    else if (e.key === 'Home') goPage(0);
    else if (e.key === 'End') goPage(current.pages.length - 1);
  });

  // Nur ansehen: Kontextmenü & Ziehen auf Seitenbildern unterbinden
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('.page, .thumb, .card-cover')) { e.preventDefault(); toast('Nur zum Ansehen 🔒'); }
  });
  document.addEventListener('dragstart', e => { if (e.target.closest('.page, .thumb, .card-cover')) e.preventDefault(); });

  // ---------- Routing ----------
  function route() {
    const [code, p] = location.hash.slice(1).split('/');
    if (!code) return showHome();
    openDoc(code, Math.max(0, (parseInt(p, 10) || 1) - 1));
  }
  window.addEventListener('hashchange', () => {
    // Eigene replaceState-Aktualisierungen lösen kein hashchange aus
    route();
  });
  route();
})();

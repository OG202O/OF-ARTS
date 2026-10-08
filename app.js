/* ==========================================================================
   ARTÉA GALLERY — Cœur applicatif : routeur, panier, recherche, accueil
   ========================================================================== */
window.App = (function () {
  'use strict';
  const { CONFIG, FORMATS, SUPPORTS, CADRES, ORIENTATIONS, COLOR_NAMES, COLOR_HEX, STYLE_NAMES,
          PRODUCTS, ARTICLES, visible, byId, catsVisible, collsVisible, featured, news } = window.ART;

  /* ---------------- Utilitaires ---------------- */
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => `${Math.round(n).toLocaleString('fr-FR')} ${CONFIG.currency.label}`;
  const icon = name => ({
    truck: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    brush: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20c1-3 2-4 5-5l7-9 3 2-7 9c-1 3-2 4-5 5z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17L17 3l4 4L7 21zM8 16l1.5 1.5M11 13l1.5 1.5M14 10l1.5 1.5"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12l5 5L20 6"/></svg>',
    gift: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h16v11H4zM4 10l2-4 6 4M20 10l-2-4-6 4M12 10v11"/></svg>',
    social: {
      instagram: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 8h3V4.5h-3A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.6l.4-3.5H14V8z"/></svg>',
      pinterest: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 20l3-9M9 11c0-2 1.5-3.5 3.5-3.5S16 9 16 10.5c0 2-1.4 3.7-3.2 3.7-1 0-1.8-.5-2-1.2"/></svg>'
    }
  }[name]);

  /* ---------------- Stockage sûr (localStorage bloqué en aperçu sandbox) ---------------- */
  const store = (() => {
    let mem = {};
    let ok = false;
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); ok = true; } catch (e) { ok = false; }
    return {
      get(k, d) { try { if (ok) { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } } catch (e) {} return mem[k] !== undefined ? mem[k] : d; },
      set(k, v) { try { if (ok) { localStorage.setItem(k, JSON.stringify(v)); return; } } catch (e) {} mem[k] = v; }
    };
  })();

  /* ---------------- État global ---------------- */
  const state = {
    cart: store.get('artea_cart', { items: [], promo: null, zone: CONFIG.zoneDefault }),
    order: null
  };
  const saveCart = () => store.set('artea_cart', state.cart);

  /* ---------------- Moteur de variantes & prix ---------------- */
  const variantKey = sel => `${sel.format}|${sel.support}|${sel.cadre}`;
  const priceOf = (p, sel) => p.price + FORMATS[sel.format].add + SUPPORTS[sel.support].add + CADRES[sel.cadre].add;
  const dimsOf = (p, sel) => FORMATS[sel.format].dims[p.orientation];
  const cmToIn = cm => Math.round(cm * 0.3937);
  const dimsFull = (p, sel) => {
    const m = dimsOf(p, sel).match(/(\d+)\s*×\s*(\d+)/);
    if (!m) return dimsOf(p, sel);
    return `${dimsOf(p, sel)} (${cmToIn(+m[1])}″ × ${cmToIn(+m[2])}″)`;
  };

  /* ---------------- Panier ---------------- */
  function addToCart(p, sel, qty, silent) {
    qty = qty || 1;
    const key = `${p.id}__${variantKey(sel)}`;
    const found = state.cart.items.find(i => i.key === key);
    if (found) found.qty = Math.min(9, found.qty + qty);
    else state.cart.items.push({ key, id: p.id, sel, qty });
    saveCart(); updateCartBadge();
    if (!silent) {
      toast(`« ${esc(p.name)} » ajouté au panier`, '#/panier', 'Voir le panier');
    }
  }
  function setQty(key, qty) {
    const it = state.cart.items.find(i => i.key === key);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) state.cart.items = state.cart.items.filter(i => i.key !== key);
    saveCart(); updateCartBadge();
  }
  function removeItem(key) { state.cart.items = state.cart.items.filter(i => i.key !== key); saveCart(); updateCartBadge(); }
  function cartTotals() {
    let sub = 0, hasBig = false, count = 0;
    state.cart.items.forEach(i => {
      const p = byId(i.id); if (!p) return;
      sub += priceOf(p, i.sel) * i.qty;
      count += i.qty;
      if (i.sel.format === 'grand') hasBig = true;
    });
    let promoVal = 0, promoLabel = '';
    if (state.cart.promo && CONFIG.promoCodes[state.cart.promo]) {
      const pc = CONFIG.promoCodes[state.cart.promo];
      promoVal = pc.type === 'percent' ? sub * pc.value / 100 : pc.value;
      promoLabel = pc.label;
    }
    const subAfter = Math.max(0, sub - promoVal);
    const z = CONFIG.zones.find(z => z.id === state.cart.zone) || CONFIG.zones[0];
    const pickup = !!state.cart.pickup && z.id === 'haiti';
    let ship = z.fee + (hasBig ? CONFIG.bigFormatSurcharge : 0);
    let free = false;
    if (CONFIG.freeShippingFrom && subAfter >= CONFIG.freeShippingFrom) { ship = 0; free = true; }
    if (pickup) { ship = 0; free = false; }
    const tax = subAfter * CONFIG.tax.rate;
    return { sub, promoVal, promoLabel, subAfter, ship, free, pickup, tax, total: subAfter + ship + tax, count, zone: z, hasBig };
  }
  function updateCartBadge() {
    const n = state.cart.items.reduce((a, i) => a + i.qty, 0);
    const el = $('#cart-count');
    el.hidden = n === 0; el.textContent = n;
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg, href, linkLabel) {
    const t = $('#toast');
    t.innerHTML = `${msg}${href ? `<a href="${href}">${esc(linkLabel || 'Voir')}</a>` : ''}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
  }

  /* ---------------- Lightbox ---------------- */
  function openLightbox(src, alt) {
    const lb = $('#lightbox'), img = $('#lb-img');
    img.src = src; img.alt = alt || ''; img.classList.remove('zoomed');
    lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { $('#lightbox').hidden = true; document.body.style.overflow = ''; }
  function bindLightbox() {
    $('#lightbox').addEventListener('click', e => {
      if (e.target.closest('.lb-close') || e.target.id === 'lightbox') return closeLightbox();
      if (e.target.id === 'lb-img') e.target.classList.toggle('zoomed');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#lightbox').hidden) closeLightbox(); });
  }

  /* ---------------- Révélations au scroll ---------------- */
  let observer;
  function bindReveals(root) {
    if (typeof IntersectionObserver === 'undefined') {
      $$('.reveal', root || $('#app')).forEach(el => el.classList.add('in'));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); observer.unobserve(en.target); } });
      }, { threshold: 0.08 });
    }
    $$('.reveal', root || $('#app')).forEach(el => observer.observe(el));
  }

  /* ---------------- Composants réutilisables ---------------- */
  function priceHTML(p) {
    return `<span class="from">à partir de</span> <b>${fmt(p.price)}</b>`;
  }
  function dispoHTML(p) {
    return p.dispo === 'stock'
      ? '<span class="ok">● Disponible — préparation sous 2–3 jours</span>'
      : '<span>● Fabrication sur commande — 2 à 3 semaines</span>';
  }
  function productCard(p) {
    return `
    <article class="card-product reveal">
      <div class="card-img">
        <a href="#/produit/${p.id}" aria-label="${esc(p.name)}">
          <img src="${p.img}" alt="${esc(p.alt)}" loading="lazy">
        </a>
        <div class="card-badges">
          ${p.isNew ? '<span class="badge gold">Nouveau</span>' : ''}
          ${p.edition === 'limitee' ? '<span class="badge">Édition limitée</span>' : ''}
          ${p.dispo !== 'stock' ? '<span class="badge muted">Sur commande</span>' : ''}
        </div>
        <button class="quick-add" data-quick="${p.id}">${icon('plus')} Ajout rapide · ${fmt(p.price)}</button>
      </div>
      <div class="card-info">
        <span class="card-coll">${esc(collName(p.col))}</span>
        <h3 class="card-name"><a href="#/produit/${p.id}">${esc(p.name)}</a></h3>
        <p class="card-price">${priceHTML(p)}</p>
        <p class="card-dispo">${dispoHTML(p)}</p>
      </div>
    </article>`;
  }
  function collName(cid) { const c = window.ART.COLLECTIONS.find(c => c.id === cid); return c ? `Collection ${c.name}` : ''; }
  function bindQuickAdds(root) {
    $$('[data-quick]', root).forEach(btn => {
      btn.addEventListener('click', () => {
        const p = byId(btn.dataset.quick);
        if (p) addToCart(p, { format: 'petit', support: 'toile', cadre: 'aucun' }, 1);
      });
    });
  }

  /* ---------------- Recherche ---------------- */
  function runSearch(q) {
    const box = $('#search-results');
    q = (q || '').trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = '<p class="hint">Saisissez au moins 2 lettres — essayez « abstrait », « paysage », « or »…</p>'; return; }
    const res = visible().filter(p =>
      p.name.toLowerCase().includes(q) ||
      (COLOR_NAMES[p.colors[0]] || '').toLowerCase().includes(q) ||
      collName(p.col).toLowerCase().includes(q) ||
      (window.ART.CATEGORIES.find(c => c.id === p.cat) || {}).label.toLowerCase().includes(q) ||
      p.lead.toLowerCase().includes(q)
    );
    const colls = collsVisible().filter(c => (c.name + ' ' + c.desc).toLowerCase().includes(q));
    let html = '';
    if (res.length === 0 && colls.length === 0) {
      html = `<p class="hint">Aucune œuvre ne correspond à « ${esc(q)} ». Essayez « abstrait », « mer », « or », « vert »…</p>`;
    } else {
      if (colls.length) html += `<p class="hint">Collections : ${colls.map(c => `<a href="#/collection/${c.id}" style="text-decoration:underline">${esc(c.name)}</a>`).join(' · ')}</p>`;
      html += res.slice(0, 8).map(productCard).join('');
      if (res.length > 8) html += `<p class="hint"><a href="#/boutique?q=${encodeURIComponent(q)}" style="text-decoration:underline">Voir tous les résultats (${res.length}) →</a></p>`;
    }
    box.innerHTML = html;
    bindQuickAdds(box); bindReveals(box);
  }
  function openSearch() {
    $('#search-overlay').hidden = false;
    runSearch('');
    setTimeout(() => $('#search-input').focus(), 60);
    document.body.style.overflow = 'hidden';
  }
  function closeSearch() { $('#search-overlay').hidden = true; document.body.style.overflow = ''; }

  /* ---------------- Compte (démo) ---------------- */
  function openAccount() {
    const m = document.createElement('div');
    m.className = 'mini-modal';
    m.innerHTML = `<div class="box">
      <h3>Espace client</h3>
      <p>Sur la boutique de production, cet espace permet au client de suivre ses commandes, ses retours et ses adresses (membre natif Wix). Il sera activé à la mise en ligne.</p>
      <button class="btn btn-dark" data-close>Compris</button>
    </div>`;
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    document.body.appendChild(m);
  }

  /* ---------------- Barre d'annonce ---------------- */
  function initAnnounce() {
    const el = $('#announce');
    const msgs = CONFIG.announcements;
    let i = 0;
    const render = () => {
      el.innerHTML = `<span>${msgs[i % msgs.length]}</span><span class="ann-dot">·</span><span style="opacity:.75">${msgs[(i + 1) % msgs.length]}</span>
        <button class="ann-close" aria-label="Masquer la barre d'annonce">✕</button>`;
      $('.ann-close', el).addEventListener('click', () => { el.style.display = 'none'; });
    };
    render();
    if (msgs.length > 1) setInterval(() => { i += 2; if (!$('#announce').style.display) render(); }, 6000);
  }

  /* ---------------- Menu mobile ---------------- */
  function initNav() {
    const burger = $('#burger'), nav = $('#main-nav');
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); document.body.classList.remove('nav-open'); } });
  }

  /* ---------------- Pied de page ---------------- */
  function renderFooter() {
    const C = CONFIG;
    const socials = C.socials.filter(s => s.url).map(s =>
      `<a href="${esc(s.url)}" aria-label="${esc(s.label)}" title="${esc(s.label)}" rel="noopener" target="_blank">${icon('social.' + s.id) || s.label}</a>`).join('');
    const socialsTodo = C.socials.filter(s => !s.url).map(s =>
      `<a href="#/contact" aria-label="${esc(s.label)} — à connecter" title="${esc(s.label)} — à connecter">${icon('social.' + s.id) || s.label}</a>`).join('');
    $('#site-footer').innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="logo" href="#/">
            <span class="logo-text"><span class="logo-name">ARTÉA</span><span class="logo-sub">GALLERY</span></span>
          </a>
          <p>${esc(C.brand.short)}</p>
          <p style="margin-top:14px"><em style="color:var(--gold-soft)">« ${esc(C.brand.tagline)} »</em></p>
        </div>
        <div class="footer-col">
          <h4>Collections</h4>
          <ul>
            ${collsVisible().map(c => `<li><a href="#/collection/${c.id}">Collection ${esc(c.name)}</a></li>`).join('')}
            <li><a href="#/boutique">Toute la boutique</a></li>
            <li><a href="#/boutique?tri=nouveautes">Nouveautés</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Informations</h4>
          <ul>
            <li><a href="#/a-propos">Notre histoire</a></li>
            <li><a href="#/livraison">Politique de livraison</a></li>
            <li><a href="#/retours">Politique de retour</a></li>
            <li><a href="#/faq">FAQ</a></li>
            <li><a href="#/contact">Contact</a></li>
            <li><a href="#/inspiration">Inspiration & conseils</a></li>
          </ul>
        </div>
        <div class="footer-col footer-news">
          <h4>Une touche d'art dans votre boîte mail</h4>
          <p>Nouvelles collections, inspirations déco et offres exclusives.</p>
          <form id="footer-news-form" novalidate>
            <input type="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail">
            <button class="btn btn-gold btn-sm" type="submit">Je m'inscris</button>
          </form>
          <div class="footer-pay" aria-label="Moyens de paiement">
            ${C.payments.map(p => `<span class="pay-pill">${esc(p.label)} <span class="todo">à configurer</span></span>`).join('')}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ARTÉA GALLERY — ${CONFIG.demo ? 'site de démonstration, ' : ''}<a href="#/mentions" style="text-decoration:underline">Mentions légales</a> · <a href="#/cgv" style="text-decoration:underline">CGV</a> · <a href="#/confidentialite" style="text-decoration:underline">Confidentialité</a></span>
        <div class="footer-socials">${socials}${socialsTodo}</div>
      </div>
    </div>`;
    const f = $('#footer-news-form');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const em = $('input', f).value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Veuillez saisir une adresse e-mail valide.'); return; }
      f.innerHTML = '<p style="color:var(--gold-soft);font-size:.92rem">✓ Merci ! Votre inscription est enregistrée. <span class="demo-tag">démonstration</span><br><span style="color:#A79C89;font-size:.8rem">En production : double opt-in, confirmation par e-mail et désinscription en un clic via Wix Email Marketing.</span></p>';
    });
  }

  /* ---------------- Routeur ---------------- */
  const ROUTES = [
    { rx: /^$/,                          page: () => pageHome() },
    { rx: /^boutique$/,                  page: (m, q) => window.Pages.boutique(q) },
    { rx: /^produit\/([\w-]+)$/,         page: m => window.Pages.produit(m[1]) },
    { rx: /^collections$/,               page: () => window.Pages.collections() },
    { rx: /^collection\/([\w-]+)$/,      page: m => window.Pages.collection(m[1]) },
    { rx: /^panier$/,                    page: () => window.Pages.panier() },
    { rx: /^commande$/,                  page: () => window.Pages.commande() },
    { rx: /^confirmation$/,              page: () => window.Pages.confirmation() },
    { rx: /^livraison$/,                 page: () => window.Pages.livraison() },
    { rx: /^a-propos$/,                  page: () => window.Pages.aPropos() },
    { rx: /^contact$/,                   page: (m, q) => window.Pages.contact(q) },
    { rx: /^faq$/,                       page: () => window.Pages.faq() },
    { rx: /^inspiration$/,               page: () => window.Pages.inspiration() },
    { rx: /^article\/([\w-]+)$/,         page: m => window.Pages.article(m[1]) },
    { rx: /^cgv$/,                       page: () => window.Pages.legal('cgv') },
    { rx: /^confidentialite$/,           page: () => window.Pages.legal('confidentialite') },
    { rx: /^retours$/,                   page: () => window.Pages.legal('retours') },
    { rx: /^mentions$/,                  page: () => window.Pages.legal('mentions') },
    { rx: /^recherche$/,                 page: (m, q) => window.Pages.recherche(q) }
  ];

  function parseHash() {
    let h = location.hash.replace(/^#\/?/, '');
    let query = {};
    const qi = h.indexOf('?');
    if (qi > -1) {
      const qs = new URLSearchParams(h.slice(qi + 1));
      qs.forEach((v, k) => { query[k] = v; });
      h = h.slice(0, qi);
    }
    return { path: h, query };
  }

  function route() {
    const { path, query } = parseHash();
    closeSearch(); closeLightbox();
    $('#main-nav').classList.remove('open'); document.body.classList.remove('nav-open');
    for (const r of ROUTES) {
      const m = path.match(r.rx);
      if (m) { r.page(m, query); return; }
    }
    window.Pages.notFound();
  }

  /* Rendu commun d'une vue */
  function render(view) {
    const app = $('#app');
    app.innerHTML = view.html;
    document.title = view.title;
    const md = document.querySelector('meta[name="description"]');
    if (md && view.desc) md.setAttribute('content', view.desc);
    $$('a[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === view.nav));
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    bindQuickAdds(app); bindReveals(app);
    if (view.after) view.after();
    const h1 = $('h1', app); if (h1) { h1.setAttribute('tabindex', '-1'); }
  }

  /* ================= PAGE ACCUEIL ================= */
  function pageHome() {
    const cats = catsVisible();
    const feats = featured().slice(0, 4);
    const newsList = news().slice(0, 4);
    const heroImg = CONFIG.hero.img;

    const html = `
    <!-- C · Bannière principale -->
    <section class="hero">
      <div class="hero-img">
        <img src="${heroImg}" alt="${CONFIG.hero.temp ? 'Œuvre abstraite dorée — visuel provisoire de la bannière d\u2019accueil' : 'Intérieur contemporain décoré de tableaux ARTÉA GALLERY'}" fetchpriority="high">
      </div>
      <div class="container">
        <div class="hero-content">
          <span class="eyebrow">Galerie & boutique d'art mural</span>
          <h1>L'art qui donne vie <em>à vos murs</em></h1>
          <p class="hero-sub">Découvrez des tableaux qui transforment votre intérieur et racontent votre histoire.</p>
          <div class="hero-cta">
            <a class="btn btn-dark btn-lg" href="#/boutique">Explorer la collection</a>
            <a class="btn btn-outline btn-lg" href="#/boutique?tri=nouveautes">Découvrir les nouveautés</a>
          </div>
          <div class="hero-meta">
            <span>${icon('brush')} Œuvres sélectionnées avec soin</span>
            <span>${icon('truck')} Livraison soignée & suivie</span>
          </div>
        </div>
      </div>
    </section>

    <!-- D · Catégories -->
    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Explorer par univers</span>
          <h2>Trouvez l'univers qui vous ressemble</h2>
        </div>
        <div class="cat-grid">
          ${cats.map((c, i) => {
            const p = window.ART.byCategory(c.id)[0];
            return `<a class="cat-card reveal${i === 0 ? ' wide' : ''}" href="#/boutique?cat=${c.id}">
              <img src="${p.img}" alt="${esc(c.label)} — sélection ARTÉA GALLERY" loading="lazy">
              <div class="cat-label"><h3>${esc(c.label)}</h3><span>${window.ART.byCategory(c.id).length} œuvre${window.ART.byCategory(c.id).length > 1 ? 's' : ''}</span></div>
            </a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- E · Meilleures ventes / coups de cœur -->
    <section class="section" style="background:var(--cream-2)">
      <div class="container">
        <div class="section-head-row">
          <div class="section-head reveal" style="margin-bottom:0">
            <span class="eyebrow">Sélection de la galerie</span>
            <h2>Les œuvres que vous aimez</h2>
            <p>Nos coups de cœur du moment. Les meilleures ventes réelles s'afficheront ici dès les premières commandes.</p>
          </div>
          <a class="link-arrow" href="#/boutique">Toute la boutique ${icon('arrow')}</a>
        </div>
        <div class="grid-products">${feats.map(productCard).join('')}</div>
      </div>
    </section>

    <!-- F · Nouveautés -->
    <section class="section">
      <div class="container">
        <div class="section-head-row">
          <div class="section-head reveal" style="margin-bottom:0">
            <span class="eyebrow">Dernières arrivées</span>
            <h2>Fraîchement arrivés dans la galerie</h2>
          </div>
          <a class="link-arrow" href="#/boutique?tri=nouveautes">Voir les nouveautés ${icon('arrow')}</a>
        </div>
        <div class="grid-products">${newsList.map(productCard).join('')}</div>
      </div>
    </section>

    <!-- G · Inspiration & décoration -->
    <section class="section band">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Mises en situation</span>
          <h2>Trouvez le tableau qui vous ressemble</h2>
          <p>Visualisez nos œuvres dans différents environnements — et imaginez la vôtre.</p>
        </div>
        <div class="insp-grid">
          ${[
            { t: 'Salon moderne', s: 'Énergie et élégance', img: 'img/tableau-abstrait-echo-dore.jpg', href: '#/boutique?cat=abstrait', alt: 'Salon moderne avec tableau abstrait aux tons dorés' },
            { t: 'Chambre élégante', s: 'Calme et douceur', img: 'img/tableau-paysage-montagne-bleue.jpg', href: '#/boutique?cat=paysages', alt: 'Chambre élégante avec paysage bleu apaisant' },
            { t: 'Bureau professionnel', s: 'Structure et concentration', img: 'img/tableau-minimaliste-lignes-equilibre.jpg', href: '#/boutique?cat=minimaliste', alt: 'Bureau professionnel avec œuvre minimaliste' }
          ].map(x => `
          <a class="insp-card reveal" href="${x.href}">
            <img src="${x.img}" alt="${x.alt}" loading="lazy">
            <div class="insp-label"><h3>${x.t}</h3><span>${x.s}</span></div>
          </a>`).join('')}
        </div>
        <div style="text-align:center;margin-top:38px">
          <a class="btn btn-gold" href="#/inspiration">Trouver mon style</a>
        </div>
      </div>
    </section>

    <!-- H · Avantages -->
    <section class="section">
      <div class="container">
        <div class="benefits">
          ${[
            { i: 'brush', t: 'Œuvres sélectionnées avec soin', d: 'Chaque tableau est choisi pour sa qualité, son originalité et sa capacité à sublimer un intérieur.' },
            { i: 'ruler', t: 'Formats adaptés à vos espaces', d: 'Petit, moyen ou grand format, toile ou support rigide, avec ou sans encadrement : à vous de composer.' },
            { i: 'shield', t: 'Paiement sécurisé', d: 'Les moyens de paiement activés seront affichés à la caisse, traités par des prestataires certifiés. <span class="demo-tag">en cours de configuration</span>' },
            { i: 'chat', t: 'Accompagnement personnalisé', d: 'Une question sur une œuvre, un doute sur la taille ? Nous vous conseillons avant et après l\u2019achat.' }
          ].map(b => `
          <div class="benefit reveal">
            ${icon(b.i)}
            <h3>${b.t}</h3>
            <p>${b.d}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- I · Histoire de la marque -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="split">
          <div class="img-frame reveal">
            <img src="img/tableau-nenuphars-crepuscule.jpg" alt="Toiles présentées dans l'espace galerie ARTÉA" loading="lazy">
          </div>
          <div class="reveal">
            <span class="eyebrow">Notre philosophie</span>
            <h2>L'art est plus qu'une décoration. C'est une émotion.</h2>
            <p>ARTÉA GALLERY est née d'une conviction simple : chacun mérite de vivre entouré d'œuvres qui lui ressemblent. Un tableau ne remplit pas un mur — il donne un ton, une lumière, une âme à votre quotidien.</p>
            <p>Nous sélectionnons chaque œuvre avec le même soin que si elle devait habiter nos propres murs : qualité des matières, justesse des couleurs, émotion à première vue.</p>
            <div style="margin-top:26px;display:flex;gap:14px;flex-wrap:wrap">
              <a class="btn btn-dark" href="#/a-propos">Notre histoire</a>
              <a class="btn btn-ghost" href="#/collections">Voir les collections</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- J · Avis clients (état réel : aucun avis encore) -->
    <section class="section-tight">
      <div class="container">
        <div class="section-head center reveal">
          <span class="eyebrow">Vos retours</span>
          <h2>Ils ont choisi ARTÉA</h2>
        </div>
        <div class="reviews-empty reveal">
          <div class="stars-deco" aria-hidden="true">✦ ✦ ✦ ✦ ✦</div>
          <h3>Les avis vérifiés arrivent bientôt</h3>
          <p>La galerie en ligne vient d'ouvrir. Dès vos premières commandes, les avis authentiques et vérifiés de nos clients s'afficheront ici — sans invention, promis.</p>
        </div>
      </div>
    </section>

    <!-- K · Newsletter -->
    <section class="section newsletter">
      <div class="container">
        <span class="eyebrow">Restons connectés</span>
        <h2>Une touche d'art dans votre boîte mail</h2>
        <p>Découvrez nos nouvelles collections, nos inspirations déco et nos offres exclusives.</p>
        <form class="newsletter-form" id="home-news-form" novalidate>
          <input type="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail">
          <button class="btn btn-gold" type="submit">Je m'inscris</button>
        </form>
        <label class="newsletter-consent">
          <input type="checkbox" required id="home-news-consent">
          <span>J'accepte de recevoir la newsletter et je reconnais avoir pris connaissance de la <a href="#/confidentialite">politique de confidentialité</a>. Désinscription possible à tout moment.</span>
        </label>
        <p class="form-msg" id="home-news-msg" role="status"></p>
      </div>
    </section>`;

    render({ html, title: 'ARTÉA GALLERY — Tableaux décoratifs & art mural | Galerie en ligne', desc: 'Tableaux abstraits, paysages, art africain et caribéen : découvrez des œuvres qui transforment votre intérieur. ARTÉA GALLERY, galerie en ligne.', nav: 'accueil' });

    const nf = $('#home-news-form');
    nf.addEventListener('submit', e => {
      e.preventDefault();
      const msg = $('#home-news-msg');
      if (!$('#home-news-consent').checked) { msg.textContent = 'Merci de cocher la case de consentement pour vous inscrire.'; msg.className = 'form-msg err'; return; }
      msg.textContent = '✓ Merci ! Votre inscription est enregistrée (démonstration — connectée à Wix Email Marketing en production).';
      msg.className = 'form-msg ok';
      nf.reset();
    });
  }

  /* ---------------- Init ---------------- */
  function init() {
    initAnnounce(); initNav(); renderFooter(); bindLightbox(); updateCartBadge();
    $('#open-search').addEventListener('click', openSearch);
    $('#close-search').addEventListener('click', closeSearch);
    $('#search-overlay').addEventListener('click', e => { if (e.target.id === 'search-overlay') closeSearch(); });
    $('#search-input').addEventListener('input', e => runSearch(e.target.value));
    $('#search-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v.length >= 2) { closeSearch(); location.hash = '#/recherche?q=' + encodeURIComponent(v); }
      }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearch(); $('#main-nav').classList.remove('open'); document.body.classList.remove('nav-open'); } });
    $('#open-account').addEventListener('click', openAccount);
    if (!store.get('artea_cookie_ok', false)) {
      $('#cookie-note').hidden = false;
      $('#cookie-ok').addEventListener('click', () => { store.set('artea_cookie_ok', true); $('#cookie-note').hidden = true; });
    }
    window.addEventListener('hashchange', route);
    route();
  }

  return { init, route, render, state, $, $$, esc, fmt, icon, toast,
           addToCart, setQty, removeItem, cartTotals, updateCartBadge,
           priceOf, dimsOf, dimsFull, variantKey, productCard, dispoHTML, priceHTML, collName,
           openLightbox, bindReveals, bindQuickAdds, store };
})();

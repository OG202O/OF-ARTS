/* ==========================================================================
   ARTÉA GALLERY — Pages : boutique, produit, collections, panier, commande,
   livraison, à propos, contact, FAQ, blog, pages légales
   ========================================================================== */
window.Pages = (function () {
  'use strict';
  const A = window.App;
  const { CONFIG, FORMATS, SUPPORTS, CADRES, ORIENTATIONS, COLOR_NAMES, COLOR_HEX, STYLE_NAMES,
          CATEGORIES, COLLECTIONS, ARTICLES, FAQ,
          visible, byId, byCollection, byCategory, collsVisible } = window.ART;
  const esc = A.esc, fmt = A.fmt, icon = A.icon;
  const $ = A.$, $$ = A.$$;

  /* ======================================================================
     BOUTIQUE
  ====================================================================== */
  function boutique(q) {
    q = q || {};
    const F = {
      cats: q.cat ? [q.cat] : [], colls: [], orients: [], colors: [], styles: [], sizes: [], supports: [], dispo: [],
      pmin: '', pmax: '', tri: q.tri || 'nouveautes', text: q.q || ''
    };
    let shown = 8;

    const fmtsAvail = p => p.noBig ? ['petit', 'moyen'] : ['petit', 'moyen', 'grand'];
    const supsAvail = p => p.noRigid ? ['toile'] : ['toile', 'rigide'];

    function compute() {
      let list = visible();
      if (F.text) {
        const t = F.text.toLowerCase();
        list = list.filter(p => (p.name + ' ' + p.lead + ' ' + (COLOR_NAMES[p.colors[0]] || '') + ' ' + collName(p.col)).toLowerCase().includes(t));
      }
      if (F.cats.length) list = list.filter(p => F.cats.includes(p.cat));
      if (F.colls.length) list = list.filter(p => F.colls.includes(p.col));
      if (F.orients.length) list = list.filter(p => F.orients.includes(p.orientation));
      if (F.colors.length) list = list.filter(p => p.colors.some(c => F.colors.includes(c)));
      if (F.styles.length) list = list.filter(p => p.styles.some(s => F.styles.includes(s)));
      if (F.sizes.length) list = list.filter(p => F.sizes.some(s => fmtsAvail(p).includes(s)));
      if (F.supports.length) list = list.filter(p => F.supports.some(s => supsAvail(p).includes(s)));
      if (F.dispo.length) list = list.filter(p => F.dispo.includes(p.dispo));
      const mn = parseFloat(F.pmin), mx = parseFloat(F.pmax);
      if (!isNaN(mn)) list = list.filter(p => p.price >= mn);
      if (!isNaN(mx)) list = list.filter(p => p.price <= mx);
      const sorters = {
        'nouveautes': (a, b) => (b.added || '').localeCompare(a.added || ''),
        'prix-asc': (a, b) => a.price - b.price,
        'prix-desc': (a, b) => b.price - a.price
      };
      list = list.slice().sort(sorters[F.tri] || sorters['nouveautes']);
      return list;
    }

    const group = (title, opts, key, type) => `
      <div class="filter-group">
        <h4>${title}</h4>
        ${type === 'colors'
          ? `<div class="color-dots">${opts.map(o => `<button class="color-dot" data-k="${key}" data-v="${o.v}" title="${esc(o.l)}" style="background:${COLOR_HEX[o.v]}" aria-label="${esc(o.l)}"></button>`).join('')}</div>`
          : opts.map(o => `<label class="filter-opt"><input type="checkbox" data-k="${key}" data-v="${o.v}" ${F[key].includes(o.v) ? 'checked' : ''}> ${esc(o.l)} <span class="n">${o.n}</span></label>`).join('')}
      </div>`;

    const countIn = fn => visible().filter(fn).length;
    const sidebar = `
      <aside class="filters" id="filters" aria-label="Filtres du catalogue">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <h4 style="font-family:var(--font-t);letter-spacing:.16em;text-transform:uppercase">Filtres</h4>
          <button class="icon-btn" id="close-filters" aria-label="Fermer les filtres" style="display:none">✕</button>
        </div>
        ${group('Catégorie', CATEGORIES.filter(c => byCategory(c.id).length).map(c => ({ v: c.id, l: c.label, n: byCategory(c.id).length })), 'cats')}
        ${group('Collection', collsVisible().map(c => ({ v: c.id, l: c.name, n: byCollection(c.id).length })), 'colls')}
        <div class="filter-group">
          <h4>Prix (USD)</h4>
          <div class="price-inputs">
            <input type="number" min="0" placeholder="Min" id="pmin" value="${F.pmin}" aria-label="Prix minimum">
            <span>—</span>
            <input type="number" min="0" placeholder="Max" id="pmax" value="${F.pmax}" aria-label="Prix maximum">
          </div>
        </div>
        ${group('Taille', [
          { v: 'petit', l: 'Petit format', n: countIn(p => fmtsAvail(p).includes('petit')) },
          { v: 'moyen', l: 'Format moyen', n: countIn(p => fmtsAvail(p).includes('moyen')) },
          { v: 'grand', l: 'Grand format', n: countIn(p => fmtsAvail(p).includes('grand')) }
        ], 'sizes')}
        ${group('Orientation', Object.entries(ORIENTATIONS).map(([v, l]) => ({ v, l, n: countIn(p => p.orientation === v) })), 'orients')}
        ${group('Couleur dominante', Object.keys(COLOR_NAMES).filter(c => countIn(p => p.colors.includes(c))).map(c => ({ v: c, l: COLOR_NAMES[c] })), 'colors', 'colors')}
        ${group('Style décoratif', Object.entries(STYLE_NAMES).filter(([k]) => countIn(p => p.styles.includes(k))).map(([v, l]) => ({ v, l, n: countIn(p => p.styles.includes(v)) })), 'styles')}
        ${group('Support', Object.entries(SUPPORTS).map(([v, o]) => ({ v, l: o.label, n: countIn(p => supsAvail(p).includes(v)) })), 'supports')}
        ${group('Disponibilité', [
          { v: 'stock', l: 'En stock', n: countIn(p => p.dispo === 'stock') },
          { v: 'commande', l: 'Sur commande', n: countIn(p => p.dispo === 'commande') }
        ], 'dispo')}
        <button class="link-arrow" id="reset-filters" style="margin-top:16px;background:none;border:none;cursor:pointer">Réinitialiser les filtres</button>
      </aside>`;

    const html = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="#/">Accueil</a> <span class="sep">/</span> <span class="current">Boutique</span></nav>
      <div class="page-hero" style="text-align:left;padding-top:6px">
        <span class="eyebrow">La galerie</span>
        <h1>Toute la collection</h1>
        <p>Chaque œuvre est disponible en plusieurs formats, supports et finitions. Les filtres vous aident à trouver la vôtre.</p>
      </div>
      <div class="shop-layout">
        ${sidebar}
        <div>
          <div class="shop-toolbar">
            <button class="btn btn-ghost filter-toggle" id="open-filters">${icon('ruler')} Filtres</button>
            <span class="count" id="shop-count"></span>
            <label style="display:flex;align-items:center;gap:10px;font-size:.88rem;color:var(--muted)">
              Trier
              <select class="sort-select" id="shop-sort" aria-label="Trier les produits">
                <option value="nouveautes">Nouveautés</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </label>
          </div>
          <div class="active-chips" id="shop-chips"></div>
          <div class="grid-products" id="shop-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))"></div>
          <div class="load-more-wrap" id="shop-more"></div>
        </div>
      </div>
    </div>`;

    A.render({
      html,
      title: 'Boutique — Tableaux décoratifs & art mural | ARTÉA GALLERY',
      desc: 'Explorez la collection ARTÉA GALLERY : tableaux abstraits, paysages, minimalisme, art africain et caribéen. Filtrez par couleur, taille, style et prix.',
      nav: 'boutique',
      after() {
        $('#shop-sort').value = F.tri;
        const grid = $('#shop-grid'), chips = $('#shop-chips'), more = $('#shop-more');

        function refresh() {
          const list = compute();
          $('#shop-count').textContent = `${list.length} œuvre${list.length > 1 ? 's' : ''}`;
          grid.innerHTML = list.length
            ? list.slice(0, shown).map(A.productCard).join('')
            : `<div class="empty-state" style="grid-column:1/-1"><h3>Aucune œuvre ne correspond</h3><p>Essayez d'élargir vos critères — ou <a href="#/contact" style="text-decoration:underline">demandez-nous conseil</a>.</p></div>`;
          A.bindQuickAdds(grid); A.bindReveals(grid);

          const act = [];
          F.cats.forEach(v => act.push([v, 'cats', (CATEGORIES.find(c => c.id === v) || {}).label]));
          F.colls.forEach(v => act.push([v, 'colls', 'Coll. ' + collName(v).replace('Collection ', '')]));
          F.orients.forEach(v => act.push([v, 'orients', ORIENTATIONS[v]]));
          F.colors.forEach(v => act.push([v, 'colors', COLOR_NAMES[v]]));
          F.styles.forEach(v => act.push([v, 'styles', STYLE_NAMES[v]]));
          F.sizes.forEach(v => act.push([v, 'sizes', FORMATS[v].label]));
          F.supports.forEach(v => act.push([v, 'supports', SUPPORTS[v].label]));
          F.dispo.forEach(v => act.push([v, 'dispo', v === 'stock' ? 'En stock' : 'Sur commande']));
          if (F.pmin !== '' || F.pmax !== '') act.push(['prix', 'price', `Prix ${F.pmin || '0'}–${F.pmax || '∞'} $`]);
          if (F.text) act.push(['q', 'text', `« ${F.text} »`]);
          chips.innerHTML = act.length
            ? act.map(([id, k, l]) => `<span class="chip">${esc(l)} <button data-rm="${k}" data-id="${esc(id)}" aria-label="Retirer le filtre ${esc(l)}">×</button></span>`).join('')
              + `<button class="chip clear" id="clear-all">Tout effacer</button>`
            : '';
          chips.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
            const k = b.dataset.rm, id = b.dataset.id;
            if (k === 'price') { F.pmin = F.pmax = ''; $('#pmin').value = ''; $('#pmax').value = ''; }
            else if (k === 'text') { F.text = ''; }
            else { F[k] = F[k].filter(x => x !== id); const inp = $(`.filters input[data-k="${k}"][data-v="${CSS.escape(id)}"], .filters .color-dot[data-k="${k}"][data-v="${CSS.escape(id)}"]`); if (inp) inp.checked ? inp.checked = false : inp.classList.remove('sel'); }
            shown = 8; refresh();
          }));
          const ca = $('#clear-all');
          if (ca) ca.addEventListener('click', () => { Object.assign(F, { cats: [], colls: [], orients: [], colors: [], styles: [], sizes: [], supports: [], dispo: [], pmin: '', pmax: '', text: '' }); $('#pmin').value = ''; $('#pmax').value = ''; shown = 8; refresh(); });

          more.innerHTML = list.length > shown
            ? `<button class="btn btn-outline" id="load-more">Charger plus d'œuvres (${list.length - shown} restantes)</button>` : '';
          const lm = $('#load-more');
          if (lm) lm.addEventListener('click', () => { shown += 8; refresh(); });
        }

        $$('.filters input[type="checkbox"]').forEach(inp => inp.addEventListener('change', () => {
          const k = inp.dataset.k, v = inp.dataset.v;
          if (inp.checked) { if (!F[k].includes(v)) F[k].push(v); } else F[k] = F[k].filter(x => x !== v);
          shown = 8; refresh();
        }));
        $$('.color-dot').forEach(d => d.addEventListener('click', () => {
          const k = d.dataset.k, v = d.dataset.v;
          d.classList.toggle('sel');
          F[k] = d.classList.contains('sel') ? F[k].concat(v) : F[k].filter(x => x !== v);
          shown = 8; refresh();
        }));
        ['pmin', 'pmax'].forEach(id => $('#' + id).addEventListener('change', () => { F[id] = $('#' + id).value; shown = 8; refresh(); }));
        $('#shop-sort').addEventListener('change', () => { F.tri = $('#shop-sort').value; shown = 8; refresh(); });
        $('#reset-filters').addEventListener('click', () => {
          Object.assign(F, { cats: [], colls: [], orients: [], colors: [], styles: [], sizes: [], supports: [], dispo: [], pmin: '', pmax: '', text: '' });
          $$('.filters input[type="checkbox"]').forEach(i => i.checked = false);
          $$('.color-dot').forEach(d => d.classList.remove('sel'));
          $('#pmin').value = ''; $('#pmax').value = ''; shown = 8; refresh();
        });
        const ft = $('#open-filters'), ff = $('#filters');
        if (ft) ft.addEventListener('click', () => { ff.classList.add('open'); $('#close-filters').style.display = 'inline-flex'; });
        if ($('#close-filters')) $('#close-filters').addEventListener('click', () => ff.classList.remove('open'));

        refresh();
      }
    });
  }
  function collName(cid) { const c = COLLECTIONS.find(c => c.id === cid); return c ? `Collection ${c.name}` : ''; }

  /* ======================================================================
     FICHE PRODUIT
  ====================================================================== */
  function produit(id) {
    const p = byId(id);
    if (!p || !p.img) { A.render({ html: notFoundHTML(), title: 'Œuvre introuvable — ARTÉA GALLERY' }); return; }
    const coll = COLLECTIONS.find(c => c.id === p.col);
    const cat = CATEGORIES.find(c => c.id === p.cat);
    const sel = { format: 'petit', support: 'toile', cadre: 'aucun' };
    const fmtsAvail = p.noBig ? ['petit', 'moyen'] : ['petit', 'moyen', 'grand'];
    const supsAvail = p.noRigid ? ['toile'] : ['toile', 'rigide'];
    const views = [
      { src: p.img, alt: p.alt, label: 'L\u2019œuvre', zoom: false },
      { src: p.img, alt: 'Détail de la texture — ' + p.name, label: 'Détail', zoom: true }
    ];
    if (p.scene) views.push({ src: p.scene, alt: p.name + ' mise en situation dans un intérieur', label: 'En situation', zoom: false });

    const similar = visible().filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 4);
    const sameColl = visible().filter(x => x.id !== p.id && x.col === p.col).slice(0, 4);

    const html = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d'Ariane">
        <a href="#/">Accueil</a> <span class="sep">/</span> <a href="#/boutique">Boutique</a>
        <span class="sep">/</span> <a href="#/boutique?cat=${p.cat}">${esc(cat.label)}</a>
        <span class="sep">/</span> <span class="current">${esc(p.name)}</span>
      </nav>

      <div class="product-layout">
        <!-- Galerie -->
        <div class="gallery">
          <figure class="main-view" id="main-view">
            <img id="main-img" src="${p.img}" alt="${esc(p.alt)}" fetchpriority="high">
            <span class="zoom-hint">${icon('zoom')} Agrandir</span>
          </figure>
          <div class="thumbs" role="list">
            ${views.map((v, i) => `
              <button class="thumb${i === 0 ? ' sel' : ''}" data-view="${i}" role="listitem" aria-label="Vue : ${esc(v.label)}">
                <span class="t-img"><img src="${v.src}" alt="" class="${v.zoom ? 'zoomed' : ''}"></span>
              </button>`).join('')}
            <span class="thumb" aria-hidden="true"><span class="t-label">Photos en situation<br>bientôt disponibles</span></span>
          </div>
        </div>

        <!-- Colonne d'achat -->
        <div class="buy-panel">
          <a class="product-coll" href="#/collection/${p.col}">${esc(collName(p.col))}</a>
          <h1 class="product-title">${esc(p.name)}</h1>
          <p class="product-artist">Création <b>Atelier ARTÉA</b> · <span class="demo-tag">œuvre de démonstration</span></p>

          <div class="product-price-row">
            <span class="product-price" id="p-price"></span>
            <span class="product-price-note" id="p-price-note">prix pour la sélection ci-dessous${CONFIG.tax.rate ? '' : ' · ' + esc(CONFIG.tax.note)}</span>
          </div>
          <p class="product-lead">${esc(p.lead)}</p>

          <p class="dispo-line"><span class="dot ${p.dispo === 'stock' ? 'ok' : 'wait'}"></span> ${A.dispoHTML(p)}</p>

          <div class="opt-block">
            <div class="opt-label"><span>Format</span><span class="v" id="lb-format"></span></div>
            <div class="opt-cards" role="radiogroup" aria-label="Format">
              ${Object.entries(FORMATS).map(([k, f]) => {
                const dis = !fmtsAvail.includes(k);
                return `<button class="opt-card${k === 'petit' ? ' sel' : ''}" data-format="${k}" ${dis ? 'disabled' : ''} title="${dis ? 'Non disponible pour cette œuvre' : ''}">
                  <span class="t">${f.label}</span><small>${f.dims[p.orientation]}</small>
                </button>`;
              }).join('')}
            </div>
          </div>

          <div class="opt-block">
            <div class="opt-label"><span>Support</span><span class="v" id="lb-support"></span></div>
            <div class="opt-cards" role="radiogroup" aria-label="Support">
              ${Object.entries(SUPPORTS).map(([k, s]) => {
                const dis = !supsAvail.includes(k);
                return `<button class="opt-card${k === 'toile' ? ' sel' : ''}" data-support="${k}" ${dis ? 'disabled' : ''}>
                  <span class="t">${s.label}</span><small>${s.add ? '+ ' + fmt(s.add) : 'inclus'}</small>
                </button>`;
              }).join('')}
            </div>
          </div>

          <div class="opt-block">
            <div class="opt-label"><span>Encadrement</span><span class="v" id="lb-cadre"></span></div>
            <div class="swatch-row" role="radiogroup" aria-label="Encadrement">
              ${[['aucun', '#FAF7F1', '—'], ['noir', '#211D18', 'Noir mat'], ['chene', '#C89B62', 'Chêne'], ['blanc', '#F4F1EA', 'Blanc']].map(([k, c, t]) =>
                `<button class="swatch${k === 'aucun' ? ' sel' : ''}" data-cadre="${k}" title="${esc(CADRES[k].label)} ${CADRES[k].add ? '(+ ' + fmt(CADRES[k].add) + ')' : ''}" style="background:${c};${k === 'aucun' ? 'background:repeating-linear-gradient(45deg,#fff,#fff 4px,#eee 4px,#eee 8px)' : ''}" aria-label="${esc(CADRES[k].label)}"></button>`
              ).join('')}
            </div>
            <small style="color:var(--muted);font-size:.78rem;display:block;margin-top:8px" id="lb-cadre-note">Sans encadrement : la toile est bord à bord sur châssis.</small>
          </div>

          <div class="qty-row">
            <div class="stepper">
              <button id="q-minus" aria-label="Diminuer la quantité">−</button>
              <input id="q-val" value="1" inputmode="numeric" aria-label="Quantité">
              <button id="q-plus" aria-label="Augmenter la quantité">+</button>
            </div>
            <span id="p-dims" style="font-size:.85rem;color:var(--muted)"></span>
          </div>

          <div class="buy-actions">
            <button class="btn btn-dark btn-lg btn-wide" id="btn-add">${icon('plus')} Ajouter au panier — <span id="btn-add-price"></span></button>
            <button class="btn btn-gold btn-wide" id="btn-buy">Acheter maintenant</button>
            <a class="btn btn-ghost btn-wide" href="#/contact?sujet=question&produit=${p.id}">Poser une question sur cette œuvre</a>
          </div>

          <div class="ship-note">
            <b>${icon('truck')} Livraison & retours</b>
            <ul>
              ${CONFIG.zones.map(z => `<li><span>${esc(z.name)}</span><span>${fmt(z.fee)} · ${esc(z.delay)}</span></li>`).join('')}
            </ul>
            ${CONFIG.freeShippingFrom ? `<small style="display:block;margin-top:8px;color:var(--gold-deep)">Livraison offerte dès ${fmt(CONFIG.freeShippingFrom)} d'achat <span class="demo-tag">offre d'exemple</span></small>` : ''}
            <small style="display:block;margin-top:6px;color:var(--muted)">Retour sous ${CONFIG.returns.days} jours · Œuvre endommagée : remplacée ou remboursée. <a href="#/retours" style="text-decoration:underline">Détails</a></small>
          </div>

          <div class="trust-mini">
            <span>${icon('shield')} Emballage renforcé pour œuvres</span>
            <span>${icon('chat')} Conseil personnalisé avant achat</span>
            <span>${icon('brush')} Impression giclée haute fidélité</span>
            <span>${icon('ruler')} ${esc(dimsLabel(p))}</span>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="tabs">
        <div class="tab-btns" role="tablist">
          <button class="tab-btn sel" data-tab="0" role="tab">L'histoire & l'inspiration</button>
          <button class="tab-btn" data-tab="1" role="tab">Caractéristiques</button>
          <button class="tab-btn" data-tab="2" role="tab">Conseils déco</button>
          <button class="tab-btn" data-tab="3" role="tab">Livraison, retours & FAQ</button>
        </div>
        <div class="tab-panel" data-panel="0">
          <h3>${esc(p.name)} — l'histoire de l'œuvre</h3>
          <p>${esc(p.histoire)}</p>
          <p>Chaque impression est réalisée à partir du fichier haute définition de l'atelier, avec des encres pigmentaires qui préservent la profondeur des couleurs pendant des décennies.</p>
        </div>
        <div class="tab-panel" data-panel="1" hidden>
          <h3>Caractéristiques techniques</h3>
          <table class="spec-table">
            <tr><td>Œuvre</td><td>${esc(p.name)} — Atelier ARTÉA${p.edition === 'limitee' ? ' · édition limitée numérotée' : ''}</td></tr>
            <tr><td>Dimensions disponibles</td><td>${Object.entries(FORMATS).filter(([k]) => fmtsAvail.includes(k)).map(([k, f]) => `${f.label} : ${f.dims[p.orientation]}`).join(' · ')}</td></tr>
            <tr><td>Orientation</td><td>${ORIENTATIONS[p.orientation]}</td></tr>
            <tr><td>Supports</td><td>${supsAvail.map(k => SUPPORTS[k].label).join(' · ')}</td></tr>
            <tr><td>Matériaux</td><td>Toile de coton 380 g/m² sur châssis bois, ou panneau aluminium composite · encres pigmentaires</td></tr>
            <tr><td>Technique</td><td>Création originale de l'atelier · impression giclée haute définition</td></tr>
            <tr><td>Couleurs dominantes</td><td>${p.colors.map(c => COLOR_NAMES[c]).join(' · ')}</td></tr>
            <tr><td>Encadrement</td><td>Optionnel : noir mat, chêne naturel ou blanc (+ ${fmt(59)})</td></tr>
            <tr><td>Disponibilité</td><td>${p.dispo === 'stock' ? 'En stock — préparation sous 2 à 3 jours ouvrés' : 'Fabrication sur commande — 2 à 3 semaines'}</td></tr>
          </table>
        </div>
        <div class="tab-panel" data-panel="2" hidden>
          <h3>Conseils de décoration</h3>
          <p>${esc(p.deco)}</p>
          <p><b>Espaces recommandés :</b> ${p.rooms.join(' · ')}.</p>
          <p>Astuce : au-dessus d'un canapé ou d'un lit, visez une largeur d'environ deux tiers de celle du meuble, et placez le centre de l'œuvre vers 1,55 m du sol.</p>
          <a class="link-arrow" href="#/article/choisir-tableau-salon">Lire notre guide : choisir un tableau pour son salon ${icon('arrow')}</a>
        </div>
        <div class="tab-panel" data-panel="3" hidden>
          <h3>Livraison estimée</h3>
          <table class="spec-table">
            ${CONFIG.zones.map(z => `<tr><td>${esc(z.name)}</td><td>${esc(z.delay)} — ${fmt(z.fee)}${CONFIG.bigFormatSurcharge ? ' (surcharge emballage + ' + fmt(CONFIG.bigFormatSurcharge) + ' au-delà de 80 cm)' : ''}</td></tr>`).join('')}
          </table>
          <h3 style="margin-top:22px">Conditions de retour</h3>
          <p>${esc(CONFIG.returns.note)} Délai de retour : <b>${CONFIG.returns.days} jours</b>. <span class="demo-tag">politique d'exemple à confirmer</span></p>
          <h3 style="margin-top:22px">Questions fréquentes</h3>
          ${FAQ[0].items.slice(0, 3).map(f => `<div class="tab-qa"><b>${esc(f.q)}</b><p>${esc(f.a)}</p></div>`).join('')}
          <a class="link-arrow" href="#/faq">Voir toute la FAQ ${icon('arrow')}</a>
        </div>
      </div>

      ${similar.length ? `
      <section class="section-tight" style="padding-bottom:0">
        <div class="section-head-row" style="margin-bottom:26px">
          <div class="section-head" style="margin-bottom:0"><span class="eyebrow">Dans le même univers</span><h2>Œuvres similaires</h2></div>
        </div>
        <div class="grid-products">${similar.map(A.productCard).join('')}</div>
      </section>` : ''}

      ${sameColl.length ? `
      <section class="section-tight" style="padding-bottom:0">
        <div class="section-head-row" style="margin-bottom:26px">
          <div class="section-head" style="margin-bottom:0"><span class="eyebrow">${esc(collName(p.col))}</span><h2>De la même collection</h2></div>
          <a class="link-arrow" href="#/collection/${p.col}">Voir la collection ${icon('arrow')}</a>
        </div>
        <div class="grid-products">${sameColl.map(A.productCard).join('')}</div>
      </section>` : ''}
    </div>`;

    A.render({
      html,
      title: `${p.name} — Tableau ${cat.label.toLowerCase()} | ARTÉA GALLERY`,
      desc: `${p.lead} ${p.name} : disponible en plusieurs formats, toile ou support rigide, encadrement en option. Livraison soignée vers les zones desservies.`,
      nav: 'boutique',
      after() {
        /* Galerie */
        const mainImg = $('#main-img');
        $$('.thumb[data-view]').forEach(t => t.addEventListener('click', () => {
          $$('.thumb').forEach(x => x.classList.remove('sel')); t.classList.add('sel');
          const v = views[+t.dataset.view];
          mainImg.src = v.src; mainImg.alt = v.alt;
        }));
        $('#main-view').addEventListener('click', () => A.openLightbox(mainImg.src, mainImg.alt));

        /* Variantes */
        function update() {
          const price = A.priceOf(p, sel);
          $('#p-price').textContent = fmt(price);
          $('#lb-format').textContent = `${FORMATS[sel.format].label} · ${A.dimsFull(p, sel)}`;
          $('#lb-support').textContent = SUPPORTS[sel.support].label;
          $('#lb-cadre').textContent = CADRES[sel.cadre].label;
          $('#lb-cadre-note').textContent = sel.cadre === 'aucun'
            ? 'Sans encadrement : la toile est bord à bord sur châssis.'
            : `${CADRES[sel.cadre].label} (+ ${fmt(CADRES[sel.cadre].add)}) — baguette fine, verre acryrique anti-reflet.`;
          $('#p-dims').textContent = `Dimensions : ${A.dimsFull(p, sel)}`;
          $('#btn-add-price').textContent = fmt(price);
          $$('[data-format]').forEach(b => b.classList.toggle('sel', b.dataset.format === sel.format));
          $$('[data-support]').forEach(b => b.classList.toggle('sel', b.dataset.support === sel.support));
          $$('[data-cadre]').forEach(b => b.classList.toggle('sel', b.dataset.cadre === sel.cadre));
        }
        $$('[data-format]').forEach(b => b.addEventListener('click', () => { sel.format = b.dataset.format; update(); }));
        $$('[data-support]').forEach(b => b.addEventListener('click', () => { sel.support = b.dataset.support; update(); }));
        $$('[data-cadre]').forEach(b => b.addEventListener('click', () => { sel.cadre = b.dataset.cadre; update(); }));

        /* Quantité */
        const qv = $('#q-val');
        $('#q-minus').addEventListener('click', () => { qv.value = Math.max(1, (+qv.value || 1) - 1); });
        $('#q-plus').addEventListener('click', () => { qv.value = Math.min(9, (+qv.value || 1) + 1); });

        /* Achats */
        $('#btn-add').addEventListener('click', () => A.addToCart(p, { ...sel }, Math.max(1, +qv.value || 1)));
        $('#btn-buy').addEventListener('click', () => { A.addToCart(p, { ...sel }, Math.max(1, +qv.value || 1), true); location.hash = '#/commande'; });

        /* Onglets */
        $$('.tab-btn').forEach(b => b.addEventListener('click', () => {
          $$('.tab-btn').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
          $$('.tab-panel').forEach((pn, i) => pn.hidden = i !== +b.dataset.tab);
        }));

        update();

        /* Données structurées produit (SEO) */
        document.querySelectorAll('script[data-seo="product"]').forEach(s => s.remove());
        const ld = document.createElement('script');
        ld.type = 'application/ld+json'; ld.dataset.seo = 'product';
        ld.textContent = JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Product',
          name: p.name, description: p.lead, image: p.img,
          brand: { '@type': 'Brand', name: 'ARTÉA GALLERY' },
          offers: {
            '@type': 'Offer', price: p.price, priceCurrency: CONFIG.currency.code,
            availability: p.dispo === 'stock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'
          }
        });
        document.head.appendChild(ld);
      }
    });
  }
  function dimsLabel(p) {
    return { portrait: 'Orientations portrait, paysage et carré disponibles selon l\u2019œuvre', paysage: 'Formats paysage disponibles', carre: 'Formats carrés disponibles' }[p.orientation] || 'Plusieurs formats disponibles';
  }

  /* ======================================================================
     COLLECTIONS
  ====================================================================== */
  function collections() {
    const list = collsVisible();
    const bannerImg = id => (byCollection(id)[0] || {}).img;
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">Les collections</span>
        <h1>Cinq regards, cinq atmosphères</h1>
        <p>Chaque collection réunit des œuvres cohérentes par leur émotion : explorez, comparez, laissez-vous guider.</p>
      </div>
      <div class="coll-grid" style="padding-bottom:20px">
        ${list.map(c => `
        <a class="coll-card reveal" href="#/collection/${c.id}">
          <img src="${bannerImg(c.id)}" alt="Collection ${esc(c.name)} — ARTÉA GALLERY" loading="lazy">
          <div class="coll-label">
            <h3>Collection ${esc(c.name)}</h3>
            <p>${esc(c.desc)}</p>
            <span style="font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-soft)">${byCollection(c.id).length} œuvre${byCollection(c.id).length > 1 ? 's' : ''} →</span>
          </div>
        </a>`).join('')}
      </div>
    </div>`;
    A.render({
      html,
      title: 'Collections artistiques — Épure, Horizon, Expression, Héritage, Signature | ARTÉA GALLERY',
      desc: 'Explorez les collections ARTÉA GALLERY : œuvres minimalistes, paysages, abstraits colorés, héritages africains et caribéens, éditions signature.',
      nav: 'collections'
    });
  }

  function collection(cid) {
    const c = COLLECTIONS.find(x => x.id === cid);
    const list = byCollection(cid);
    if (!c || !list.length) { A.render({ html: notFoundHTML(), title: 'Collection introuvable — ARTÉA GALLERY' }); return; }
    const html = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="#/">Accueil</a> <span class="sep">/</span> <a href="#/collections">Collections</a> <span class="sep">/</span> <span class="current">${esc(c.name)}</span></nav>
      <section class="coll-hero reveal">
        <img src="${list[0].img}" alt="Bannière de la collection ${esc(c.name)}">
        <div class="inner">
          <span class="eyebrow" style="color:var(--gold-soft)">Collection</span>
          <h1>${esc(c.name)}</h1>
          <p>${esc(c.desc)}</p>
        </div>
      </section>
      <div class="grid-products section-tight">${list.map(A.productCard).join('')}</div>
      <div style="text-align:center;padding-bottom:40px">
        <a class="btn btn-outline" href="#/collections">Toutes les collections</a>
      </div>
    </div>`;
    A.render({
      html,
      title: `Collection ${c.name} — ${c.desc} | ARTÉA GALLERY`,
      desc: `${c.desc} Découvrez la collection ${c.name} d'ARTÉA GALLERY et trouvez l'œuvre qui transformera votre intérieur.`,
      nav: 'collections'
    });
  }

  /* ======================================================================
     PANIER
  ====================================================================== */
  function panier() {
    const t = A.cartTotals();
    if (!t.count) {
      A.render({
        html: `<div class="container"><div class="empty-state" style="margin:60px auto;max-width:560px">
          <h1 style="font-size:1.9rem;margin-bottom:10px">Votre panier est vide</h1>
          <p>Laissez-vous tenter : chaque œuvre est disponible en plusieurs formats et finitions.</p>
          <a class="btn btn-dark" href="#/boutique">Explorer la collection</a>
        </div></div>`,
        title: 'Panier — ARTÉA GALLERY', nav: ''
      });
      return;
    }
    const html = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="#/">Accueil</a> <span class="sep">/</span> <span class="current">Panier</span></nav>
      <div class="cart-page-title">
        <h1 style="font-size:clamp(1.8rem,3vw,2.4rem)">Votre panier</h1>
        <a class="link-arrow" href="#/boutique">Continuer mes découvertes ${icon('arrow')}</a>
      </div>
      <div class="cart-layout section-tight">
        <div id="cart-items">
          ${A.state.cart.items.map(i => {
            const p = byId(i.id); if (!p) return '';
            const unit = A.priceOf(p, i.sel);
            return `<div class="cart-item" data-key="${esc(i.key)}">
              <a class="ci-img" href="#/produit/${p.id}"><img src="${p.img}" alt="${esc(p.alt)}"></a>
              <div>
                <a class="ci-name" href="#/produit/${p.id}">${esc(p.name)}</a>
                <p class="ci-variant">${esc(FORMATS[i.sel.format].label)} · ${esc(A.dimsOf(p, i.sel))} · ${esc(SUPPORTS[i.sel.support].label)} · ${esc(CADRES[i.sel.cadre].label)}</p>
                <div class="stepper">
                  <button data-dec aria-label="Diminuer">−</button>
                  <input value="${i.qty}" inputmode="numeric" aria-label="Quantité">
                  <button data-inc aria-label="Augmenter">+</button>
                </div>
              </div>
              <div class="ci-side" style="text-align:right">
                <p class="ci-price">${fmt(unit * i.qty)}</p>
                <button class="ci-remove" data-rm>Retirer</button>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="summary-card">
          <h3>Récapitulatif</h3>
          <div class="sum-row"><span>Sous-total (${t.count} article${t.count > 1 ? 's' : ''})</span><span>${fmt(t.sub)}</span></div>
          ${t.promoVal ? `<div class="sum-row" style="color:var(--ok)"><span>Code ${esc(A.state.cart.promo)} — ${esc(t.promoLabel)}</span><span>− ${fmt(t.promoVal)}</span></div>` : ''}
          <div class="sum-row"><span>${t.pickup ? 'Retrait à l\u2019atelier — Port-au-Prince' : 'Livraison — ' + esc(t.zone.name)}</span><span class="${t.free && !t.pickup ? 'free' : ''}">${t.pickup ? 'Gratuit' : (t.free ? 'Offerte' : fmt(t.ship))}</span></div>
          <div class="sum-row total"><span>Total</span><span>${fmt(t.total)} <small style="font-size:.75em;color:var(--muted)">USD</small></span></div>
          <p class="sum-note">${esc(CONFIG.tax.note)}</p>
          ${CONFIG.freeShippingFrom && !t.free && !t.pickup ? `
          <div class="free-ship-bar"><i style="width:${Math.min(100, t.subAfter / CONFIG.freeShippingFrom * 100)}%"></i></div>
          <p class="free-ship-txt">Plus que <b>${fmt(CONFIG.freeShippingFrom - t.subAfter)}</b> pour la livraison offerte <span class="demo-tag">offre d'exemple</span></p>` : ''}
          <div class="promo-row">
            <input id="promo-input" placeholder="Code promo" aria-label="Code promotionnel" value="${A.state.cart.promo || ''}">
            <button class="btn btn-ghost" id="promo-apply">Appliquer</button>
          </div>
          <p class="sum-note" id="promo-msg"></p>
          <div class="field" style="margin-block:14px">
            <label for="zone-select">Zone de livraison</label>
            <select id="zone-select" class="select" style="width:100%">
              ${CONFIG.zones.map(z => `<option value="${z.id}" ${z.id === A.state.cart.zone ? 'selected' : ''}>${esc(z.name)} — ${esc(z.delay)}</option>`).join('')}
            </select>
          </div>
          <a class="btn btn-dark btn-lg btn-wide" href="#/commande">Passer à la caisse</a>
          <p class="sum-note" style="text-align:center;margin-top:12px">Paiement sécurisé · moyens de paiement activés à la caisse</p>
        </div>
      </div>
    </div>`;
    A.render({
      html, title: 'Votre panier — ARTÉA GALLERY',
      desc: 'Consultez votre panier ARTÉA GALLERY : formats, supports et totaux transparents avant la caisse.',
      nav: '', after() { bindCart(); }
    });
  }

  function bindCart() {
    $$('.cart-item').forEach(row => {
      const key = row.dataset.key;
      const inp = $('input', row);
      $('[data-dec]', row).addEventListener('click', () => { A.setQty(key, (+inp.value || 1) - 1); panier(); });
      $('[data-inc]', row).addEventListener('click', () => { A.setQty(key, Math.min(9, (+inp.value || 1) + 1)); panier(); });
      $('[data-rm]', row).addEventListener('click', () => { A.removeItem(key); panier(); A.toast('Œuvre retirée du panier'); });
    });
    $('#zone-select').addEventListener('change', () => { A.state.cart.zone = $('#zone-select').value; A.store.set('artea_cart', A.state.cart); panier(); });
    $('#promo-apply').addEventListener('click', () => {
      const code = $('#promo-input').value.trim().toUpperCase();
      const msg = $('#promo-msg');
      if (!code) { A.state.cart.promo = null; A.store.set('artea_cart', A.state.cart); panier(); return; }
      if (CONFIG.promoCodes[code]) { A.state.cart.promo = code; A.store.set('artea_cart', A.state.cart); panier(); }
      else { msg.style.color = 'var(--err)'; msg.textContent = 'Ce code n\u2019est pas valide.'; }
    });
  }

  /* ======================================================================
     COMMANDE (démonstration — aucun paiement réel)
  ====================================================================== */
  function commande() {
    const t = A.cartTotals();
    if (!t.count) { location.hash = '#/panier'; return; }
    const html = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d'Ariane"><a href="#/">Accueil</a> <span class="sep">/</span> <a href="#/panier">Panier</a> <span class="sep">/</span> <span class="current">Caisse</span></nav>
      <h1 style="font-size:clamp(1.8rem,3vw,2.4rem)">Finaliser ma commande</h1>
      <div class="steps" style="margin-top:22px">
        <div class="step on"><b>1</b>Coordonnées & livraison</div>
        <div class="step"><b>2</b>Paiement</div>
        <div class="step"><b>3</b>Confirmation</div>
      </div>
      <div class="checkout-layout section-tight">
        <form id="co-form" novalidate>
          <fieldset>
            <legend>Vos coordonnées</legend>
            <div class="form-grid">
              <div class="field"><label for="f-prenom">Prénom *</label><input id="f-prenom" required autocomplete="given-name"></div>
              <div class="field"><label for="f-nom">Nom *</label><input id="f-nom" required autocomplete="family-name"></div>
              <div class="field"><label for="f-email">E-mail *</label><input id="f-email" type="email" required autocomplete="email"></div>
              <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" type="tel" autocomplete="tel"></div>
              <div class="field full"><label for="f-addr">Adresse de livraison *</label><input id="f-addr" required autocomplete="street-address"></div>
              <div class="field"><label for="f-ville">Ville *</label><input id="f-ville" required autocomplete="address-level2"></div>
              <div class="field"><label for="f-pays">Pays *</label>
                <select id="f-pays" required>
                  <option value="">— Sélectionner —</option>
                  <option>Haïti</option><option>République dominicaine</option><option>Jamaïque</option>
                  <option>États-Unis</option><option>Canada</option><option>France</option><option>Autre pays (zone Europe & International)</option>
                </select>
              </div>
              <div class="field full"><label for="f-notes">Instructions de livraison (optionnel)</label><input id="f-notes" placeholder="Code, étage, horaires…"></div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Mode de livraison</legend>
            ${CONFIG.zones.map(z => `
              <label class="radio-line${z.id === A.state.cart.zone ? ' sel' : ''}">
                <input type="radio" name="ship" value="${z.id}" ${z.id === A.state.cart.zone ? 'checked' : ''}>
                <span class="rl-main"><span class="rl-title">${esc(z.name)} — ${esc(z.delay)}</span><br><span class="rl-sub">Emballage renforcé pour œuvre d'art · suivi inclus</span></span>
                <span class="rl-price">${fmt(z.fee + (t.hasBig ? CONFIG.bigFormatSurcharge : 0))}${t.hasBig ? ' <small style="color:var(--muted)">(dont emballage grand format)</small>' : ''}</span>
              </label>`).join('')}
            ${CONFIG.zones.find(z => z.id === 'haiti').pickup ? `
              <label class="radio-line">
                <input type="radio" name="ship" value="pickup">
                <span class="rl-main"><span class="rl-title">Retrait à l'atelier — Port-au-Prince</span><br><span class="rl-sub">Sur rendez-vous, une fois la commande prête</span></span>
                <span class="rl-price">Gratuit</span>
              </label>` : ''}
          </fieldset>

          <fieldset>
            <legend>Paiement</legend>
            <div class="pay-demo-box">
              <b>Démonstration — paiement non activé.</b><br>
              Sur la boutique de production, le client choisit ici parmi les moyens de paiement réellement configurés dans Wix (carte bancaire, prestataire en ligne, virement…), puis règle sa commande sur la caisse sécurisée. Aucun paiement n'est simulé sur ce site.
            </div>
            ${CONFIG.payments.map(pm => `
              <label class="radio-line" style="opacity:.75;cursor:default">
                <input type="radio" name="pay" disabled>
                <span class="rl-main"><span class="rl-title">${esc(pm.label)}</span><br><span class="rl-sub">${esc(pm.note)}</span></span>
                <span class="demo-tag">à configurer</span>
              </label>`).join('')}
          </fieldset>

          <label class="consent-line">
            <input type="checkbox" id="f-cgv" required>
            <span>J'ai lu et j'accepte les <a href="#/cgv">conditions générales de vente</a> et la <a href="#/confidentialite">politique de confidentialité</a>. *</span>
          </label>
          <p class="form-msg err" id="co-err" style="margin-bottom:12px"></p>
          <button class="btn btn-dark btn-lg btn-wide" type="submit">Valider ma commande — <span id="co-total">${fmt(t.total)}</span></button>
          <p class="sum-note" style="text-align:center;margin-top:10px">Montant total affiché avant validation. Aucun prélèvement sur cette démonstration.</p>
        </form>

        <aside class="summary-card">
          <h3>Votre commande</h3>
          ${A.state.cart.items.map(i => {
            const p = byId(i.id); if (!p) return '';
            return `<div class="sum-row"><span>${esc(p.name)}<br><small style="color:var(--muted);font-size:.78rem">${esc(FORMATS[i.sel.format].label)} · ${esc(SUPPORTS[i.sel.support].label)} · ${esc(CADRES[i.sel.cadre].label)} × ${i.qty}</small></span><span>${fmt(A.priceOf(p, i.sel) * i.qty)}</span></div>`;
          }).join('')}
          <div class="sum-row"><span>Sous-total</span><span>${fmt(t.sub)}</span></div>
          ${t.promoVal ? `<div class="sum-row" style="color:var(--ok)"><span>Code ${esc(A.state.cart.promo)}</span><span>− ${fmt(t.promoVal)}</span></div>` : ''}
          <div class="sum-row"><span>${t.pickup ? 'Retrait à l\u2019atelier — Port-au-Prince' : 'Livraison'}</span><span>${t.pickup ? 'Gratuit' : (t.free ? 'Offerte' : fmt(t.ship))}</span></div>
          <div class="sum-row"><span>${esc(CONFIG.tax.label)}</span><span>${t.tax ? fmt(t.tax) : '—'}</span></div>
          <div class="sum-row total"><span>Total</span><span>${fmt(t.total)} <small style="font-size:.75em;color:var(--muted)">USD</small></span></div>
          <p class="sum-note">${esc(CONFIG.tax.note)}</p>
        </aside>
      </div>
    </div>`;
    A.render({
      html, title: 'Caisse — ARTÉA GALLERY (démonstration)',
      desc: 'Processus de commande ARTÉA GALLERY : coordonnées, livraison, paiement sécurisé.',
      nav: '',
      after() {
        $$('input[name="ship"]').forEach(r => r.addEventListener('change', () => {
          $$('input[name="ship"]').forEach(x => x.closest('.radio-line').classList.remove('sel'));
          r.closest('.radio-line').classList.add('sel');
          A.state.cart.zone = r.value === 'pickup' ? 'haiti' : r.value;
          A.state.cart.pickup = r.value === 'pickup';
          A.store.set('artea_cart', A.state.cart);
          const nt = A.cartTotals();
          $('#co-total').textContent = A.fmt(nt.total);
        }));
        $('#co-form').addEventListener('submit', e => {
          e.preventDefault();
          const req = ['f-prenom', 'f-nom', 'f-email', 'f-addr', 'f-ville', 'f-pays'];
          let bad = req.filter(id => !$('#' + id).value.trim());
          const em = $('#f-email').value.trim();
          if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) bad.push('f-email');
          if (!$('#f-cgv').checked) bad.push('f-cgv');
          const err = $('#co-err');
          if (bad.length) {
            err.textContent = bad.includes('f-cgv')
              ? 'Merci d\u2019accepter les conditions générales de vente.'
              : 'Merci de compléter les champs obligatoires (*).';
            bad.forEach(id => { const el = $('#' + id); if (el) el.style.borderColor = 'var(--err)'; });
            return;
          }
          const ship = document.querySelector('input[name="ship"]:checked');
          A.state.order = {
            ref: 'ART-DEMO-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toLocaleDateString('fr-FR'),
            customer: { prenom: $('#f-prenom').value.trim(), nom: $('#f-nom').value.trim(), email: em, tel: $('#f-tel').value.trim(), addr: $('#f-addr').value.trim(), ville: $('#f-ville').value.trim(), pays: $('#f-pays').value },
            ship: ship ? (ship.value === 'pickup' ? 'Retrait à l\u2019atelier — Port-au-Prince' : (CONFIG.zones.find(z => z.id === ship.value) || {}).name) : '—',
            items: A.state.cart.items.map(i => { const p = byId(i.id); return { name: p.name, sel: i.sel, qty: i.qty, price: A.priceOf(p, i.sel) }; }),
            totals: A.cartTotals()
          };
          A.state.cart = { items: [], promo: null, zone: CONFIG.zoneDefault, pickup: false };
          A.store.set('artea_cart', A.state.cart); A.updateCartBadge();
          location.hash = '#/confirmation';
        });
      }
    });
  }

  function confirmation() {
    const o = A.state.order;
    if (!o) { location.hash = '#/'; return; }
    const html = `
    <div class="container section-tight">
      <div class="confirm-card">
        <div class="confirm-badge">${icon('check')}</div>
        <h1>Merci pour votre commande${o.customer.prenom ? ', ' + esc(o.customer.prenom) : ''} !</h1>
        <p class="order-ref">Référence : <b>${esc(o.ref)}</b> · ${esc(o.date)}</p>
        <div class="demo-notice">
          <b>Démonstration</b> — Aucune commande réelle n'a été enregistrée et aucun paiement n'a été effectué.
          Sur la boutique de production, cette étape est gérée par la caisse sécurisée Wix : règlement réel, e-mail de confirmation automatique au client, notification vendeur et suivi de commande.
        </div>
        <div style="text-align:left;margin-block:18px">
          ${o.items.map(it => `<div class="sum-row"><span>${esc(it.name)} × ${it.qty}<br><small style="color:var(--muted);font-size:.78rem">${esc(FORMATS[it.sel.format].label)} · ${esc(SUPPORTS[it.sel.support].label)} · ${esc(CADRES[it.sel.cadre].label)}</small></span><span>${fmt(it.price * it.qty)}</span></div>`).join('')}
          <div class="sum-row"><span>Livraison — ${esc(o.ship)}</span><span>${o.totals.pickup ? 'Gratuit' : (o.totals.free ? 'Offerte' : fmt(o.totals.ship))}</span></div>
          <div class="sum-row total"><span>Total</span><span>${fmt(o.totals.total)} USD</span></div>
          <p class="sum-note">Livraison à : ${esc(o.customer.addr)}, ${esc(o.customer.ville)}, ${esc(o.customer.pays)}</p>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-dark" href="#/boutique">Continuer à explorer</a>
          <a class="btn btn-ghost" href="#/livraison">En savoir plus sur la livraison</a>
        </div>
      </div>
    </div>`;
    A.render({ html, title: 'Commande confirmée (démonstration) — ARTÉA GALLERY', desc: 'Confirmation de commande — démonstration ARTÉA GALLERY.', nav: '' });
  }

  /* ======================================================================
     LIVRAISON
  ====================================================================== */
  function livraison() {
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">Informations pratiques</span>
        <h1>Livraison & expédition</h1>
        <p>Chaque œuvre voyage comme une pièce de galerie : protégée, suivie et assurée. <span class="demo-tag">tarifs et délais d'exemple à ajuster</span></p>
      </div>
      <div class="prose" style="max-width:860px">
        <h2>Zones desservies, délais et frais</h2>
        <table>
          <thead><tr><th>Zone</th><th>Délai estimé</th><th>Frais</th><th>Options</th></tr></thead>
          <tbody>
            ${CONFIG.zones.map(z => `<tr>
              <td><b>${esc(z.name)}</b></td>
              <td>${esc(z.delay)}</td>
              <td>${fmt(z.fee)}${CONFIG.bigFormatSurcharge ? ` + ${fmt(CONFIG.bigFormatSurcharge)} par article de grand format (emballage renforcé)` : ''}</td>
              <td>${z.pickup ? 'Livraison standard · retrait à l\u2019atelier possible' : 'Livraison standard'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        ${CONFIG.freeShippingFrom ? `<p><b>Livraison offerte</b> à partir de ${fmt(CONFIG.freeShippingFrom)} d'achat, toutes zones confondues. <span class="demo-tag">offre d'exemple à confirmer</span></p>` : ''}
        <h2>Préparation & emballage</h2>
        <ul>
          <li>Œuvres en stock préparées sous <b>2 à 3 jours ouvrés</b> ; œuvres « sur commande » : 2 à 3 semaines de production supplémentaires.</li>
          <li>Protection par feuille de garde, coins mousse, calage rigide ; grands formats en caisse ou carton double cannelure.</li>
          <li>Chaque expédition est <b>assurée</b> contre les dommages de transport.</li>
        </ul>
        <h2>Suivi de commande</h2>
        <p>Un e-mail de confirmation est envoyé à la commande, puis un e-mail d'expédition avec numéro de suivi dès la prise en charge par le transporteur. Sur la boutique de production, la page « Suivi de commande » permet de consulter l'état en temps réel.</p>
        <h2>Retrait local (Haïti)</h2>
        <p>Le retrait gratuit à l'atelier de Port-au-Prince est proposé sur rendez-vous, une fois la commande prête. Vous êtes prévenu par e-mail.</p>
        <div class="todo-note">Avant la mise en ligne : remplacez zones, tarifs et délais par vos transporteurs réels, puis activez les règles correspondantes dans Wix (Transport → Zones et tarifs). Voir GUIDE-CONFIGURATION-WIX.md, section 5.</div>
        <p><a class="btn btn-dark" href="#/boutique">Retour à la boutique</a></p>
      </div>
    </div>`;
    A.render({ html, title: 'Livraison — zones, délais et emballage | ARTÉA GALLERY', desc: 'Zones desservies, délais, frais et emballage des œuvres ARTÉA GALLERY : transparents, assurés et suivis.', nav: '' });
  }

  /* ======================================================================
     À PROPOS
  ====================================================================== */
  function aPropos() {
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">À propos</span>
        <h1>Notre vision : rendre l'art accessible à chaque intérieur</h1>
        <p>ARTÉA GALLERY est une maison de tableaux décoratifs née d'une évidence : un mur nu est une histoire qui attend d'être racontée.</p>
      </div>
      <div class="split" style="padding-block:20px">
        <div class="img-frame reveal">
          <img src="img/tableau-nenuphars-crepuscule.jpg" alt="Toiles de la galerie exposées côte à côte" loading="lazy">
        </div>
        <div class="reveal">
          <span class="eyebrow">L'origine</span>
          <h2>Une galerie ouverte à tous</h2>
          <p>ARTÉA est née du constat que l'art reste trop souvent perçu comme réservé à quelques initiés. Nous croyons au contraire qu'un beau tableau, bien choisi et bien réalisé, peut transformer un salon, une chambre ou un bureau — sans budget de collectionneur.</p>
          <p>Notre atelier crée et sélectionne des œuvres originales, déclinées en impressions giclée haute fidélité, pour que chaque intérieur trouve sa voix.</p>
          <div class="todo-note">Ébauche éditoriale : personnalisez cette page avec votre véritable histoire, votre parcours et votre équipe — sans rien inventer. Un cadre « [À COMPLÉTER] » vous indique où apporter votre récit.</div>
        </div>
      </div>
      <div class="section-head center reveal" style="margin-top:30px">
        <span class="eyebrow">Nos valeurs</span>
        <h2>Ce qui guide chaque choix</h2>
      </div>
      <div class="benefits" style="margin-bottom:20px">
        ${[
          ['Élégance', 'Des œuvres et une présentation qui respectent l\u2019art et vos intérieurs.'],
          ['Créativité', 'Un atelier vivant, des collections qui évoluent avec les saisons et les inspirations.'],
          ['Qualité', 'Toiles 380 g/m², encres pigmentaires, contrôles qualité pièce par pièce.'],
          ['Accessibilité', 'Des prix justes, plusieurs formats, des conseils honnêtes pour choisir sereinement.'],
          ['Originalité', 'Des créations propres à l\u2019atelier, pas de catalogue générique.'],
          ['Satisfaction', 'Un accompagnement avant, pendant et après l\u2019achat — et une politique de retour claire.']
        ].map(([t, d]) => `<div class="benefit reveal"><h3 style="font-family:var(--font-d);font-size:1.2rem">${t}</h3><p>${d}</p></div>`).join('')}
      </div>
      <div class="split" style="padding-block:40px">
        <div class="reveal">
          <span class="eyebrow">Notre méthode</span>
          <h2>Comment les œuvres sont sélectionnées</h2>
          <p><b>1. Création.</b> L'atelier ARTÉA conçoit chaque œuvre : composition, palette, matière.</p>
          <p><b>2. Sélection.</b> Une œuvre entre en collection seulement si elle provoque une émotion immédiate et s'accorde à un vrai usage déco.</p>
          <p><b>3. Fabrication.</b> Impression giclée sur toile ou support rigide, contrôle des couleurs à la lumière du jour, emballage renforcé.</p>
        </div>
        <div class="img-frame reveal">
          <img src="img/tableau-paysage-horizon-dete.jpg" alt="Paysage minimal de la collection Horizon" loading="lazy">
        </div>
      </div>
      <div class="cta-box reveal">
        <p>« Transformez vos murs. Exprimez votre univers. »</p>
        <a class="btn btn-dark" href="#/boutique">Découvrir les œuvres</a>
      </div>
    </div>`;
    A.render({ html, title: 'À propos — Notre vision de l\u2019art mural | ARTÉA GALLERY', desc: 'La vision d\u2019ARTÉA GALLERY : rendre l\u2019art accessible à chaque intérieur, avec des œuvres sélectionnées et créées avec soin.', nav: 'a-propos' });
  }

  /* ======================================================================
     CONTACT
  ====================================================================== */
  function contact(q) {
    q = q || {};
    const p = q.produit ? byId(q.produit) : null;
    const sujetDefaut = q.sujet === 'question' && p ? 'question' : 'autre';
    const C = CONFIG.contact;
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">Contact</span>
        <h1>Parlons de vos murs</h1>
        <p>Une question sur une œuvre, une hésitation sur un format ? Nous répondons avec plaisir.</p>
      </div>
      <div class="contact-layout section-tight">
        <div>
          <form id="contact-form" novalidate>
            <div class="form-grid">
              <div class="field"><label for="c-nom">Nom *</label><input id="c-nom" required autocomplete="name"></div>
              <div class="field"><label for="c-email">E-mail *</label><input id="c-email" type="email" required autocomplete="email"></div>
              <div class="field full"><label for="c-sujet">Sujet *</label>
                <select id="c-sujet" required>
                  <option value="question" ${sujetDefaut === 'question' ? 'selected' : ''}>Question sur une œuvre</option>
                  <option value="commande">Suivi de commande</option>
                  <option value="retour">Retour / endommagé</option>
                  <option value="deco">Conseil décoration</option>
                  <option value="autre" ${sujetDefaut === 'autre' ? 'selected' : ''}>Autre demande</option>
                </select>
              </div>
              <div class="field full"><label for="c-msg">Message *</label><textarea id="c-msg" required>${p ? `Bonjour, j\u2019aimerais des informations sur l\u2019œuvre « ${p.name} »…` : ''}</textarea></div>
            </div>
            <p class="form-msg" id="c-msg-ok" style="margin-top:14px"></p>
            <button class="btn btn-dark btn-lg" type="submit" style="margin-top:16px">Envoyer le message</button>
            <p class="sum-note" style="margin-top:10px">En envoyant ce formulaire, vous acceptez que vos données soient utilisées uniquement pour répondre à votre demande (voir <a href="#/confidentialite" style="text-decoration:underline">politique de confidentialité</a>).</p>
          </form>
        </div>
        <aside class="contact-info-card">
          <h3>Nous joindre</h3>
          <div class="contact-line">${icon('chat')}<span><b>E-mail</b><br>${esc(C.email)} <span class="todo">à confirmer</span></span></div>
          <div class="contact-line">${icon('ruler')}<span><b>Atelier</b><br>${esc(C.address)}</span></div>
          <div class="contact-line">${icon('truck')}<span><b>Horaires du service client</b><br>${esc(C.hours)} <span class="todo">${esc(C.hoursNote)}</span></span></div>
          ${C.phone ? `<div class="contact-line">${icon('shield')}<span><b>Téléphone</b><br>${esc(C.phone)}</span></div>` : ''}
          ${C.whatsapp ? `<a class="btn btn-gold btn-wide" style="margin-top:14px" href="https://wa.me/${esc(C.whatsapp.replace(/[^0-9]/g, ''))}" rel="noopener" target="_blank">Écrire sur WhatsApp</a>` : ''}
          <h3 style="margin-top:26px">Suivez la galerie</h3>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${CONFIG.socials.map(s => s.url
              ? `<a class="btn btn-ghost btn-sm" href="${esc(s.url)}" target="_blank" rel="noopener">${s.label}</a>`
              : `<span class="btn btn-ghost btn-sm" style="cursor:default;opacity:.7">${s.label} <span class="todo">à connecter</span></span>`).join('')}
          </div>
          <p class="sum-note" style="margin-top:16px">Les coordonnées de cette page sont modifiables à tout moment depuis l'administration du site.</p>
        </aside>
      </div>
    </div>`;
    A.render({ html, title: 'Contact — Conseil & service client | ARTÉA GALLERY', desc: 'Contactez ARTÉA GALLERY : questions sur les œuvres, conseils déco, suivi de commande. Réponse personnalisée.', nav: 'contact', after() {
      $('#contact-form').addEventListener('submit', e => {
        e.preventDefault();
        const req = ['c-nom', 'c-email', 'c-msg'];
        let ok = true;
        req.forEach(id => { const el = $('#' + id); el.style.borderColor = el.value.trim() ? '' : 'var(--err)'; if (!el.value.trim()) ok = false; });
        const em = $('#c-email').value.trim();
        if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $('#c-email').style.borderColor = 'var(--err)'; ok = false; }
        const msg = $('#c-msg-ok');
        if (!ok) { msg.className = 'form-msg err'; msg.textContent = 'Merci de compléter les champs obligatoires.'; return; }
        msg.className = 'form-msg ok';
        msg.innerHTML = '✓ Merci ! Votre message a bien été envoyé. Nous revenons vers vous sous 24 à 48 h ouvrées. <span class="demo-tag">démonstration</span><br><small style="color:var(--muted)">En production : formulaire natif Wix avec e-mail de confirmation automatique.</small>';
        $('#contact-form').reset();
      });
    } });
  }

  /* ======================================================================
     FAQ
  ====================================================================== */
  function faq() {
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">Aide</span>
        <h1>Questions fréquentes</h1>
        <p>Produits, commandes, livraison, paiement, retours : tout ce qu'il faut savoir avant et après l'achat.</p>
      </div>
      <div class="faq-cats" role="tablist">
        ${FAQ.map((c, i) => `<button class="faq-cat-btn${i === 0 ? ' sel' : ''}" data-cat="${c.id}">${esc(c.label)}</button>`).join('')}
      </div>
      <div style="max-width:820px;margin-inline:auto;padding-bottom:30px" id="faq-list">
        ${FAQ[0].items.map(f => `
          <details class="acc"><summary>${esc(f.q)} ${icon('chev')}</summary><div class="acc-body">${esc(f.a)}</div></details>`).join('')}
      </div>
      <div style="text-align:center;padding-bottom:50px">
        <p style="color:var(--muted);margin-bottom:16px">Vous ne trouvez pas votre réponse ?</p>
        <a class="btn btn-dark" href="#/contact">Nous écrire</a>
      </div>
    </div>`;
    A.render({ html, title: 'FAQ — Questions fréquentes | ARTÉA GALLERY', desc: 'Réponses aux questions fréquentes : produits, commandes, livraison, paiement et retours ARTÉA GALLERY.', nav: '', after() {
      $$('.faq-cat-btn').forEach(b => b.addEventListener('click', () => {
        $$('.faq-cat-btn').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        const cat = FAQ.find(c => c.id === b.dataset.cat);
        $('#faq-list').innerHTML = cat.items.map(f => `<details class="acc"><summary>${esc(f.q)} ${icon('chev')}</summary><div class="acc-body">${esc(f.a)}</div></details>`).join('');
      }));
    } });
  }

  /* ======================================================================
     INSPIRATION (blog)
  ====================================================================== */
  function inspiration() {
    const html = `
    <div class="container">
      <div class="page-hero">
        <span class="eyebrow">Journal & conseils</span>
        <h1>Inspiration et conseils déco</h1>
        <p>Guides pratiques pour choisir, accrocher et mettre en scène vos tableaux — rédigés par la galerie.</p>
      </div>
      <div class="article-grid" style="padding-bottom:20px">
        ${ARTICLES.map(a => `
        <a class="article-card reveal" href="#/article/${a.slug}">
          <span class="a-img"><img src="${a.img}" alt="${esc(a.alt)}" loading="lazy"></span>
          <span class="a-body">
            <span class="a-meta">Conseils · ${a.min} min</span>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.excerpt)}</p>
            <span class="link-arrow">Lire l'article ${icon('arrow')}</span>
          </span>
        </a>`).join('')}
      </div>
      <div class="cta-box reveal" style="margin-block:30px 50px">
        <p>Un projet déco précis ? Nous vous aidons à choisir la pièce idéale.</p>
        <a class="btn btn-dark" href="#/contact">Demander conseil</a>
      </div>
    </div>`;
    A.render({ html, title: 'Inspiration & conseils déco — Choisir ses tableaux | ARTÉA GALLERY', desc: 'Guides déco ARTÉA GALLERY : choisir un tableau pour son salon, créer un mur de tableaux, associer les couleurs, tendances art mural.', nav: 'inspiration' });
  }

  function article(slug) {
    const a = window.ART.article(slug);
    if (!a) { A.render({ html: notFoundHTML(), title: 'Article introuvable — ARTÉA GALLERY' }); return; }
    const others = ARTICLES.filter(x => x.slug !== slug).slice(0, 3);
    const bodyHTML = a.body.map(([t, v]) => {
      if (t === 'p') return `<p>${esc(v)}</p>`;
      if (t === 'h2') return `<h2>${esc(v)}</h2>`;
      if (t === 'cta') return `<div class="cta-box"><p>${esc(v)}</p><a class="btn btn-dark" href="#/boutique">Voir les œuvres</a></div>`;
      if (t === 'product') return `
        <div class="grid-products" style="grid-template-columns:repeat(3,1fr);margin:22px 0 26px">
          ${v.map(id => A.productCard(byId(id))).join('')}
        </div>`;
      return '';
    }).join('');
    const html = `
    <div class="container">
      <nav class="breadcrumb" style="justify-content:center"><a href="#/">Accueil</a> <span class="sep">/</span> <a href="#/inspiration">Inspiration</a> <span class="sep">/</span> <span class="current">${esc(a.title)}</span></nav>
      <article class="prose" style="max-width:820px">
        <div class="article-hero">
          <span class="a-meta">Conseils déco · ${a.min} min de lecture · ${new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <h1 style="margin-top:10px">${esc(a.title)}</h1>
          <div class="a-img"><img src="${a.img}" alt="${esc(a.alt)}"></div>
        </div>
        ${bodyHTML}
      </article>
      <section class="section-tight">
        <div class="section-head" style="margin-bottom:22px"><span class="eyebrow">À lire aussi</span><h2>Autres guides</h2></div>
        <div class="article-grid">${others.map(o => `
          <a class="article-card" href="#/article/${o.slug}">
            <span class="a-img"><img src="${o.img}" alt="${esc(o.alt)}" loading="lazy"></span>
            <span class="a-body"><span class="a-meta">Conseils · ${o.min} min</span><h3>${esc(o.title)}</h3><p>${esc(o.excerpt)}</p></span>
          </a>`).join('')}</div>
      </section>
    </div>`;
    A.render({ html, title: `${a.title} | Inspiration ARTÉA GALLERY`, desc: a.excerpt, nav: 'inspiration' });
  }

  /* ======================================================================
     PAGES LÉGALES (cadres + placeholders, rien d'inventé)
  ====================================================================== */
  const TODO = '<div class="todo-note">[À COMPLÉTER] Renseignez ici vos informations légales réelles (raison sociale, immatriculation, adresse…) avec l\u2019aide de votre conseil juridique. Aucune mention légale ne doit être inventée.</div>';
  function legal(kind) {
    const map = {
      cgv: {
        title: 'Conditions générales de vente',
        desc: 'Conditions générales de vente ARTÉA GALLERY : commandes, prix, livraison, retours.',
        body: `
        ${TODO}
        <h2>1. Objet</h2><p>Les présentes conditions régissent les ventes de tableaux et d'œuvres décoratives conclues sur le site ARTÉA GALLERY. Elles s'appliquent à toute commande, sans exception.</p>
        <h2>2. Produits & prix</h2><p>Les œuvres sont décrites avec la plus grande exactitude possible (dimensions, matériaux, supports, encadrement en option). Les prix sont affichés en ${CONFIG.currency.code}, hors taxes applicables selon le pays de livraison ; les frais de livraison sont indiqués avant validation finale.</p>
        <h2>3. Commande</h2><p>La commande est confirmée par e-mail après validation. Le montant total, taxes et livraison comprises, est toujours affiché avant le paiement final.</p>
        <h2>4. Paiement</h2><p>Le paiement s'effectue via les moyens activés sur la boutique, traités par des prestataires sécurisés. L'entreprise ne stocke aucune donnée bancaire.</p>
        <h2>5. Livraison</h2><p>Les zones, délais et frais figurent sur la <a href="#/livraison" style="text-decoration:underline">page Livraison</a>. Les risques liés au transport sont couverts par l'assurance expédition.</p>
        <h2>6. Droit de rétractation & retours</h2><p>Les conditions détaillées figurent sur la <a href="#/retours" style="text-decoration:underline">page Retours</a>.</p>
        <h2>7. Garanties & œuvres endommagées</h2><p>Toute œuvre endommagée à l'arrivée est remplacée ou remboursée après constatation (photos de l'emballage et de l'œuvre demandées sous 48 h).</p>
        <h2>8. Propriété intellectuelle</h2><p>Les œuvres, visuels et textes du site sont protégés. Toute reproduction sans autorisation écrite est interdite.</p>
        <h2>9. Droit applicable</h2><p>Ces CGV sont soumises au droit du pays d'établissement de l'entreprise [À COMPLÉTER]. En cas de litige, une solution amiable sera recherchée en priorité.</p>`
      },
      confidentialite: {
        title: 'Politique de confidentialité',
        desc: 'Politique de confidentialité ARTÉA GALLERY : données collectées, finalités, consentement et droits.',
        body: `
        ${TODO}
        <h2>Données collectées</h2><p>Lors d'une commande ou d'un contact : nom, e-mail, téléphone, adresse de livraison. Lors de l'inscription à la newsletter : adresse e-mail et consentement explicite.</p>
        <h2>Finalités</h2><p>Traiter les commandes et livraisons · répondre aux demandes · envoyer la newsletter uniquement avec consentement · améliorer le site (statistiques anonymisées).</p>
        <h2>Consentement & désinscription</h2><p>L'inscription à la newsletter requiert une case de consentement explicite. Chaque e-mail contient un lien de désinscription immédiate. Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.</p>
        <h2>Cookies</h2><p>Seuls les cookies strictement nécessaires (panier, session) et, après consentement explicite via la bannière dédiée, les cookies de mesure d'audience et marketing (le cas échéant). Vous pouvez modifier vos préférences à tout moment.</p>
        <h2>Droits</h2><p>Vous disposez de droits d'accès, de rectification, d'effacement et de portabilité de vos données. Pour les exercer : ${esc(CONFIG.contact.email)}. Conformez-vous aux obligations de votre juridiction (ex. RGPD pour l'Europe, législation haïtienne pour Haïti) avec l'aide de votre conseil.</p>`
      },
      retours: {
        title: 'Politique de retour',
        desc: 'Conditions de retour et gestion des œuvres endommagées chez ARTÉA GALLERY.',
        body: `
        <h2>Délai de retour</h2><p>Vous disposez de <b>${CONFIG.returns.days} jours</b> après réception pour demander un retour. <span class="demo-tag">politique d'exemple à confirmer</span></p>
        <h2>Conditions</h2><ul>
          <li>L'œuvre doit être dans son état d'origine, avec son emballage d'origine.</li>
          <li>Contactez-nous d'abord via la <a href="#/contact" style="text-decoration:underline">page Contact</a> : nous vous indiquons la procédure et l'adresse de retour.</li>
          <li>Les frais de retour sont à la charge du client, sauf erreur de notre part.</li>
          <li>Remboursement sous 7 jours après réception et contrôle de l'œuvre.</li>
        </ul>
        <div class="todo-note">[À COMPLÉTER] Selon votre législation, les œuvres fabriquées sur commande selon des spécifications personnalisées peuvent être exclues du droit de rétractation. Faites valider cette clause par votre conseil juridique.</div>
        <h2>Œuvre endommagée à l'arrivée</h2><p>Signalez-le nous <b>sous 48 h</b> avec des photos de l'emballage et de l'œuvre. Nous organisons le remplacement ou le remboursement complet, transport compris. Chaque expédition est assurée.</p>`
      },
      mentions: {
        title: 'Mentions légales',
        desc: 'Mentions légales du site ARTÉA GALLERY.',
        body: `
        ${TODO}
        <h2>Éditeur du site</h2><p>ARTÉA GALLERY — ${esc(CONFIG.contact.address)}<br>Raison sociale, forme juridique et immatriculation : [À COMPLÉTER]<br>Directeur(rice) de la publication : [À COMPLÉTER]<br>Contact : ${esc(CONFIG.contact.email)}</p>
        <h2>Hébergement</h2><p>Le site de production est hébergé par Wix.com Ltd. — [coordonnées de l'hébergeur à compléter].</p>
        <h2>Propriété intellectuelle</h2><p>L'ensemble des contenus (œuvres, textes, logo, design) est la propriété exclusive d'ARTÉA GALLERY ou de ses auteurs. Toute reproduction, même partielle, est interdite sans autorisation écrite.</p>
        <h2>Note de démonstration</h2><p>Ce site est une démonstration : aucune vente réelle n'y est conclue, aucun paiement n'y est traité.</p>`
      }
    }[kind];
    A.render({
      html: `<div class="container"><div class="page-hero"><h1>${map.title}</h1></div><div class="prose" style="padding-bottom:40px">${map.body}</div></div>`,
      title: `${map.title} | ARTÉA GALLERY`, desc: map.desc, nav: ''
    });
  }

  /* ======================================================================
     RECHERCHE & 404
  ====================================================================== */
  function recherche(q) {
    const t = ((q && q.q) || '').toLowerCase();
    const list = t ? visible().filter(p => (p.name + ' ' + p.lead + ' ' + collName(p.col) + ' ' + (CATEGORIES.find(c => c.id === p.cat) || {}).label).toLowerCase().includes(t)) : [];
    A.render({
      html: `<div class="container">
        <div class="page-hero"><span class="eyebrow">Recherche</span><h1>Résultats pour « ${esc(t)} »</h1><p>${list.length} œuvre${list.length > 1 ? 's' : ''} trouvée${list.length > 1 ? 's' : ''}</p></div>
        <div class="grid-products" style="padding-bottom:20px">${list.map(A.productCard).join('')}</div>
        ${!list.length ? `<div class="empty-state" style="margin-bottom:50px"><h3>Aucun résultat</h3><p>Essayez « abstrait », « paysage », « or »… ou parcourez toute la boutique.</p><a class="btn btn-dark" href="#/boutique">Voir la boutique</a></div>` : ''}
      </div>`,
      title: `Recherche : ${t} | ARTÉA GALLERY`, desc: 'Résultats de recherche dans la galerie ARTÉA.', nav: ''
    });
  }

  function notFoundHTML() {
    return `<div class="container"><div class="nf-wrap">
      <p class="eyebrow" style="justify-content:center">Erreur 404</p>
      <h1 style="margin-bottom:14px">Cette œuvre a quitté la galerie</h1>
      <p style="color:var(--muted);max-width:440px;margin:0 auto 26px">La page recherchée n'existe pas ou plus. Laissez-vous guider vers nos collections.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a class="btn btn-dark" href="#/boutique">Explorer la boutique</a>
        <a class="btn btn-ghost" href="#/">Retour à l'accueil</a>
      </div>
    </div></div>`;
  }
  function notFound() { A.render({ html: notFoundHTML(), title: 'Page introuvable — ARTÉA GALLERY', desc: 'Page introuvable.', nav: '' }); }

  return { boutique, produit, collections, collection, panier, commande, confirmation,
           livraison, aPropos, contact, faq, inspiration, article, legal, recherche, notFound };
})();

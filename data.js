/* ==========================================================================
   ARTÉA GALLERY — Données & configuration
   ---------------------------------------------------------------------------
   ▸ Tout ce qui est modifiable se trouve ici (équivalent du back-office Wix).
   ▸ Les prix, offres, zones et textes marqués « démonstration » sont
     PROVISOIRES : à remplacer par vos vraies données avant la mise en ligne.
   ▸ Produits avec img:null = visuel en cours de création (masqués du site).
   ========================================================================== */
window.ART = (function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURATION GÉNÉRALE
  ------------------------------------------------------------------ */
  const CONFIG = {
    demo: true, // passe à false quand la boutique réelle est en ligne

    brand: {
      name: 'ARTÉA GALLERY',
      tagline: 'Transformez vos murs. Exprimez votre univers.',
      short: 'Galerie et boutique en ligne de tableaux décoratifs : des œuvres sélectionnées avec soin pour donner du caractère à chaque intérieur.'
    },

    currency: { code: 'USD', label: '$' },

    /* Barre d'annonce — modifiable ici, sans toucher au code.
       Ne jamais afficher une offre qui n'existe pas réellement. */
    announcements: [
      'Nouvelle sélection — découvrez les dernières œuvres arrivées dans la galerie',
      'Site de démonstration — produits, prix et offres provisoires',
      'Livraison offerte dès 250 $ d\u2019achat <span class="demo-tag">offre d\u2019exemple à confirmer</span>'
    ],

    /* Livraison offerte à partir de (offre d'EXEMPLE — mettre null si non offerte) */
    freeShippingFrom: 250,

    /* Codes promotionnels (démonstration) */
    promoCodes: {
      'ART10': { type: 'percent', value: 10, label: 'Bienvenue — 10 % (code de démonstration)' }
    },

    /* Zones de livraison — TARIFS ET DÉLAIS D'EXEMPLE, à ajuster
       selon vos transporteurs réels avant publication. */
    zones: [
      { id: 'haiti',         name: 'Haïti',                    delay: '5 à 7 jours ouvrés',    fee: 15, pickup: true },
      { id: 'ameriques',     name: 'Caraïbes & Amériques',     delay: '10 à 15 jours ouvrés',  fee: 45, pickup: false },
      { id: 'international', name: 'Europe & International',   delay: '15 à 25 jours ouvrés',  fee: 75, pickup: false }
    ],
    zoneDefault: 'haiti',
    bigFormatSurcharge: 20, // supplément emballage renforcé par format grand

    /* Taxes — À CONFIGURER selon votre juridiction (ex. TCA 10 % en Haïti). */
    tax: { rate: 0, label: 'Taxes', note: 'Taxes non incluses — à configurer selon votre juridiction (ex. TCA 10 % en Haïti).' },

    /* Moyens de paiement — AUCUN n'est encore configuré (démonstration).
       Wix Payments / PayPal ne sont pas disponibles pour une entreprise
       enregistrée en Haïti : voir GUIDE-CONFIGURATION-WIX.md section 4. */
    payments: [
      { id: 'carte',    label: 'Carte bancaire',              status: 'pending', note: 'À activer — selon disponibilité pour le pays de l\u2019entreprise' },
      { id: 'paypal',   label: 'PayPal',                      status: 'pending', note: 'Sous réserve d\u2019éligibilité du compte' },
      { id: 'virement', label: 'Virement / paiement manuel',  status: 'pending', note: 'Possible nativement dans Wix Stores' }
    ],

    returns: {
      days: 14, // POLITIQUE D'EXEMPLE à confirmer
      note: 'Retour sous 14 jours après réception, œuvre dans son état d\u2019origine et son emballage. Œuvre arrivée endommagée : remplacement ou remboursement après photos.'
    },

    /* Contact — À REMPLACER par vos coordonnées vérifiées. */
    contact: {
      email: 'bonjour@artea-gallery.com',
      phone: null,           // affiché seulement si renseigné
      whatsapp: null,        // ex. '+509 00 00 0000' — bouton WhatsApp activé seulement si renseigné
      address: 'Port-au-Prince, Haïti',
      hours: 'Lundi – Vendredi · 9h00 – 17h00',
      hoursNote: 'horaires à confirmer'
    },

    /* Réseaux sociaux réellement utilisés — remplacer url:null par vos liens.
       Ceux qui restent null ne s'affichent pas. */
    socials: [
      { id: 'instagram', label: 'Instagram', url: null },
      { id: 'facebook',  label: 'Facebook',  url: null },
      { id: 'pinterest', label: 'Pinterest', url: null }
    ],

    /* Image de bannière d'accueil — provisoire, sera remplacée par la
       photographie d'intérieur dédiée (banniere-accueil-galerie-art.jpg). */
    hero: { img: 'img/tableau-abstrait-echo-dore.jpg', temp: true }
  };

  /* ------------------------------------------------------------------
     VARIANTES (formats · supports · encadrements)
     Prix de base = format petit · toile · sans encadrement.
  ------------------------------------------------------------------ */
  const FORMATS = {
    petit: { label: 'Petit format',  add: 0,   dims: { portrait: '40 × 50 cm', paysage: '50 × 40 cm', carre: '50 × 50 cm' } },
    moyen: { label: 'Format moyen',  add: 60,  dims: { portrait: '60 × 80 cm', paysage: '80 × 60 cm', carre: '70 × 70 cm' } },
    grand: { label: 'Grand format',  add: 120, dims: { portrait: '80 × 120 cm', paysage: '120 × 80 cm', carre: '90 × 90 cm' } }
  };
  const SUPPORTS = {
    toile:  { label: 'Toile montée sur châssis',        add: 0 },
    rigide: { label: 'Impression sur support rigide',   add: 45 }
  };
  const CADRES = {
    aucun: { label: 'Sans encadrement', add: 0 },
    noir:  { label: 'Encadré noir mat', add: 59 },
    chene: { label: 'Encadré chêne naturel', add: 59 },
    blanc: { label: 'Encadré blanc', add: 59 }
  };
  const ORIENTATIONS = { portrait: 'Portrait', paysage: 'Paysage', carre: 'Carré' };
  const COLOR_NAMES = {
    beige: 'Beige', blanc: 'Blanc cassé', noir: 'Noir', bleu: 'Bleu', vert: 'Vert',
    or: 'Or', ocre: 'Ocre / terre', gris: 'Gris', rouge: 'Rouge', multicolore: 'Multicolore'
  };
  const COLOR_HEX = {
    beige: '#D9C7A7', blanc: '#F5F0E6', noir: '#1D1A16', bleu: '#3D5A73', vert: '#5C7259',
    or: '#B08D4F', ocre: '#A9682F', gris: '#8D8779', rouge: '#9E3B2D', multicolore: 'conic-gradient(#C05B4D,#C9A35C,#5C7259,#3D5A73,#6E5A8E)'
  };
  const STYLE_NAMES = { moderne: 'Moderne', minimaliste: 'Minimaliste', boheme: 'Bohème', classique: 'Classique', eclectique: 'Éclectique' };

  /* ------------------------------------------------------------------
     CATÉGORIES (affichées seulement si des produits visibles existent)
  ------------------------------------------------------------------ */
  const CATEGORIES = [
    { id: 'abstrait',          label: 'Tableaux abstraits',        desc: 'Compositions libres, matières et couleurs.' },
    { id: 'contemporain',      label: 'Art contemporain',          desc: 'Un regard actuel, entre formes et idée.' },
    { id: 'paysages',          label: 'Paysages et nature',        desc: 'Horizons, forêts, eau et lumière.' },
    { id: 'portraits',         label: 'Portraits et figures',      desc: 'Présences humaines et sensibilité.' },
    { id: 'africain-caribeen', label: 'Art africain et caribéen',  desc: 'Héritages, racines et identités.' },
    { id: 'minimaliste',       label: 'Tableaux minimalistes',     desc: 'Lignes, silence et équilibre.' },
    { id: 'spirituel',         label: 'Art spirituel et symbolique', desc: 'Symboles, recueillement, élévation.' },
    { id: 'deco-moderne',      label: 'Décoration murale moderne', desc: 'Pièces graphiques pensées pour décorer.' }
  ];

  /* ------------------------------------------------------------------
     COLLECTIONS
  ------------------------------------------------------------------ */
  const COLLECTIONS = [
    { id: 'epure',     name: 'Épure',     desc: 'Des œuvres minimalistes et apaisantes, pour des intérieurs qui respirent.' },
    { id: 'horizon',   name: 'Horizon',   desc: 'Des paysages, des horizons et des compositions naturelles.' },
    { id: 'expression',name: 'Expression',desc: 'Des tableaux abstraits, colorés et expressifs qui dynamisent l\u2019espace.' },
    { id: 'heritage',  name: 'Héritage',  desc: 'Des œuvres inspirées des cultures, des identités et des traditions artistiques.' },
    { id: 'signature', name: 'Signature', desc: 'Une sélection premium : éditions limitées numérotées et pièces d\u2019exception.' }
  ];

  /* ------------------------------------------------------------------
     PRODUITS — Prix de démonstration (format petit · toile · sans cadre)
     img:null → produit masqué jusqu\u2019à availability du visuel.
  ------------------------------------------------------------------ */
  const PRODUCTS = [
    {
      id: 'echo-dore', name: 'Écho Doré', cat: 'abstrait', col: 'expression',
      price: 189, orientation: 'portrait', colors: ['beige', 'or'], styles: ['moderne', 'minimaliste'],
      dispo: 'stock', isNew: false, featured: true, added: '2026-09-12',
      img: 'img/tableau-abstrait-echo-dore.jpg',
      alt: 'Tableau abstrait Écho Doré — couches de beige chaleureux et feuille d\u2019or sur toile',
      scene: null,
      lead: 'Une abstraction douce où le beige et l\u2019or se répondent en vagues successives.',
      histoire: 'Écho Doré est née d\u2019une réflexion sur la lumière du matin : celle qui glisse sur un mur et le transforme. Les couches superposées de beiges chauds, rehaussées de touches de feuille d\u2019or, créent une matière vivante qui change d\u2019aspect selon l\u2019heure de la journée.',
      deco: 'Superbe au-dessus d\u2019un canapé ou d\u2019une console, dans un salon aux tons neutres, bois clair et lin. Se marie avec des textures naturelles : rotin, laine bouclée, pierre claire.',
      rooms: ['Salon', 'Entrée', 'Chambre']
    },
    {
      id: 'reverie-lin', name: 'Rêverie de Lin', cat: 'minimaliste', col: 'epure',
      price: 149, orientation: 'portrait', colors: ['beige', 'blanc'], styles: ['minimaliste', 'boheme'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-12',
      img: 'img/tableau-minimaliste-reverie-lin.jpg',
      alt: 'Tableau minimaliste Rêverie de Lin — arche organique beige sur fond écru texturé',
      scene: null,
      lead: 'Une arche organique, une matière-like-plâtre et un silence apaisant.',
      histoire: 'Inspirée de l\u2019architecture douce et du wabi-sabi, Rêverie de Lin célèbre l\u2019imperfection : la main de l\u2019artiste se lit dans la matière, comme un souffle retenu. Une œuvre pensée pour ralentir le regard.',
      deco: 'Parfaite dans une chambre ou un coin lecture, seule ou en duo avec une pièce tonale plus sombre. S\u2019accorde aux palettes écru, sable et terracotta doux.',
      rooms: ['Chambre', 'Salon', 'Coin lecture']
    },
    {
      id: 'lignes-equilibre', name: 'Lignes d\u2019Équilibre', cat: 'minimaliste', col: 'epure',
      price: 159, orientation: 'paysage', colors: ['noir', 'blanc'], styles: ['minimaliste', 'moderne'],
      dispo: 'stock', isNew: false, featured: true, added: '2026-09-12',
      img: 'img/tableau-minimaliste-lignes-equilibre.jpg',
      alt: 'Tableau minimaliste Lignes d\u2019Équilibre — fines lignes noires horizontales sur fond crème',
      scene: null,
      lead: 'Le geste répété, presque méditatif : quelques lignes, et tout s\u2019apaise.',
      histoire: 'Chaque ligne est tracée à la main, sans règle : leur légère irregularité donne à l\u2019œuvre sa respiration. Une pièce d\u2019inspiration japonaise qui structure un mur sans jamais l\u2019encombrer.',
      deco: 'Idéale au-dessus d\u2019un bureau ou d\u2019une table basse. S\u2019harmonise avec un intérieur graphique : noir, blanc, bois clair et métal fin.',
      rooms: ['Bureau', 'Salon', 'Salle à manger']
    },
    {
      id: 'etreinte', name: 'Étreinte', cat: 'portraits', col: 'epure',
      price: 155, orientation: 'portrait', colors: ['ocre', 'beige'], styles: ['minimaliste', 'boheme'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-14', noRigid: true,
      img: 'img/tableau-portrait-ligne-etreinte.jpg',
      alt: 'Tableau Étreinte — dessin au trait continu terracotta de deux silhouettes enlacées',
      scene: null,
      lead: 'Un trait continu, une étreinte : l\u2019essentiel de l\u2019émotion en une seule ligne.',
      histoire: 'D\u2019un seul geste, sans lever le crayon, la ligne dessine deux silhouettes qui se tiennent. Étreinte parle de lien, de tendresse et de présence — une œuvre que l\u2019on offre autant que l\u2019on s\u2019offre.',
      deco: 'Très belle dans une chambre ou un couloir, encadrée finement. À associer à des tons terracotta, lin et bois naturel.',
      rooms: ['Chambre', 'Couloir', 'Salon']
    },
    {
      id: 'horizon-dete', name: 'Horizon d\u2019Été', cat: 'paysages', col: 'horizon',
      price: 179, orientation: 'paysage', colors: ['bleu', 'beige'], styles: ['moderne', 'minimaliste'],
      dispo: 'stock', isNew: false, featured: true, added: '2026-09-16',
      img: 'img/tableau-paysage-horizon-dete.jpg',
      alt: 'Tableau paysage Horizon d\u2019Été — mer turquoise et ciel crème à l\u2019horizon minimal',
      scene: null,
      lead: 'Une mer calme, un ciel laiteux : la respiration d\u2019une plage à midi.',
      histoire: 'Peint d\u2019après le souvenir d\u2019une côte au mois d\u2019août, Horizon d\u2019Été réduit le paysage à l\u2019essentiel : la ligne d\u2019horizon, la lumière, la couleur de l\u2019eau. Une fenêtre ouverte sur la mer.',
      deco: 'Éclatante au-dessus d\u2019un canapé ou d\u2019une tête de lit. S\u2019accorde aux intérieurs clairs, lin blanc, bois pâle et touches indigo.',
      rooms: ['Salon', 'Chambre', 'Salle de bain']
    },
    {
      id: 'montagne-bleue', name: 'Montagne Bleue', cat: 'paysages', col: 'horizon',
      price: 169, orientation: 'portrait', colors: ['bleu', 'gris'], styles: ['classique', 'moderne'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-16',
      img: 'img/tableau-paysage-montagne-bleue.jpg',
      alt: 'Tableau paysage Montagne Bleue — crêtes brumeuses en dégradés de bleu et de gris',
      scene: null,
      lead: 'Des crêtes superposées dans la brume, comme des respirations successives.',
      histoire: 'L\u2019œuvre joue sur la superposition des plans : chaque crête est plus pâle que la précédente, jusqu\u2019à se fondre dans le ciel. Une profondeur qui invite au silence et au voyage intérieur.',
      deco: 'Magnifique dans un escalier, un bureau ou une chambre. Se marie aux matières froides : lin gris-bleu, pierre, métal brossé.',
      rooms: ['Bureau', 'Chambre', 'Couloir']
    },
    {
      id: 'foret-silencieuse', name: 'Forêt Silencieuse', cat: 'paysages', col: 'horizon',
      price: 175, orientation: 'portrait', colors: ['vert'], styles: ['classique', 'boheme'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-18',
      img: 'img/tableau-nature-foret-silencieuse.jpg',
      alt: 'Tableau nature Forêt Silencieuse — silhouettes d\u2019arbres dans la brume, tons verts sauge',
      scene: null,
      lead: 'Une forêt dans la brume, où la lumière filtre entre les troncs.',
      histoire: 'Forêt Silencieuse capture ce moment du petit matin où la forêt ne fait encore aucun bruit. Les verts profonds et sauge se répondent pour créer une atmosphère presque sonore de calme.',
      deco: 'Somptueuse dans une chambre ou un salon aux tons verts, bois foncé et laiton. À associer à des plantes et des matières veloutées.',
      rooms: ['Chambre', 'Salon', 'Bureau']
    },
    {
      id: 'nenuphars-crepuscule', name: 'Nénuphars au Crépuscule', cat: 'paysages', col: 'horizon',
      price: 185, orientation: 'carre', colors: ['bleu', 'vert', 'or'], styles: ['classique', 'eclectique'],
      dispo: 'stock', isNew: true, featured: true, added: '2026-10-01', noBig: true,
      img: 'img/tableau-nenuphars-crepuscule.jpg',
      alt: 'Tableau Nénuphars au Crépuscule — bassin bleu-vert traversé de reflets dorés et de nénuphars roses',
      scene: null,
      lead: 'Un bassin au soir tombant, entre bleu profond et or liquide.',
      histoire: 'Hommage contemporain aux jardins d\u2019eau des impressionnistes : l\u2019eau du soir retient les dernières lueurs dorées pendant que les nénuphars s\u2019endorment. Une peinture de lumière autant que de fleurs.',
      deco: 'Rayonnante sur un grand mur de salon ou de salle à manger. Appelle des matières nobles : velours, laiton, bois fumé.',
      rooms: ['Salon', 'Salle à manger', 'Chambre']
    },
    {
      id: 'danse-arc-en-ciel', name: 'Danse Arc-en-Ciel', cat: 'contemporain', col: 'expression',
      price: 199, orientation: 'carre', colors: ['multicolore'], styles: ['eclectique', 'moderne'],
      dispo: 'stock', isNew: true, featured: true, added: '2026-10-03',
      img: 'img/tableau-contemporain-danse-arc-en-ciel.jpg',
      alt: 'Tableau contemporain Danse Arc-en-Ciel — formes organiques corail, sarcelle, jaune et violet sur fond crème',
      scene: null,
      lead: 'Des formes qui dansent : la joie en pleine conscience.',
      histoire: 'Découpées comme des papiers collés, les formes s\u2019enlacent et s\u2019équilibrent — un hombage moderne aux composition joyeuses de Matisse. Danse Arc-en-Ciel est une œuvre qui sourit sans crier.',
      deco: 'Énergie idéale pour un salon neutre, une salle de jeux raffinée ou un cabinet dentaire… qui a de l\u2019humour. Réveillez un canapé gris ou une bibliothèque blanche.',
      rooms: ['Salon', 'Salle à manger', 'Espace enfants élégant']
    },
    {
      id: 'frenesie', name: 'Frénésie', cat: 'abstrait', col: 'expression',
      price: 209, orientation: 'paysage', colors: ['rouge', 'or'], styles: ['moderne', 'eclectique'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-20',
      img: 'img/tableau-abstrait-frenesie.jpg',
      alt: 'Tableau abstrait Frénésie — gestes énergiques rouge carmin et orange sur fond anthracite',
      scene: null,
      lead: 'Un geste ample, presque musical : l\u2019énergie contenue d\u2019un murmure rouge.',
      histoire: 'Frénésie naît d\u2019un mouvement du bras entier — pas de dessin préparatoire, seulement le rythme. Les rouges profonds s\u2019embrasent sur le charbon, ponctués d\u2019éclats d\u2019or.',
      deco: 'Pièce maîtresse au-dessus d\u2019une table basse ou dans une entrée double hauteur. Superbe avec noir, laiton, cuir cognac.',
      rooms: ['Salon', 'Entrée', 'Bureau créatif']
    },
    /* --- Œuvres en cours de création visuelle (img:null → masquées) --- */
    {
      id: 'rythme-urbain', name: 'Rythme Urbain', cat: 'contemporain', col: 'expression',
      price: 189, orientation: 'portrait', colors: ['bleu', 'or'], styles: ['moderne'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-22',
      img: null, alt: 'Tableau contemporain Rythme Urbain — skyline géométrique bleu nuit aux lignes dorées',
      scene: null,
      lead: 'Une skyline la nuit, quand la ville ne garde que ses lumières essentielles.',
      histoire: 'Rythme Urbain simplifie la ville à ses verticales et ses arcs, baignés de bleu minuit. L\u2019or trace le trajet des lumières, comme une partition suspendue.',
      deco: 'Élégante dans un bureau ou un salon masculin-tailored : cuir, noyer, laiton. À marier à un bleu profond.',
      rooms: ['Bureau', 'Salon', 'Chambre']
    },
    {
      id: 'racines', name: 'Racines', cat: 'africain-caribeen', col: 'heritage',
      price: 219, orientation: 'portrait', colors: ['ocre'], styles: ['boheme', 'eclectique'],
      dispo: 'stock', isNew: false, featured: true, added: '2026-09-24',
      img: null, alt: 'Tableau art caribéen Racines — portrait de femme au regard fier, tons ocre et terracotta',
      scene: null,
      lead: 'Un regard fier, une couronne de fleurs dorées : l\u2019élégance des racines.',
      histoire: 'Racines célèbre la force tranquille des femmes des Caraïbes. La chevelure devient paysage, les fleurs deviennent couronne — l\u2019identité comme un jardin que l\u2019on entretient.',
      deco: 'Magnifique dans un salon aux tons chauds : terracotta, ocre, bois mi-sombre, fibres naturelles. Belle en paire avec Masque Ancestral.',
      rooms: ['Salon', 'Salle à manger', 'Entrée']
    },
    {
      id: 'masque-ancestral', name: 'Masque Ancestral', cat: 'africain-caribeen', col: 'heritage',
      price: 229, orientation: 'portrait', colors: ['ocre', 'or'], styles: ['classique', 'eclectique'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-24',
      img: null, alt: 'Tableau art africain Masque Ancestral — masque sculpté sur fond de feuille d\u2019or',
      scene: null,
      lead: 'La mémoire sculptée, présentée comme un trésor de musée.',
      histoire: 'Un masque sculpté, isolé sur un fond d\u2019or : Masque Ancestral rend hommage aux arts premiers et à leur modernité vertigineuse. Une œuvre de contemplation et de respect.',
      deco: 'Traitement galerie pour un mur d\u2019entrée ou de bureau. S\u2019accorde au bois foncé, au noir et aux mérites dorés.',
      rooms: ['Entrée', 'Bureau', 'Salon']
    },
    {
      id: 'carrefour-esprits', name: 'Carrefour des Esprits', cat: 'spirituel', col: 'heritage',
      price: 239, orientation: 'carre', colors: ['bleu', 'or'], styles: ['eclectique', 'classique'],
      dispo: 'stock', isNew: true, featured: false, added: '2026-10-05',
      img: null, alt: 'Tableau spirituel Carrefour des Esprits — symboles célestes dorés sur indigo profond',
      scene: null,
      lead: 'Soleil, lune et étoiles tracés à l\u2019or sur une nuit indigo.',
      histoire: 'Inspirée des cosmologies et des arts du sacré, cette œuvre dessine un carrefour céleste : les lignes d\u2019or relient les astres comme on relie les générations. Une pièce méditative, ouverte à toutes les spiritualités.',
      deco: 'Belle dans un espace de recueillement : chambre, coin méditation, bibliothèque. À marier à l\u2019indigo, l\u2019or et le bois sombre.',
      rooms: ['Chambre', 'Coin méditation', 'Bibliothèque']
    },
    {
      id: 'serenite', name: 'Sérénité', cat: 'spirituel', col: 'epure',
      price: 165, orientation: 'carre', colors: ['blanc', 'or'], styles: ['minimaliste'],
      dispo: 'stock', isNew: true, featured: false, added: '2026-10-05',
      img: null, alt: 'Tableau spirituel Sérénité — cercle enso doré peint à la main sur fond ivoire',
      scene: null,
      lead: 'Un cercle tracé d\u2019un seul souffle : la pleine présence.',
      histoire: 'L\u2019enso, ce cercle peint en un seul geste, symbolise le moment présent — complet bien qu\u2019ouvert. Ici, l\u2019or délicat sur l\u2019ivoire rend la méditation presque lumineuse.',
      deco: 'Idéale pour un mur de yoga, une chambre apaisée ou un spa privé. Minimale, elle aime les grandes surfaces claires.',
      rooms: ['Chambre', 'Salle de yoga', 'Salle de bain']
    },
    {
      id: 'portrait-ocre', name: 'Portrait en Ocre', cat: 'portraits', col: 'signature',
      price: 349, orientation: 'portrait', colors: ['ocre'], styles: ['classique', 'moderne'],
      dispo: 'commande', isNew: true, featured: false, added: '2026-10-07', edition: 'limitee',
      img: null, alt: 'Tableau Portrait en Ocre — portrait contemporain aux tons ambre et bronze',
      scene: null,
      lead: 'Un visage émergeant de l\u2019ambre, entre tradition du portrait et abstraction.',
      histoire: 'Pièce signature : le portrait classique rencontre la peinture gestuelle contemporaine. Chaque exemplaire est numéroté et accompagné de son certificat d\u2019édition limitée.',
      deco: 'Pièce de conversation pour un salon, un cabinet ou un hôtel boutique. Sublime en grand format au-dessus d\u2019une cheminée.',
      rooms: ['Salon', 'Bureau', 'Hôtel']
    },
    {
      id: 'murmures-ville', name: 'Murmures de la Ville', cat: 'deco-moderne', col: 'signature',
      price: 259, orientation: 'paysage', colors: ['gris', 'or'], styles: ['moderne', 'minimaliste'],
      dispo: 'stock', isNew: true, featured: false, added: '2026-10-07', edition: 'limitee',
      img: null, alt: 'Tableau Murmures de la Ville — façades grises et champagne aux fenêtres dorées',
      scene: null,
      lead: 'Une ville au crépuscule, réduite à des façades et des lumières murmurantes.',
      histoire: 'Murmures de la Ville peint l\u2019heure bleue : les façades deviennent abstraites, les fenêtres s\u2019allument une à une. Une édition limitée numérotée à l\u2019atmosphère feutrée.',
      deco: 'Parfaite au-dessus d\u2019une console d\u2019entrée ou dans une chambre d\u2019hôtel. Élégante avec gris perle, champagne et velours.',
      rooms: ['Entrée', 'Chambre', 'Hôtel']
    },
    {
      id: 'panneau-dore', name: 'Panneau Doré', cat: 'deco-moderne', col: 'expression',
      price: 279, orientation: 'portrait', colors: ['or', 'noir'], styles: ['moderne'],
      dispo: 'stock', isNew: false, featured: false, added: '2026-09-28', edition: 'limitee',
      img: null, alt: 'Tableau décoratif Panneau Doré — arches noires et feuille d\u2019or sur fond crème',
      scene: null,
      lead: 'Des arches graphiques et de la feuille d\u2019or : le chic géométrique.',
      histoire: 'Pensé comme un objet de décoration autant que comme une œuvre, Panneau Doré joue des arches architecturales et de la lumière métallique de l\u2019or. Édition limitée numérotée.',
      deco: 'Déclarative dans une entrée ou derrière un lit. Affirmée avec marbre, noir profond et laiton.',
      rooms: ['Entrée', 'Chambre', 'Salon']
    }
  ];

  /* ------------------------------------------------------------------
     JOURNAL / BLOG — Inspiration & conseils déco
  ------------------------------------------------------------------ */
  const ARTICLES = [
    {
      slug: 'choisir-tableau-salon',
      title: 'Comment choisir un tableau pour son salon',
      excerpt: 'Dimensions, hauteur d\u2019accroche, couleurs : la méthode simple pour choisir un tableau qui structure votre salon.',
      img: 'img/tableau-abstrait-echo-dore.jpg',
      alt: 'Tableau abstrait doré au-dessus d\u2019un canapé',
      date: '2026-10-02', min: 4,
      body: [
        ['p', 'Le salon est la pièce où un tableau a le plus d\u2019effet : c\u2019est souvent le premier mur que voient vos invités. Voici une méthode en quatre étapes, utilisée par les décorateurs, pour choisir sans vous tromper.'],
        ['h2', '1. Mesurez le mur, pas l\u2019envie'],
        ['p', 'Règle d\u2019or : un tableau doit représenter environ les deux tiers de la largeur du meuble qu\u2019il surmonte. Au-dessus d\u2019un canapé de 220 cm, visez donc 120 à 150 cm de large — un grand format paysage ou un diptyque.'],
        ['h2', '2. Respectez la hauteur d\u2019accroche'],
        ['p', 'Le centre de l\u2019œuvre se place à environ 1,55–1,60 m du sol, et laissez 15–25 cm entre le bas du cadre et le haut du canapé. Trop haut, le tableau « flotte » ; trop bas, il écrase.'],
        ['h2', '3. Choisissez un dialogue de couleurs'],
        ['p', 'Reprenez deux couleurs déjà présentes dans la pièce (coussins, tapis, rideaux) et choisissez une œuvre qui les contient, puis ajoutez une couleur contrastante pour le piquant. Un intérieur beige gagne beaucoup à un accent doré, terracotta ou bleu nuit.'],
        ['product', ['echo-dore', 'horizon-dete', 'frenesie']],
        ['h2', '4. Pensez « ambiance » plutôt que « thème »'],
        ['p', 'Un abstrait apporte de l\u2019énergie, un paysage du calme, un minimaliste de la structure. Demandez-vous ce que votre salon ne fait pas encore, et choisissez l\u2019œuvre qui complète l\u2019atmosphère.'],
        ['cta', 'Explorez les collections et trouvez le tableau qui s\u2019accordera à votre salon.']
      ]
    },
    {
      slug: 'creer-mur-de-tableaux',
      title: 'Créer un mur de tableaux harmonieux',
      excerpt: 'La technique du « mur galerie » : mélanger les formats, les encadrements et les styles sans jamais créer de chaos.',
      img: 'img/tableau-minimaliste-lignes-equilibre.jpg',
      alt: 'Composition de lignes minimalistes pour un mur de tableaux',
      date: '2026-10-02', min: 5,
      body: [
        ['p', 'Un mur de tableaux — ou gallery wall — transforme un mur vide en récit personnel. Mais sans méthode, il devient un chaos. Voici les règles des commissaires d\u2019exposition, adaptées à la maison.'],
        ['h2', 'Choisissez un fil conducteur'],
        ['p', 'Trois options : une palette de couleurs commune (ex. tons chauds), un thème (voyage, nature, abstraction) ou un type de cadre identique. Une seule règle suffit — jamais les trois à moitié.'],
        ['h2', 'Composez au sol avant de clouer'],
        ['p', 'Disposez vos œuvres au sol, en partant de la pièce maîtresse au centre. Gardez 5 à 8 cm entre les cadres : c\u2019est le « silence » qui permet à chaque œuvre de respirer.'],
        ['h2', 'Mélangez les formats avec logique'],
        ['p', 'Alternez vertical et horizontal, grand et petit, mais évitez deux pièces de même taille côte à côte. Un miroir ou un objet rond peut servir de respiration au centre de la composition.'],
        ['product', ['lignes-equilibre', 'etreinte', 'nenuphars-crepuscule']],
        ['h2', 'Accrochez à hauteur de regard'],
        ['p', 'Le centre visuel de l\u2019ensemble se place à 1,55 m du sol. Dans un escalier ou un couloir, suivez la ligne montante du regard.'],
        ['cta', 'Découvrez les œuvres qui se marient bien en mur galerie.']
      ]
    },
    {
      slug: 'associer-couleurs-tableau-interieur',
      title: 'Associer les couleurs d\u2019un tableau à son intérieur',
      excerpt: 'La roue des couleurs appliquée à la décoration : complémentaire, analogue ou ton sur ton — les trois duos qui fonctionnent toujours.',
      img: 'img/tableau-contemporain-danse-arc-en-ciel.jpg',
      alt: 'Tableau multicolore réveillant un intérieur neutre',
      date: '2026-10-04', min: 4,
      body: [
        ['p', 'Un tableau réussi n\u2019est pas seulement beau : il est juste dans son environnement. Tout se joue sur trois stratégies chromatiques simples.'],
        ['h2', 'La stratégie analogue : l\u2019harmonie douce'],
        ['p', 'Choisissez un tableau dont les couleurs voisinent avec celles de la pièce : un paysage bleu et gris dans un intérieur vert-de-gris, un abstrait ocre dans un salon beige. Effet : apaisant, élégant, intemporel.'],
        ['h2', 'La stratégie complémentaire : le contraste maîtrisé'],
        ['p', 'Les couleurs opposées sur la roue se renforcent : bleu/orange, vert/terracotta, violet/jaune. Un seul tableau suffit à créer ce contraste — c\u2019est la façon la plus rapide de réveiller un intérieur neutre.'],
        ['product', ['danse-arc-en-ciel', 'montagne-bleue', 'foret-silencieuse']],
        ['h2', 'Le ton sur ton : la profondeur'],
        ['p', 'Un tableau monochrome légèrement plus sombre ou plus clair que son mur crée une profondeur subtile. Un noir et blanc sur mur crème, un écru sur mur sable : discret mais très raffiné.'],
        ['h2', 'La règle des 60-30-10'],
        ['p', '60 % de couleur dominante (murs), 30 % de couleur secondaire (meubles), 10 % d\u2019accent. Votre tableau est l\u2019endroit idéal pour assumer ce dernier 10 % audacieux.'],
        ['cta', 'Filtrez la boutique par couleur dominante pour trouver votre accent parfait.']
      ]
    },
    {
      slug: 'inspirations-africaines-caribeennes',
      title: 'Inspirations africaines et caribéennes dans la décoration murale',
      excerpt: 'Couleurs de terre, matières naturelles, symbolique : comment honorer ces héritages artistiques avec justesse chez soi.',
      img: 'img/tableau-portrait-ligne-etreinte.jpg',
      alt: 'Œuvre au trait inspirée des traditions artistiques',
      date: '2026-10-06', min: 5,
      body: [
        ['p', 'Les arts d\u2019Afrique et des Caraïbes portent une puissance singulière : des couleurs de terre, des gestes qui racontent des histoires, des symboles qui relient les générations. Les intégrer chez soi est un bel hommage — à condition de le faire avec justesse.'],
        ['h2', 'Privilégier les œuvres contemporaines'],
        ['p', 'Plutôt que des objets détournés de leur fonction, choisissez des créations contemporaines inspirées de ces traditions : portraits fiers, scènes de vie, compositions symboliques. Vous soutenez ainsi une création vivante.'],
        ['product', ['racines', 'carrefour-esprits', 'masque-ancestral']],
        ['h2', 'Jouer la palette de terre'],
        ['p', 'Ocre, terracotta, brun chaud, indigo et or : ces teintes dialoguent naturellement avec les fibres (rotin, jonc), les bois mi-sombres et le lin. Une seule œuvre suffit à ancrer toute une pièce.'],
        ['h2', 'Donner de l\u2019espace et de la lumière'],
        ['p', 'Ces œuvres racontent : offrez-leur un mur dégagé et un éclairage doux dirigé. Un accrochage aéré respecte leur force symbolique.'],
        ['cta', 'Découvrez la collection Héritage et ses œuvres inspirées des cultures atlantiques.']
      ]
    }
  ];

  /* ------------------------------------------------------------------
     FAQ — réponses conformes aux réglages de démonstration.
  ------------------------------------------------------------------ */
  const FAQ = [
    {
      id: 'produits', label: 'Produits',
      items: [
        { q: 'Les tableaux sont-ils originaux ou imprimés ?', a: 'La collection standard propose des impressions giclée haute définition des créations de l\u2019atelier, sur toile de coton 380 g/m² ou sur support rigide. Les œuvres de la collection Signature sont des éditions limitées numérotées. Chaque fiche produit précise la nature exacte de l\u2019œuvre.' },
        { q: 'Quels matériaux sont utilisés ?', a: 'Toile de coton 380 g/m² montée sur châssis bois, ou impression sur panneau rigide (aluminium composite), avec encres pigmentaires résistantes à la lumière. Les cadres proposés sont en bois (noir mat, chêne naturel ou blanc).' },
        { q: 'Les cadres sont-ils inclus ?', a: 'Non, sauf si vous sélectionnez l\u2019option « Encadré » au moment de la commande. Le prix affiché par défaut correspond à l\u2019œuvre sans encadrement ; l\u2019option encadrement est ajoutée en toute transparence dans le prix.' },
        { q: 'Comment choisir la bonne dimension ?', a: 'Au-dessus d\u2019un canapé ou d\u2019un lit, visez une largeur d\u2019environ deux tiers de celle du meuble. Le centre de l\u2019œuvre se place vers 1,55 m du sol. En cas d\u2019hésitation entre deux formats, prenez le plus grand : un tableau trop petit est l\u2019erreur la plus fréquente. Consultez aussi notre guide « Comment choisir un tableau pour son salon ».' }
      ]
    },
    {
      id: 'commandes', label: 'Commandes',
      items: [
        { q: 'Comment commander un tableau ?', a: 'Choisissez votre format, le support et l\u2019encadrement sur la fiche de l\u2019œuvre, ajoutez au panier, puis validez vos coordonnées et votre mode de livraison à la caisse. Le montant total est toujours affiché avant confirmation finale.' },
        { q: 'Puis-je modifier ma commande ?', a: 'Oui, tant que la commande n\u2019a pas été mise en production : contactez-nous au plus vite via la page Contact en indiquant votre numéro de commande, nous ferons le nécessaire.' },
        { q: 'Comment savoir si ma commande est confirmée ?', a: 'Vous recevez immédiatement un e-mail de confirmation récapitulant votre commande (fonction activée dans la boutique de production), puis un second e-mail à l\u2019expédition avec le suivi.' }
      ]
    },
    {
      id: 'livraison', label: 'Livraison',
      items: [
        { q: 'Où livrez-vous ?', a: 'Nous livrons vers les zones desservies indiquées sur la page Livraison (Haïti, Caraïbes & Amériques, Europe & International). Les tarifs et délais détaillés y sont présentés en toute transparence.' },
        { q: 'Quels sont les délais ?', a: 'Les œuvres en stock sont préparées sous 2 à 3 jours ouvrés, puis acheminées selon la zone (de 5 à 25 jours ouvrés selon la destination — délais d\u2019exemple à confirmer sur la page Livraison). Les œuvres « sur commande » demandent 2 à 3 semaines de production supplémentaires.' },
        { q: 'Comment suivre ma commande ?', a: 'Un numéro de suivi vous est envoyé par e-mail dès l\u2019expédition. Sur la boutique de production, la page de suivi Wix permet également de consulter l\u2019état de votre commande à tout moment.' },
        { q: 'Comment les tableaux sont-ils emballés ?', a: 'Chaque œuvre est protégée par une feuille de protection, des coins renforcés en mousse et un emballage rigide. Les grands formats voyagent en caisse ou carton double cannelure.' }
      ]
    },
    {
      id: 'paiement', label: 'Paiement',
      items: [
        { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Les moyens de paiement réellement activés seront affichés à la caisse et en pied de page. Selon le pays d\u2019enregistrement de l\u2019entreprise, cela peut inclure la carte bancaire, un prestataire en ligne et/ou le paiement par virement. Cette version de démonstration n\u2019active encore aucun paiement.' },
        { q: 'Comment le paiement est-il sécurisé ?', a: 'Sur la boutique de production, les paiements sont traités par des prestataires certifiés via la caisse sécurisée Wix (chiffrement HTTPS, norme PCI-DSS). ARTÉA GALLERY ne stocke jamais vos données bancaires.' }
      ]
    },
    {
      id: 'retours', label: 'Retours',
      items: [
        { q: 'Quelles sont les conditions de retour ?', a: 'Vous disposez de 14 jours après réception pour demander un retour (politique d\u2019exemple à confirmer), l\u2019œuvre devant être dans son état d\u2019origine et son emballage. Les frais de retour sont à votre charge sauf erreur de notre part.' },
        { q: 'Que faire si un tableau arrive endommagé ?', a: 'Signalez-le nous sous 48 h avec des photos de l\u2019emballage et de l\u2019œuvre : nous organisons le remplacement ou le remboursement complet, transport compris. Chaque expédition est assurée.' }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     MOTEUR — helpers d'accès
  ------------------------------------------------------------------ */
  const visible = () => PRODUCTS.filter(p => p.img);
  const byId = id => PRODUCTS.find(p => p.id === id);
  const byCollection = cid => visible().filter(p => p.col === cid);
  const byCategory = cid => visible().filter(p => p.cat === cid);
  const catsVisible = () => CATEGORIES.filter(c => byCategory(c.id).length > 0);
  const collsVisible = () => COLLECTIONS.filter(c => byCollection(c.id).length > 0);
  const featured = () => visible().filter(p => p.featured);
  const news = () => visible().filter(p => p.isNew);
  const article = slug => ARTICLES.find(a => a.slug === slug);

  return { CONFIG, FORMATS, SUPPORTS, CADRES, ORIENTATIONS, COLOR_NAMES, COLOR_HEX, STYLE_NAMES,
           CATEGORIES, COLLECTIONS, PRODUCTS, ARTICLES, FAQ,
           visible, byId, byCollection, byCategory, catsVisible, collsVisible, featured, news, article };
})();

# ARTÉA GALLERY — Boutique en ligne de tableaux & art mural

> « Transformez vos murs. Exprimez votre univers. »

**Site de démonstration fonctionnel complet** d'une boutique e-commerce haut de gamme de tableaux décoratifs — conçu comme la spécification visuelle et fonctionnelle d'une future boutique Wix.

---

## Aperçu

Galerie d'art contemporaine + boutique en ligne :

- **Page d'accueil** immersive (bannière, catégories, sélections, nouveautés, mises en situation, newsletter…)
- **Boutique** avec filtres réels : catégorie, collection, prix, taille, orientation, couleur dominante, style, support, disponibilité — et 4 options de tri
- **Fiches produit** : galerie avec zoom, variantes format × support × encadrement (prix et disponibilité dynamiques), description en 3 actes, livraison par zone, JSON-LD produit
- **Collections** : Épure · Horizon · Expression · Héritage · Signature
- **Panier & caisse de démonstration** : quantités, codes promo, zones de livraison, récapitulatif transparent — *aucun paiement simulé*
- **Pages** : Livraison, À propos, Contact, FAQ, Journal (4 guides déco), CGV, Confidentialité, Retours, Mentions légales, 404
- **Qualité** : responsive mobile, accessibilité (ARIA, focus visible, reduced-motion), SEO par page, parcours d'achat vérifié par 35 tests automatisés

> ⚠️ **Statut : démonstration.** Les produits, prix, offres, tarifs et délais sont provisoires et signalés comme tels sur le site. Aucune vente réelle n'y est conclue.

## Structure du projet

```
artea-gallery/
├── index.html                    # Point d'entrée (SPA à routage par hash)
├── css/style.css                 # Design système « galerie » (palette, typo, composants)
├── js/data.js                    # ⭐ Tout le contenu modifiable : produits, prix, textes, FAQ, articles, config
├── js/app.js                     # Cœur : routeur, panier, recherche, page d'accueil
├── js/pages.js                   # Pages : boutique, produit, collections, caisse, éditorial…
├── img/                          # Visuels originaux des œuvres (générés)
└── GUIDE-CONFIGURATION-WIX.md    # Guide pas-à-pas de reproduction dans Wix
```

## Lancer le site en local

Aucune dépendance ni build. Avec Python :

```bash
cd artea-gallery
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`. (Ouvrir directement `index.html` dans un navigateur fonctionne aussi.)

## Personnaliser

Tout le contenu modifiable est centralisé dans **`js/data.js`** : nom de marque, barre d'annonce, offres, zones de livraison, prix, œuvres (avec textes SEO), FAQ, articles. Le nom **ARTÉA GALLERY** est provisoire et se remplace en quelques lignes.

## Déploiement

- **Version de production** : reproduire la structure dans **Wix Stores** — voir [`GUIDE-CONFIGURATION-WIX.md`](GUIDE-CONFIGURATION-WIX.md) (incl. le point critique *paiements pour une entreprise enregistrée en Haïti*).
- **Hébergement statique de la démo** (GitHub Pages, Netlify, Vercel) : pousser le dossier tel quel — le site est 100 % statique.

---

© 2026 ARTÉA GALLERY (projet de démonstration).

# Site officiel d’Eduo

Site vitrine statique (HTML, CSS, JavaScript, sans dépendance ni étape de construction). Il s’héberge partout : GitHub Pages, Netlify, Cloudflare Pages, OVH…

## Ce qui est publié

```
index.html              page d’accueil (générée par _sources/outils/page.py)
mentions-legales.html   mentions légales
404.html                page « introuvable »
favicon.ico, robots.txt, sitemap.xml, site.webmanifest
assets/css/site.css     styles (couleurs, mise en page, animations)
assets/js/site.js       menu, animations au défilement, iPhone 3D, carrousel, FAQ, réseaux sociaux
assets/fonts/           police Bricolage Grotesque (licence libre OFL), hébergée avec le site
assets/img/             captures réelles de l’app (AVIF + JPEG/PNG de secours), icônes, image de partage
```

`_sources/` n’est pas publié : captures d’origine, outils et tests.

## Modifier le site

- **Textes de la page d’accueil** : modifie `_sources/outils/page.py`, puis lance `python3 _sources/outils/page.py` (cela réécrit `index.html`).
- **Couleurs, tailles, animations** : `assets/css/site.css` (les couleurs sont en haut, dans `:root`).
- **Réseaux sociaux** : en haut de `assets/js/site.js`, remplis `SOCIAL` (TikTok, Instagram, YouTube). Un lien vide n’est pas affiché.
- **Nouvelles captures** : place-les dans `_sources/captures`, déclare-les dans `_sources/outils/images.json`, puis lance `swift _sources/outils/images.swift`.
- **Nom de domaine** : il est écrit `www.eduo-app.fr` dans `_sources/outils/page.py` (constante `SITE`), `robots.txt`, `sitemap.xml` et `mentions-legales.html`. Remplace-le partout si tu en choisis un autre.
- **Hébergeur** : les mentions légales indiquent GitHub Pages. Change ce paragraphe si tu héberges ailleurs.

## Tester

```
cd _sources/outils
swiftc -O capture.swift -o capture
./capture ../../index.html - 390 844 --check          # images, liens, débordement (mobile)
./capture ../../index.html ../tests/mobile 390 844 --tour   # captures écran par écran
```

Ou simplement : ouvre `index.html` dans Safari, Chrome et Firefox, et redimensionne la fenêtre.

## Liens importants

- App Store : https://apps.apple.com/fr/app/eduo/id6831674131
- Aide et confidentialité (pages utilisées par l’app, à ne pas supprimer) : https://lauweryscome-tech.github.io/eduo-site/

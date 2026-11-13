# NEOS — Kit d’interface « Cyber Flat » v1.0

**Livrable prêt à transmettre à la session qui développe le dashboard Nextcloud NEOS.**

Cette archive contient une identité visuelle implémentable : **10 applications**, **41 icônes utilitaires / actions**, **tuiles colorées**, **logo NEOS**, **7 fonds vectoriels discrets**, **variables CSS**, **classes CSS de composants**, **une démonstration HTML responsive**, et **une maquette de référence**.

## Démarrage

1. Décompresser l’archive en conservant son arborescence.
2. Ouvrir `demo/index.html` dans le navigateur, sans serveur ni connexion réseau.
3. Lire `docs/HANDOFF_DEVELOPPEUR.md` et copier `docs/PROMPT_SESSION_CODE.txt` à la session qui fera le code.
4. Les styles de démonstration sont dans `css/neos-tokens.css` et `css/neos-components.css`.
5. Les icônes et décorations sont des **SVG éditables**. Les PNG sont des alternatives à taille fixe.

## Philosophie

- Interface dark navy, cartes sobres, contrastes élevés.
- Icônes flat & colorées, sans engrenages omniprésents.
- Cyberpunk subtil (tracés HUD, cyan/violet, léger glow), accent cuivré très discret.
- Effets et fonds réservés aux grands éléments, pour que l’information reste prioritaire.
- Destiné à l'intégration progressive sans toucher aux fonctionnalités existantes.

## Contenu

| Répertoire | Usage |
|---|---|
| `assets/icons/apps` | Glyphes des 10 apps, SVG sur fond transparent |
| `assets/icons/tiles` | 10 tuiles d'apps décorées, SVG autonomes |
| `assets/icons/ui` | Icônes d’action, fichiers, widgets, navigation |
| `assets/icons/png64` | PNG transparents, 64 px |
| `assets/icons/png128`, `png256` | Tuiles PNG en 128 et 256 px |
| `assets/branding` | Monogramme + wordmark SVG/PNG |
| `assets/panels` | Habillages et fonds SVG responsives |
| `css` | Variables et composants, sous espace de noms `.neos-*` |
| `demo/index.html` | Démonstrateur statique, ouvrable localement |
| `references` | Captures de contexte et concept approuvé |
| `docs` | Cahier d’intégration et prompt à transmettre |

**Remarques** : la page `demo/` est une **démo visuelle statique**, pas un frontend Nextcloud fonctionnel. Les données, les liens et l'horloge de démonstration sont fictifs. Toutes les intégrations métiers restent à relier au code Nextcloud existant.

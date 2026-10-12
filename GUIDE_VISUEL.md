# Guide de prise en main — visuel des diapositives

## Modifier le contenu sans toucher au code

- **Fiche** : changez l’établissement, le parcours, le titre, les noms et les autres champs d’identité. Les champs sont enregistrés dans le navigateur.
- **Éditer** : cliquez sur un texte directement dans la diapositive, puis cliquez ailleurs pour enregistrer.
- **Réinitialiser** : dans la fiche, restaure les textes et notes par défaut et efface les modifications locales.

Pour modifier un texte sur la diapositive, activez **Éditer**, cliquez sur le texte, puis cliquez ailleurs pour enregistrer. Vous pouvez aussi ouvrir **Fiche** pour changer les champs d’identité et les valeurs du scénario.

Le fichier PowerPoint garde le décor et les images en arrière-plan, mais les textes sont exportés comme des zones de texte distinctes, modifiables dans PowerPoint ou Google Slides. Les notes d’oral sont conservées.

## Présenter avec les animations

Dans **Présenter**, les blocs de contenu apparaissent progressivement. Utilisez **→**, **Page suivante**, la **barre d’espace** ou un clic à droite pour révéler le bloc suivant ; une fois la diapositive complète, la même action passe à la suivante. **←**, **Page précédente** et un clic à gauche font revenir d’un bloc ou d’une diapositive. Les diapositives entrent avec un léger glissement.

Le PowerPoint exporté révèle également chaque bloc de texte au clic et ajoute un fondu entre les diapositives. Les textes restent modifiables dans PowerPoint et Google Slides.

## Modifier le visuel dans le code

| Élément | Fichier |
| --- | --- |
| Texte par défaut, titres, légendes et notes | `src/deck/copy.ts` |
| Ordre des diapositives et libellés de navigation | `src/deck/copy.ts` (`SLIDES` et `SECTIONS`) |
| Structure et composants de chaque diapositive | `src/slides/views.tsx` |
| Couleurs, typographie, dimensions et mise en page | `src/index.css` |
| Images de fond et autres visuels | `public/images/` et `src/deck/images.ts` |
| Arrière-plans, zones de texte modifiables et fichier PowerPoint | `src/export/pptx.ts` |

Les diapositives sont conçues sur une base de **1280 × 720 px** (format 16:9). Dans `src/index.css`, les règles `.slide` définissent la taille de base ; les règles `.slide-cover` et `.institutional-*` contrôlent la couverture.

### Personnaliser la bannière de couverture

Les valeurs institutionnelles par défaut sont dans `defaultCopy` dans `src/deck/copy.ts` : pays, devise, ministère, université, école, mention et parcours. Elles sont aussi modifiables dans la **Fiche**. La couverture reprend la disposition en trois colonnes du modèle avec les logos locaux `public/images/logo-universite.jpg` et `public/images/logo-espa.jpg`, déclarés dans `src/deck/images.ts`.

La couverture affiche ensuite le titre, le sous-titre et les informations de soutenance une seule fois. Évitez de recopier l’université ou l’école dans ce second bloc : elles figurent déjà dans la bannière.

## Vérifier et lancer

Depuis le dossier du projet :

```powershell
npm run dev
npm run build
```

Le serveur local affiche son adresse dans le terminal. Après un changement de structure ou de style, vérifiez la diapositive dans l’application puis téléchargez un nouveau `.pptx` pour contrôler le rendu exporté.

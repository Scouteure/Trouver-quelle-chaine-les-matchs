# 📺 Le Guide Sport de Papa

Le calendrier de **tous les matchs** (foot, tennis, rugby, F1, NBA, NFL), avec **les chaînes pour les regarder** en France 🇫🇷, en Espagne 🇪🇸, en Italie 🇮🇹, aux États-Unis 🇺🇸 et au Royaume-Uni 🇬🇧.

Les matchs des équipes de cœur sont mis en avant avec une carte animée **🔥 Immanquable** aux couleurs du club :

| Équipe | Habillage |
|---|---|
| 🇫🇷 Équipe de France (foot et XV de France) | bleu-blanc-rouge, deux étoiles et la coupe |
| 💜 Toulouse FC | violet, croix occitane |
| ❤️🖤 Stade Toulousain | rouge et noir |
| 🌳 Nottingham Forest | rouge et blanc, l'arbre et la Trent |

## Ce que fait l'appli

- **Le petit mot du fiston** 🎁 : à la première ouverture, une surprise avec des confettis. Ensuite, chaque jour, « Bonne journée Papa ! » (« Bonne soirée » après 18h) avec le match du jour de ses équipes. Il peut le fermer pour la journée.
- **💪 Mes équipes : forme et classement** : pour les Bleus, le Téfécé, le Stade Toulousain et Forest :
  - la place au classement (un clic ouvre le classement complet, avec les zones Europe et relégation) ;
  - les 5 derniers résultats (V / N / D) ;
  - le prochain match.

  Tout est **mis à jour automatiquement** depuis ESPN : à chaque ouverture, toutes les 15 minutes et avec 🔄 Actualiser.
- **À la une** : le prochain grand rendez-vous (par exemple *Ce soir, France–Italie, 20h45, TF1*), avec un compte à rebours.
- **Calendrier du mois** : un point de couleur par sport et un badge sur les jours où joue une équipe de cœur.
- **Programme du jour** : d'abord les immanquables, puis les matchs « à suivre » (grosses affiches, joueurs français au tennis, Grands Prix de F1…), puis tout le reste, classé par compétition.
- **Chaînes** : pour chaque match, les chaînes françaises, espagnoles, italiennes, américaines et anglaises. Les chaînes gratuites ont le badge **GRATUIT**.
- **Prochains immanquables** : un bandeau avec les prochains matchs des équipes de cœur. Un clic mène directement au match.
- **📺 Mes abonnements** : cocher ses abonnements (Canal+, beIN, Ligue 1+, DAZN…) pour voir ✓ sur ses chaînes, et le filtre « Ce que je peux voir » pour n'afficher que les matchs regardables chez soi.
- **Scores en direct**, mis à jour toutes les minutes pendant les matchs.
- **🔄 Actualiser** (en haut) : recharge tout le programme d'un coup : nouveaux matchs, horaires confirmés, changements de chaîne. Un message dit combien de nouveaux matchs sont arrivés. Sans cliquer, l'appli vérifie aussi toute seule toutes les 15 minutes et à chaque retour sur l'onglet.
- **📅 Me le rappeler** : ajoute le match à l'agenda du téléphone ou de l'ordinateur, avec une alerte 30 minutes avant.
- **Recherche** d'une équipe ou d'un joueur (« Forest », « Fils », « Marseille »…).
- **⚙ Réglages** :
  - activer ou désactiver une équipe de cœur, ou en ajouter une (club ou joueur) ;
  - **📅 Agenda** à côté de chaque équipe : ajoute tous ses prochains matchs à l'agenda d'un coup ;
  - choisir les pays de chaînes à afficher.
- **Quatre thèmes de couleurs** (Bleus, Téfécé, Stade, Forest) et un bouton **AA** pour agrandir le texte.
- Fonctionne **sur ordinateur, tablette et téléphone**, et s'installe comme une appli (*Ajouter à l'écran d'accueil*).

## L'ouvrir

**Sur l'ordinateur** : double-cliquer sur `index.html`. Rien à installer.

**En ligne, pour l'avoir partout (conseillé)** : avec GitHub Pages.

1. Dans le dépôt GitHub, ouvrir *Settings → Pages*.
2. Dans *Source*, choisir *Deploy from a branch*.
3. Choisir la branche et le dossier `/ (root)`, puis enregistrer.

L'adresse ressemble à `https://<compte>.github.io/Trouver-quelle-chaine-les-matchs/`. Sur le téléphone de Papa, l'ouvrir puis faire *Partager → Sur l'écran d'accueil*.

## D'où viennent les infos

- **Calendriers et scores** : les calendriers publics d'ESPN, lus en direct par le navigateur. Il n'y a ni clé ni serveur.
- **Chaînes** : les droits TV de la saison 2026-27 sont rassemblés dans [`js/config.js`](js/config.js).
  - Les diffuseurs américains viennent d'ESPN match par match quand ils sont connus.
  - Les listes `es` et `it` (Espagne, Italie) sont rassemblées dans `ES_IT`, dans le même fichier.
  - Les droits changent d'une saison à l'autre : il suffit de modifier les listes `fr`, `us` et `uk` de la compétition concernée.
- **Fiabilité** : l'appli écarte les doublons et les matchs « fantômes » que publie parfois le calendrier ESPN, ainsi que les matchs de tennis dont les joueurs ne sont pas encore connus. Elle réessaie toute seule si le calendrier ne répond pas.
- **Hors connexion** : si le calendrier en ligne ne répond pas, l'appli affiche la copie enregistrée dans `data/snapshot.js`. Pour la rafraîchir :

  ```sh
  node scripts/build-snapshot.js
  ```

> ⚠️ Un diffuseur peut changer au dernier moment. Au moindre doute, vérifier le programme TV.

## Organisation du code

```
index.html               la page
css/style.css            le style (thèmes, animations, mobile)
js/config.js             compétitions, chaînes, équipes de cœur, règles « immanquable »
js/espn.js               lecture et traduction des calendriers ESPN
js/app.js                l'interface (calendrier, programme, fiches, réglages)
data/snapshot.js         copie de secours du programme (générée)
scripts/build-snapshot.js  génère la copie de secours
```

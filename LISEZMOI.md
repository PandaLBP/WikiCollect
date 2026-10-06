# WikiCollect — organisation des fichiers (V133)

| Fichier | Contenu |
|---|---|
| `index.html` | La page : barre de navigation, zone principale, fenêtre modale, et le chargement des fichiers ci-dessous (dans cet ordre). |
| `style.css` | Tout le style (ancien « base » + toutes les couches ajoutées version après version, dans le même ordre : l'ordre compte pour que le rendu reste identique). |
| `restore.js` | Chargé en premier : copie de secours au démarrage + petit journal discret `wcDbg`. |
| `data.js` | Les grosses données : catalogue par catégories, photos des créateurs, image spéciale. |
| `game.js` | Le jeu : boosters, collection, enchères, casino, missions, succès, profil… |
| `catalogue.js` | Le robot qui construit le gros catalogue Wikipédia/Wikidata (IndexedDB). |
| `extras.js` | Modules complémentaires, chacun isolé : liaison catalogue, fonctionnalités finales (missions/succès sans scroll, stats, labo), connexion quotidienne & paliers, sons, sauvegarde. |

**Important :** ces 7 fichiers vont ensemble dans le même dossier (la racine du dépôt GitHub). Si tu en oublies un, le jeu ne démarre pas.
Les anciennes versions « un seul fichier » (`index.html` V132 ou avant) continuent de fonctionner seules.

Ce qui a été nettoyé par rapport à la V132 : style / données / jeu séparés, 8 morceaux de code jamais utilisés supprimés,
2 anciennes pages (missions, succès) remplacées par leurs versions actuelles, 1 couche sans effet supprimée, et les 143 erreurs
« avalées en silence » écrivent maintenant une ligne discrète dans la console (niveau Verbose) au lieu de ne rien dire.

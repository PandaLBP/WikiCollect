# WikiCollect — version GitHub Pages

Cette version garde le fonctionnement actuel de WikiCollect et ajoute :

- hébergement statique compatible GitHub Pages ;
- sauvegarde locale de secours ;
- compte cloud Supabase (connexion par lien envoyé par e-mail) ;
- synchronisation de la collection, du solde, des boosters et de la liste de souhaits ;
- liste de souhaits avec alerte lorsqu'une carte suivie apparaît dans les enchères ;
- notifications navigateur si l'utilisateur les autorise ;
- import JSON/CSV de grosse collection, avec fusion des quantités ;
- export JSON de la collection WikiCollect.

## 1. Créer la base Supabase

1. Crée un projet Supabase.
2. Ouvre le SQL Editor.
3. Exécute `supabase.sql`.
4. Dans Authentication, active l'authentification par e-mail / OTP.
5. Ajoute l'URL finale de GitHub Pages dans les URLs autorisées de l'authentification.
6. Récupère l'URL du projet et la clé publishable/anon.
7. Mets-les dans `config.js`.

Le navigateur ne doit recevoir que la clé publishable/anon. Ne mets jamais une clé `service_role` dans ce dépôt.

## 2. Publier sur GitHub Pages

1. Crée un dépôt GitHub, par exemple `wikicollect`.
2. Mets `index.html`, `config.js` et `supabase.sql` à la racine.
3. Active GitHub Pages dans Settings > Pages.
4. Publie depuis la branche principale et le dossier `/root`.
5. Ouvre l'URL GitHub Pages sur PC puis téléphone.

## 3. Importer la collection WikiMaster (~20K)

Dans WikiCollect > Profil > Sauvegarde & transfert :

- importe le JSON/CSV de WikiMaster ;
- l'import fusionne les quantités avec la collection existante ;
- les doublons sont additionnés ;
- rien n'est supprimé par l'import.

### Important pour WikiMaster

Un site web ne peut pas lire directement le `localStorage` d'un autre domaine : le navigateur isole les stockages par origine. Pour passer ta collection WikiMaster, il faut donc d'abord exporter ses données depuis WikiMaster (ou utiliser l'outil/bookmarklet fourni à côté), puis importer le fichier dans WikiCollect.

Le lecteur WikiCollect essaie plusieurs formats courants : `collection`, `col`, `cards`, `inventory`, `owned`, `ownedCards`, ainsi que des objets JSON imbriqués. Il accepte aussi un CSV avec des colonnes de type `id`, `title/name/nom`, `rarity/rarete` et `count/quantity/qty`.

## 4. Liste de souhaits

Ouvre une carte > `Suivre cette carte`.

La page `⭐ Liste de souhaits` affiche les cartes suivies et détecte les annonces d'enchères correspondantes. `Activer les notifications` demande l'autorisation du navigateur.

La détection fonctionne tant que WikiCollect est ouvert ou au prochain chargement du site. Une alerte push serveur lorsque le navigateur est totalement fermé nécessiterait une fonction backend/notification supplémentaire.

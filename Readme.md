# Projet de gestion 
## Démarrage du serveur pocket base 
donner les droit au fichier : 
chmod +x pocketbase
Dans le répertoire pocketbase/ 
-> ./pocketbase serve

## Donner les droits au répertoire de l'application
sudo chmod -R u+w /var/www/html/Athena/gestion-entreprise
sudo chown -R votre_utilisateur:votre_utilisateur /var/www/html/Athena/gestion-entreprise

# Arborescence des fichiers 

gestion-entreprise/
│── src/
│   ├── components/    # Composants UI réutilisables
│   ├── views/         # Pages principales
│   ├── stores/        # Gestion de l'état avec Pinia
│   ├── router/        # Définition des routes
│   ├── api/           # Connexion à PocketBase
│   ├── styles/        # Fichiers CSS/SASS
│   ├── App.vue        # Composant principal
│   ├── main.js        # Fichier d’entrée de l’application
│── pocketbase/        # Dossier pour PocketBase (données, logs…)
│── package.json       # Dépendances et scripts
│── vite.config.js     # Configuration de Vite

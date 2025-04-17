Plateforme d’apprentissage SQL boostée à l’IA
SQL Mastery est une plateforme interactive pour apprendre le SQL à travers des exercices concrets et un accompagnement intelligent. Que tu sois débutant ou confirmé, tu peux progresser grâce à des retours personnalisés et une expérience immersive.

✨ Fonctionnalités principales
Exercices interactifs avec des cas proches du réel.

Corrections en temps réel grâce à l’IA locale.

Suivi de progression avec statistiques et graphiques.

Comparaison communautaire pour te situer parmi les autres.

Environnement SQL en ligne avec éditeur et visualisation de schéma.

Personnalisation avancée : feedback, explications, et optimisation de requêtes.

🚀 Démarrage rapide
Clone le projet :

git clone https://github.com/mebs22/sql-training.git
cd sql-training
Installe les dépendances :

npm install
Configure ta base de données PostgreSQL et le fichier .env.

Lance les migrations :
npx prisma migrate dev --name init
Installe et lance Ollama avec le modèle DeepSeek 7B :



ollama pull deepseek-coder:7b-instruct-q4_1
Démarre le serveur :

npm run dev
Accède ensuite à l’app sur http://localhost:3000.

🔐 Auth & API
Authentification intégrée avec NextAuth.

API REST pour gérer les exercices et les soumissions
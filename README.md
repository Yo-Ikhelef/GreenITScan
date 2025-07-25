# 🌱 GreenITScan – Simulateur d'Empreinte Numérique

Ce projet propose une application web visant à sensibiliser les utilisateurs à leur empreinte numérique. Il comprend :

- un frontend Quasar (Vue.js)
- une API backend Symfony
- une base de données MariaDB

Le tout est orchestré via **Docker** et des commandes **Makefile**.

---

## ⚙️ Prérequis

- Docker & Docker Compose
- Make
- Git

---

## 🚀 Installation du projet (première fois)

Pour cloner et initialiser le projet :

```bash
git clone git@github.com:MatITAka/GreenITScan.git
cd GreenITScan
make install
```

Cela va :

- construire les images Docker
- démarrer les conteneurs (`frontend`, `backend`, `database`)
- attendre que MariaDB soit prêt
- installer les dépendances Symfony
- créer et migrer la base de données
- génerer une paire de clé JWT pour l'authentification

✅ Le projet sera accessible :

- API Symfony : [http://localhost:8000](http://localhost:8000)
- Frontend Quasar : [http://localhost:9000](http://localhost:9000)

---

## 🔁 Mise à jour du backend

Si vous souhaitez mettre à jour les dépendances du backend, exécutez :

```bash
make update-backend
```

Cela :

- installe les dépendances PHP (composer)
- s’assure que la base existe
- exécute les migrations

> ✅ À utiliser après un `git pull` si la base ou l’API a été modifiée.

---

## 🧹 Reset complet du projet

Si vous rencontrez des problèmes ou souhaitez réinitialiser le projet comme neuf :

```bash
make rebuild-project
```

Cela :

- arrête les conteneurs
- supprime les volumes et données de base
- reconstruit les images
- relance le projet avec `make install`
- génère une nouvelle paire de clé JWT

---

## 🪰 Commandes utiles

```bash
make up               # Démarrer les conteneurs (mode détaché)
make down             # Arrêter les conteneurs
make build            # Rebuild les images (si Dockerfile modifié)
make ps               # Afficher l'état des conteneurs
make logs             # Voir les logs en direct
make backend          # Ouvrir un terminal dans le conteneur backend
make frontend         # Ouvrir un terminal dans le conteneur frontend
```

---

## 📦 Structure du projet

```bash
.
├── docker/                  # Dockerfiles
├── api-backend/             # Symfony backend
├── quasar-project/          # Frontend Quasar
├── Makefile                 # Commandes facilitatrices
└── docker-compose.yaml      # Définition des services
```

# 📋 CDA Interactive

> Plateforme interactive de gestion de fiches techniques avec système de références et bibliothèque multimédia

[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)

---

## 🎯 Vue d'ensemble

CDA Interactive est une application web moderne permettant de créer, gérer et consulter des fiches techniques interactives avec un système de références réutilisables et une bibliothèque multimédia centralisée.

### ✨ Technologies principales

- **Backend**: Django 5.0 + Django REST Framework
- **Frontend**: React 18 + TypeScript + Vite
- **Base de données**: PostgreSQL
- **Canvas**: Konva.js pour les éléments interactifs
- **Déploiement**: Docker + Railway

---

## 👥 Système d'utilisateurs

L'application propose **3 niveaux de permissions** selon le rôle :

### 🔵 Reader (Lecteur)

- ✅ Consulter les fiches et pages
- ✅ Rechercher dans le contenu
- ❌ Pas de création ni modification

### 🟢 Editor (Éditeur)

- ✅ Toutes les permissions Reader
- ✅ Créer et modifier des fiches
- ✅ Gérer les pages et éléments interactifs
- ✅ Uploader des médias dans la bibliothèque
- ❌ Pas de gestion des références

### 🔴 Admin (Administrateur)

- ✅ Toutes les permissions Editor
- ✅ Créer et gérer les références
- ✅ Gérer les utilisateurs
- ✅ Accès à l'administration Django

---

## 🚀 Fonctionnalités principales

### 📚 Media Library (Bibliothèque Multimédia)

La bibliothèque multimédia centralise tous les assets du projet :

- 🖼️ **Images** : formats JPG, PNG, GIF, WebP
- 🎥 **Vidéos** : formats MP4, WebM, OGG, MOV
- 🏷️ **Tags** : organisation par tags pour une recherche facile
- 🌍 **Multilingue** : support EN/FR pour chaque média
- 🔍 **Recherche** : filtrage avancé par type, tags et langue
- 📊 **Métadonnées** : dimensions, taille, durée automatiques

**Architecture :**

- URLs relatives pour la portabilité entre environnements
- Stockage dans `/media/library_media/`
- Serializers Django optimisés avec `build_absolute_uri()`

### 🔗 References (Références)

Système de références réutilisables pour standardiser les éléments :

- 🔩 **Vis** : références de visserie avec spécifications techniques
- 📐 **Gabarits** : modèles réutilisables pour la production
- 🌐 **Multilingue** : champs traduits EN/FR
- 📜 **Versioning** : historique des modifications
- 🔒 **Immuables** : les références ne sont pas modifiables après création (pour garantir l'intégrité)

**Champs dynamiques :**

- Texte, nombres, images
- Validation par type de référence
- Linking avec les éléments interactifs

### 📊 Dashboard (Tableau de bord)

Interface principale de travail avec deux modes :

#### 👁️ Mode Viewer

- Consultation des fiches et pages
- Navigation entre les pages
- Visualisation des éléments interactifs
- Export et partage

#### ✏️ Mode Editor

- Canvas interactif avec Konva.js
- Drag & drop d'éléments
- Propriétés éditables (position, taille, rotation, opacité)
- Types d'éléments disponibles :
  - 🖼️ Images libres
  - 🎥 Vidéos libres
  - 📝 Texte libre
  - ➡️ Flèches
  - 🔩 Vis (référence)
  - 📐 Gabarits (référence)
- Gestion des couches (z-order)
- Support multilingue (EN/FR)

---

## 🏗️ Architecture technique

### Backend (Django)

```
backend/
├── cda_interactive/          # Configuration principale
│   ├── settings.py           # Settings avec proxy headers Railway
│   ├── urls.py               # Routes principales
│   └── views.py
├── production/               # App métier
│   ├── models.py            # Models (Sheet, Page, Element, Reference...)
│   ├── serializers.py       # DRF Serializers
│   ├── views/               # Views par domaine
│   └── urls/                # Routes par domaine
└── users/                    # Gestion utilisateurs
    ├── models.py            # User custom model
    └── views/               # Auth (JWT)
```

**Features backend :**

- 🔐 JWT Authentication (SimpleJWT)
- 🌐 CORS configuré pour multi-environnements
- 📦 JSONB fields pour la flexibilité
- 🔄 Proxy headers pour Railway (`USE_X_FORWARDED_HOST`)
- 📁 Whitenoise pour les fichiers statiques
- 🗃️ Migrations Django complètes

### Frontend (React + TypeScript)

```
frontend/src/
├── components/              # Composants réutilisables
│   ├── auth/               # Authentication
│   ├── canvas/             # Canvas Konva
│   ├── header/             # Navigation
│   ├── library/            # Media library
│   └── reference/          # References
├── contexts/               # React Contexts (Auth, Language, etc.)
├── hooks/                  # Custom hooks
├── pages/                  # Pages principales
├── services/               # API calls
├── types/                  # TypeScript types
├── utils/                  # Utilitaires
│   ├── urlUtils.ts        # Conversion URLs absolues → relatives
│   └── videoUtils.ts      # Gestion vidéos
└── config/                 # Configuration
    ├── references.ts       # Config types de références
    └── routes.ts           # Routes de l'app
```

**Features frontend :**

- ⚡ Vite pour le build ultra-rapide
- 🎨 Bootstrap 5 + React Bootstrap
- 🖼️ Konva.js pour le canvas interactif
- 🌍 i18n (EN/FR)
- 🔐 Protected routes avec role-based access
- 📱 Responsive design
- 🎯 TypeScript strict mode

---

## 🛠️ Installation & Développement

### Prérequis

- Docker & Docker Compose
- Node.js 18+ (pour le dev frontend)
- Python 3.11+ (pour le dev backend)

### 💻 Développement Local

```bash
# Cloner le repository
git clone <repo-url>
cd cda_interactive

utiliser le devcontainer et lire son readme

# L'application est accessible sur http://localhost:8000
```

## 🌐 Déploiement sur Railway

L'application est configurée pour être déployée sur Railway :

### Variables d'environnement requises

```bash
# Django
SECRET_KEY=<votre-secret-key>
DEBUG=False
ALLOWED_HOSTS=<votre-domaine.railway.app>
RAILWAY_STATIC_URL=https://<votre-domaine>.railway.app

# Database (auto-configuré par Railway)
DATABASE_URL=<postgresql-url>

# Frontend
VITE_MY_IP=https://<votre-domaine>.railway.app
VITE_SENTRY_DSN_REACT=<optionnel>
```

### Configuration spécifique Railway

Le projet inclut :

- ✅ `Dockerfile.railway` optimisé
- ✅ `Procfile` pour Gunicorn
- ✅ Proxy headers configurés dans Django
- ✅ URLs relatives pour les médias (portabilité)
- ✅ Collecte automatique des fichiers statiques

---

## 🐛 Problèmes connus & Améliorations futures

### 🔴 Bugs connus

1. **Stockage des médias**

   - ⚠️ Actuellement stockés en local
   - 💡 **TODO**: Migrer vers S3 ou équivalent

2. **Konva JSON des interactive_elements**
   - ⚠️ Structure à revoir et optimiser
   - 💡 **TODO**: Refactoring de la sérialisation

### 🟡 Améliorations prévues

- [ ] Système de backup automatique
- [ ] Export PDF des fiches
- [ ] Versionning des fiches
- [ ] Templates de fiches prédéfinis
- [ ] Recherche full-text avancée
- [ ] Mode collaboratif en temps réel
- [ ] Progressive Web App (PWA) complète
- [ ] Intégration stockage cloud (S3)

---

## 🔑 Administration

### Django Admin

**URL**: `/admin/`

**Superuser par défaut (dev uniquement)**:

- Username: `root`
- Password: `cdainter!`

⚠️ **Sécurité**: Changer ces identifiants en production !

### Gestion via l'interface

Les admins peuvent gérer les utilisateurs directement via l'interface web :

- Créer/modifier/supprimer des utilisateurs
- Attribuer les rôles (Reader, Editor, Admin)
- Gérer les permissions

---

## 📝 Scripts utiles

### Backend

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer des données de test
python manage.py loaddata fixtures/initial_data.json

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Shell Django
python manage.py shell
```

### Frontend

```bash
# Dev avec hot reload
npm run dev

# Build production
npm run build

# Preview du build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Base de données

```bash
# Exporter la DB
pg_dump -U postgres cda_interactive > backup.sql

# Restaurer la DB
psql -U postgres cda_interactive < backup.sql

# Fixer les URLs de médias (script SQL fourni)
psql -U postgres cda_interactive -f fix_media_urls.sql
```

---

## 📚 Documentation additionnelle

- 📖 [Backend Documentation](backend.md) - Architecture backend détaillée
- 🔄 [PWA Implementation](PWA_IMPLEMENTATION.md) - Progressive Web App
- 🤔 [Thinking Notes](thinking.md) - Notes de design et décisions
- ✅ [TODO List](todo.md) - Tâches à venir

---

## 🤝 Contribution

Les contributions sont bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

## 👨‍💻 Support

Pour toute question ou problème :

- 📧 Créer une issue sur le repository
- 💬 Contacter l'équipe de développement

---

**Fait avec ❤️ pour la gestion de fiches techniques interactives**

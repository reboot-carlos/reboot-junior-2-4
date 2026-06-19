# 📁 Structure Professionnelle de my'chat

## Vue d'ensemble

```
RebootJR/
├── frontend/                          # Interface utilisateur
│   ├── index.html                     # Page principale du chatbot
│   ├── css/
│   │   ├── variables.css              # Variables globales (couleurs, typos)
│   │   ├── animations.css             # Animations et transitions
│   │   ├── layout.css                 # Structure et disposition
│   │   ├── chatbot.css                # Styles du chat et messages
│   │   ├── sidebar.css                # Barre latérale et menus
│   │   └── responsive.css             # Design responsif (mobile/tablet)
│   ├── js/
│   │   ├── api.js                     # Appels API
│   │   ├── storage.js                 # localStorage
│   │   ├── characters.js              # Personnalités et prompts
│   │   ├── sidebar.js                 # Barre latérale
│   │   ├── chat.js                    # Logique du chat
│   │   └── app.js                     # Initialisation
│   └── assets/
│       └── background.webp            # Image de fond
├── backend/
│   └── main.py                        # API FastAPI
├── landing.html                       # Page d'accueil
├── .env                               # Variables d'environnement (secret)
├── .env.example                       # Exemple de configuration
├── requirements.txt                   # Dépendances Python
├── Dockerfile                         # Image Docker
├── docker-compose.yml                 # Orchestration Docker
├── start.sh                           # Script de démarrage
└── README.md                          # Documentation générale
```

## Architecture

### Frontend (HTML/CSS/JS)

**Variables CSS** (`variables.css`)
- Couleurs du design system
- Typographie (Poppins)
- Espacements (spacing scale)
- Ombres et transitions
- Dimensions fixes

**Mise en page** (`layout.css`)
- Structure flex principal
- Barre latérale fixe (280px)
- Conteneur principal avec marges
- Responsive breakpoints

**Styles du chat** (`chatbot.css`)
- Zone de chat (scrollable)
- Styles des messages (bot/user/loading)
- Formulaire d'entrée
- Menus flottants
- Styles des jeux

**Barre latérale** (`sidebar.css`)
- Section Personnalités
- Section Historique
- Section Paramètres
- Menus de couleurs et emojis

**Animations** (`animations.css`)
- Sparkle (scintillement)
- Slide in (glissement)
- Pulse (pulsation)
- Classes réutilisables

**Responsive** (`responsive.css`)
- Breakpoints: 1920px, 768px, 480px, 320px
- Adaptation des dimensions
- Menus adaptatifs
- Images fluides

### JavaScript Modulaire

**API** (`api.js`)
```javascript
API.chat(message, langue, personnalite)
API.ping()
API.getConfig()
```

**Storage** (`storage.js`)
- Sauvegarde des préférences
- Historique des conversations
- Gestion du localStorage

**Characters** (`characters.js`)
- Définitions des 3 personnalités
- Prompts système multilingues (5 langues)
- Messages de bienvenue

**Sidebar** (`sidebar.js`)
- Rendu des personnalités
- Affichage de l'historique
- Changement de couleur
- État de la barre

**Chat** (`chat.js`)
- Envoi/réception de messages
- Gestion du langage
- Traduction multilingue
- Sauvegarde de conversations

**App** (`app.js`)
- Point d'entrée
- Initialisation des modules
- Configuration des menus
- Gestion des événements

### Backend (FastAPI)

**API Endpoints**
```
GET  /health              # Vérifier l'état
GET  /api/config          # Configuration
POST /api/chat            # Message principal
GET  /                    # Landing page
GET  /chatbot             # Chatbot app
```

**Modèles Pydantic**
- `MessageRequest` : message, langue, personnalité
- `MessageResponse` : réponse
- `HealthResponse` : santé du serveur
- `ConfigResponse` : configuration

**Traitement**
1. Appel Claude (si clé disponible)
2. Fallback base locale
3. Message par défaut

## Déploiement

### Environnement Local

```bash
cp .env.example .env
# Éditer .env avec ta clé ANTHROPIC_API_KEY

# Avec venv
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sur Windows
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload

# Ou avec le script
./start.sh --dev
```

### Docker

```bash
docker-compose up -d
# Accès: http://localhost:8000
```

### Production

```bash
docker build -t mychat:latest .
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name mychat \
  mychat:latest
```

## Design System

### Couleurs
- **Primaire** : #00D4FF (Cyan)
- **Accent** : #FFD700 (Or)
- **Foncé** : #15151e
- **Gris** : #38383f
- **Succès** : #00AA66
- **Danger** : #FF6B6B

### Typos
- **Font** : Poppins (400, 600, 700)
- **Base** : 1rem
- **Petit** : 0.95rem
- **XSmall** : 0.85rem

### Espacements
- xs: 0.5rem
- sm: 0.75rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem

### Animations
- Rapide : 0.2s
- Normal : 0.3s
- Lent : 0.5s

## Caractéristiques

### Personnalités
1. **my'chat** 😜💜
   - Polyvalent et amical
   - Discussions générales
   - Aide aux études

2. **L'Ami** 👋
   - Décontracté et sympathique
   - Plans et conseils
   - Écoute active

3. **Le Prof** 📚
   - Pédagogue patient
   - Toutes les matières
   - Explications progressives

### Langues Supportées
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇩🇪 Allemand
- 🇪🇸 Espagnol
- 🇮🇱 Hébreu

### Fonctionnalités
- ✅ Chat multilingue
- ✅ 3 personnalités
- ✅ Historique (localStorage)
- ✅ Personnalisation (couleurs, emojis)
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Integration Claude IA
- ✅ Fallback local

## Avant de Présenter au Jury

**Vérifications**
- [ ] Clé ANTHROPIC_API_KEY configurée
- [ ] Tests sur tous les personnages
- [ ] Test des 5 langues
- [ ] Responsive testé (mobile, tablet, desktop)
- [ ] Sauvegarde de l'historique fonctionne
- [ ] Changement de couleurs fonctionne
- [ ] Barre latérale masquable/affichable
- [ ] Messages d'erreur clairs

**Documentation**
- [ ] README.md à jour
- [ ] Code commenté (WHY, pas WHAT)
- [ ] Pas de secrets en git
- [ ] Fichier .gitignore complet

**Performance**
- [ ] Temps de réponse < 2s
- [ ] Pas de console errors
- [ ] Pas de memory leaks
- [ ] Images optimisées

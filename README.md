# my'chat - Chatbot Multilingue avec FastAPI & Claude API

Un chatbot moderne et élégant connecté à **Claude (API Anthropic)** via FastAPI. Avec fallback automatique sur la base locale.

🤖 **Maintenant alimenté par Claude AI!**

## 🚀 Installation & Démarrage

### 1. Cloner et installer les dépendances
```bash
pip install -r requirements.txt
```

### 2. Configurer la clé API Claude

#### Option A: Avec Claude (recommandé) 🌟
1. Crée une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Copie le fichier `.env.example` en `.env`:
   ```bash
   cp .env.example .env
   ```
3. Ajoute ta clé API dans `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxx
   ```

#### Option B: Sans Claude (base locale)
- Simplement skip l'étape 2, le chatbot utilisera la base locale

### 3. Lancer le serveur FastAPI
```bash
python main.py
```

Le serveur démarre sur **http://localhost:8000**

### 4. Accéder au chatbot
Ouvre ton navigateur:
```
http://localhost:8000
```

✅ Si Claude est configuré → tu verras "claude_available": true
⚠️ Sinon → tu utiliseras la base locale

## 📁 Structure du Projet

```
RebootJR/
├── main.py                      # API FastAPI (backend)
├── services/
│   ├── __init__.py
│   └── claude_service.py        # Service d'intégration Claude
├── index.html                   # Chatbot frontend (HTML/CSS/JS) ✨
├── .env.example                 # Template de configuration
├── .gitignore                   # Fichiers à ignorer
├── requirements.txt             # Dépendances Python
└── README.md                    # Ce fichier
```

## 🏗️ Architecture

```
┌─────────────────────┐
│  Frontend (HTML/JS) │ ← Ton chatbot intact et propre ✨
└──────────┬──────────┘
           │
           │ fetch("/api/chat")
           ↓
┌─────────────────────────────────────┐
│    FastAPI (main.py)                │
│  ┌──────────────────────────────┐   │
│  │  /api/chat endpoint          │   │
│  └───────────────┬──────────────┘   │
│                  │                   │
│  ┌───────────────┴────────────┐     │
│  ↓                            ↓     │
│ Claude API           Base Connaissances (fallback)
│ (si clé API)         (toujours disponible)
│                                     │
└─────────────────────────────────────┘
           │
           ↓
     Réponse JSON
```

## 🌍 Langues Supportées

- 🇫🇷 Français
- 🇮🇱 Hébreu
- 🇬🇧 Anglais
- 🇩🇪 Allemand
- 🇪🇸 Espagnol

## 🎨 Caractéristiques

✨ **Design**
- Couleur bleu clair pétant (#00D4FF)
- Contours dorés (#FFD700)
- Police arrondie Poppins
- Bouton étoile pour changer la langue

🤖 **Fonctionnalités**
- Chat multilingue en temps réel
- API REST avec FastAPI
- Gestion des erreurs robuste
- Réponses personnalisées par langue

## 📡 API Endpoints

### GET `/`
Servir l'interface du chatbot
```
Retourne: index.html
```

### POST `/api/chat` ⭐ Principal
Traiter un message avec Claude ou fallback local

**Request:**
```json
{
  "message": "Bonjour",
  "langue": "fr",
  "use_claude": true
}
```

**Response:**
```json
{
  "reponse": "Salut ! Comment puis-je t'aider aujourd'hui ? 😊",
  "source": "claude"
}
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `message` | string | Message de l'utilisateur |
| `langue` | string | Langue (fr, en, de, es, he) |
| `use_claude` | boolean | Force Claude ou local (optionnel) |

**Réponse source:**
- `"claude"` - Réponse générée par Claude API
- `"local"` - Réponse de la base locale (fallback)

### GET `/health`
Vérifier l'état du serveur

```json
{
  "status": "ok",
  "service": "my'chat API v2",
  "claude_available": true,
  "timestamp": "2024-06-16T10:30:00.123456"
}
```

### GET `/api/config`
Récupérer la configuration

```json
{
  "app_name": "my'chat",
  "version": "2.0.0",
  "langues": ["fr", "en", "de", "es", "he"],
  "claude_enabled": true,
  "fallback_mode": "base locale"
}
```

## 🤖 Claude vs Base Locale

### Avec Claude API ✨
- Réponses IA intelligentes et contextuelles
- Comprend les questions complexes
- Adapte les réponses à chaque utilisateur
- Conversations naturelles en 5 langues
- Plus lent (~2-3 secondes par réponse)

### Base Locale 🚀
- Réponses instantanées
- Fonctionne sans connexion internet
- Pas de clé API requise
- Réponses prédéfinies mais fiables

**Le système bascule automatiquement sur local en cas d'erreur Claude!**

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla) - INTACT ✨
- **Backend**: Python, FastAPI, Uvicorn
- **API**: Anthropic Claude (optionnel)
- **Architecture**: API REST avec fallback intelligent

## 📝 Fonctionnalités Avancées

✅ Fallback automatique Claude → Local
✅ Gestion multilingue complète
✅ Service Claude encapsulé et réutilisable
✅ Vérification de santé et de configuration
✅ Logging des erreurs
✅ Code professionnel et scalable

## 🔐 Sécurité

- Clé API stockée en `.env` (jamais en Git)
- Fichier `.gitignore` configuré
- Validation des requêtes avec Pydantic
- Gestion d'erreurs sécurisée

## 👩‍💻 Crédits

Créé par une collégienne passionate de codage! 💙✨

Architecture professionnelle avec:
- Séparation des responsabilités (services/)
- Gestion des dépendances (requirements.txt)
- Configuration d'environnement (.env)
- Documentation complète

---

**Questions fréquentes:**

**Q: Mon chatbot ne parle pas avec Claude?**
A: Vérifie que ta clé API est dans `.env` et que le serveur affiche "✅ Claude API initialisée"

**Q: Ça fonctionne sans Claude?**
A: Oui! Le fallback local s'active automatiquement si Claude n'est pas disponible.

**Q: Mon chatbot reste intact?**
A: OUI! Le HTML/CSS/JS n'a pas changé. Seul le JavaScript communique avec l'API au lieu de la base locale.

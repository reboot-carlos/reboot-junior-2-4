# 🚀 Guide de Configuration Claude API

## ⚡ Démarrage Rapide (3 étapes)

### Étape 1️⃣: Installer les dépendances
```bash
pip install -r requirements.txt
```

### Étape 2️⃣: Configurer Claude (optionnel mais recommandé)

#### Obtenir une clé API:
1. Va sur https://console.anthropic.com
2. Crée un compte si nécessaire
3. Copie ta clé API (commence par `sk-ant-`)

#### Ajouter la clé au projet:
```bash
# Copie le template
cp .env.example .env

# Édite .env et ajoute ta clé:
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

Ouvre `.env` avec ton éditeur de texte préféré et remplace `your_api_key_here` par ta vraie clé.

### Étape 3️⃣: Lancer le serveur
```bash
python main.py
```

Tu verras:
- ✅ `Claude API initialisée avec succès` → Claude est actif
- ⚠️ `Claude API non configurée` → Utilisation de la base locale

Puis ouvre: **http://localhost:8000**

---

## 🎯 Comment ça marche?

```
Ton Chatbot (HTML/JS)
        ↓
   FastAPI
        ↓
  Claude API (si configuré)
        ↓ (ou fallback)
  Base locale (toujours disponible)
```

## ✨ Qu'est-ce qui change avec Claude?

| Sans Claude | Avec Claude |
|------------|------------|
| Réponses rapides | Réponses IA intelligentes |
| Base prédéfinie | Conversations naturelles |
| 4 réponses fixes | Réponses infinies |
| Offline possible | Nécessite internet |

## 🆘 Troubleshooting

### "Module not found: anthropic"
```bash
pip install anthropic
```

### "ANTHROPIC_API_KEY not found"
- Vérifie que `.env` existe
- Vérifie que la clé y est bien
- Redémarre le serveur

### "Connection error to server"
- Claude est temporairement indisponible
- Le fallback local s'active automatiquement
- Attends quelques secondes et réessaie

### Le chatbot reste vide
- Ouvre la console du navigateur (F12)
- Cherche les erreurs rouges
- Assure-toi que le serveur fonctionne (`http://localhost:8000`)

---

## 📊 Vérifier que tout fonctionne

Ouvre dans ton navigateur:
```
http://localhost:8000/api/config
```

Tu dois voir:
```json
{
  "app_name": "my'chat",
  "version": "2.0.0",
  "claude_enabled": true,  // ← true = Claude configuré ✅
  "langues": ["fr", "en", "de", "es", "he"]
}
```

---

## 🔑 Où obtenir une clé API gratuite?

1. Anthropic offre des crédits gratuits pour les nouveaux comptes
2. Va sur https://console.anthropic.com
3. Ajoute un moyen de paiement (débité seulement si tu dépasses les crédits)
4. Copie ta clé dans `.env`

**Coût approximatif:** ~$0.003 par message (très peu!)

---

## 💡 Pro Tips

- Ton chatbot continue de fonctionner même sans Claude
- Les messages à Claude prennent 2-3 secondes
- La base locale répond en <100ms
- Tu peux switch entre Claude et local sans redémarrage

---

**Besoin d'aide supplémentaire?** Consulte le [README.md](./README.md)

# ▶️ LANCER LE SERVEUR - INSTRUCTIONS SIMPLES

## ⚡ Juste 2 commandes

### 1️⃣ Installe les dépendances (une seule fois)
```bash
pip install -r requirements.txt
```

### 2️⃣ Lance le serveur
```bash
python main.py
```

Tu dois voir:
```
🚀 Lancement de my'chat
=====================
✅ Claude disponible: False  (ou True si tu as une clé API)
🌐 Serveur: http://localhost:8000
```

### 3️⃣ Ouvre le chatbot
```
http://localhost:8000
```

---

## ✅ Si ça fonctionne

Tu verras:
- ✅ "Serveur actif" dans la console (F12)
- ✅ Le chatbot répond avec la base locale
- ✅ Pas d'erreur rouge

---

## ❌ Si ça ne fonctionne pas

### Erreur: "port 8000 is already in use"
```bash
# Le port est utilisé. Change-le dans main.py ligne ~300
# Change port=8000 en port=8001
# Puis accède à http://localhost:8001
```

### Erreur: "No module named..."
```bash
pip install -r requirements.txt
```

### Erreur: "Failed to fetch"
1. Ouvre F12 dans le navigateur
2. Regarde la Console (pas Network)
3. Copy-paste l'erreur exacte
4. Assure-toi que le terminal affiche "Uvicorn running on"

---

## 🎯 Ce qui doit ABSOLUMENT afficher

Dans le **terminal** (serveur):
```
🚀 Lancement de my'chat
...
Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

Si tu vois cela → **LE SERVEUR FONCTIONNE** ✅

---

## 📝 Troubleshoot rapide

| Problème | Solution |
|----------|----------|
| Failed to fetch | Relance `python main.py` |
| Port 8000 déjà utilisé | Change en 8001 dans main.py |
| Module not found | `pip install -r requirements.txt` |
| Rien n'apparaît | Appuie sur Entrée après lancer main.py |

---

**C'est tout! Si le serveur affiche "Application startup complete", c'est bon!** ✅

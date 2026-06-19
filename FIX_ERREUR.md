# 🆘 Répare l'erreur "Erreur de connexion au serveur"

## ⚡ Solution rapide (99% des cas)

### 1️⃣ Tue le serveur actuel
```bash
# Appuie sur Ctrl+C dans la console du serveur
```

### 2️⃣ Réinstalle les dépendances
```bash
pip install --upgrade -r requirements.txt
```

### 3️⃣ Lance le serveur à nouveau
```bash
python main.py
```

Tu dois voir:
```
✅ Claude API initialisée avec succès
```

Ou:

```
⚠️  Claude API non configurée
```

Les deux sont OK! ✅

### 4️⃣ Ouvre le chatbot
```
http://localhost:8000
```

---

## 🔍 Si ça ne marche toujours pas

### Étape A: Ouvre la console (F12 dans le navigateur)

1. Ouvre ton navigateur
2. Appuie sur **F12**
3. Va dans l'onglet **Console**
4. Envoie un message au chatbot
5. Copie **TOUS les messages rouges** que tu vois

### Étape B: Lance le diagnostic

```bash
python diagnose.py
```

Copie **tout** ce qui s'affiche.

### Étape C: Teste l'API

```bash
# Dans une console: lance le serveur
python main.py

# Dans une autre console:
python test_api.py
```

Copie **tout** ce qui s'affiche.

---

## 🆘 Les erreurs courantes

### Erreur: "No module named 'anthropic'"
```bash
pip install anthropic
```

### Erreur: "No module named 'fastapi'"
```bash
pip install -r requirements.txt
```

### Erreur: "Address already in use"
```bash
# Le serveur est déjà lancé ailleurs
# Tue tous les processus Python et relance
```

### Erreur: "ModuleNotFoundError: No module named 'services'"
```bash
# Assure-toi que tu es dans le bon répertoire
cd /chemin/vers/RebootJR
python main.py
```

---

## 📝 Checklist

- [ ] Serveur lancé (`python main.py`)
- [ ] Message ✅ ou ⚠️ affiché
- [ ] Pas de message d'erreur rouge
- [ ] Navigateur à `http://localhost:8000`
- [ ] Console du navigateur (F12) sans erreur

---

## 🆘 Besoin d'aide?

**Donne-moi:**
1. L'erreur exacte de la console du serveur (la partie rouge)
2. L'erreur exacte de la console du navigateur (F12)
3. Le résultat de `python diagnose.py`

Et je vais corriger! 💙

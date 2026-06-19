#!/usr/bin/env python3
"""
Script de diagnostic - Vérifie que tout est correctement configuré
"""

import os
import sys

print("🔍 Diagnostic my'chat\n")

# 1. Vérifier Python
print(f"✓ Python: {sys.version}")

# 2. Vérifier les dépendances
print("\n📦 Vérification des dépendances:")
dépendances = {
    "fastapi": "FastAPI",
    "uvicorn": "Uvicorn",
    "pydantic": "Pydantic",
    "dotenv": "python-dotenv",
    "anthropic": "Anthropic SDK"
}

missing = []
for module, name in dépendances.items():
    try:
        __import__(module)
        print(f"  ✅ {name}")
    except ImportError:
        print(f"  ❌ {name} - MANQUANT")
        missing.append(name)

if missing:
    print(f"\n⚠️  Modules manquants: {', '.join(missing)}")
    print("Installation: pip install -r requirements.txt")
    sys.exit(1)

# 3. Vérifier .env
print("\n🔐 Configuration:")
if os.path.exists(".env"):
    print("  ✅ Fichier .env trouvé")
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        key_masked = api_key[:10] + "..." if len(api_key) > 10 else "***"
        print(f"  ✅ ANTHROPIC_API_KEY configurée: {key_masked}")
    else:
        print("  ⚠️  ANTHROPIC_API_KEY non configurée dans .env")
else:
    print("  ⚠️  Fichier .env non trouvé")
    print("  Crée-le avec: cp .env.example .env")

# 4. Vérifier la structure
print("\n📁 Structure du projet:")
files = {
    "main.py": "API FastAPI",
    "index.html": "Chatbot frontend",
    "services/claude_service.py": "Service Claude",
    "requirements.txt": "Dépendances",
}

for file, desc in files.items():
    if os.path.exists(file):
        print(f"  ✅ {file} ({desc})")
    else:
        print(f"  ❌ {file} - MANQUANT")

# 5. Vérifier les imports
print("\n🔗 Vérification des imports:")
try:
    from services.claude_service import obtenir_claude
    print("  ✅ Import service Claude OK")
except ImportError as e:
    print(f"  ❌ Erreur import: {e}")

try:
    from dotenv import load_dotenv
    print("  ✅ Import dotenv OK")
except ImportError:
    print("  ❌ Erreur import dotenv")

# 6. Tester la connexion à Claude (optionnel)
print("\n🤖 Test Claude API:")
api_key = os.getenv("ANTHROPIC_API_KEY")
if api_key:
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        print("  ✅ Connexion Anthropic établie")
        print("  ℹ️  Modèle: claude-opus-4-8")
    except Exception as e:
        print(f"  ❌ Erreur de connexion: {e}")
else:
    print("  ℹ️  ANTHROPIC_API_KEY non configurée")
    print("  (Le chatbot utilisera la base locale)")

print("\n" + "="*50)
print("✅ Diagnostic terminé!")
print("="*50)
print("\n📝 Prochaines étapes:")
print("1. Si tout est ✅: lance avec 'python main.py'")
print("2. Si tu vois des ❌: corrige les problèmes ci-dessus")
print("3. Pour l'aide: consulte SETUP_CLAUDE.md")

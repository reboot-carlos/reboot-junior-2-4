#!/usr/bin/env python3
"""
Script de test du serveur my'chat
Vérifie que tout fonctionne correctement
"""

import sys
import subprocess
import time

print("\n" + "="*60)
print("🔍 Diagnostic my'chat")
print("="*60 + "\n")

# 1. Vérifier Python
print("1️⃣  Vérification Python...")
print(f"   Version: {sys.version}")
print("   ✅ OK\n")

# 2. Vérifier les imports
print("2️⃣  Vérification des modules...")
modules = ['fastapi', 'uvicorn', 'pydantic', 'dotenv']
missing = []

for mod in modules:
    try:
        __import__(mod)
        print(f"   ✅ {mod}")
    except ImportError:
        print(f"   ❌ {mod} - MANQUANT")
        missing.append(mod)

if missing:
    print(f"\n⚠️  Modules manquants: {', '.join(missing)}")
    print("   Installation: pip install -r requirements.txt\n")
    sys.exit(1)
else:
    print("   ✅ Tous les modules\n")

# 3. Vérifier le fichier .env
print("3️⃣  Vérification .env...")
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")

if api_key:
    masked = api_key[:10] + "..." + api_key[-4:] if len(api_key) > 14 else "***"
    print(f"   ✅ ANTHROPIC_API_KEY: {masked}")
else:
    print(f"   ⚠️  ANTHROPIC_API_KEY non trouvée")

print()

# 4. Tester l'import de main.py
print("4️⃣  Vérification main.py...")
try:
    import main
    print("   ✅ main.py importé avec succès\n")
except Exception as e:
    print(f"   ❌ Erreur dans main.py: {e}\n")
    print("   Essaie: python main.py\n")
    sys.exit(1)

# 5. Résumé
print("="*60)
print("✅ Diagnostic OK!")
print("="*60)
print("\n▶️  Pour lancer le serveur, tape:\n")
print("   python main.py\n")
print("Puis ouvre: http://localhost:8000\n")

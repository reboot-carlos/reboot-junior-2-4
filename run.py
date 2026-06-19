#!/usr/bin/env python3
"""
Script de lancement simple - Lance le serveur et affiche tout clairement
"""

import subprocess
import sys
import os
import time

print("=" * 60)
print("🚀 Lancement du serveur my'chat")
print("=" * 60)

# Vérifier les dépendances
print("\n✓ Vérification des dépendances...")
try:
    import fastapi
    import uvicorn
    import anthropic
    print("  ✅ Toutes les dépendances présentes")
except ImportError as e:
    print(f"  ❌ Erreur: {e}")
    print("\nInstalle les dépendances avec:")
    print("  pip install -r requirements.txt")
    sys.exit(1)

# Charger .env
from dotenv import load_dotenv
load_dotenv()

# Vérifier Claude
api_key = os.getenv("ANTHROPIC_API_KEY")
if api_key:
    print("  ✅ Clé API Claude configurée")
else:
    print("  ⚠️  Clé API Claude non trouvée (fallback mode)")

print("\n" + "=" * 60)
print("📋 INFORMATIONS IMPORTANTES:")
print("=" * 60)
print("\n🌐 Adresse du serveur: http://localhost:8000")
print("\n📝 Instructions:")
print("  1. Ouvre ton navigateur")
print("  2. Va sur: http://localhost:8000")
print("  3. Envoie un message")
print("  4. Regarde la console (F12) pour les erreurs")
print("\n💡 Pour ARRÊTER le serveur: Appuie sur Ctrl+C")
print("\n" + "=" * 60 + "\n")

# Lancer le serveur
print("▶️  Démarrage du serveur...\n")

try:
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
except KeyboardInterrupt:
    print("\n\n🛑 Serveur arrêté.")
    sys.exit(0)
except Exception as e:
    print(f"\n❌ Erreur au démarrage: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

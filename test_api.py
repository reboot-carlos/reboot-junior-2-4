#!/usr/bin/env python3
"""
Script de test de l'API - Vérifie que l'API fonctionne correctement
"""

import requests
import json
import time
import sys

API_URL = "http://localhost:8000"

print("🧪 Test API my'chat\n")

# Test 1: /health
print("1️⃣  Test /health")
try:
    response = requests.get(f"{API_URL}/health", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ Serveur réactif")
        print(f"     Status: {data.get('status')}")
        print(f"     Claude disponible: {data.get('claude_available')}")
    else:
        print(f"  ❌ Erreur HTTP {response.status_code}")
except requests.exceptions.ConnectionError:
    print(f"  ❌ Impossible de se connecter à {API_URL}")
    print("     Le serveur est-il lancé? (python main.py)")
    sys.exit(1)
except Exception as e:
    print(f"  ❌ Erreur: {e}")
    sys.exit(1)

# Test 2: /api/config
print("\n2️⃣  Test /api/config")
try:
    response = requests.get(f"{API_URL}/api/config", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ Config récupérée")
        print(f"     App: {data.get('app_name')}")
        print(f"     Version: {data.get('version')}")
        print(f"     Langues: {', '.join(data.get('langues', []))}")
        print(f"     Claude: {'Activé ✅' if data.get('claude_enabled') else 'Désactivé ⚠️'}")
except Exception as e:
    print(f"  ❌ Erreur: {e}")

# Test 3: /api/chat avec la base locale
print("\n3️⃣  Test /api/chat (français)")
try:
    payload = {
        "message": "bonjour",
        "langue": "fr",
        "use_claude": False  # Force la base locale pour ce test
    }
    print(f"  📨 Envoi: {payload}")

    start = time.time()
    response = requests.post(
        f"{API_URL}/api/chat",
        json=payload,
        timeout=10
    )
    elapsed = time.time() - start

    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ Réponse reçue ({elapsed:.2f}s)")
        print(f"     Source: {data.get('source')}")
        print(f"     Réponse: {data.get('reponse')}")
    else:
        print(f"  ❌ Erreur HTTP {response.status_code}")
        print(f"     {response.text}")
except Exception as e:
    print(f"  ❌ Erreur: {e}")

# Test 4: /api/chat en anglais
print("\n4️⃣  Test /api/chat (anglais)")
try:
    payload = {
        "message": "hello",
        "langue": "en"
    }
    response = requests.post(
        f"{API_URL}/api/chat",
        json=payload,
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        print(f"  ✅ Réponse reçue")
        print(f"     Source: {data.get('source')}")
        print(f"     Réponse (preview): {data.get('reponse')[:50]}...")
    else:
        print(f"  ❌ Erreur HTTP {response.status_code}")
except Exception as e:
    print(f"  ❌ Erreur: {e}")

print("\n" + "="*50)
print("✅ Tests terminés!")
print("="*50)
print("\n💡 Conseils:")
print("- Si tous les tests ✅: ton API fonctionne parfaitement!")
print("- Si tu vois des ❌: regarde les messages d'erreur du serveur")
print("- Lance le diagnostic: python diagnose.py")

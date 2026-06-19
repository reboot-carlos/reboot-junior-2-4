#!/bin/bash

echo ""
echo "========================================================"
echo "🚀 Lancement de my'chat"
echo "========================================================"
echo ""
echo "📋 Vérification..."
python3 test_serveur.py

echo ""
echo "▶️  Démarrage du serveur..."
echo ""
echo "✅ Quand tu vois 'Application startup complete'"
echo "   Le serveur est prêt!"
echo ""
echo "🌐 Ouvre dans ton navigateur:"
echo "   http://localhost:8000"
echo ""
echo "🛑 Pour arrêter: Ctrl+C"
echo ""
echo "========================================================"
echo ""

python3 main.py

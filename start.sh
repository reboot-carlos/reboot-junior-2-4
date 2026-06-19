#!/bin/bash

# Script de démarrage de my'chat
# Utilisation: ./start.sh [--dev]

set -e

echo "🚀 Démarrage de my'chat..."

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "   Copie .env.example en .env"
    cp .env.example .env
    echo "   ⚡️ Complète les variables d'environnement dans .env"
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installation des dépendances..."
    pip install -q -r requirements.txt
else
    source venv/bin/activate
fi

# Mode développement
if [ "$1" == "--dev" ]; then
    echo "🔧 Mode développement activé"
    uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
else
    echo "▶️  Démarrage du serveur..."
    python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
fi

#!/usr/bin/env bash
# ============================================================
# start.sh — lanceur my'chat
#
# Modes :
#   ./start.sh          → développement local (Python + hot-reload)
#   ./start.sh --docker → build Docker + Nginx (test pré-déploiement)
#   ./start.sh --down   → arrête les conteneurs Docker
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RESET='\033[0m'
ok()   { echo -e "${GREEN}✅ $*${RESET}"; }
info() { echo -e "${CYAN}ℹ  $*${RESET}"; }

MODE="${1:-}"

# ── Arrêt Docker ─────────────────────────────────────────────
if [[ "$MODE" == "--down" ]]; then
    info "Arrêt des conteneurs..."
    docker compose down 2>/dev/null || docker-compose down
    ok "Conteneurs arrêtés."
    exit 0
fi

# ── Mode Docker (test conteneurisation) ──────────────────────
if [[ "$MODE" == "--docker" ]]; then
    info "Lancement du test Docker + Nginx..."
    exec ./test-docker.sh
fi

# ── Mode développement local (défaut) ────────────────────────
info "Mode développement — Python direct + hot-reload"

if [[ ! -f .env ]]; then
    echo -e "${YELLOW}⚠  .env absent — copie depuis .env.example${RESET}"
    cp .env.example .env
    echo "   Remplis ANTHROPIC_API_KEY dans .env puis relance."
    exit 1
fi

# Créer le venv si absent
if [[ ! -d venv ]]; then
    info "Création de l'environnement virtuel..."
    python3 -m venv venv
    source venv/bin/activate
    info "Installation des dépendances..."
    pip install -q -r requirements.txt
else
    source venv/bin/activate
fi

# Libérer le port 8000 si déjà occupé
if lsof -ti:8000 &>/dev/null; then
    warn "Port 8000 occupé — arrêt du processus existant..."
    kill $(lsof -ti:8000) 2>/dev/null || true
    sleep 1
fi

ok "Démarrage — http://localhost:8000/chatbot"
echo ""
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

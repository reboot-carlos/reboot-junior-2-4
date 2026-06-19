#!/usr/bin/env bash
# ============================================================
# test-docker.sh — build et test de la stack complète
# (FastAPI + Nginx) avant déploiement sur Railway
#
# Usage:
#   ./test-docker.sh          # build + lance + tests
#   ./test-docker.sh --down   # arrête et supprime les conteneurs
#   ./test-docker.sh --logs   # affiche les logs en direct
# ============================================================
set -euo pipefail

# ── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}✅ $*${RESET}"; }
fail() { echo -e "${RED}❌ $*${RESET}"; }
info() { echo -e "${CYAN}ℹ  $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠  $*${RESET}"; }
hr()   { echo -e "${CYAN}────────────────────────────────────────${RESET}"; }

# ── Gestion des arguments ────────────────────────────────────
if [[ "${1:-}" == "--down" ]]; then
    info "Arrêt des conteneurs..."
    docker compose down
    ok "Conteneurs arrêtés."
    exit 0
fi

if [[ "${1:-}" == "--logs" ]]; then
    docker compose logs -f
    exit 0
fi

# ── Vérifications préliminaires ──────────────────────────────
hr
echo -e "${BOLD}🐳 my'chat — Test Docker + Nginx${RESET}"
hr

# Docker disponible ?
if ! command -v docker &>/dev/null; then
    fail "Docker n'est pas installé."
    echo "  Lance : sudo apt-get install -y docker.io"
    exit 1
fi
ok "Docker : $(docker --version | cut -d' ' -f3 | tr -d ',')"

# docker compose (plugin v2) ou docker-compose (v1) ?
if docker compose version &>/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
else
    fail "docker compose introuvable."
    echo "  Lance : sudo apt-get install -y docker-compose"
    exit 1
fi
ok "Compose : $($COMPOSE version --short 2>/dev/null || echo 'v1')"

# .env présent ?
if [[ ! -f .env ]]; then
    fail "Fichier .env absent."
    echo "  Lance : cp .env.example .env  puis remplis ANTHROPIC_API_KEY"
    exit 1
fi

# Clé API configurée ?
if grep -q "YOUR_API_KEY_HERE" .env 2>/dev/null; then
    warn "ANTHROPIC_API_KEY non configurée — Claude sera en mode fallback."
else
    ok "ANTHROPIC_API_KEY détectée dans .env"
fi

# Port 80 libre ?
if ss -tlnp 2>/dev/null | grep -q ':80 ' || netstat -tlnp 2>/dev/null | grep -q ':80 '; then
    warn "Port 80 déjà utilisé — nginx risque d'échouer."
    warn "Arrête le service qui l'occupe ou édite docker-compose.yml (ports: '8080:80')."
fi

hr
info "Nettoyage des anciens conteneurs..."
$COMPOSE down --remove-orphans 2>/dev/null || true

# ── Build ────────────────────────────────────────────────────
hr
info "Build de l'image Docker..."
if $COMPOSE build --no-cache 2>&1 | tail -5; then
    ok "Build réussi."
else
    fail "Build échoué. Lance './test-docker.sh --logs' pour les détails."
    exit 1
fi

# ── Démarrage ────────────────────────────────────────────────
hr
info "Démarrage des conteneurs (FastAPI + Nginx)..."
$COMPOSE up -d

# ── Attendre que l'app soit prête ────────────────────────────
hr
info "Attente que l'application soit prête..."
MAX_WAIT=60
ELAPSED=0
until curl -sf http://localhost/health &>/dev/null; do
    if [[ $ELAPSED -ge $MAX_WAIT ]]; then
        fail "L'application n'a pas démarré dans les ${MAX_WAIT}s."
        echo ""
        info "Logs des conteneurs :"
        $COMPOSE logs --tail=30
        $COMPOSE down
        exit 1
    fi
    printf "."
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done
echo ""
ok "Application prête en ${ELAPSED}s."

# ── Suite de tests ───────────────────────────────────────────
hr
echo -e "${BOLD}🧪 Tests${RESET}"
hr

PASS=0
FAIL=0

run_test() {
    local name="$1"
    local cmd="$2"
    local expected="$3"
    local result
    result=$(eval "$cmd" 2>/dev/null || echo "ERROR")
    if echo "$result" | grep -q "$expected"; then
        ok "$name"
        PASS=$((PASS + 1))
    else
        fail "$name"
        echo "   Attendu : $expected"
        echo "   Obtenu  : ${result:0:120}"
        FAIL=$((FAIL + 1))
    fi
}

# 1. Health check via Nginx
run_test "GET /health → status:ok" \
    "curl -sf http://localhost/health" \
    '"status":"ok"'

# 2. Landing page
run_test "GET / → HTML landing page" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost/" \
    "200"

# 3. Chatbot page
run_test "GET /chatbot → HTML chatbot" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost/chatbot" \
    "200"

# 4. Static CSS
run_test "GET /static/css/variables.css → 200" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost/static/css/variables.css" \
    "200"

# 5. Static JS
run_test "GET /static/js/app.js → 200" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost/static/js/app.js" \
    "200"

# 6. API config
run_test "GET /api/config → app_name" \
    "curl -sf http://localhost/api/config" \
    '"app_name":"my'"'"'chat"'

# 7. API chat (fallback local si pas de clé)
run_test "POST /api/chat → réponse valide" \
    "curl -sf -X POST http://localhost/api/chat \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"salut\",\"langue\":\"fr\",\"personnalite\":\"mychat\"}'" \
    '"reponse"'

# 8. Validation Pydantic — langue invalide doit retourner 422
run_test "POST /api/chat langue=xx → 422 (validation)" \
    "curl -sf -o /dev/null -w '%{http_code}' -X POST http://localhost/api/chat \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"test\",\"langue\":\"xx\",\"personnalite\":\"mychat\"}'" \
    "422"

# 9. Validation Pydantic — personnalité invalide
run_test "POST /api/chat personnalite=hacker → 422 (validation)" \
    "curl -sf -o /dev/null -w '%{http_code}' -X POST http://localhost/api/chat \
        -H 'Content-Type: application/json' \
        -d '{\"message\":\"test\",\"langue\":\"fr\",\"personnalite\":\"hacker\"}'" \
    "422"

# 10. Headers sécurité nginx
run_test "Headers sécurité nginx présents (X-Frame-Options)" \
    "curl -sI http://localhost/" \
    "X-Frame-Options"

# 11. Conteneurs en bonne santé
run_test "Conteneurs running et healthy" \
    "docker ps --format '{{.Names}} {{.Status}}'" \
    "healthy"

# ── Résultats ────────────────────────────────────────────────
hr
TOTAL=$((PASS + FAIL))
if [[ $FAIL -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}🎉 $PASS/$TOTAL tests passés — Stack prête pour Railway !${RESET}"
    hr
    echo ""
    echo -e "  ${BOLD}URLs locales :${RESET}"
    echo -e "  Landing page → ${CYAN}http://localhost/${RESET}"
    echo -e "  Chatbot      → ${CYAN}http://localhost/chatbot${RESET}"
    echo -e "  Health       → ${CYAN}http://localhost/health${RESET}"
    echo ""
    echo -e "  ${BOLD}Commandes utiles :${RESET}"
    echo -e "  Logs en direct → ${YELLOW}./test-docker.sh --logs${RESET}"
    echo -e "  Arrêter        → ${YELLOW}./test-docker.sh --down${RESET}"
    echo ""
else
    echo -e "${RED}${BOLD}$FAIL/$TOTAL tests échoués.${RESET}"
    echo ""
    info "Logs pour diagnostiquer :"
    $COMPOSE logs --tail=40
    echo ""
    warn "La stack reste UP pour que tu puisses investiguer."
    echo -e "  Arrêter → ${YELLOW}./test-docker.sh --down${RESET}"
    exit 1
fi

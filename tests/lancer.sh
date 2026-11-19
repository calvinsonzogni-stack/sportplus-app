#!/usr/bin/env bash
# Lance tous les tests de l'appli dans Chromium (Playwright).
# Usage : bash tests/lancer.sh        (depuis la racine du dépôt)
set -u
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8085}"
export SPORTPLUS_URL="http://localhost:$PORT/"
export SPORTPLUS_CAPTURES="${SPORTPLUS_CAPTURES:-$(mktemp -d)}"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"

# Petit serveur local, arrêté à la fin
python3 -m http.server "$PORT" -d "$RACINE" >/dev/null 2>&1 &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null' EXIT
sleep 1

total=0; echecs=0
for t in "$RACINE"/tests/*.test.js; do
  sortie=$(node "$t" 2>&1)
  p=$(grep -c '^PASS' <<<"$sortie"); f=$(grep -c '^FAIL' <<<"$sortie")
  plante=$(grep -m1 -E 'Error:|TimeoutError' <<<"$sortie")
  printf '%-24s %3d OK  %d échec(s)\n' "$(basename "$t")" "$p" "$f"
  grep '^FAIL' <<<"$sortie"
  [ -n "$plante" ] && { echo "  ⚠ arrêt : $plante"; f=$((f+1)); }
  total=$((total+p)); echecs=$((echecs+f))
done
echo "TOTAL : $total OK, $echecs échec(s)   (captures : $SPORTPLUS_CAPTURES)"
[ "$echecs" -eq 0 ]

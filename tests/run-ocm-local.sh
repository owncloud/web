#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OCIS_BIN="/Users/mk/dev/kiteworks/ocis/ocis/bin/ocis"
export GITHUB_WORKSPACE="$REPO_ROOT"

wait_for() {
  for i in {1..30}; do
    curl -kfsSL "$1" > /dev/null 2>&1 && return 0
    sleep 5
  done
  echo "timed out waiting for $1" && exit 1
}

cleanup() {
  pkill -f "ocis server" 2>/dev/null || true
  rm -rf ~/.ocis-9200 ~/.ocis-10200
}
trap cleanup EXIT

start_ocis() {
  local env_file="$1"
  (
    cd "$REPO_ROOT/tests/actions"
    set -a && source "$env_file" && set +a
    export OCM_LOG_LEVEL=debug
    "$OCIS_BIN" init --insecure true \
      && cp "$REPO_ROOT/tests/drone/app-registry.yaml" "$OCIS_CONFIG_DIR/app-registry.yaml" \
      && "$OCIS_BIN" server 2>&1 | tee "/tmp/ocis-$(basename "$env_file" | sed 's/\.env\./ocis-/').log"
  ) &
}

start_ocis .env.ocis
wait_for "https://localhost:9200/.well-known/openid-configuration"
echo "local oCIS up"

start_ocis .env.ocis-federated
wait_for "https://localhost:10200/.well-known/openid-configuration"
echo "federated oCIS up"

cd "$REPO_ROOT"
BASE_URL_OCIS=localhost:9200 \
FEDERATED_BASE_URL_OCIS=localhost:10200 \
HEADLESS=false \
RETRY=0 \
BROWSER=chromium \
REPORT_TRACING=false \
FAIL_ON_UNCAUGHT_CONSOLE_ERR=false \
SKIP_A11Y_TESTS=true \
TEST_TYPE=playwright \
  pnpm test:e2e:playwright --project=chromium tests/e2e-playwright/specs/ocm/ocm.spec.ts

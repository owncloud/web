#!/bin/bash

set -euo pipefail

OCIS_DIR="${RUNNER_TEMP:-/tmp}/ocis"
OCIS_REPOSITORY=https://github.com/owncloud/ocis.git
OCIS_COMMIT=latest # `latest` or a specific commit SHA, e.g. `9ac0452d61f062572f7e4663679ffb8ac06845e6`

COLLABORA_CODE_IMAGE=collabora/code:25.04.7.3.1
ONLYOFFICE_DOCUMENT_SERVER_IMAGE=onlyoffice/documentserver:9.2.1
POSTGRES_ALPINE_IMAGE=postgres:alpine3.18
KEYCLOAK_IMAGE=quay.io/keycloak/keycloak:26.5.6

TIKA_ENABLED=false
FEDERATION_ENABLED=false
COLLABORATION_ENABLED=false
OIDC_ENABLED=false
OIDC_IFRAME_ENABLED=false
KEYCLOAK_ENABLED=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tika)
      TIKA_ENABLED=true
      shift
      ;;
    --federation)
      FEDERATION_ENABLED=true
      shift
      ;;
    --collaboration)
      COLLABORATION_ENABLED=true
      shift
      ;;
    --oidc)
      OIDC_ENABLED=true
      shift
      ;;
    --oidc-iframe)
      OIDC_IFRAME_ENABLED=true
      shift
      ;;
    --keycloak)
      KEYCLOAK_ENABLED=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

wait_for_service() {
  echo "Waiting for $2"
  # 150s timeout
  for i in {1..30}; do
    if curl -kfsSL "$1" > /dev/null; then
      echo "$2 is up ✅"
      return 0
    fi
    echo "Retrying in 5s..."
    sleep 5
  done
  echo "❌ $2 failed to start"
  exit 1
}

wait_for_port() {
  echo "Waiting for $2"
  for i in {1..30}; do
    if nc -z localhost "$1" 2>/dev/null; then
      echo "$2 is up ✅"
      return 0
    fi
    echo "Retrying in 5s..."
    sleep 5
  done
  echo "❌ $2 failed to start"
  exit 1
}

setup_tika() {
  echo "Setting up tika"
  docker run -d --name tika --network host -p 9998:9998 apache/tika:3.2.3.0
  wait_for_service "http://localhost:9998" "tika"
}

clone_ocis() {
  echo "Cloning oCIS"
  git clone $OCIS_REPOSITORY "$OCIS_DIR"
  cd "$OCIS_DIR"

  if [ "$OCIS_COMMIT" != "latest" ]; then
    echo "Checking out commit $OCIS_COMMIT"
    git checkout $OCIS_COMMIT
  fi

  make generate && make -C ocis build
  OCIS_BIN="$(pwd)/ocis/bin/ocis"

  cd -
  echo "oCIS cloned"
}

setup_ocis() {
  echo "Setting up $1"

  (
    set -a && source .env.$1 && set +a

    if $TIKA_ENABLED; then
      export SEARCH_EXTRACTOR_TYPE=tika
      export SEARCH_EXTRACTOR_TIKA_TIKA_URL=http://localhost:9998
      export SEARCH_EXTRACTOR_CS3SOURCE_INSECURE=true
      export FRONTEND_FULL_TEXT_SEARCH_ENABLED=true
    fi

    if $COLLABORATION_ENABLED; then
      export MICRO_REGISTRY=nats-js-kv
      export MICRO_REGISTRY_ADDRESS=localhost:9233
      export FRONTEND_APP_HANDLER_SECURE_VIEW_APP_ADDR=com.owncloud.api.collaboration.Collabora
      export COLLABORA_DOMAIN=localhost:9980
      export ONLYOFFICE_DOMAIN=localhost:443
    fi

    if $OIDC_ENABLED; then
      export IDP_ACCESS_TOKEN_EXPIRATION=30
      export WEB_OIDC_SCOPE="openid profile email offline_access"
    fi

    if $OIDC_IFRAME_ENABLED; then
      export IDP_ACCESS_TOKEN_EXPIRATION=30
    fi

    if $KEYCLOAK_ENABLED; then
      export OCIS_EXCLUDE_RUN_SERVICES=idp
      export PROXY_AUTOPROVISION_ACCOUNTS=true
      export PROXY_ROLE_ASSIGNMENT_DRIVER=oidc
      export OCIS_OIDC_ISSUER=https://localhost:8443/realms/oCIS
      export PROXY_OIDC_REWRITE_WELLKNOWN=true
      export WEB_OIDC_CLIENT_ID=web
      export PROXY_USER_OIDC_CLAIM=preferred_username
      export PROXY_USER_CS3_CLAIM=username
      export OCIS_ADMIN_USER_ID=""
      export GRAPH_ASSIGN_DEFAULT_USER_ROLE=false
      export GRAPH_USERNAME_MATCH=none
      export KEYCLOAK_DOMAIN=localhost:8443
      export IDM_CREATE_DEMO_USERS=false
    fi

    export OCM_LOG_LEVEL=debug
    $OCIS_BIN init --insecure true && cp $GITHUB_WORKSPACE/tests/drone/app-registry.yaml $OCIS_CONFIG_DIR/app-registry.yaml && $OCIS_BIN server 2>&1 | tee /tmp/ocis-$1.log
  ) &
  wait_for_service "https://localhost:$2" "$1"
}

setup_onlyoffice() {
  echo "Setting up onlyoffice"
  local repo_root
  repo_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

  # GitHub runners ship PostgreSQL pre-started on 5432.
  # OnlyOffice supervisord starts its own PostgreSQL on 5432 internally.
  # With --network host both compete for the same port → OnlyOffice DB never
  # starts → docservice stays down → nginx returns 502 forever.
  sudo systemctl stop postgresql || true

  docker run -d \
    --name onlyoffice \
    --network host \
    -e WOPI_ENABLED=true \
    -e USE_UNAUTHORIZED_STORAGE=true \
    -v "$repo_root/tests/drone/onlyoffice/local.json:/tmp/local.json:ro" \
    --entrypoint /bin/sh \
    $ONLYOFFICE_DOCUMENT_SERVER_IMAGE \
    -c "set -e
cp /tmp/local.json /etc/onlyoffice/documentserver/local.json
openssl req -x509 -newkey rsa:4096 -keyout onlyoffice.key -out onlyoffice.crt -sha256 -days 365 -batch -nodes
mkdir -p /var/www/onlyoffice/Data/certs
cp onlyoffice.key /var/www/onlyoffice/Data/certs/
cp onlyoffice.crt /var/www/onlyoffice/Data/certs/
chmod 400 /var/www/onlyoffice/Data/certs/onlyoffice.key
/app/ds/run-document-server.sh"
  wait_for_service "https://localhost:443/hosting/discovery" "onlyoffice"
}

setup_collabora() {
  echo "Setting up collabora"
  docker run -d \
    --name collabora \
    --network host \
    --entrypoint bash \
    -e DONT_GEN_SSL_CERT=set \
    -e "extra_params=--o:ssl.enable=true --o:ssl.termination=true --o:welcome.enable=false --o:net.frame_ancestors=https://localhost:9200" \
    $COLLABORA_CODE_IMAGE \
    -c "coolconfig generate-proof-key && bash /start-collabora-online.sh"
  wait_for_service "https://localhost:9980/hosting/discovery" "collabora"
}

setup_wopi_collabora() {
  echo "Setting up wopi-collabora"
  (
    export MICRO_REGISTRY=nats-js-kv
    export MICRO_REGISTRY_ADDRESS=localhost:9233
    export COLLABORATION_GRPC_ADDR=0.0.0.0:9301
    export COLLABORATION_HTTP_ADDR=0.0.0.0:9300
    export COLLABORATION_DEBUG_ADDR=0.0.0.0:9304
    export COLLABORATION_APP_INSECURE=true
    export COLLABORATION_CS3API_DATAGATEWAY_INSECURE=true
    export OCIS_JWT_SECRET=some-ocis-jwt-secret
    export COLLABORATION_WOPI_SECRET=some-wopi-secret
    export COLLABORATION_APP_NAME=Collabora
    export COLLABORATION_APP_ADDR=https://localhost:9980
    export COLLABORATION_APP_ICON=https://localhost:9980/favicon.ico
    export COLLABORATION_WOPI_SRC=http://localhost:9300
    $OCIS_BIN collaboration server
  ) &
  wait_for_service "http://localhost:9304/healthz" "wopi-collabora"
}

setup_wopi_onlyoffice() {
  echo "Setting up wopi-onlyoffice"
  (
    export MICRO_REGISTRY=nats-js-kv
    export MICRO_REGISTRY_ADDRESS=localhost:9233
    export COLLABORATION_GRPC_ADDR=0.0.0.0:9303
    export COLLABORATION_HTTP_ADDR=0.0.0.0:9302
    export COLLABORATION_DEBUG_ADDR=0.0.0.0:9305
    export COLLABORATION_APP_INSECURE=true
    export COLLABORATION_CS3API_DATAGATEWAY_INSECURE=true
    export OCIS_JWT_SECRET=some-ocis-jwt-secret
    export COLLABORATION_WOPI_SECRET=some-wopi-secret
    export COLLABORATION_APP_NAME=OnlyOffice
    export COLLABORATION_APP_PRODUCT=OnlyOffice
    export COLLABORATION_APP_ADDR=https://localhost:443
    export COLLABORATION_APP_ICON=https://localhost/web-apps/apps/documenteditor/main/resources/img/favicon.ico
    export COLLABORATION_WOPI_SRC=http://localhost:9302
    $OCIS_BIN collaboration server
  ) &
  wait_for_service "http://localhost:9305/healthz" "wopi-onlyoffice"
}

wait_for_app_providers() {
  echo "Waiting for Collabora and OnlyOffice to register in the oCIS app registry"
  for i in {1..30}; do
    local apps has_collabora has_onlyoffice
    apps=$(curl -kfsSL "https://localhost:9200/app/list" 2>/dev/null || echo "")
    # Check specifically within app_providers[].name, not just anywhere in the response
    # (default_application also contains "Collabora"/"OnlyOffice" even without a live provider)
    has_collabora=$(echo "$apps" | jq -r '[.["mime-types"][].app_providers[].name] | map(select(. == "Collabora")) | length' 2>/dev/null || echo "0")
    has_onlyoffice=$(echo "$apps" | jq -r '[.["mime-types"][].app_providers[].name] | map(select(. == "OnlyOffice")) | length' 2>/dev/null || echo "0")
    if [[ "$has_collabora" -gt 0 ]] && [[ "$has_onlyoffice" -gt 0 ]]; then
      echo "App providers registered ✅"
      return 0
    fi
    echo "Retrying in 5s... (Collabora: ${has_collabora}, OnlyOffice: ${has_onlyoffice})"
    sleep 5
  done
  echo "❌ App providers failed to register"
  exit 1
}

generate_keycloak_certs() {
  echo "Generating keycloak certs"

  mkdir -p "$GITHUB_WORKSPACE/keycloak-certs"
  openssl req -x509 -newkey rsa:2048 \
    -keyout "$GITHUB_WORKSPACE/keycloak-certs/keycloakkey.pem" \
    -out "$GITHUB_WORKSPACE/keycloak-certs/keycloakcrt.pem" \
    -nodes -days 365 -subj '/CN=keycloak'
  chmod -R 777 "$GITHUB_WORKSPACE/keycloak-certs"
}

setup_postgres() {
  echo "Setting up postgres"

  # GitHub runners ship PostgreSQL pre-started on 5432, but we need to stop it to avoid conflicts.
  sudo systemctl stop postgresql || true

  docker run -d --name postgres --network host \
    -e POSTGRES_DB=keycloak \
    -e POSTGRES_USER=keycloak \
    -e POSTGRES_PASSWORD=keycloak \
    $POSTGRES_ALPINE_IMAGE
  timeout 30 bash -c 'until docker exec postgres pg_isready -U keycloak; do sleep 1; done'
}

setup_keycloak() {
  # Patch realm: replace Drone Docker hostname with localhost
  sed 's|https://ocis:9200|https://localhost:9200|g' \
    $GITHUB_WORKSPACE/tests/drone/ocis_keycloak/ocis-ci-realm.dist.json > /tmp/ocis-realm.json
  docker run -d --name keycloak --network host \
    -e OCIS_DOMAIN=https://localhost:9200 \
    -e KC_HOSTNAME=localhost \
    -e KC_PORT=8443 \
    -e KC_DB=postgres \
    -e "KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak" \
    -e KC_DB_USERNAME=keycloak \
    -e KC_DB_PASSWORD=keycloak \
    -e KC_FEATURES=impersonation \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
    -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
    -e KC_HTTPS_CERTIFICATE_FILE=/keycloak-certs/keycloakcrt.pem \
    -e KC_HTTPS_CERTIFICATE_KEY_FILE=/keycloak-certs/keycloakkey.pem \
    -v "$GITHUB_WORKSPACE/keycloak-certs:/keycloak-certs:ro" \
    -v "/tmp/ocis-realm.json:/opt/keycloak/data/import/oCIS-realm.json:ro" \
    $KEYCLOAK_IMAGE \
    start-dev --proxy-headers xforwarded \
      --spi-connections-http-client-default-disable-trust-manager=true \
      --import-realm --health-enabled=true
  timeout 300 bash -c 'until curl -skf https://localhost:9000/health/ready; do sleep 3; done' \
    || (echo "=== keycloak logs ===" && docker logs keycloak --tail 80 && exit 1)
  echo "keycloak ready."
}

if $TIKA_ENABLED; then
  setup_tika
fi

if $KEYCLOAK_ENABLED; then
  generate_keycloak_certs
  setup_postgres
  setup_keycloak
fi

clone_ocis
setup_ocis "ocis" 9200

# This needs to happen after oCIS is set up to ensure that the collaboration services can connect to it
if $COLLABORATION_ENABLED; then
  setup_collabora
  setup_onlyoffice
  setup_wopi_collabora
  setup_wopi_onlyoffice
  wait_for_app_providers
fi

if $FEDERATION_ENABLED; then
  setup_ocis "ocis-federated" 10200
  wait_for_service "https://localhost:10200/.well-known/openid-configuration" "ocis-federated"

  echo "=== Diagnostic: Graph role definitions on LOCAL (:9200) ==="
  curl -kfsSL -u admin:admin "https://localhost:9200/graph/v1beta1/roleManagement/permissions/roleDefinitions" | python3 -c "import sys,json; roles=json.load(sys.stdin); [print(r['id'], r['displayName']) for r in roles]" || echo "WARNING: Graph role definitions failed on LOCAL"

  echo "=== Diagnostic: listPermissions with Federated filter (admin home) ==="
  ADMIN_HOME_ID=$(curl -kfsSL -u admin:admin "https://localhost:9200/graph/v1.0/me/drives" | python3 -c "import sys,json; d=json.load(sys.stdin); print([x for x in d['value'] if x['driveType']=='personal'][0]['id'])" 2>/dev/null || echo "")
  if [ -n "$ADMIN_HOME_ID" ]; then
    ADMIN_ROOT_ID=$(echo "$ADMIN_HOME_ID" | cut -d'!' -f1)
    echo "  Drive ID: $ADMIN_HOME_ID"
    curl -ksSL -u admin:admin "https://localhost:9200/graph/v1beta1/drives/$ADMIN_HOME_ID/items/$ADMIN_ROOT_ID/permissions?\$filter=@libre.graph.permissions.roles.allowedValues/rolePermissions/any(p:contains(p/condition,+'@Subject.UserType==%22Federated%22'))&\$select=@libre.graph.permissions.roles.allowedValues" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); roles=d.get('@libre.graph.permissions.roles.allowedValues',[]); [print(r['id'], r.get('displayName','?')) for r in roles] or print('  (empty roles list)')" \
      2>/dev/null || echo "WARNING: listPermissions with Federated filter failed"
  else
    echo "WARNING: Could not get admin home drive ID"
  fi
fi

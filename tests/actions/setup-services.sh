#!/bin/bash

set -euo pipefail

OCIS_DIR="${RUNNER_TEMP:-/tmp}/ocis"
OCIS_REPOSITORY=https://github.com/owncloud/ocis.git
OCIS_COMMIT=latest # `latest` or a specific commit SHA, e.g. `9ac0452d61f062572f7e4663679ffb8ac06845e6`

COLLABORA_CODE_IMAGE=collabora/code:25.04.7.3.1
ONLYOFFICE_DOCUMENT_SERVER_IMAGE=onlyoffice/documentserver:9.2.1

TIKA_ENABLED=false
FEDERATION_ENABLED=false
COLLABORATION_ENABLED=false
OIDC_ENABLED=false

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
      export COLLABORATION_APP_HANDLER_SECURE_VIEW_APP_ADDR=com.owncloud.api.collaboration.Collabora
      export COLLABORA_DOMAIN=localhost:9980
      export ONLYOFFICE_DOMAIN=localhost:443
    fi

    if $OIDC_ENABLED; then
      export IDP_ACCESS_TOKEN_EXPIRATION=30
      export WEB_OIDC_SCOPE="openid profile email offline_access"
    fi

    $OCIS_BIN init --insecure true && cp $GITHUB_WORKSPACE/tests/drone/app-registry.yaml $OCIS_CONFIG_DIR/app-registry.yaml && $OCIS_BIN server
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
    local apps
    apps=$(curl -kfsSL "https://localhost:9200/app/list" 2>/dev/null || echo "")
    if echo "$apps" | grep -q "Collabora" && echo "$apps" | grep -q "OnlyOffice"; then
      echo "App providers registered ✅"
      return 0
    fi
    echo "Retrying in 5s..."
    sleep 5
  done
  echo "❌ App providers failed to register"
  exit 1
}

if $TIKA_ENABLED; then
  setup_tika
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
fi

#!/bin/bash

set -euo pipefail

OCIS_DIR="${RUNNER_TEMP:-/tmp}/ocis"
OCIS_REPOSITORY=https://github.com/owncloud/ocis.git
OCIS_COMMIT=latest # `latest` or a specific commit SHA, e.g. `9ac0452d61f062572f7e4663679ffb8ac06845e6`

TIKA_ENABLED=false
FEDERATION_ENABLED=false

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
  docker logs "$2"
  docker inspect "$2"
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

  if $TIKA_ENABLED; then
    export SEARCH_EXTRACTOR_TYPE=tika
    export SEARCH_EXTRACTOR_TIKA_TIKA_URL=http://localhost:9998
    export SEARCH_EXTRACTOR_CS3SOURCE_INSECURE=true
    export FRONTEND_FULL_TEXT_SEARCH_ENABLED=true
  fi

  (set -a && source .env.$1 && set +a && $OCIS_BIN init --insecure true && $OCIS_BIN server) &
  wait_for_service "https://localhost:$2" "$1"
}

if $TIKA_ENABLED; then
  setup_tika
fi

clone_ocis
setup_ocis "ocis" 9200

if $FEDERATION_ENABLED; then
  setup_ocis "ocis-federated" 10200
fi

#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
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

setup_ocis() {
  echo "Setting up $1"

  docker_args=(
    --name $1 \
    --network host \
    -p $2:$2 \
    -v $SCRIPT_DIR/../..:/workspace \
    --env-file $SCRIPT_DIR/.env.$1 \
  )

  if $TIKA_ENABLED; then
    docker_args+=(-e SEARCH_EXTRACTOR_TYPE=tika -e SEARCH_EXTRACTOR_TIKA_TIKA_URL=http://localhost:9998 -e SEARCH_EXTRACTOR_CS3SOURCE_INSECURE=true -e FRONTEND_FULL_TEXT_SEARCH_ENABLED=true)
  fi

  docker run -d "${docker_args[@]}" owncloud/ocis-rolling:latest
  wait_for_service "https://localhost:$2" "$1"
}

if $TIKA_ENABLED; then
  setup_tika
fi

setup_ocis "ocis" 9200

if $FEDERATION_ENABLED; then
  setup_ocis "ocis-federated" 10200
fi

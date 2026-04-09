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

create_network() {
  echo "Creating docker network"
  docker network create ocis-net
}

setup_tika() {
  echo "Setting up tika"
  docker run -d --name tika --network ocis-net -p 9998:9998 apache/tika:3.2.3.0
  wait_for_service "http://localhost:9998" "tika"
}

setup_ocis() {
  echo "Setting up $1"

  docker_args=(
    --name $1 \
    --network ocis-net \
    -p $2:$2 \
    -v $SCRIPT_DIR/../..:/workspace \
    -e IDM_ADMIN_PASSWORD=admin \
    -e OCIS_INSECURE=true \
    -e OCIS_LOG_LEVEL=error \
    -e OCIS_JWT_SECRET=some-ocis-jwt-secret \
    -e LDAP_GROUP_SUBSCRIPTION_FILTER_TYPE=any \
    -e LDAP_USER_SUBSCRIPTION_FILTER_TYPE=any \
    -e WEB_ASSET_CORE_PATH=/workspace/dist \
    -e FRONTEND_SEARCH_MIN_LENGTH=2 \
    -e OCIS_PASSWORD_POLICY_BANNED_PASSWORDS_LIST=/workspace/tests/drone/banned-passwords.txt \
    -e GRAPH_AVAILABLE_ROLES=b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5,a8d5fe5e-96e3-418d-825b-534dbdf22b99,fb6c3e19-e378-47e5-b277-9732f9de6e21,58c63c02-1d89-4572-916a-870abc5a1b7d,2d00ce52-1fc2-4dbc-8b95-a73b73395f5a,1c996275-f1c9-4e71-abdf-a42f6495e960,312c0871-5ef7-4b3a-85b6-0e4074c64049,aa97fe03-7980-45ac-9e50-b325749fd7e6,63e64e19-8d43-42ec-a738-2b6af2610efa \
    -e FRONTEND_CONFIGURABLE_NOTIFICATIONS=true \
    -e OCIS_URL=https://localhost:$2 \
    -e PROXY_HTTP_ADDR=0.0.0.0:$2 \
    -e WEB_UI_CONFIG_FILE=/workspace/tests/drone/$3.json \
    -e OCIS_TRANSFER_SECRET=some-ocis-transfer-secret \
    -e OCIS_LOG_PRETTY=true \
    -e OCIS_LOG_COLOR=true \
    -e OCIS_ADMIN_USER_ID=some-admin-user-id-0000-000000000000 \
    -e OCIS_SYSTEM_USER_ID=some-system-user-id-000-000000000000 \
    -e OCIS_SYSTEM_USER_API_KEY=some-system-user-machine-auth-api-key \
    -e OCIS_MACHINE_AUTH_API_KEY=some-ocis-machine-auth-api-key \
    -e COLLABORATION_WOPIAPP_SECRET=some-wopi-secret \
    -e IDM_SVC_PASSWORD=some-ldap-idm-password \
    -e GRAPH_LDAP_BIND_PASSWORD=some-ldap-idm-password \
    -e IDM_REVASVC_PASSWORD=some-ldap-reva-password \
    -e GROUPS_LDAP_BIND_PASSWORD=some-ldap-reva-password \
    -e USERS_LDAP_BIND_PASSWORD=some-ldap-reva-password \
    -e AUTH_BASIC_LDAP_BIND_PASSWORD=some-ldap-reva-password \
    -e IDM_IDPSVC_PASSWORD=some-ldap-idp-password \
    -e IDP_LDAP_BIND_PASSWORD=some-ldap-idp-password \
    -e GATEWAY_STORAGE_USERS_MOUNT_ID=storage-users-1 \
    -e STORAGE_USERS_MOUNT_ID=storage-users-1 \
    -e GRAPH_APPLICATION_ID=application-1 \
    -e OCIS_SERVICE_ACCOUNT_ID=service-account-id \
    -e OCIS_SERVICE_ACCOUNT_SECRET=service-account-secret \
    -e PROXY_CSP_CONFIG_FILE_LOCATION=/workspace/tests/drone/csp.yaml \
    -e PROXY_ENABLE_BASIC_AUTH=true \
    -e OCM_OCM_PROVIDER_AUTHORIZER_PROVIDERS_FILE=/workspace/dev/docker/ocis.storage.ocmproviders.json \
    -e OCM_OCM_INVITE_MANAGER_INSECURE=true \
    -e OCM_OCM_SHARE_PROVIDER_INSECURE=true \
    -e OCM_OCM_STORAGE_PROVIDER_INSECURE=true \
    -e FRONTEND_SEARCH_MIN_LENGTH=2 \
    -e FRONTEND_FULL_TEXT_SEARCH_ENABLED=true \
  )

  if $TIKA_ENABLED; then
    docker_args+=(-e SEARCH_EXTRACTOR_TYPE=tika -e SEARCH_EXTRACTOR_TIKA_TIKA_URL=http://tika:9998 -e SEARCH_EXTRACTOR_CS3SOURCE_INSECURE=true)
  fi

  docker run -d "${docker_args[@]}" owncloud/ocis-rolling:latest
  wait_for_service "https://localhost:$2" "$1"
}

create_network

if $TIKA_ENABLED; then
  setup_tika
fi

setup_ocis "ocis" 9200 "config-ocis"

if $FEDERATION_ENABLED; then
  setup_ocis "ocis-federated" 10200 "config-ocis-federated"
fi

#!/usr/bin/env sh
set -eo pipefail
[[ "${DEBUG}" == "true" ]] && set -x

exec /usr/bin/ocis server

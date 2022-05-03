#!/usr/bin/env sh
set -eo pipefail
[[ "${DEBUG}" == "true" ]] && set -x

/usr/bin/ocis init
/usr/bin/ocis server

#!/usr/bin/env sh
set -eo pipefail
[[ "${DEBUG}" == "true" ]] && set -x

if [ ! -e "/var/lib/ocis/.ocis/config/ocis.yaml" ]; then
    /usr/bin/ocis init
fi

/usr/bin/ocis server

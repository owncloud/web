#!/usr/bin/env bash

/usr/bin/owncloud server &

until curl --output /dev/null --head --fail --silent --insecure "http://localhost:8080"; do
  echo "waiting for 'ownCloud'"
  sleep 1
done

occ app:enable oauth2
occ app:enable testing
occ app:enable web
occ oauth2:add-client \
  web \
  M8W5mo3wQV3VHWYsaYpWhkr8dwa949i4GljCkedHhl7GWqmHMkxSeJgK2PcS0jt5 \
  sqvPYXK94tMsEEVOYORxg8Ufesi2kC4WpJJSYb0Kj1DSAYl6u2XvJZjc3VcitjDv \
  http://host.docker.internal:8080/index.php/apps/web/oidc-callback.html

tail -f /mnt/data/files/owncloud.log

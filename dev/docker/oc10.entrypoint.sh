#!/usr/bin/env bash
set -eo pipefail
[[ "${DEBUG}" == "true" ]] && set -x

for FILE in $(find /etc/entrypoint.d -iname \*.sh | sort)
do
  source ${FILE}
done

/usr/bin/owncloud server &

until curl --output /dev/null --head --fail --silent --insecure "http://localhost:8080"; do
  echo "waiting for 'oc10'"
  sleep 1
done

if [ ! -d /mnt/data/apps/testing ]
then
    git clone https://github.com/owncloud/testing.git /mnt/data/apps/testing
    occ app:enable oauth2
    occ app:enable testing
    occ oauth2:add-client \
      web \
      M8W5mo3wQV3VHWYsaYpWhkr8dwa949i4GljCkedHhl7GWqmHMkxSeJgK2PcS0jt5 \
      sqvPYXK94tMsEEVOYORxg8Ufesi2kC4WpJJSYb0Kj1DSAYl6u2XvJZjc3VcitjDv \
      http://host.docker.internal:8080/index.php/apps/web/oidc-callback.html
    occ oauth2:add-client \
      web-sidecar \
      UmCVsEIxdWmssxa6uVRRPC3txYBVN4qqxooJbsPhuuoPmHk9Pt9Oy68N4ZaKXUYy \
      HW1fo6lbtgEERBQufBouJ4HID2QaDfngvIdc2vjDUE46qKB4JRG1YDir41LliReC \
      http://localhost:9100/oidc-callback.html
    occ config:system:set trusted_domains 0 --value="localhost"
    occ config:system:set cors.allowed-domains 0 --value="http://localhost:9100"
fi

if [ -d /var/www/owncloud/apps/web/ ]
then
    rm -rf /var/www/owncloud/apps/web/
    occ app:enable web
fi

tail -f /mnt/data/files/owncloud.log

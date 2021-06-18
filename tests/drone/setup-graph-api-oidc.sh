#!/bin/bash
# Input parameters
# $1 the directory where the installed server code is found

git clone -b master https://github.com/owncloud/graphapi.git "$1"/apps/graphapi
cd "$1"/apps/graphapi || exit
make vendor
git clone -b master https://github.com/owncloud/openidconnect.git "$1"/apps/openidconnect
cd "$1"/apps/openidconnect || exit
make vendor
cd "$1" || exit
php occ a:e graphapi
php occ a:e openidconnect
php occ config:system:set trusted_domains 2 --value=web
php occ config:system:set openid-connect provider-url --value="https://idp:9130"
php occ config:system:set openid-connect loginButtonName --value=OpenId-Connect
php occ config:system:set openid-connect client-id --value=web
php occ config:system:set openid-connect insecure --value=true --type=bool
php occ config:system:set cors.allowed-domains 0 --value="http://web"
php occ config:system:set memcache.local --value="\\\\OC\\\\Memcache\\\\APCu"
php occ config:system:set web.baseUrl --value="http://web"
php occ config:list

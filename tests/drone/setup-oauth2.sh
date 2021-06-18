#!/bin/bash
# Input parameters
# $1 the directory where the installed server code is found
# $2 oidc url

git clone -b master https://github.com/owncloud/oauth2.git "$1"/apps/oauth2
cd "$1"/apps/oauth2 || exit
make vendor
cd "$1" || exit
php occ a:e oauth2
php occ oauth2:add-client Web Cxfj9F9ZZWQbQZps1E1M0BszMz6OOFq3lxjSuc8Uh4HLEYb9KIfyRMmgY5ibXXrU 930C6aA0U1VhM03IfNiheR2EwSzRi4hRSpcNqIhhbpeSGU6h38xssVfNcGP0sSwQ "$2"

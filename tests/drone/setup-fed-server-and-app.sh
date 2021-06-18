#!/bin/bash
# Input parameters
# $1 federated server directory
# $2 log level

cd "$1"/ || exit
php occ a:e testing
php occ config:system:set trusted_domains 2 --value=federated
php occ log:manage --level "$2"
php occ config:list
php occ config:system:set skeletondirectory --value="$1"/apps/testing/data/webUISkeleton
php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool

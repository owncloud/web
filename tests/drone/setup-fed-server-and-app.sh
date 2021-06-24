#!/bin/bash
# Input parameters
# $1 federated server directory
# $2 log level

if test -f runUnitTestsOnly
then echo 'skipping setup-fed-server-and-app'
else
	cd "$1"/ || exit
	php occ a:e testing
	php occ config:system:set trusted_domains 2 --value=federated
	php occ log:manage --level "$2"
	php occ config:list
	php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool
	php occ config:system:set web.rewriteLinks --type=boolean --value=true
fi

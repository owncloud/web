#!/bin/bash
# Input parameters:
# $1 the directory where the installed server code is found
# $2 the log level to pass to the log:manage command
# $3 if set to "builtInWeb" then setup the server for integrating with the built-in web app
#    else setup to use the "web" being server at http://web
if test -f runUnitTestsOnly
then
	echo "skipping setup-server-and-app"
else
	cd $1
	php occ app:enable testing
	if [ "$3" == "builtInWeb" ]
	then
		php occ app:enable web
	fi
	php occ app:list
	php occ config:system:set trusted_domains 1 --value=owncloud
	php occ log:manage --level $2
	php occ config:list
	if [ "$3" == "builtInWeb" ]
	then
		php occ config:system:set web.baseUrl --value="http://owncloud/index.php/apps/web"
		php occ config:system:set enable_previews --type=boolean --value=false
		php occ config:system:set skeletondirectory --value=''
	else
		php occ config:system:set web.baseUrl --value="http://web"
		php occ config:system:set cors.allowed-domains 0 --value=http://web
	fi
	php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool
	php occ config:system:set web.rewriteLinks --value=true
	# Remove when https://github.com/owncloud/core/pull/40024 is merged and released
	php occ config:system:set cors.allowed-headers --type json --value '["cache-control"]'
fi

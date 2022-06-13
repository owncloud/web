#!/bin/bash

STEP=$1 # which step to run

if test -f runUnitTestsOnly
then echo 'skipping build-ocis'
else
	source .drone.env
	echo "checking ocis version - $OCIS_COMMITID in cache"

	url="https://cache.owncloud.com/owncloud/web/ocis-build/$OCIS_COMMITID/ocis"

	echo "downloading ocis from $url"

	if [ "$STEP" == "nodejs" ]
  		then
  			mkdir -p "$GOPATH"/src/github.com/owncloud/
  			cd "$GOPATH"/src/github.com/owncloud/ || exit
  			git clone -b "$OCIS_BRANCH" --single-branch --no-tags https://github.com/owncloud/ocis
  			cd ocis || exit
  			git checkout "$OCIS_COMMITID"
  			make ci-node-generate
  		else # golang
  			cd "$GOPATH"/src/github.com/owncloud/ocis/ocis || exit
  			if make build
  			then
  				echo "oCIS build successful."
  			else
  				echo "oCIS build failed."
  				exit 1
  			fi
  			mkdir -p /var/www/owncloud/ocis-build/"$OCIS_COMMITID"
  			cp bin/ocis /var/www/owncloud/ocis-build/"$OCIS_COMMITID"/
  			ls -la /var/www/owncloud/ocis-build/"$OCIS_COMMITID"/
  		fi
fi

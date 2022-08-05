#!/bin/bash

# {string} which step to run
# options: nodejs, golang
STEP=$1

REPO_URL=https://github.com/owncloud/ocis.git
BASE_PATH=/var/www/owncloud/ocis-build/

source .drone.env

if [ "$STEP" == "nodejs" ]
then
	mkdir -p "$GOPATH"/src/github.com/owncloud/
	cd "$GOPATH"/src/github.com/owncloud/ || exit
	git clone -b "$OCIS_BRANCH" --single-branch --no-tags $REPO_URL
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
	mkdir -p "$BASE_PATH""$OCIS_COMMITID"
	cp bin/ocis "$BASE_PATH""$OCIS_COMMITID"/
	ls -la "$BASE_PATH""$OCIS_COMMITID"/
fi

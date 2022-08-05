#!/bin/bash

STEP=$1 # which step to run

source .drone.env
echo "checking oCIS version - $OCIS_COMMITID in cache"

url="https://cache.owncloud.com/owncloud/web/ocis-build/$OCIS_COMMITID/ocis"

echo "downloading ocis from $url"

if curl --output /dev/null --silent --head --fail "$url"
then
	echo "oCIS binary for $OCIS_COMMITID already available in cache"
	echo "Skipping the caching pipeline..."
	# https://discourse.drone.io/t/how-to-exit-a-pipeline-early-without-failing/3951
	# exit a Pipeline early without failing
	exit 78
else
    echo "oCIS binary for $OCIS_COMMITID not available in cache"
fi

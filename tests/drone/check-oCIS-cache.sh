#!/bin/bash

source .drone.env

url="https://cache.owncloud.com/$CACHE_BUCKET/ocis-build/$OCIS_COMMITID/ocis"

echo "Checking oCIS version - $OCIS_COMMITID in cache."
echo "Downloading oCIS from '$url'."

if curl --output /dev/null --silent --head --fail "$url"
then
	echo "oCIS binary for $OCIS_COMMITID already available in cache."
	echo "Skipping the caching pipeline..."
	# https://discourse.drone.io/t/how-to-exit-a-pipeline-early-without-failing/3951
	# exit a Pipeline early without failing
	exit 78
else
	echo "oCIS binary for $OCIS_COMMITID not available in cache."
fi

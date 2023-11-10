#!/bin/bash

source .drone.env

ocis_cache=$(mc find s3/$CACHE_BUCKET/ocis-build/$OCIS_COMMITID/ocis | grep 'Object does not exist')

if [[ "$ocis_cache" != "" ]]
then
    echo "$OCIS_COMMITID doesn't exist"
    exit 0
fi
exit 78


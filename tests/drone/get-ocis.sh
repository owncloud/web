#!/bin/bash
# Input parameters
# $1 base directory
# $2 web directory

source "$2"/.drone.env
mkdir -p "$1"/ocis-build
mc alias set s3 "$MC_HOST" "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY"
mc mirror s3/owncloud/web/ocis-build/"$OCIS_COMMITID" "$1"/ocis-build/
chmod +x "$1"/ocis-build/ocis

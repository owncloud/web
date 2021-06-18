#!/bin/bash
# Input parameters
# $1 the directory where the installed server code is found
# $2 the directory where the installed web app code is found

cd "$1" || exit
mkdir apps-external/web
cp /srv/config/drone/config-oc10-integration-app-oauth.json config/config.json
cp "$2"/packages/web-integration-oc10/* apps-external/web -r
cp "$2"/dist/* apps-external/web -r
ls -la apps-external/web
cat config/config.json

#!/bin/bash
# Input parameters
# $1 base directory

cd /srv/app/src/github.com/owncloud/ocis || exit
cd web || exit
make build
cp bin/web "$1"/ocis-web

#!/bin/bash
# Input parameters
# $1 base directory

cd /srv/app/src/github.com/owncloud/ocis || exit
cd idp || exit
make build
cp bin/idp "$1"

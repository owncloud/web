#!/bin/bash
# Input parameters
# $1 base directory

cd /srv/app/src/github.com/owncloud/ocis/glauth || exit
make build
cp bin/glauth "$1"

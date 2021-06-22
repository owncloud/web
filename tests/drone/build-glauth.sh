#!/bin/bash
# Input parameters
# $1 base directory
if test -f runUnitTestsOnly
then echo 'skipping build-glauth'
else
	cd /srv/app/src/github.com/owncloud/ocis/glauth || exit
	make build
	cp bin/glauth "$1"
fi

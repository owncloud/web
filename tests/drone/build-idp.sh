#!/bin/bash
# Input parameters
# $1 base directory

if test -f runUnitTestsOnly
then echo 'skipping build-idp'
else
	cd /srv/app/src/github.com/owncloud/ocis || exit
	cd idp || exit
	make build
	cp bin/idp "$1"
fi

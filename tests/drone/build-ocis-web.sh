#!/bin/bash
# Input parameters
# $1 base directory

if test -f runUnitTestsOnly
then echo 'skipping build-ocis-web'
else
	cd /srv/app/src/github.com/owncloud/ocis || exit
	cd web || exit
	make build
	cp bin/web "$1"/ocis-web
fi

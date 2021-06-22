#!/bin/bash
# Input parameters
# $1 the directory where the installed web app code is found

if test -f runUnitTestsOnly
then echo 'skipping build-web-app'
else
	yarn build
	mkdir -p /srv/config
	cp -r "$1"/tests/drone /srv/config
	ls -la /srv/config/drone
fi

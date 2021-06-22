#!/bin/bash
# Input parameters
# $1 server directory

if test -f runUnitTestsOnly
then echo 'skipping setup-notifications-app'
else
	git clone -b master https://github.com/owncloud/notifications.git "$1"/apps/notifications
	cd "$1" || exit
	php occ a:e notifications
	php occ a:l
fi

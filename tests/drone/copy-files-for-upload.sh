#!/bin/bash
# Input parameters
# $1 web directory

if test -f runUnitTestsOnly
then echo 'skipping copy-files-for-upload'
else
	ls -la /filesForUpload
	cp -a "$1"/tests/acceptance/filesForUpload/. /filesForUpload
	ls -la /filesForUpload
fi

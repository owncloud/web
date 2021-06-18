#!/bin/bash
# Input parameters
# $1 web directory

ls -la /filesForUpload
cp -a "$1"/tests/acceptance/filesForUpload/. /filesForUpload
ls -la /filesForUpload

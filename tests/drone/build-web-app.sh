#!/bin/bash
# Input parameters
# $1 the directory where the installed web app code is found

yarn build
mkdir -p /srv/config
cp -r "$1"/tests/drone /srv/config
ls -la /srv/config/drone

#!/usr/bin/env sh
# cleanup filesForUpload dir before start
rm -rf /uploads/*
# populate shared volume with the files
cp -r filesForUpload/* /uploads/
# start the middleware service
yarn start

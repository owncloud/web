#!/usr/bin/env sh
# cleanup filesForUpload dir before start
ls

rm -rf /uploads/*
# populate shared volume with the files for upload
cp -r filesForUpload/* /uploads/
# start the middleware service
yarn start

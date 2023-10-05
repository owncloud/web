#!/bin/bash

# Command arguments:
#   $1    - server url
#

echo "[INFO] Waiting for '$1' ..."

while
    CODE=$(curl -sk -o /dev/null "$1" --write-out %{http_code})
    [ "$CODE" != "200" ]
do
    echo "$CODE"
    sleep 0.5
done

echo "[INFO] '$1' is ready"

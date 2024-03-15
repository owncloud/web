#!/bin/bash

source .drone.env

echo "$OCIS_BRANCH"
# Run git ls-remote to get the latest commit ID
latest_commit_id=$(git ls-remote https://github.com/owncloud/ocis.git "refs/heads/$OCIS_BRANCH" | cut -f 1)

# Specify the path to the drone.env file
env_file="./.drone.env"

if [[ "$OCIS_BRANCH" == "master" ]] || [["$OCIS_BRANCH" == "stable-5.0"]]; then
  # Update the OCIS_COMMITID in the drone.env file
  sed -i "s/^OCIS_COMMITID=.*/OCIS_COMMITID=$latest_commit_id/" "$env_file"
  cat $env_file
else
  echo "Invalid branch $1"
  exit 78
fi

#!/bin/bash

source .drone.env

echo "$OCIS_BRANCH"
# Run git ls-remote to get the latest commit ID
latest_commit_id=$(git ls-remote https://github.com/owncloud/ocis.git "refs/heads/$OCIS_BRANCH" | cut -f 1)

# Specify the path to the drone.env file
env_file="./.drone.env"

sed -i "s/^OCIS_COMMITID=.*/OCIS_COMMITID=$latest_commit_id/" "$env_file"
cat $env_file
exit 0

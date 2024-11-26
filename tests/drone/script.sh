#!/bin/bash

source .drone.env

# Function to get the latest oCIS commit ID
get_latest_ocis_commit_id() {
    echo "Getting latest commit ID for branch: $OCIS_BRANCH"
    latest_commit_id=$(git ls-remote https://github.com/owncloud/ocis.git "refs/heads/$OCIS_BRANCH" | cut -f 1)

    # Update the OCIS_COMMITID in the .drone.env file
    env_file="./.drone.env"
    sed -i "s/^OCIS_COMMITID=.*/OCIS_COMMITID=$latest_commit_id/" "$env_file"

    echo "Updated .drone.env with latest commit ID: $latest_commit_id"
    cat $env_file
    exit 0
}

# Function to check if the cache exists for the given commit ID
check_ocis_cache() {
    echo "Checking OCIS cache for commit ID: $OCIS_COMMITID"
    ocis_cache=$(mc find s3/$CACHE_BUCKET/ocis-build/$OCIS_COMMITID/ocis 2>&1 | grep 'Object does not exist')

    if [[ "$ocis_cache" != "" ]]
    then
        echo "$OCIS_COMMITID doesn't exist in cache."
        exit 0
    fi
    exit 78
}

# get playwright version from package.json
get_playwright_version() {
    if [[ ! -f "package.json" ]]; then
        echo "Error: package.json file not found."
    fi

    playwright_version=$(grep '"@playwright/test":' "package.json" | cut -d':' -f2 | tr -d '", ')
    if [[ -z "$playwright_version" ]]; then
        echo "Error: Playwright package not found in package.json." >&2
        exit 78
    fi

    echo "$playwright_version"
}

# Function to check if the cache exists for the given commit ID
check_playwright_cache() {
    get_playwright_version

    playwright_cache=$(mc find s3/$CACHE_BUCKET/web/$playwright_version/.playwright 2>&1 | grep 'Object does not exist')

    if [[ "$playwright_cache" != "" ]]
    then
        echo "Playwright $playwright_version Chromium exists in cache."
        exit 0
    fi
    exit 78
}


if [[ "$1" == "" ]]; then
    echo "Usage: $0 [COMMAND]"
    echo "Commands:"
    echo -e "  get_latest_ocis_commit_id \t get the latest oCIS commit ID"
    echo -e "  check_ocis_cache \t\t check if the cache exists for the given commit ID"
    echo -e "  check_playwright_cache \t check if the cache exists for the given commit ID"
    exit 1
fi

$1

#!/bin/bash

source .drone.env

MC_CACHE_NOT_FOUND_PATTERN=".*Object does not exist"

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
    local output

    echo "Checking OCIS cache for commit ID: $OCIS_COMMITID"
    output=$(mc find s3/"$CACHE_BUCKET"/ocis-build/"$OCIS_COMMITID"/ocis 2>&1)

    if [[ "$output" =~ $MC_CACHE_NOT_FOUND_PATTERN ]]; then
        echo "$OCIS_COMMITID doesn't exist in cache."
        exit 0
    fi
    exit 78
}

# get playwright version from package.json
get_playwright_version() {
    local playwright_version

    if [[ ! -f "package.json" ]]; then
        echo "Error: package.json file not found."
    fi

    # get the playwright version from package.json
    while IFS= read -r line; do
        case "$line" in
        *'"@playwright/test":'*)
            playwright_version=$(echo "$line" | cut -d':' -f2 | tr -d '", ')
            break
            ;;
        esac
    done <package.json

    if [[ -z "$playwright_version" ]]; then
        echo "Error: Playwright package not found in package.json." >&2
        exit 78
    fi

    echo "$playwright_version"
}

# Function to check if the cache exists for the given commit ID
check_browsers_cache() {
    local output
    local playwright_version

    playwright_version=$(get_playwright_version)
    output=$(mc find s3/"$CACHE_BUCKET"/web/browsers-cache/"$playwright_version"/playwright-browsers.tar.gz 2>&1)

    if [[ "$output" =~ $MC_CACHE_NOT_FOUND_PATTERN ]]; then
        echo "Playwright v$playwright_version supported browsers doesn't exist in cache."
        exit 0
    fi
    exit 78
}

if [[ "$1" == "" ]]; then
    echo "Usage: $0 [COMMAND]"
    echo "Commands:"
    echo -e "  get_latest_ocis_commit_id \t get the latest oCIS commit ID"
    echo -e "  check_ocis_cache \t\t check if the cache exists for the given commit ID"
    echo -e "  get_playwright_version \t get the playwright version from package.json"
    echo -e "  check_browsers_cache \t check if the browsers cache exists for the given playwright version"
    exit 1
fi

$1

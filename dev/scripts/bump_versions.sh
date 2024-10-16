#!/bin/bash

# This script bumps the version in the package.json files of the main app
# and all published packages to the provided version.
#
# NOTE: only run this if all packages are supposed to get the same version!

apps=("design-system" "eslint-config" "extension-sdk" "web-pkg" "web-client" "web-test-helpers")

NEW_VERSION="$1"

if [ -z "$NEW_VERSION" ]; then
	echo "Error: No new version provided."
	echo "Usage: $0 <new_version>"
	exit 1
fi

cd "$(dirname "$0")/../.."
CURRENT_VERSION=$(node -p "require('./package.json').version")
sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json

for app in "${apps[@]}"; do
	cd "./packages/$app"
	CURRENT_VERSION=$(node -p "require('./package.json').version")
	sed -i '' "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json
	cd "../.."
done

echo "package.json files have been updated to version $NEW_VERSION"

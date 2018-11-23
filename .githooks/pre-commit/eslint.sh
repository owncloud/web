#!/usr/bin/env sh
if [ -z "$CI" ]
then
    yarn run lint
else
    echo "No linting in drone ..."
fi

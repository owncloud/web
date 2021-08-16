#!/usr/bin/env bash

CHANGED_UNIT_TESTS_ONLY=True

DIFFS=$(git diff origin/master --name-only)

for DIFF in ${DIFFS}
do
	if ! echo "${DIFF}" | grep 'packages/.*/tests/.*'
	then
		CHANGED_UNIT_TESTS_ONLY=False
		break
	fi
done

if [ ! "${DIFF}" ]
then
	echo "no any files are changed"
elif [ $CHANGED_UNIT_TESTS_ONLY == "True" ]
then
	echo "only unit tests files are changed"
	touch runUnitTestsOnly
else
	echo "files other than unit tests files are also changed"
fi

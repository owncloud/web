#!/usr/bin/env bash

CHANGED_UNIT_TESTS_ONLY=True
CHANGED_DOCS_ONLY=True
CHANGED_UNIT_TESTS_AND_DOCS_ONLY=True

DIFFS=$(git diff origin/master --name-only)
DOCS_ONLY_CHANGES=$(echo "$DIFFS" | grep -E '(^docs/.*|^changelog/.*)')
UNIT_TESTS_ONLY_CHANGES=$(echo "$DIFFS" | grep '^packages/.*/tests/.*')
DOCS_AND_UNIT_TESTS_ONLY_CHANGES=$(echo "$DIFFS" | grep -E '(^docs/.*|^changelog/.*|^packages/.*/tests/.*)')

changesExceptDocsChanges=$(echo ${DIFFS[@]} ${DOCS_ONLY_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)
changesExceptUnitTestsChanges=$(echo ${DIFFS[@]} ${UNIT_TESTS_ONLY_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)
changesExceptUnitTestsAndDocsChanges=$(echo ${DIFFS[@]} ${DOCS_AND_UNIT_TESTS_ONLY_CHANGES[@]} | tr ' ' '\n' | sort | uniq -u)

if ((${#DIFFS})); then
  if ((${#changesExceptUnitTestsAndDocsChanges})); then
    echo "FILES OTHER THAN UNIT TESTS AND DOCS ARE ALSO CHANGED"
    CHANGED_UNIT_TESTS_AND_DOCS_ONLY=False
    CHANGED_UNIT_TESTS_ONLY=False
    CHANGED_DOCS_ONLY=False
  else
    if ((${#changesExceptDocsChanges})); then
      echo "FILES OTHER THAN DOCS FILES ARE ALSO CHANGED"
      CHANGED_DOCS_ONLY=False
    elif ((${#changesExceptUnitTestsChanges})); then
      echo "FILES OTHER THAN UNIT TEST FILES ARE ALSO CHANGED"
      CHANGED_UNIT_TESTS_ONLY=False
    fi
  fi

  if [ $CHANGED_UNIT_TESTS_ONLY == "True" ]
  then
    echo "ONLY UNIT TEST FILES ARE CHANGED"
    touch runUnitTestsOnly
  elif [ $CHANGED_DOCS_ONLY == "True" ]
  then
    echo "ONLY DOCS FILES ARE CHANGED"
    touch runTestsForDocsChangeOnly
  elif [ $CHANGED_UNIT_TESTS_AND_DOCS_ONLY == "True" ]
  then
    echo "ONLY UNIT TEST FILES AND DOCS FILES ARE CHANGED"
    # When only the combination of unit tests and docs files are changed, we
    # want to run the pipelines which run on the unit tests changes.
    touch runUnitTestsOnly
  fi
else
  echo "NO FILES ARE CHANGED"
fi

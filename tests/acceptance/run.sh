#!/usr/bin/env bash

echo 'run.sh: running acceptance-tests-drone'

yarn run acceptance-tests-drone
ACCEPTANCE_TESTS_EXIT_STATUS=$?
if [ $ACCEPTANCE_TESTS_EXIT_STATUS -ne 0 ]
then
	echo 'The acceptance test run exited with error status '${ACCEPTANCE_TESTS_EXIT_STATUS}
fi

pwd
ls -l
cat failed-scenarios.txt

exit $ACCEPTANCE_TESTS_EXIT_STATUS

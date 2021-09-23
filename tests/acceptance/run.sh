#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$( cd "${SCRIPT_PATH}" && pwd )  # normalized and made absolute
FEATURES_DIR="${SCRIPT_PATH}/features"

COMMENTS_FILE="${COMMENTS_FILE:-comments.file}"

rm -rf logfile.txt "$COMMENTS_FILE"

echo 'run.sh: running acceptance-tests-drone'

# Look for command line options for:
# --part - run a subset of scenarios, need two numbers.
#          first number: which part to run
#          second number: in how many parts to divide the set of scenarios

# Command line options processed here will override environment variables that
# might have been set by the caller, or in the code above.
while [[ $# -gt 0 ]]
do
	key="$1"
	case ${key} in
		--part)
			RUN_PART="$2"
			DIVIDE_INTO_NUM_PARTS="$3"
			if [ "${RUN_PART}" -gt "${DIVIDE_INTO_NUM_PARTS}" ]
			then
				echo "cannot run part ${RUN_PART} of ${DIVIDE_INTO_NUM_PARTS}"
				exit 1
			fi
			shift 2
			;;
	esac
	shift
done

# An array of the suites that were run. Each value is a string like:
# webUILogin
# webUIPrivateLinks
declare -a SUITES_IN_THIS_RUN

# An array of the unique scenarios that failed. Each key is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -A FAILED_SCENARIO_PATHS

# An array of the scenarios that failed, and were not in the expected failures file.
# Each value is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -a UNEXPECTED_FAILED_SCENARIOS

# An array of the scenarios that were in the expected failures file but did not fail
# Each value is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -a UNEXPECTED_PASSED_SCENARIOS

# An array of the scenarios that failed but passed on retry
# Each value is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -A SINGLE_FAILED_SCENARIOS

UNEXPECTED_NIGHTWATCH_CRASH=false
FINAL_EXIT_STATUS=0

# Work out which suites will be run.
# TEST_PATHS: valid if path is from tests directory
# Example: "tests/acceptance/features/webUILogin tests/acceptance/features/webUINotifications"
# or
# TEST_CONTEXT: name of the suite to run
# Example: "webUIFavorites"

if [ -n "${TEST_PATHS}" ]
then
	for TEST_PATH in ${TEST_PATHS}
	do
		echo $TEST_PATH
		SUITES_IN_THIS_RUN+=( "${TEST_PATH}" )
	done
elif [[ -n  "${RUN_PART}" ]]
then
  	ALL_SUITES=$(find "${FEATURES_DIR}"/ -type d | sort | rev | cut -d"/" -f1 | rev | grep -v '^[[:space:]]*$')
	if [ "${RUN_ON_OCIS}" == "true" ]
	then
		NOT_OCIS_SUITES=$(cat "${SCRIPT_PATH}"/suites-not-to-run-on-ocis.txt)

		for SUITE in "${NOT_OCIS_SUITES[@]}"
		do
			ALL_SUITES=$(echo "${ALL_SUITES}" | grep -v "${SUITE}")
		done
	fi
	ALL_SUITES_COUNT=$(echo "${ALL_SUITES}" | wc -l)
	#divide the suites letting it round down (could be zero)
	MIN_SUITES_PER_RUN=$((ALL_SUITES_COUNT / DIVIDE_INTO_NUM_PARTS))
	#some jobs might need an extra suite
	MAX_SUITES_PER_RUN=$((MIN_SUITES_PER_RUN + 1))
	# the remaining number of suites that need to be distributed (could be zero)
	REMAINING_SUITES=$((ALL_SUITES_COUNT - (DIVIDE_INTO_NUM_PARTS * MIN_SUITES_PER_RUN)))

	if [[ ${RUN_PART} -le ${REMAINING_SUITES} ]]
	then
		SUITES_THIS_RUN=${MAX_SUITES_PER_RUN}
		SUITES_IN_PREVIOUS_RUNS=$((MAX_SUITES_PER_RUN * (RUN_PART - 1)))
	else
		SUITES_THIS_RUN=${MIN_SUITES_PER_RUN}
		SUITES_IN_PREVIOUS_RUNS=$(((MAX_SUITES_PER_RUN * REMAINING_SUITES) + (MIN_SUITES_PER_RUN * (RUN_PART - REMAINING_SUITES - 1))))
	fi

	if [ ${SUITES_THIS_RUN} -eq 0 ]
	then
		echo "run.sh: there are only ${ALL_SUITES_COUNT} suites, nothing to do in part ${RUN_PART}"
		exit 0
	fi

	COUNT_FINISH_AND_TODO_SUITES=$((SUITES_IN_PREVIOUS_RUNS + SUITES_THIS_RUN))

	declare -a TEST_PATHS_TO_RUN
	TEST_PATHS_TO_RUN+=( `echo "${ALL_SUITES}" | head -n ${COUNT_FINISH_AND_TODO_SUITES} | tail -n ${SUITES_THIS_RUN}` )

	for TEST_PATH in "${TEST_PATHS_TO_RUN[@]}"
	do
		SUITE=$(basename "${TEST_PATH}")
		TEST_PATHS+=( "${FEATURES_DIR}/${SUITE}" )
		SUITES_IN_THIS_RUN+=( "${FEATURES_DIR}/${SUITE}" )
	done
elif [ -n "${TEST_CONTEXT}" ]
then
	SUITES_IN_THIS_RUN+=("${FEATURES_DIR}/${TEST_CONTEXT}")
	TEST_PATHS+=("${FEATURES_DIR}/${TEST_CONTEXT}")
fi

# check that all the requested suites exist
INVALID_SUITE_FOUND=false

for SUITE_IN_THIS_RUN in "${SUITES_IN_THIS_RUN[@]}"
do
	if [ ! -d "${SUITE_IN_THIS_RUN}" ]
	then
		INVALID_SUITE_FOUND=true
		echo "Invalid suite: ${SUITE_IN_THIS_RUN}"
	fi
done

if [ "${INVALID_SUITE_FOUND}" = true ]
then
  echo "run.sh: Invalid suite(s) requested in test run"
  exit 1
fi



echo "waiting for backend server to start"
timeout 180 bash -c 'while [[ "$(curl --insecure -s -o /dev/null -w ''%{http_code}'' ${BACKEND_HOST}/status.php)" != "200" ]]; do printf "."; sleep 5; done'

# if no test path is set, set whole feature directory as test path
if [ -z "${TEST_PATHS}" ]
then
	TEST_PATHS+=( "${FEATURES_DIR}" )
fi

RUN_ACCEPTANCE_TESTS="cucumber-js --retry 1 --require-module @babel/register --require-module @babel/polyfill --require tests/acceptance/setup.js --require tests/acceptance/stepDefinitions --format @cucumber/pretty-formatter"

if [ -z "${TEST_TAGS}" ]
then
	CUCUMBER_PUBLISH_ENABLED=false yarn ${RUN_ACCEPTANCE_TESTS} ${TEST_PATHS[@]} | tee -a 'logfile.txt'
else
	CUCUMBER_PUBLISH_ENABLED=false yarn ${RUN_ACCEPTANCE_TESTS} ${TEST_PATHS[@]} -t "${TEST_TAGS}" | tee -a 'logfile.txt'
fi

ACCEPTANCE_TESTS_EXIT_STATUS=${PIPESTATUS[0]}
if [ "${ACCEPTANCE_TESTS_EXIT_STATUS}" -ne 0 ]; then
  echo "The acceptance tests exited with error status ${ACCEPTANCE_TESTS_EXIT_STATUS}"

  # If the first run of a scenario fails, then it gets reported like:
  # 5) Scenario: try to login with invalid username (attempt 1, retried) # tests/acceptance/features/webUILogin/login.feature:67
  # If the second run of a scenario fails, hen it gets reported like:
  # 5) Scenario: try to login with invalid username (attempt 2) # tests/acceptance/features/webUILogin/login.feature:67
  # and the tests with undefined steps are not retried and are reported simply like:
  # 5) Scenario: try to login with invalid username
  # So we need to look for those failed tests that don't end with (attempt 1, retried)
  #
  # https://stackoverflow.com/questions/6550484/prevent-grep-returning-an-error-when-input-doesnt-match
  FAILED_SCENARIOS="$(grep ') Scenario: .*' logfile.txt | { grep -v '(attempt 1, retried)' || true; })"
  for FAILED_SCENARIO in ${FAILED_SCENARIOS}; do
    if [[ $FAILED_SCENARIO =~ "tests/acceptance/features/" ]]; then
      SUITE_PATH=$(dirname "${FAILED_SCENARIO}")
      SUITE=$(basename "${SUITE_PATH}")
      SCENARIO=$(basename "${FAILED_SCENARIO}")
      SUITE_SCENARIO="${SUITE}/${SCENARIO}"
      # Use the SUITE_SCENARIO as the array key, so that if a SUITE_SCENARIO
      # occurs twice in the loop, it ends up in the array just once.
      FAILED_SCENARIO_PATHS+=(["${SUITE_SCENARIO}"]="failed")
    fi
  done

  if [ ${#FAILED_SCENARIO_PATHS[@]} -eq 0 ]
  then
    # Nightwatch had some problem but there were no failed scenarios reported
    # So the problem is something else.
    # Possibly there were missing step definitions. Or Nightwatch crashed badly, or...
    UNEXPECTED_NIGHTWATCH_CRASH=true
  fi
fi

if [ !$UNEXPECTED_NIGHTWATCH_CRASH ]
then
  FAILED_SCENARIOS="$(grep ') Scenario: .*' logfile.txt | { grep '(attempt 1, retried)' || true; })"
  for FAILED_SCENARIO in ${FAILED_SCENARIOS}; do
    found=false
    if [[ $FAILED_SCENARIO =~ "tests/acceptance/features/" ]]; then
      SUITE_PATH=$(dirname "${FAILED_SCENARIO}")
      SUITE=$(basename "${SUITE_PATH}")
      SCENARIO=$(basename "${FAILED_SCENARIO}")
      SUITE_SCENARIO="${SUITE}/${SCENARIO}"
      for FAILED_ON_RETRY in ${!FAILED_SCENARIO_PATHS[@]}; do
        if [ "${FAILED_ON_RETRY}" == "${SUITE_SCENARIO}" ]; then
          found=true;
          break;
        fi
      done
    else
      continue
    fi
    if [ "$found" == false ]; then
      if [[ $FAILED_SCENARIO =~ "tests/acceptance/features/" ]]; then
        SUITE_PATH=$(dirname "${FAILED_SCENARIO}")
        SUITE=$(basename "${SUITE_PATH}")
        SCENARIO=$(basename "${FAILED_SCENARIO}")
        SUITE_SCENARIO="${SUITE}/${SCENARIO}"
        # Use the SUITE_SCENARIO as the array key, so that if a SUITE_SCENARIO
        # occurs twice in the loop, it ends up in the array just once.
        SINGLE_FAILED_SCENARIOS+=(["${SUITE_SCENARIO}"]="failed")
      fi
    fi
  done
fi

if [ ${#FAILED_SCENARIO_PATHS[@]} -ne 0 ]
then
  echo "The following scenarios failed:"
  echo "-------------------------------"
  for KEY in "${!FAILED_SCENARIO_PATHS[@]}"; do echo "- $KEY"; done
  echo "-------------------------------"
fi

if [ ${#SINGLE_FAILED_SCENARIOS[@]} -ne 0 ]
then
  echo ""
  echo ""
  echo "The following scenarios passed on retry:" | tee -a "$COMMENTS_FILE"
  echo "-------------------------------"
  for KEY in "${!SINGLE_FAILED_SCENARIOS[@]}"; do echo "- $KEY" | tee -a "$COMMENTS_FILE"; done
  echo "-------------------------------"
fi

if [ -n "${EXPECTED_FAILURES_FILE}" ]; then
  echo "Checking expected failures in ${EXPECTED_FAILURES_FILE}"

  # Check that every failed scenario is in the list of expected failures
  # Loop through the keys of the FAILED_SCENARIO_PATHS array (! does that)
  for FAILED_SCENARIO_PATH in "${!FAILED_SCENARIO_PATHS[@]}"; do
    grep "\[${FAILED_SCENARIO_PATH}\]" "${EXPECTED_FAILURES_FILE}" >/dev/null
    if [ $? -ne 0 ]; then
      echo "Error: Scenario ${FAILED_SCENARIO_PATH} failed but was not expected to fail."
      UNEXPECTED_FAILED_SCENARIOS+=("${FAILED_SCENARIO_PATH}")
    fi
  done

  # Check that every relevant scenario in the expected failures file did fail
  while IFS= read -r LINE; do
    # Ignore comment lines (starting with hash) or the empty lines
    if [[ ("${LINE}" =~ ^#) || (-z "${LINE}") ]]; then
      continue
    fi

    # Match lines that have [someSuite/someName.feature:n] - the part inside the
    # brackets is the suite, feature and line number of the expected failure.
    # Else ignore the line.
    if [[ "${LINE}" =~ \[([a-zA-Z0-9]+/[a-zA-Z0-9]+\.feature:[0-9]+)] ]]; then
      LINE="${BASH_REMATCH[1]}"
    else
      continue
    fi
    # This should be a suite name (string) like "webUILogin"
    EXPECTED_FAILURE_SUITE=$(dirname "${LINE}")

    for SUITE_IN_THIS_RUN in "${SUITES_IN_THIS_RUN[@]}"; do
      SUITE_IN_RUN="$(basename "${SUITE_IN_THIS_RUN}")"
      if [ "${SUITE_IN_RUN}" == "${EXPECTED_FAILURE_SUITE}" ]
      then
        # This line in the expected failures file is for a suite that has been run.
        # So we expect that the scenario in LINE has run and failed.
        # Look for it in keys of the FAILED_SCENARIO_PATHS array (! does that)
        # The string that is echoed is space-separated. A space is added at the end also.
        # Then we look for the line from the expected failures file followed by a space.
        # That ensures that when looking for a specific line number like xyz.feature:12
        # we do not accidentally match xyz.feature:12 that is in xyz.feature:123
        echo "${!FAILED_SCENARIO_PATHS[@]} " | grep "${LINE} " > /dev/null
        if [ $? -ne 0 ]
        then
          echo "Info: Scenario ${LINE} was expected to fail but did not fail."
          UNEXPECTED_PASSED_SCENARIOS+=("${LINE}")
        fi
      fi
    done
  done < "${EXPECTED_FAILURES_FILE}"
elif [ "${ACCEPTANCE_TESTS_EXIT_STATUS}" -ne 0 ]; then
  for FAILED_SCENARIO_PATH in "${!FAILED_SCENARIO_PATHS[@]}"; do
    UNEXPECTED_FAILED_SCENARIOS+=("${FAILED_SCENARIO_PATH}")
  done
  FINAL_EXIT_STATUS=1
fi

if [ ${#UNEXPECTED_FAILED_SCENARIOS[@]} -gt 0 ]; then
  UNEXPECTED_FAILURE=true
else
  UNEXPECTED_FAILURE=false
fi

if [ ${#UNEXPECTED_PASSED_SCENARIOS[@]} -gt 0 ]; then
  UNEXPECTED_SUCCESS=true
else
  UNEXPECTED_SUCCESS=false
fi

if [ "${UNEXPECTED_FAILURE}" = true ] || [ "${UNEXPECTED_SUCCESS}" = true ] || [ "${UNEXPECTED_NIGHTWATCH_CRASH}" = true ] || [ ${FINAL_EXIT_STATUS} -ne 0 ]; then
  FINAL_EXIT_STATUS=1
fi

if [ "${UNEXPECTED_FAILURE}" = true ]
then
  tput setaf 3; echo "runsh: Total unexpected failed scenarios throughout the test run:"
  tput setaf 1; printf "%s\n" "${UNEXPECTED_FAILED_SCENARIOS[@]}"
else
  tput setaf 2; echo "runsh: There were no unexpected failures."
fi

if [ "${UNEXPECTED_SUCCESS}" = true ]
then
  tput setaf 3; echo "runsh: Total unexpected passed scenarios throughout the test run:"
  tput setaf 1; printf "%s\n" "${UNEXPECTED_PASSED_SCENARIOS[@]}"
else
  tput setaf 2; echo "runsh: There were no unexpected success."
fi

if [ "${UNEXPECTED_NIGHTWATCH_CRASH}" = true ]
then
  tput setaf 3; echo "Unexpected failure or crash of the nightwatch test run"
fi

echo "runsh: Exit code: ${FINAL_EXIT_STATUS}"

# sync the file-system so all output will be flushed to storage.
# In drone we sometimes see that the last lines of output are missing from the
# drone log.
sync

# If we are running in drone CI, then sleep for a bit to (hopefully) let the
# drone agent send all the output to the drone server.
if [ -n "${CI_REPO}" ]
then
  echo "sleeping for 30 seconds at end of test run"
  sleep 30
fi

exit ${FINAL_EXIT_STATUS}

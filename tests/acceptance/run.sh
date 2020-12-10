#!/usr/bin/env bash

echo 'run.sh: running acceptance-tests-drone'

# An array of the suites that were run. Each entry is a string like:
# webUILogin
# webUIPrivateLinks
declare -a SUITES_IN_THIS_RUN

# An array of the scenarios that failed. Each entry is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -a FAILED_SCENARIO_PATHS

# An array of the scenarios that failed, and were not in the expected failures file.
# Each entry is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -a UNEXPECTED_FAILED_SCENARIOS

# An array of the scenarios that were in the expected failures file but did not fail
# Each entry is a string like:
# webUILogin/login.feature:50
# webUIPrivateLinks/accessingPrivateLinks.feature:8
declare -a UNEXPECTED_PASSED_SCENARIOS

declare -a UNEXPECTED_NIGHTWATCH_EXIT_STATUSES

yarn run acceptance-tests-drone | tee -a 'logfile.txt'
ACCEPTANCE_TESTS_EXIT_STATUS=${PIPESTATUS[0]}
echo "Debug: ACCEPTANCE_TESTS_EXIT_STATUS is ${ACCEPTANCE_TESTS_EXIT_STATUS}"
if [ "${ACCEPTANCE_TESTS_EXIT_STATUS}" -ne 0 ]; then
  echo "The acceptance test exited with error status ${ACCEPTANCE_TESTS_EXIT_STATUS}"

  FAILED_SCENARIOS="$(grep -F ') Scenario:' logfile.txt)"
  echo "+++++++++++++++++++++++++++++++++++ FAILED_SCENARIOS"
  echo "${FAILED_SCENARIOS}"
  echo "----------------------------------"
  for FAILED_SCENARIO in ${FAILED_SCENARIOS}; do
    if [[ $FAILED_SCENARIO =~ "tests/acceptance/features/" ]]; then
      SUITE_PATH=$(dirname "${FAILED_SCENARIO}")
      SUITE=$(basename "${SUITE_PATH}")
      SCENARIO=$(basename "${FAILED_SCENARIO}")
      SUITE_SCENARIO="${SUITE}/${SCENARIO}"
      FAILED_SCENARIO_PATHS+=("${SUITE_SCENARIO}")
    fi
  done

  if [ ${#FAILED_SCENARIO_PATHS[@]} -eq 0 ]
  then
    # Nightwatch had some problem but there were no failed scenarios reported
    # So the problem is something else.
    # Possibly there were missing step definitions. Or Nightwatch crashed badly, or...
    echo "Unexpected failure or crash"
    UNEXPECTED_NIGHTWATCH_EXIT_STATUSES+=("The run had nightwatch exit status ${ACCEPTANCE_TESTS_EXIT_STATUS}")
  fi
fi

echo "+++++++++++++++++++++++++++++++++++ FAILED_SCENARIO_PATHS"
echo "${FAILED_SCENARIO_PATHS[@]}"
echo "----------------------------------"

# Work out which suites were run.
# TEST_PATHS = "tests/acceptance/features/webUILogin tests/acceptance/features/webUINotifications"
# or
# TEST_CONTEXT = "webUIFavorites"
if [ -n "${TEST_PATHS}" ]; then
  for TEST_PATH in ${TEST_PATHS}; do
    SUITE=$(basename "${TEST_PATH}")
    SUITES_IN_THIS_RUN+=("${SUITE}")
  done
fi

if [ -n "${TEST_CONTEXT}" ]; then
  SUITES_IN_THIS_RUN+=("${TEST_CONTEXT}")
fi

echo "+++++++++++++++++++++++++++++++++++ SUITES_IN_THIS_RUN"
echo "${SUITES_IN_THIS_RUN[@]}"
echo "----------------------------------"

if [ -n "${EXPECTED_FAILURES_FILE}" ]; then
  echo "Checking expected failures in ${EXPECTED_FAILURES_FILE}"

  # Check that every failed scenario is in the list of expected failures
  for FAILED_SCENARIO_PATH in "${FAILED_SCENARIO_PATHS[@]}"; do
    grep -x "${FAILED_SCENARIO_PATH}" "${EXPECTED_FAILURES_FILE}" >/dev/null
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

    # This should be a suite name (string) like "webUILogin"
    EXPECTED_FAILURE_SUITE=$(dirname "${LINE}")

    for SUITE_IN_THIS_RUN in "${SUITES_IN_THIS_RUN[@]}"; do
      if [ "${SUITE_IN_THIS_RUN}" == "${EXPECTED_FAILURE_SUITE}" ]
      then
        # This line in the expected failures file is for a suite that has been run.
        # So we expect that the scenario in LINE has run and failed.
        # Look for it in FAILED_SCENARIO_PATHS
        # The string that is echoed is space-separated. A space is added at the end also.
        # Then we look for the line from the expected failures file followed by a space.
        # That ensures that when looking for a specific line number like xyz.feature:12
        # we do not accidentally match xyz.feature:12 that is in xyz.feature:123
        echo "${FAILED_SCENARIO_PATHS[@]} " | grep "${LINE} " > /dev/null
        if [ $? -ne 0 ]
        then
          echo "Info: Scenario ${LINE} was expected to fail but did not fail."
          UNEXPECTED_PASSED_SCENARIOS+=("${LINE}")
        fi
      fi
    done
  done < "${EXPECTED_FAILURES_FILE}"
fi

# Rerun any UNEXPECTED_FAILED_SCENARIOS to see if they pass or fail on a 2nd attempt
SCENARIOS_TO_RERUN=("${UNEXPECTED_FAILED_SCENARIOS[@]}")
for SCENARIO_TO_RERUN in "${SCENARIOS_TO_RERUN[@]}"; do
  echo "Rerun failed scenario: ${SCENARIO_TO_RERUN}"
  yarn run acceptance-tests-drone tests/acceptance/features/${SCENARIO_TO_RERUN} | tee -a 'logfile.txt'
  YARN_EXIT_STATUS=${PIPESTATUS[0]}
  if [ "${YARN_EXIT_STATUS}" -eq 0 ]; then
    # The scenario was not expected to fail but had failed and is present in the
    # unexpected_failures list. We've checked the scenario with a re-run and
    # it passed. So remove it from the unexpected_failures list.
    for i in "${!UNEXPECTED_FAILED_SCENARIOS[@]}"; do
      if [ "${UNEXPECTED_FAILED_SCENARIOS[i]}" == "${SCENARIO_TO_RERUN}" ]; then
        unset "UNEXPECTED_FAILED_SCENARIOS[i]"
      fi
    done
  else
    echo "test rerun failed with exit status: ${YARN_EXIT_STATUS}"
    # The scenario is not expected to fail but is failing also after the rerun.
    # Since it is already reported in the unexpected_failures list, there is no
    # need to touch that again. Continue processing the next scenario to rerun.
  fi
done

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

if [ ${#UNEXPECTED_NIGHTWATCH_EXIT_STATUSES[@]} -gt 0 ]
then
  UNEXPECTED_NIGHTWATCH_EXIT_STATUS=true
else
  UNEXPECTED_NIGHTWATCH_EXIT_STATUS=false
fi

if [ "${UNEXPECTED_FAILURE}" = false ] && [ "${UNEXPECTED_SUCCESS}" = false ] && [ "${UNEXPECTED_NIGHTWATCH_EXIT_STATUS}" = false ]; then
  FINAL_EXIT_STATUS=0
else
  FINAL_EXIT_STATUS=1
fi

if [ -n "${EXPECTED_FAILURES_FILE}" ]
then
  echo "runsh: Exit code after checking expected failures: ${FINAL_EXIT_STATUS}"
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

if [ "${UNEXPECTED_NIGHTWATCH_EXIT_STATUS}" = true ]
then
  tput setaf 3; echo "runsh: The following test runs exited with non-zero status:"
  tput setaf 1; printf "%s\n" "${UNEXPECTED_NIGHTWATCH_EXIT_STATUSES[@]}"
fi

exit ${FINAL_EXIT_STATUS}

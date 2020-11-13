#!/usr/bin/env bash

echo 'run.sh: running acceptance-tests-drone'

#TEST_LOG_FILE=$(mktemp)
EXPECTED_FAILURES_FILE=tests/acceptance/expected-failures.txt
declare -a UNEXPECTED_FAILED_SCENARIOS
declare -a UNEXPECTED_PASSED_SCENARIOS

yarn run acceptance-tests-drone | tee -a 'logfile.txt'
ACCEPTANCE_TESTS_EXIT_STATUS=${PIPESTATUS[0]}
echo ${ACCEPTANCE_TESTS_EXIT_STATUS}
if [ $ACCEPTANCE_TESTS_EXIT_STATUS -ne 0 ]; then
  echo 'The acceptance test exited with error status '${ACCEPTANCE_TESTS_EXIT_STATUS}

  FAILED_SCENARIOS="$(grep -F ') Scenario:' logfile.txt)"
  FAILED_SCENARIO_PATHS=()
  for FAILED_SCENARIO in ${FAILED_SCENARIOS}; do
    if [[ $FAILED_SCENARIO =~ "tests/acceptance/features/" ]]; then
      SUITE_PATH=$(dirname ${FAILED_SCENARIO})
      SUITE=$(basename ${SUITE_PATH})
      SCENARIO=$(basename ${FAILED_SCENARIO})
      SUITE_SCENARIO="${SUITE}/${SCENARIO}"
      FAILED_SCENARIO_PATHS+="${SUITE_SCENARIO} "
    fi
  done
fi

if [ $ACCEPTANCE_TESTS_EXIT_STATUS -eq 0 ]; then
  # Find the count of scenarios that passed
  SCENARIO_RESULTS_COLORED=$(grep -E '^[0-9]+[[:space:]]scenario(|s)[[:space:]]\(' logfile.txt)
  SCENARIO_RESULTS=$(echo "${SCENARIO_RESULTS_COLORED}" | sed "s/\x1b[^m]*m//g")
  # They all passed, so just get the first number.
  # The text looks like "1 scenario (1 passed)" or "123 scenarios (123 passed)"
  [[ ${SCENARIO_RESULTS} =~ ([0-9]+) ]]
  SCENARIOS_THAT_PASSED=$((SCENARIOS_THAT_PASSED + BASH_REMATCH[1]))
elif [ $ACCEPTANCE_TESTS_EXIT_STATUS -ne 0 ]; then
  echo 'The acceptance test run exited with error status '${ACCEPTANCE_TESTS_EXIT_STATUS}
  # Find the count of scenarios that passed and failed
  SCENARIO_RESULTS_COLORED=$(grep -E '^[0-9]+[[:space:]]scenario(|s)[[:space:]]\(' logfile.txt)
  SCENARIO_RESULTS=$(echo "${SCENARIO_RESULTS_COLORED}" | sed "s/\x1b[^m]*m//g")
  if [[ ${SCENARIO_RESULTS} =~ [0-9]+[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+ ]]; then
    # Some passed and some failed, we got the second and third numbers.
    # The text looked like "15 scenarios (6 passed, 9 failed)"
    SCENARIOS_THAT_PASSED=$((SCENARIOS_THAT_PASSED + BASH_REMATCH[1]))
    SCENARIOS_THAT_FAILED=$((SCENARIOS_THAT_FAILED + BASH_REMATCH[2]))
  elif [[ ${SCENARIO_RESULTS} =~ [0-9]+[^0-9]+([0-9]+)[^0-9]+ ]]; then
    # All failed, we got the second number.
    # The text looked like "4 scenarios (4 failed)"
    SCENARIOS_THAT_FAILED=$((SCENARIOS_THAT_FAILED + BASH_REMATCH[1]))
  fi
fi

if [ -n "${EXPECTED_FAILURES_FILE}" ]; then
  echo "Checking expected failures"

  #  printf "%s" "$(<$EXPECTED_FAILURES_FILE)"
  #  echo "$(<$EXPECTED_FAILURES_FILE)"

  # Check that every failed scenario is in the list of expected failures
  for FAILED_SCENARIO_PATH in ${FAILED_SCENARIO_PATHS}; do
    grep -x ${FAILED_SCENARIO_PATH} ${EXPECTED_FAILURES_FILE} >/dev/null
    if [ $? -ne 0 ]; then
      echo "Error: Scenario ${FAILED_SCENARIO_PATH} failed but was not expected to fail."
      UNEXPECTED_FAILED_SCENARIOS+="${FAILED_SCENARIO_PATH} "
    fi
  done

  # Check that every scenario in the expected failures did fail
  while IFS= read -r line; do
    # Ignore comment lines (starting with hash) or the empty lines
    if [[ ("$line" =~ ^#) || (-z "$line") ]]; then
      continue
    fi
    EXPECTED_FAILURE_SUITE=$(dirname "${line}")

    if [ -n "${TEST_PATHS}" ]; then
      # If the expected failure is not in the suite that is currently being run,
      # then do not try and check that it failed.
      RUN_SUITE_SCENARIO=()
      for TEST_PATH in "${TEST_PATHS}"; do
        SUITE=$(basename ${TEST_PATH})
        RUN_SUITE_SCENARIO+="${SUITE} "
        done
        REGEX_TO_MATCH="^${EXPECTED_FAILURE_SUITE}/"
        if ! [[ " ${RUN_SUITE_SCENARIO[@]} " == *"${REGEX_TO_MATCH}"* ]]; then
          continue
        fi
    fi

    if [ -n "${TEST_CONTEXT}" ]; then
      # If the expected failure is not in the suite that is currently being run,
      # then do not try and check that it failed.
      RUN_SUITE_SCENARIO=()
      for CONTEXT in "${TEST_CONTEXT}"; do
        RUN_SUITE_SCENARIO+="^${CONTEXT}/ "
        done
        REGEX_TO_MATCH="^${EXPECTED_FAILURE_SUITE}/"
        if ! [[ " ${RUN_SUITE_SCENARIO[@]} " == *"${REGEX_TO_MATCH}"* ]]; then
          continue
        fi
    fi

    if ! [[ " ${FAILED_SCENARIO_PATHS[@]} " == *"$line"* ]]; then
      echo "Error: Scenario $line was expected to fail but did not fail."
      UNEXPECTED_PASSED_SCENARIOS+="$line "
    fi
  done <"$EXPECTED_FAILURES_FILE"
fi

if [ -n "${UNEXPECTED_PASSED_SCENARIOS}" ]; then
  echo "The following scenarios passed unexpectedly: "
  for SCENARIO in ${UNEXPECTED_PASSED_SCENARIOS}; do
    echo ${SCENARIO}
  done
else
  echo "There were no unexpected passed scenarios"
fi

if [ -n "${UNEXPECTED_FAILED_SCENARIOS}" ]; then
  echo "The following scenarios failed unexpectedly: "
  for SCENARIO in ${UNEXPECTED_FAILED_SCENARIOS}; do
    echo ${SCENARIO}
  done
else
  echo "There were no unexpected failed scenarios"
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

if [ "${UNEXPECTED_FAILURE}" = false ] && [ "${UNEXPECTED_SUCCESS}" = false ]; then
  FINAL_EXIT_STATUS=0
else
  FINAL_EXIT_STATUS=1
fi

rm logfile.txt
unset UNEXPECTED_FAILED_SCENARIOS
unset UNEXPECTED_PASSED_SCENARIOS

exit ${FINAL_EXIT_STATUS}

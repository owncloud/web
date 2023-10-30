#!/usr/bin/env bash

# when deleting the tests suites from /features there might be the tests scenarios that might be in the expected to failure file
# this script checks if there are such scenarios in the expected to failure file which needs to be deleted

# helper functions
log_error() {
	echo -e "\e[31m$1\e[0m"
}

log_info() {
	echo -e "\e[37m$1\e[0m"
}

log_success() {
	echo -e "\e[32m$1\e[0m"
}

SCRIPT_PATH=$(dirname "$0")
PATH_TO_SUTES="${SCRIPT_PATH}/features"
PATH_TO_EXPECTED_TO_FAILURE_FILE="${SCRIPT_PATH}/expected-failures-with-ocis-server-ocis-storage.md"
# contains all the suites names inside tests/acceptance/features
SUITES_AVAILABLE=($(ls -l "$PATH_TO_SUTES" | grep '^d' | awk '{print $NF}'))

# regex to match [someSuites/someFeatureFile.feature:lineNumber]
REGEX_FOR_TEST_SCENARIO="\[([a-zA-Z0-9]+/[a-zA-Z0-9]+\.feature:[0-9]+)]"

# contains all those suites available in the expected to failure files in pattern [someSuites/someFeatureFile.feature:lineNumber]
SUITES_IN_EXPECTED_TO_FAILURE=($(grep -Eo ${REGEX_FOR_TEST_SCENARIO} ${PATH_TO_EXPECTED_TO_FAILURE_FILE}))

# get and store only the suites names from SUITES_IN_EXPECTED_TO_FAILURE
FILTERED_SUITES_IN_EXPECTED_TO_FAILURE=()
for value in "${SUITES_IN_EXPECTED_TO_FAILURE[@]}"; do
  if [[ $value =~ \[([a-zA-Z0-9]+) ]]; then
     current_value="${BASH_REMATCH[1]}"
     FILTERED_SUITES_IN_EXPECTED_TO_FAILURE+=("$current_value")
  fi
done

# also filter the duplicated suites name
FILTERED_SUITES_IN_EXPECTED_TO_FAILURE=($(echo "${FILTERED_SUITES_IN_EXPECTED_TO_FAILURE[@]}" | tr ' ' '\n' | sort | uniq))

# Check the existence of the suite
SCENARIOS_THAT_DOESNOT_EXISTS=()
for suite in "${FILTERED_SUITES_IN_EXPECTED_TO_FAILURE[@]}"; do
  if [[ " ${SUITES_AVAILABLE[*]} " != *" $suite "* ]]; then
    pattern="(${suite}/[a-zA-Z0-9]+\\.feature:[0-9]+)"
    SCENARIOS_THAT_DOESNOT_EXISTS+=($(grep -Eo ${pattern} ${PATH_TO_EXPECTED_TO_FAILURE_FILE}))
  fi
done

count="${#SCENARIOS_THAT_DOESNOT_EXISTS[@]}"

if [ "$count" -gt 0 ]; then
  log_info "The following test scenarios does not exists anymore:"
  log_info "The below test scenarios can be deleted from the ${PATH_TO_EXPECTED_TO_FAILURE_FILE}."
  for path_to_scenario in "${SCENARIOS_THAT_DOESNOT_EXISTS[@]}"; do
    log_error "$path_to_scenario"
  done
  exit 1
fi

log_success "All the suites in the expected to failure files exists in the test suites"

#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$(cd "${SCRIPT_PATH}" && pwd) # normalized and made absolute
FEATURES_DIR="${SCRIPT_PATH}/cucumber/features"
PROJECT_ROOT=$(cd "$SCRIPT_PATH/../../" && pwd)
E2E_COMMAND="pnpm test:e2e:cucumber"

ALL_SUITES=$(find "${FEATURES_DIR}"/ -type d | sort | rev | cut -d"/" -f1 | rev | grep -v '^[[:space:]]*$')
FEATURE_FILE=""
FILTER_SUITES=""
EXCLUDE_SUITES=""

SKIP_RUN_PARTS=true
RUN_PART=""
TOTAL_PARTS=""

HELP_COMMAND="
Available options:
    --feature       - feature file to run
                      e.g.: --feature tests/e2e/cucumber/features/journeys/kindergarten.feature
    --suites        - suites to run. Comma separated values (folder names)
                      e.g.: --suites smoke,shares
    --exclude       - exclude suites from running. Comma separated values
                      e.g.: --exclude spaces,search
    --run-part      - part to run out of total parts (groups)
                      e.g.: --run-part 2 (runs part 2 out of 4)
    --total-parts   - total number of groups to divide into
                      e.g.: --total-parts 4 (suites will be divided into 4 groups)
"

while [[ $# -gt 0 ]]; do
    key="$1"
    case ${key} in
    --feature)
        FEATURE_FILE=$2
        shift 2
        ;;
    --exclude)
        EXCLUDE_SUITES=$(echo "$2" | sed -E "s/,/\n/g")
        shift 2
        ;;
    --suites)
        FILTER_SUITES=$(echo "$2" | sed -E "s/,/\n/g")
        shift 2
        ;;
    --run-part)
        SKIP_RUN_PARTS=false
        RUN_PART=$2
        shift 2
        ;;
    --total-parts)
        SKIP_RUN_PARTS=false
        TOTAL_PARTS=$2
        shift 2
        ;;
    --help | -h)
        echo "$HELP_COMMAND"
        exit 0
        ;;
    *)
        echo "ERR: Unknown option '$1'"
        echo "$HELP_COMMAND"
        exit 1
        ;;
    esac
done
# TODO: treat remaining args as feature paths

function runE2E() {
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        echo "ERR: Project root '$PROJECT_ROOT' doesn't exist"
    fi
    cd "$PROJECT_ROOT" || exit 1
    $E2E_COMMAND # run e2e test
    exit $?
}

function checkSuites() {
    # $1    - suites (separated by space or newline)
    for e_suite in $1; do
        exists=false
        for a_suite in $ALL_SUITES; do
            if [[ "$e_suite" == "$a_suite" ]]; then
                exists=true
            fi
        done
        if [[ "$exists" == false ]]; then
            echo "ERR: Suite doesn't exist: '$e_suite'"
            exit 1
        fi
    done
}

function buildSuitesPattern() {
    # count words
    CURRENT_SUITES_COUNT=$(echo "$1" | wc -w)
    suites=$(echo "$1" | xargs | sed -E "s/( )+/,/g")
    if [[ $CURRENT_SUITES_COUNT -gt 1 ]]; then
        echo "multiple"
        suites="{$suites}"
    fi
    E2E_COMMAND+=" $FEATURES_DIR/$suites/**/*.feature"
}

# [RUN E2E]
# run only provided feature file
if [[ -n $FEATURE_FILE ]]; then
    E2E_COMMAND+=" $FEATURE_FILE"
    runE2E
fi

# check if suites exist
if [[ -n $FILTER_SUITES ]]; then
    checkSuites "$FILTER_SUITES"
    ALL_SUITES=$FILTER_SUITES
fi
if [[ -n $EXCLUDE_SUITES ]]; then
    checkSuites "$EXCLUDE_SUITES"
fi

# exclude suites from running
if [[ -n $EXCLUDE_SUITES ]]; then
    for exclude_suite in $EXCLUDE_SUITES; do
        ALL_SUITES=${ALL_SUITES/$exclude_suite/}
    done
fi

if [[ "$SKIP_RUN_PARTS" != true ]]; then
    if [[ -z $RUN_PART ]]; then
        echo "ERR: Missing '--run-part'"
        echo "USAGE: --run-part <number>"
        exit 1
    fi
    if [[ -z $TOTAL_PARTS ]]; then
        echo "ERR: Missing '--total-parts'"
        echo "USAGE: --total-parts <number>"
        exit 1
    fi

    ALL_SUITES_COUNT=$(echo "${ALL_SUITES}" | wc -l)
    SUITES_PER_RUN=$((ALL_SUITES_COUNT / TOTAL_PARTS))
    REMAINING_SUITES=$((ALL_SUITES_COUNT - (TOTAL_PARTS * SUITES_PER_RUN)))

    if [[ ${RUN_PART} -le ${REMAINING_SUITES} ]]; then
        SUITES_PER_RUN=$((SUITES_PER_RUN + 1))
        PREVIOUS_SUITES_COUNT=$(((RUN_PART - 1) * SUITES_PER_RUN))
    else
        PREV_MAX_SUITES=$((REMAINING_SUITES * (SUITES_PER_RUN + 1)))
        PREV_MIN_SUITES=$((((RUN_PART - 1) - REMAINING_SUITES) * SUITES_PER_RUN))
        PREVIOUS_SUITES_COUNT=$((PREV_MAX_SUITES + PREV_MIN_SUITES))
    fi

    GRAB_SUITES_UPTO=$((PREVIOUS_SUITES_COUNT + SUITES_PER_RUN))
    ALL_SUITES=$(echo "${ALL_SUITES}" | head -n "$GRAB_SUITES_UPTO" | tail -n "$SUITES_PER_RUN")
fi

buildSuitesPattern "$ALL_SUITES"
# [RUN E2E]
# run the suites
runE2E

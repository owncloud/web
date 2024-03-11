#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$(cd "${SCRIPT_PATH_REL}" && pwd) # absolute path
FEATURES_DIR="${SCRIPT_PATH}/cucumber/features"
PROJECT_ROOT=$(cd "$SCRIPT_PATH/../../" && pwd)
SCRIPT_PATH_REL=${SCRIPT_PATH//"$PROJECT_ROOT/"/}

E2E_COMMAND="pnpm test:e2e:cucumber" # run command defined in package.json

ALL_SUITES=$(find "${FEATURES_DIR}"/ -type d | sort | rev | cut -d"/" -f1 | rev | grep -v '^[[:space:]]*$')
FILTER_SUITES=""
EXCLUDE_SUITES=""
FEATURE_PATHS=""
GLOB_FEATURE_PATHS=""
FEATURE_PATHS_FROM_ARG=""

SKIP_RUN_PARTS=true
RUN_PART=""
TOTAL_PARTS=""

HELP_COMMAND="
COMMAND [options] [paths]

Available options:
    --suites        - suites to run. Comma separated values (folder names)
                      e.g.: --suites smoke,shares
    --exclude       - exclude suites from running. Comma separated values
                      e.g.: --exclude spaces,search
    --run-part      - part to run out of total parts (groups)
                      e.g.: --run-part 2 (runs part 2 out of 4)
    --total-parts   - total number of groups to divide into
                      e.g.: --total-parts 4 (suites will be divided into 4 groups)
    --help, -h      - show cli options
"

while [[ $# -gt 0 ]]; do
    key="$1"
    case ${key} in
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
        if [[ $1 =~ ^-.* ]]; then
            echo "ERR: Unknown option: '$1'"
            echo "$HELP_COMMAND"
            exit 1
        fi
        FEATURE_PATHS_FROM_ARG+=" $1" # maintain the white space
        shift
        ;;
    esac
done

function getFeaturePaths() {
    # $1    - paths to suite or feature file
    paths=$(echo "$1" | xargs)
    real_paths=""
    for path in $paths; do
        real_paths+=" $SCRIPT_PATH/$path" # maintain the white space
        a_path=$(echo "$path" | cut -d ":" -f1)
        if [[ ! -f $a_path && ! -d $a_path ]]; then
            echo "ERR: File or folder doesn't exist: '$a_path'"
            echo "INFO: Path must be relative to '$SCRIPT_PATH_REL'"
            exit 1
        fi
    done
    FEATURE_PATHS=$(echo "$real_paths" | xargs) # remove trailing white spaces
}

function runE2E() {
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        echo "ERR: Project root doesn't exist: '$PROJECT_ROOT'"
    fi
    cd "$PROJECT_ROOT" || exit 1
    if [[ -n $GLOB_FEATURE_PATHS ]]; then
        $E2E_COMMAND "$GLOB_FEATURE_PATHS" # run without expanding glob pattern
    else
        # shellcheck disable=SC2086
        $E2E_COMMAND $FEATURE_PATHS
    fi
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
    CURRENT_SUITES_COUNT=$(echo "$1" | wc -w) # count words
    suites=$(echo "$1" | xargs | sed -E "s/( )+/,/g")
    if [[ $CURRENT_SUITES_COUNT -gt 1 ]]; then
        suites="{$suites}"
    fi
    GLOB_FEATURE_PATHS="$FEATURES_DIR/$suites/**/*.feature"
}

# 1. [RUN E2E] run features from provided paths
if [[ -n $FEATURE_PATHS_FROM_ARG && "$SKIP_RUN_PARTS" == true ]]; then
    getFeaturePaths "$FEATURE_PATHS_FROM_ARG"
    echo "INFO: Running e2e using paths. All cli options will be discarded"
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
        ALL_SUITES=$(echo "${ALL_SUITES/$exclude_suite/}" | sed -E "/^( )*$/d") # remove suite and trim empty lines
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
# 2. [RUN E2E] run the suites
runE2E

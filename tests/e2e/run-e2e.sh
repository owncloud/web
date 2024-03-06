#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$(cd "${SCRIPT_PATH}" && pwd) # normalized and made absolute
FEATURES_DIR="${SCRIPT_PATH}/cucumber/features"
PROJECT_ROOT=$(cd "$SCRIPT_PATH/../../" && pwd)
E2E_COMMAND="pnpm test:e2e:cucumber"

ALL_SUITES=""
FEATURE_FILE=""

SKIP_RUN_PARTS=true
EXCLUDE_SUITES=""
RUN_PART=""
TOTAL_PARTS=""

HELP_COMMAND="
Available options:
    --feature   - feature file to run
                  e.g.: --feature tests/e2e/cucumber/features/journeys/kindergarten.feature
    --suites    - suites to run. Comma separated values (folder names)
                  e.g.: --suites smoke,shares
    --exclude   - exclude suites from running. Comma separated values
                  e.g.: --exclude spaces,search
    --run-part  - part to run: <part>/<total-parts>
                  e.g.: --run-part 2/4 (runs part 2 out of 4)
"

while [[ $# -gt 0 ]]; do
    key="$1"
    case ${key} in
    --feature)
        FEATURE_FILE=$2
        shift 2
        ;;
    --exclude)
        EXCLUDE_SUITES=${2//,/ }
        shift 2
        ;;
    --suites)
        ALL_SUITES=${2//,/ }
        shift 2
        ;;
    --run-part)
        SKIP_RUN_PARTS=false
        parts=${2/\// }
        # shellcheck disable=SC2206
        parts=($parts)
        RUN_PART=${parts[0]}
        TOTAL_PARTS=${parts[1]}

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

if [[ -n "$FEATURE_FILE" ]]; then
    E2E_COMMAND+=" $FEATURE_FILE"
elif [[ "$ALL_SUITES" == "" ]]; then
    ALL_SUITES=$(find "${FEATURES_DIR}"/ -type d | sort | rev | cut -d"/" -f1 | rev | xargs)

    if [[ -n "$EXCLUDE_SUITES" ]]; then
        for exclude_suite in $EXCLUDE_SUITES; do
            ALL_SUITES=${ALL_SUITES/$exclude_suite/}
        done
    fi

    # build suites for running in parts
    if [[ "$SKIP_RUN_PARTS" != true && -n $RUN_PART && -n $TOTAL_PARTS ]]; then
        ALL_SUITES_COUNT=$(echo "${ALL_SUITES}" | wc -l)
        SUITES_PER_RUN=$((ALL_SUITES_COUNT / TOTAL_PARTS))
        REMAINING_SUITES=$((ALL_SUITES_COUNT - (TOTAL_PARTS * SUITES_PER_RUN)))

        if [[ ${RUN_PART} -le ${REMAINING_SUITES} ]]; then
            SUITES_PER_RUN=$((SUITES_PER_RUN + 1))
            PREVIOUS_INDEX=$(((RUN_PART - 1) * SUITES_PER_RUN))
        else
            MAX=$((REMAINING_SUITES * (SUITES_PER_RUN + 1)))
            REM=$((((RUN_PART - 1) - REMAINING_SUITES) * SUITES_PER_RUN))
            PREVIOUS_INDEX=$((MAX + REM))
        fi

        SUITES_UPTO=$((SUITES_PER_RUN + PREVIOUS_INDEX))

        # shellcheck disable=SC2207
        SUITES_TO_RUN+=($(echo "${ALL_SUITES}" | head -n "$SUITES_UPTO" | tail -n "$SUITES_PER_RUN"))
        echo "${SUITES_TO_RUN[@]}"
    fi

    # build suites command
    suites=$(echo "$ALL_SUITES" | xargs | sed -E "s/( )+/,/g")
    E2E_COMMAND+=" $FEATURES_DIR/{$suites}/*.feature"
fi

# SUITES_GLOB="$FEATURES_DIR/{${SUITES_TO_RUN[@]}}/*.feature"
# echo $ALL_SUITES_COUNT

# run e2e test
cd "$PROJECT_ROOT" || exit 1
$E2E_COMMAND

#!/usr/bin/env bash

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$(cd "${SCRIPT_PATH}" && pwd) # normalized and made absolute
FEATURES_DIR="${SCRIPT_PATH}/cucumber/features"
PROJECT_ROOT="$SCRIPT_PATH/../../"

ALL_SUITES=$(find "${FEATURES_DIR}"/ -type d | sort | rev | cut -d"/" -f1,2 | rev | grep -v '^features/$')

EXCLUDE_SUITES=""
RUN_PART=""
TOTAL_PARTS=""

# cli options:
# --suites      - suites to run. Comma separated values
#                 e.g.: --suites smoke,shares
# --exclude     - exclude suites from running. Comma separated values
#                 e.g.: --exclude spaces,search
# --run-part    - part to run: <part>/<total-parts>
#                 e.g.: --run-part 2/4 (runs part 2 out of 4)
while [[ $# -gt 0 ]]; do
    key="$1"
    case ${key} in
    --exclude)
        EXCLUDE_SUITES=${2//,/ }
        shift 2
        ;;
    --suites)
        ALL_SUITES=${2//,/ }
        shift 2
        ;;
    --run-part)
        parts=${2/\// }
        # shellcheck disable=SC2206
        parts=($parts)
        RUN_PART=${parts[0]}
        TOTAL_PARTS=${parts[1]}

        shift 2
        ;;
    esac
done

if [[ -z "$ALL_SUITES" ]]; then
    echo "ERR: No suites provided with '--suites' option"
    echo "USAGE: --suites suite1,suite2"
    exit 1
fi

if [[ -n "$EXCLUDE_SUITES" ]]; then
    for suite in $ALL_SUITES; do
        for exclude_suite in $EXCLUDE_SUITES; do
            if [[ "$suite" == "$exclude_suite" ]]; then
                ALL_SUITES="${ALL_SUITES/$suite/}"
            fi
        done
    done
fi

if [[ -n $RUN_PART && -n $TOTAL_PARTS ]]; then
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

# SUITES_GLOB="$FEATURES_DIR/{${SUITES_TO_RUN[@]}}/*.feature"
echo $ALL_SUITES_COUNT

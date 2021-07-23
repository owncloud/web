
SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$( cd "${SCRIPT_PATH}" && pwd )  # normalized and made absolute
stopBuildsFilePath="${SCRIPT_PATH}/buildsToStop.txt"


while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
 echo "$p" | awk -F'#' '{print $(2)}'
 echo "done"
done <${SCRIPT_PATH}/../../buildsToStop.txt

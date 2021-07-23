
SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$( cd "${SCRIPT_PATH}" && pwd )  # normalized and made absolute
stopBuildsFilePath="${SCRIPT_PATH}/buildsToStop.txt"


while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
done <${SCRIPT_PATH}/../../buildsToStop.txt

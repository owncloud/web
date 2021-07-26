SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$( cd "${SCRIPT_PATH}" && pwd )  # normalized and made absolute

awk "/Build #|Ref: refs\/pull/" ${SCRIPT_PATH}/../../recentBuilds.txt > ${SCRIPT_PATH}/filteredDescriptions.txt
cat ${SCRIPT_PATH}/filteredDescriptions.txt
awk "/Ref: refs\/pull/" ${SCRIPT_PATH}/../../thisBuildInfo.txt > ${SCRIPT_PATH}/thisBuildFiltered.txt
echo "2"
cat ${SCRIPT_PATH}/thisBuildFiltered.txt
NUMBER=$(awk -F"\/head" "{print $(1)}" ${SCRIPT_PATH}/thisBuildFiltered.txt | awk -F"pull\/" "{print $(2)}")
echo "3"
echo $NUMBER
echo "4"
awk -v ref="Ref: refs\/pull\/" $NUMBER "\/head" "index($0,ref){print p} {p=$0}" ${SCRIPT_PATH}/filteredDescriptions.txt > ${SCRIPT_PATH}/buildsToStop.txt
cat ${SCRIPT_PATH}/buildsToStop.txt

while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
 echo "$p" | awk -F'#' '{print $(2)}'
 echo "done"
done <${SCRIPT_PATH}/buildsToStop.txt

SCRIPT_PATH=$(dirname "$0")
SCRIPT_PATH=$( cd "${SCRIPT_PATH}" && pwd )  # normalized and made absolute

awk "/Build #|Ref: refs\/pull/" ${SCRIPT_PATH}/../../recentBuilds.txt > ${SCRIPT_PATH}/filteredDescriptions.txt
awk "/Ref: refs\/pull/" ${SCRIPT_PATH}/../../thisBuildInfo.txt > ${SCRIPT_PATH}/thisBuildFiltered.txt
cat ${SCRIPT_PATH}/thisBuildFiltered.txt
NUMBER=$(grep -o -E "[0-9]+" ${SCRIPT_PATH}/thisBuildFiltered.txt)
referenceNum="Ref: refs/pull/"$NUMBER"/head"
awk -v ref="$referenceNum" 'index($0,ref){print p} {p=$0}' ${SCRIPT_PATH}/filteredDescriptions.txt > ${SCRIPT_PATH}/buildsToStop.txt
cat ${SCRIPT_PATH}/buildsToStop.txt

while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
 buildNumber=$(echo "$p" | awk -F'#' '{print $(2)}')
 echo $DRONE_BUILD_NUMBER
 echo $buildNumber
 if [[ $DRONE_BUILD_NUMBER > $buildNumber ]]; then
     echo "THIS BUILD SHOULD BE CANCELLED: " $buildNumber
     drone build stop owncloud/web $buildNumber
 fi
 echo "done"
done <${SCRIPT_PATH}/buildsToStop.txt

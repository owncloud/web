curl -s phoenix:8300 > /dev/null
while [ $? -ne 0 ]
do
	sleep 1
	echo .
	curl -s phoenix:8300 > /dev/null
done

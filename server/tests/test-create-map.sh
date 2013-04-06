#!/bin/bash

(
./RayCloudBrowser-client create-map 11.txt 11.txt.dat
./RayCloudBrowser-client describe-map-objects 11.txt.dat > 11.txt.dat.txt
./RayCloudBrowser-client create-map 11.txt.dat.txt 11.txt.dat.txt.dat
) &> /dev/null

echo -n "<test name=\"sort\" result=\""

if test $(sha1sum 11.txt.dat|awk '{print $1}') = $(sha1sum 11.txt.dat.txt.dat|awk '{print $1}')
then
	echo -n "PASS"
else
	echo -n "FAIL"
fi

echo "\" />"

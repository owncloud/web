#!/bin/bash
source .drone.env;
echo "checking ocis version - $OCIS_COMMITID in cache";

url="https://cache.owncloud.com/owncloud/web/ocis-build/$OCIS_COMMITID/ocis";

echo "downloading ocis from $url";

if curl --output /dev/null --silent --head --fail "$url"; then
  echo "ocis binary for $OCIS_COMMITID already available in cache";
  exit 0;
else
  mkdir -p $GOPATH/src/github.com/owncloud/;
  cd $GOPATH/src/github.com/owncloud/;
  git clone -b $OCIS_BRANCH --single-branch --no-tags https://github.com/owncloud/ocis;
  cd ocis;
  git checkout $OCIS_COMMITID;
  cd ocis;
  make build;
  mkdir -p /var/www/owncloud/ocis-build/$OCIS_COMMITID;
  cp bin/ocis /var/www/owncloud/ocis-build/$OCIS_COMMITID/ ;
  ls -la /var/www/owncloud/ocis-build/$OCIS_COMMITID/ ;
fi

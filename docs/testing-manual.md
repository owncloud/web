---
title: "Running acceptance tests - manual"
date: 2020-04-15T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: testing-old.md
---

{{< toc >}}

## Setup Selenium

There are multiple ways to run Selenium:

- [Setup using Docker](#setup-using-docker)
- [Setup using Docker Desktop for Mac](#setup-using-docker-desktop-for-mac)
- [Setup using a standalone Selenium server](#setup-using-standalone-selenium-server)

### Setup using Docker

- Set the environment variables `SELENIUM_HOST` as `localhost` and `SERVER_HOST` in the format `http://<ip_addr>:9100`.
- If you are a Linux user, run `docker run --rm -d --network="host" -v /dev/shm:/dev/shm -v ${REMOTE_UPLOAD_DIR:-$PWD/tests/acceptance/filesForUpload}:${LOCAL_UPLOAD_DIR:-/uploads}:ro --name web-tests-selenium selenium/standalone-chrome-debug`
- If you are a Mac user, run `docker run --rm -d -p ${SELENIUM_PORT:-4444}:4444 -p 5900:5900 -v /dev/shm:/dev/shm -v ${REMOTE_UPLOAD_DIR:-$PWD/tests/acceptance/filesForUpload}:${LOCAL_UPLOAD_DIR:-/uploads}:ro --name web-tests-selenium selenium/standalone-chrome-debug`
  - This command creates a docker container which uses port forwarding instead of host networking [which is not supported on Mac](https://docs.docker.com/network/host/)

  If you are running selenium with these docker commands, you can run these commands from the `web` folder, then you won't need to set `REMOTE_UPLOAD_DIR`.

### Setup using Docker Desktop for Mac

In order to run acceptance tests with selenium running in Docker Desktop for Mac while having ownCloud Server and Web running as services
on the host machine, `localhost` will not work as URL. Use the Docker host ip `172.17.0.1` or its alias `host.docker.internal` instead.
This requires adjusting all relevant config files to use `host.docker.internal` instead of `localhost` (config.json in Web and
config/config.php in oC10) and changing the web OIDC-callback url. Set the `SERVER_HOST` and `BACKEND_HOST` environment variables
accordingly. In order to use the same url for development on the host machine, define it as an alias to `127.0.0.1` in `/etc/hosts`.
After all these changes Web will be accessible at `http://host.docker.internal:9100` for both development and acceptance tests.

### Setup using standalone Selenium server

When running a standalone Selenium server, make sure to set the environment variable `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR` accordingly.

## Setup backend

### ownCloud 10

- set up the [ownCloud 10 backend]({{< ref "backend-oc10.md" >}})
- clone and install the [testing app](http://github.com/owncloud/testing) into ownCloud

### oCIS
In order to run the acceptance tests you need to run oCIS using the oCIS storage driver. Also, you need to enable basic auth on the server with these environment variables.

`PROXY_ENABLE_BASIC_AUTH=true STORAGE_HOME_DRIVER=owncloud STORAGE_USERS_DRIVER=owncloud`

- set up the [oCIS backend]({{< ref "backend-ocis.md" >}})
  - if you are a Mac user, you need to start the server with additional environment variables: `STORAGE_HOME_DATA_SERVER_URL='http://host.docker.internal:9155/data' STORAGE_DATAGATEWAY_PUBLIC_URL='https://host.docker.internal:9200/data' STORAGE_USERS_DATA_SERVER_URL='http://host.docker.internal:9158/data' STORAGE_FRONTEND_PUBLIC_URL='https://host.docker.internal:9200' PROXY_ENABLE_BASIC_AUTH=true PROXY_OIDC_ISSUER='https://host.docker.internal:9200' IDP_INSECURE='true' IDP_IDENTIFIER_REGISTRATION_CONF='<web-path>/tests/acceptance/mac-identifier-registration.yml' IDP_ISS='https://host.docker.internal:9200' IDP_TLS='true'` (`<web-path>` needs to be replaced with the path of your local clone of ownCloud Web)

## Setup ownCloud Web

- [build Web]({{< ref "building.md" >}})
- [start the Web server]({{< ref "backend-oc10.md#running-web" >}})
- if you are running web against the oCIS backend, clone the testing app `git clone git@github.com:owncloud/testing.git tests/testing-app`

## Run tests
- Change the directory to `tests/acceptance`
- Install all the test dependencies with `yarn` command
- set `SERVER_HOST` to point at the URL where the Web web pages are served, for example "http://localhost:9100"
- set `BACKEND_HOST` to point to the URL of the backend, for example "http://localhost/owncloud/"
- to be able to run federation tests, additional setup is needed:
   1. Install and set up a second ownCloud server-instance that is accessible by a different URL. That second server-instance must have its own database and data directory.
   2. clone and install the testing app into the second ownCloud server-instance from http://github.com/owncloud/testing .
   3. when running the acceptance tests use `REMOTE_BACKEND_HOST` environment variable to define its address, for example, `REMOTE_BACKEND_HOST=http://<ip_address_of_second_ownCloud_server-instance> yarn test:acceptance:oc10 <feature-files-to-test>`

- set the `SELENIUM_HOST` environment variable to your host that runs selenium, mostly `localhost`
- set the `SELENIUM_PORT` environment variable to your selenium port, mostly `4444`
- set the `TESTING_DATA_DIR` when running the tests on oCIS pointing to the testing data that includes data like skeleton directories. The testing directory is available [here](https://github.com/owncloud/testing/tree/master/data). This is handled automatically by the testrunner while running the tests in oc10.

The feature files are located in the "tests/acceptance/features" subdirectories.

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

### with oC10 backend

- run `yarn test:acceptance:oc10 <feature-files-to-test>`

### with oCIS backend

- run `yarn test:acceptance:ocis <feature-files-to-test>`
- If you are a mac user, run `STORAGE_HOME_DATA_SERVER_URL='http://host.docker.internal:9155/data' STORAGE_DATAGATEWAY_PUBLIC_URL='https://host.docker.internal:9200/data' STORAGE_USERS_DATA_SERVER_URL='http://host.docker.internal:9158/data' STORAGE_FRONTEND_PUBLIC_URL='https://host.docker.internal:9200' PROXY_ENABLE_BASIC_AUTH=true PROXY_OIDC_ISSUER='https://host.docker.internal:9200' IDP_INSECURE='true' IDP_IDENTIFIER_REGISTRATION_CONF='./mac-identifier-registration.yml' IDP_ISS='https://host.docker.internal:9200' IDP_TLS='true' yarn test:acceptance:ocis <feature-files-to-test>`

### Visual Regression Testing

The test suite consists of snapshots of UI components which can be compared for visual regression testing when running the acceptance tests. These comparisons are done in the existing scenarios. You can check the existing snapshots of the components in the directory `/tests/vrt/baseline`.

#### Running the visual regression tests

When you run the acceptance tests as usual, all the visual regression comparisons are skipped. To run the acceptance test suite with the visual comparison enabled you need to set the env variable, `VISUAL_TEST` to `true`

eg.
```
VISUAL_TEST=true SERVER_HOST=http://<server_host> BACKEND_HOST=http://<backend_host> yarn test:acceptance:oc10 <feature-file-to-test>
```

#### Updating the snapshots

If there is some change in the components, and you want to update the snapshots of the components you can run the tests with `UPDATE_VRT_SCREENSHOTS` set to `true`. When this env variable is set, the testrunner will ignore if the visual comparison fails and updates the baseline images with the latest images if the comparison fails.

eg.
```
VISUAL_TEST=true UPDATE_VRT_SCREENSHOTS=true SERVER_HOST=http://<server_host> BACKEND_HOST=http://<backend_host> yarn test:acceptance:oc10 <feature-file-to-test>
```

**note** Visual regression testing may not be completely reliable every time as small changes such as window size and screen resolution may affect the result. For better results it is recommended that you run the tests using the `selenium/standalone-chrome-debug` image of selenium and window size of `1280x1024`

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

## Available settings to be set by environment variables

These values can be set using the environment variables to configure `yarn test:acceptance:oc10` and `yarn test:acceptance:ocis` to match your local test environment.

| setting             | meaning                                                                | default               |
|-------------------- | -----------------------------------------------------------------------| ----------------------|
| `SERVER_HOST`       | web URL                                                            | http://localhost:9100 |
| `BACKEND_HOST`      | ownCloud server URL (or reva service url for running with oCIS)                                                    | http://localhost:8080 |
| `BACKEND_USERNAME`  | ownCloud administrator username                                        | admin                 |
| `BACKEND_PASSWORD`  | ownCloud administrator password                                        | admin                 |
| `SELENIUM_HOST`     | selenium server host, if not set yarn will start selenium automatically<br/>if running the selenium docker container as mentioned above set to `localhost` |                       |
| `SELENIUM_PORT`     | port of selenium server                                                   | 4444                  |
| `SCREEN_RESOLUTION` | width and height in px to set the browser resolution to e.g. 375x812      | empty = fullscreen    |
| `REMOTE_UPLOAD_DIR` | path to `filesForUpload` directory, used when uploading files through api | `./filesForUpload` |
| `LOCAL_UPLOAD_DIR`  | `filesForUpload` directory available for selenium for direct uploads<br/>If using selenium-docker and example above, set it as `/uploads`.<br/>If running local selenium, set value same as `REMOTE_UPLOAD_DIR` (please, remember to use absolute path)| `/uploads` |
| `REMOTE_BACKEND_HOST` | ownCloud remote server URL                                               | http://localhost:8080 |
| `RUN_ON_OCIS`       | Running the tests using the oCIS backend                                                            | false |
| `OCIS_REVA_DATA_ROOT`       | Data directory of oCIS                                             | /var/tmp/reva |
| `TESTING_DATA_DIR`       | Testing data directory for new users                                                           | - |
| `WEB_UI_CONFIG`       | Path for the web config file (usually in the dist folder)                       | - |
| `VISUAL_TEST`       | Run the visual regression comparison while running the acceptance tests                       | - |
| `UPDATE_VRT_SCREENSHOTS`       | Update the baseline snapshots with the latest images for visual regression tests                       | - |

## Tips

### too many open files

If tests were running fine and then suddenly start to fail your system might run into open file limits.
In that case you will see messages in the oCIS log output that look like this:

`2020-05-12 11:33:43.974552 I | http: Accept error: accept tcp [::]:9200: accept4: too many open files; retrying in 1s`

In that case increase the open file limits, how to do that would be beyond the scope of this documentation.

## Acceptance Tests in CI

In the CI we run the UI tests using different backends on different repos. We use commit IDs to indicate the version of the backend or testrunner we want to use. These commit IDs should be regularly updated in the `.drone.star` file to keep the CI up to date.
We run web UI tests in the following repos in the CI.

### 1. web Repo

In the `owncloud/web` repo, we run the tests using both the oc10 backend and the oCIS backend.
For the oc10 backend, we use the `owncloudci/core` docker image which runs the latest `daily-master-qa` version of owncloud.

For the oCIS backend, we use the Commit ID from the `owncloud/ocis` repo to indicate which version of backend to use. This can be specified in the `.drone.env` file.
```
  # The version of oCIS to use in pipelines that test against oCIS
  OCIS_COMMITID=352034d9eba8be8c4bc4b80421f3c0093e7d472c
  OCIS_BRANCH=master
```
If the version you want to run is on a different branch from master, you also need to change the branch name.

In order to check if new tests are compatible with oCIS, after changing the commit id and the branch name, we can create a draft PR in `owncloud/web` which triggers the CI, and we can see the result there.

### 2. oCIS Repo

We follow the same approach in the `owncloud/ocis` repo too. In order to run the UI tests in CI we use commit IDs from web which can be changed in the `.drone.env` file. 

```
  # The test runner source for UI tests
  WEB_COMMITID=3cab4e32bca513f14f59127a0387b44a409763a3
  WEB_BRANCH=master
```
This is the commit ID of web indicating the version of testrunner we want to use. If the version is on a branch other than master, we will also need to change the branch name.

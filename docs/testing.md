---
title: "Running acceptance tests"
date: 2020-04-15T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: testing.md
---

{{< toc >}}

## Setting up Selenium

There are multiple ways to run Selenium:

- [Setup using Docker](#setup-using-docker)
- [Setup using Docker Desktop for Mac](#setup-using-docker-desktop-for-mac)
- [Setup using a standalone Selenium server](#setup-using-standalone-selenium-server)

### Setup using Docker

- Set the environment variables `SELENIUM_HOST` as `localhost` and `SERVER_HOST` in the format `http://<ip_addr>:9100`.
- Run `yarn run selenium` (available only on Linux)
- If you are a Mac user, you can run `yarn run selenium:mac`
  - This command creates a docker container which uses port forwarding instead of host networking [which is not supported on Mac](https://docs.docker.com/network/host/)

### Setup using Docker Desktop for Mac

In order to run acceptance tests with selenium running in Docker Desktop for Mac while having ownCloud Server and Web running as services
on the host machine, `localhost` will not work as URL. Use the Docker host ip `172.17.0.1` or its alias `host.docker.internal` instead.
This requires adjusting all relevant config files to use `host.docker.internal` instead of `localhost` (config.json in Web and
config/config.php in oC10) and changing the web OIDC-callback url. Set the `SERVER_HOST` and `BACKEND_HOST` environment variables
accordingly. In order to use the same url for development on the host machine, define it as an alias to `127.0.0.1` in `/etc/hosts`.
After all these changes Web will be accessible at `http://host.docker.internal:8300` for both development and acceptance tests.

### Setup using standalone Selenium server

When running a standalone Selenium server, make sure to set the environment variable `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR` accordingly.

## Run tests

### with ownCloud 10 backend

- setup the [ownCloud 10 backend]({{< ref "backend-oc10.md" >}})
- clone and install the [testing app](http://github.com/owncloud/testing) into ownCloud
- [build Web]({{< ref "building.md" >}})
- [start the Web server]({{< ref "backend-oc10.md#running-web" >}})
- set `SERVER_HOST` to point at the URL where the Web web pages are served, for example "http://localhost:8300"
- set `BACKEND_HOST` to point to the URL of the backend, for example "http://localhost/owncloud/"
- to be able to run federation tests, additional setup is needed:
   1. Install and setup a second ownCloud server-instance that is accessible by a different URL. That second server-instance must have its own database and data directory.
   2. clone and install the testing app into the second ownCloud server-instance from http://github.com/owncloud/testing .
   3. when running the acceptance tests use `REMOTE_BACKEND_HOST` environment variable to define its address, for example, `REMOTE_BACKEND_HOST=http://<ip_address_of_second_ownCloud_server-instance> yarn run acceptance-tests <feature-files-to-test>` .
-set the `SELENIUM_HOST` environment variable to your host that runs selenium, mostly `localhost`
-set the `SELENIUM_PORT` environment variable to your selenium port, mostly `4444`

Run `yarn run acceptance-tests <feature-files-to-test>`.

The feature files are located in the "tests/acceptance/features" subdirectories.

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

### with OCIS backend

1. [build Web]({{< ref "building.md" >}})
2. create a new web `config.json` file and copy it into the `dist` folder, even though running web in the default ocis environment does not need a `config.json` file, some tests rely on it being present.
 As a starting point and example that should work when running every service on localhost use
   Linux: `config.json.sample-ocis`
   Mac: `tests/acceptance/ocis-mac-config.json`

#### the quick way (all automated)
1. run `yarn run test-requirements:ocis` (`yarn run test-requirements:ocis:mac` for Mac users) to install, configure and run all ocis requirements
2. run `yarn run acceptance-tests-ocis <feature-files-to-test>` to run the tests. The feature files are located in the "tests/acceptance/features" subdirectories. To separate ocis log output from the tests output, run the command in a separate console.
3. after the tests finish, run `yarn run killall` to stop all created docker containers, and the ocis services

#### the manual way (e.g. to run from an existing ocis location)
1. clone and build [ocis](https://github.com/owncloud/ocis)
2. From inside the `web` directory run `yarn run testing-app` to get the [testing-app](https://github.com/owncloud/testing), it's needed to have the skeleton folder for the tests
3. Run redis server using docker
    ```sh
    yarn run redis-server
    ```

4. Run the OCIS server with the necessary configurations
    ```sh
    export WEB_ASSET_PATH='<path-to-web-clone>/dist'
    export WEB_UI_CONFIG='<path-to-web-clone>/dist/config.json'
    export STORAGE_HOME_DRIVER=owncloud
    export STORAGE_USERS_DRIVER=owncloud
    export PROXY_ENABLE_BASIC_AUTH=true
    ```
    note: `WEB_UI_CONFIG` should point to the same config file you have created earlier.
    note: currently it's not possible to run the UI tests with OCIS & OWNCLOUD storage-driver

    run the server:

    ```sh
    bin/ocis server
    ```
5. Run `yarn run acceptance-tests-ocis <feature-files-to-test>`.
   The feature files are located in the "tests/acceptance/features" subdirectories.

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

## Available settings to be set by environment variables

These values can be set using the environment variables to configure `yarn run acceptance-tests` and `yarn run acceptance-tests-ocis` to match your local test environment.

| setting             | meaning                                                                | default               |
|-------------------- | -----------------------------------------------------------------------| ----------------------|
| `SERVER_HOST`       | web URL                                                            | http://localhost:8300 |
| `BACKEND_HOST`      | ownCloud server URL (or reva service url for running with OCIS)                                                    | http://localhost:8080 |
| `BACKEND_USERNAME`  | ownCloud administrator username                                        | admin                 |
| `BACKEND_PASSWORD`  | ownCloud administrator password                                        | admin                 |
| `SELENIUM_HOST`     | selenium server host, if not set yarn will start selenium automatically<br/>if running the selenium docker container as mentioned above set to `localhost` |                       |
| `SELENIUM_PORT`     | port of selenium server                                                   | 4444                  |
| `SCREEN_RESOLUTION` | width and height in px to set the browser resolution to e.g. 375x812      | empty = fullscreen    |
| `REMOTE_UPLOAD_DIR` | path to `filesForUpload` directory, used when uploading files through api | `./tests/acceptance/filesForUpload` |
| `LOCAL_UPLOAD_DIR`  | `filesForUpload` directory available for selenium for direct uploads<br/>If using selenium-docker and example above, set it as `/uploads`.<br/>If running local selenium, set value same as `REMOTE_UPLOAD_DIR` (please, remember to use absolute path)| `/uploads` |
| `REMOTE_BACKEND_HOST` | ownCloud remote server URL                                               | http://localhost:8080 |
| `RUN_ON_OCIS`       | Running the tests using the OCIS backend                                                            | false |
| `OCIS_REVA_DATA_ROOT`       | Data directory of OCIS                                             | /var/tmp/reva |
| `OCIS_SKELETON_DIR`       | Skeleton files directory for new users                                                           | - |
| `WEB_UI_CONFIG`       | Path for the web config file (usually in the dist folder)                       | - |

## Tips

### too many open files
If tests were running fine and then suddenly start to fail your system might run into open file limits.
In that case you will see messages in the OCIS log output that look like this:

`2020-05-12 11:33:43.974552 I | http: Accept error: accept tcp [::]:9200: accept4: too many open files; retrying in 1s`

In that case increase the open file limits, how to do that would be beyond the scope of this documentation.

## Acceptance Tests in CI
In the CI we run the UI tests using different backends on different repos. We use commit IDs to indicate the version of the backend or testrunner we want to use. These commit IDs should be regularly updated in the `.drone.star` file to keep the CI up to date.
We run web UI tests in the following repos in the CI.

### 1. web Repo
In the `owncloud/web` repo, we run the tests using both the oc10 backend and the OCIS backend.
For the oc10 backend, we use the `owncloudci/core` docker image which runs the latest `daily-master-qa` version of owncloud.

For the OCIS backend, we use the Commit ID from the `owncloud/ocis` repo to indicate which version of backend to use. This can be specified in the `.drone.env` file.
```
  # The version of OCIS to use in pipelines that test against OCIS
  OCIS_COMMITID=352034d9eba8be8c4bc4b80421f3c0093e7d472c
  OCIS_BRANCH=master
```
If the version you want to run is on a different branch from master, you also need to change the branch name.

In order to check if new tests are compatible with OCIS, after changing the commit id and the branch name, we can create a draft PR in `owncloud/web` which triggers the CI, and we can see the result there.

### 2. ocis Repo
We follow the same approach in the `owncloud/ocis` repo too. In order to run the UI tests in CI we use commit IDs from web which can be changed in the `.drone.env` file. 

```
  # The test runner source for UI tests
  WEB_COMMITID=3cab4e32bca513f14f59127a0387b44a409763a3
  WEB_BRANCH=master
```
This is the commit ID of web indicating the version of testrunner we want to use. If the version is on a branch other than master, we will also need to change the branch name.

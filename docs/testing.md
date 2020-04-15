---
title: "Running acceptance tests"
date: 2020-04-15T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/phoenix
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
- Run `yarn run selenium`
- Find the IP address of the docker host with:
```sh
docker inspect -f "{{ .NetworkSettings.Gateway }}" selenium`
```

Alternatively, you can run this command which is equivalen to `yarn run selenium`:

```sh
docker run -d -p 4444:4444 -p 5900:5900 -v /dev/shm:/dev/shm -v <repo_path>/tests/acceptance/filesForUpload:/uploads --name selenium selenium/standalone-chrome-debug
```

### Setup using Docker Desktop for Mac

In order to run acceptance tests with selenium running in Docker Desktop for Mac while having ownCloud Server and Phoenix running as services
on the host machine, `localhost` will not work as URL. Use the Docker host ip `172.17.0.1` or its alias `host.docker.internal` instead.
This requires to adjust all relevant config files to use `host.docker.internal` instead of `localhost` (config.json in Phoenix and
config/config.php in oC10) and to change the phoenix OIDC-callback url. Set the `SERVER_HOST` and `BACKEND_HOST` environment variables
accordingly. In order to use the same url for development on the host machine, define it as an alias to `127.0.0.1` in `/etc/hosts`.
After all these changes Phoenix will be accessible at `http://host.docker.internal:8300` for both development and acceptance tests.

### Setup using standalone Selenium server

When running a standalone Selenium server, make sure to set the environment variable `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR` accordingly.

## Setting up the backends

### Setting up for ownCloud 10 backend

- setup the [ownCloud 10 backend]({{< ref "backend-oc10.md" >}})
- clone and install [testing app](http://github.com/owncloud/testing) into ownCloud
- [build Phoenix]({{< ref "building.md" >}})
- [start the Phoenix server]({{< ref "backend-oc10.md#running-phoenix" >}})
- set `SERVER_HOST` to point at the URL where the Phoenix web pages are served, for example "http://localhost:8300"
- set `BACKEND_HOST` to point to the URL of the backend, for example "http://localhost/owncloud/"
- to be able to run federation tests, additional setup is needed:
   1. Install and setup a second ownCloud server-instance that is accessible by a different URL. That second server-instance must have its own database and data directory.
   2. clone and install testing app into the second ownCloud server-instance from http://github.com/owncloud/testing .
   3. when running the acceptance tests use `REMOTE_BACKEND_HOST` environment variable to define its address. for e.g. `REMOTE_BACKEND_HOST=http://<ip_address_of_second_ownCloud_server-instance> yarn run acceptance-tests <feature-files-to-test>` .
- see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed
- jump to the [running tests](#running-tests) section

### Setting up for OCIS backend

- clone and build [ocis-phoenix](https://github.com/owncloud/ocis-phoenix), [ocis-reva](https://github.com/owncloud/ocis-reva) and [ocis-konnectd](https://github.com/owncloud/ocis-konnectd) into their respective binaries
- Run ldap server and redis server using docker
    ```
    docker run --hostname ldap.my-company.com \
    -e LDAP_TLS_VERIFY_CLIENT=never \
    -e LDAP_DOMAIN=owncloud.com \
    -e LDAP_ORGANISATION=ownCloud \
    -e LDAP_ADMIN_PASSWORD=admin \
    --name docker-slapd \
    -p 127.0.0.1:389:389 \
    -p 636:636 -d osixia/openldap
    ```
    ```
    docker run -e REDIS_DATABASES=1 -p 6379:6379 -d webhippie/redis:latest
    ```
- Run the OCIS services with necessary configurations
    - Run `ocis-phoenix` and provide `PHOENIX_ASSET_PATH=/<path to phoenix dist dir>/` to use the latest version of phoenix and `PHOENIX_WEB_CONFIG=/<path to phoenix config file>/`

        **You need to create a new phoenix config.json file. Use [this config](https://github.com/owncloud/phoenix/blob/master/tests/drone/ocis-config.json) with necessary changes in the urls**

        **If you choose to run selenium and the browser inside a docker container then your `server`, `metadata_url` and `authority` needs to be accessible from inside the docker container**

    - Run `ocis-reva` using the ldap user driver and also provide redis server url with `REVA_STORAGE_OWNCLOUD_REDIS_ADDR=localhost:6379`

    - Run `ocis-konnectd` using the same ldap server used with `ocis-reva`

        **You need to create a new identifier registration file. Use [this file](https://github.com/owncloud/phoenix/blob/master/tests/drone/identifier-registration.yml) with necessary changes in the urls**

        **If you choose to run selenium and the browser inside a docker container then your `redirect_uris` needs to be accessible from inside the docker container**

- [setup and build Phoenix]({{< ref "building.md" >}})
- jump to the [running tests](#running-tests) section

## Available settings to be set by environment variables

These values can be set using the environment variables to match your local test environment.

| setting             | meaning                                                                | default               |
|-------------------- | -----------------------------------------------------------------------| ----------------------|
| `SERVER_HOST`       | phoenix URL                                                            | http://localhost:8300 |
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
| `LDAP_SERVER_URL`       | LDAP server for openID provider                                                            | ldap://127.0.0.1 |
| `LDAP_BASE_DN`       | bind dn for LDAP                                                            | cn=admin,dc=owncloud,dc=com |
| `LDAP_ADMIN_PASSWORD`       | Password for ldap bind dn                                                            | cn=admin,dc=owncloud,dc=com |
| `OCIS_SKELETON_DIR`       | Skeleton files directory for new users                                                           | - |
| `OCIS_PHOENIX_CONFIG`       | Path for the phoenix web config file used by OCIS                                                            | - |

## Running tests

Run `yarn run acceptance-tests <feature-files-to-test>`.

The feature files are located in the "tests/acceptance/features" subdirectories.


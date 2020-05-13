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
- Run `yarn run selenium` (available only on Linux)
- If you are a Mac user, you can run `yarn run selenium:mac`
  - This command creates docker container which uses port forwarding instead of host networking [which is not supported on Mac](https://docs.docker.com/network/host/)

### Setup using Docker Desktop for Mac

In order to run acceptance tests with selenium running in Docker Desktop for Mac while having ownCloud Server and Phoenix running as services
on the host machine, `localhost` will not work as URL. Use the Docker host ip `172.17.0.1` or its alias `host.docker.internal` instead.
This requires to adjust all relevant config files to use `host.docker.internal` instead of `localhost` (config.json in Phoenix and
config/config.php in oC10) and to change the phoenix OIDC-callback url. Set the `SERVER_HOST` and `BACKEND_HOST` environment variables
accordingly. In order to use the same url for development on the host machine, define it as an alias to `127.0.0.1` in `/etc/hosts`.
After all these changes Phoenix will be accessible at `http://host.docker.internal:8300` for both development and acceptance tests.

### Setup using standalone Selenium server

When running a standalone Selenium server, make sure to set the environment variable `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR` accordingly.

## run tests

### with ownCloud 10 backend

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
-set the `SELENIUM_HOST` environment variable to your host that runs selenium, mostly `localhost`
-set the `SELENIUM_PORT` environment variable to your selenium port, mostly `4444`

Run `yarn run acceptance-tests <feature-files-to-test>`.

The feature files are located in the "tests/acceptance/features" subdirectories.

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

### with OCIS backend

- clone and build [ocis](https://github.com/owncloud/ocis)
- clone the [testing-app](https://github.com/owncloud/testing), it's needed to have the skeleton folder for the tests

- Run ldap server and redis server using docker
    ```sh
    docker run --hostname ldap.my-company.com \
    -e LDAP_TLS_VERIFY_CLIENT=never \
    -e LDAP_DOMAIN=owncloud.com \
    -e LDAP_ORGANISATION=ownCloud \
    -e LDAP_ADMIN_PASSWORD=admin \
    --name docker-slapd \
    -p 127.0.0.1:389:389 \
    -p 636:636 -d osixia/openldap

    docker run -e REDIS_DATABASES=1 -p 6379:6379 -d webhippie/redis:latest
    ```

- create a new phoenix config.json file.

  Here an example that should work when running every service on localhost
  ```
  {
    "server": "https://localhost:9200",
    "theme": "owncloud",
    "version": "0.1.0",
    "openIdConnect": {
      "metadata_url": "https://localhost:9200/.well-known/openid-configuration",
      "authority": "https://localhost:9200",
      "client_id": "phoenix",
      "response_type": "code",
      "scope": "openid profile email"
    },
    "apps": [
      "files",
      "draw-io",
      "pdf-viewer",
      "markdown-editor",
      "media-viewer"
    ]
  }
  ```

- Run the OCIS server with necessary configurations

    ```sh
    export REVA_LDAP_HOSTNAME='localhost'
    export REVA_LDAP_PORT=636
    export REVA_LDAP_BIND_PASSWORD='admin'
    export REVA_LDAP_BIND_DN='cn=admin,dc=owncloud,dc=com'
    export REVA_LDAP_BASE_DN='dc=owncloud,dc=com'
    export REVA_STORAGE_OWNCLOUD_REDIS_ADDR='localhost:6379'
    export PHOENIX_WEB_CONFIG='<path-to-config-file>/ocis-config.json'
    export PHOENIX_ASSET_PATH='<path-to-phoenix-clone>/dist'
    export LDAP_URI='ldap://localhost'
    export LDAP_BINDDN='cn=admin,dc=owncloud,dc=com'
    export LDAP_BINDPW='admin'
    export LDAP_BASEDN='dc=owncloud,dc=com'
    
    bin/ocis server
    ```

- set the `SERVER_HOST` environment variable to point to the URL where ocis serves Phoenix, by default "https://localhost:9200"
- set the `BACKEND_HOST` environment variable to point to the URL of the backend, by default "http://localhost:9140"
- set the `RUN_ON_OCIS` environment variable to `true`
- set the `OCIS_SKELETON_DIR` environment variable to the `data/webUISkeleton` folder inside the testing app
 
- [setup and build Phoenix]({{< ref "building.md" >}})
- set the `SELENIUM_HOST` environment variable to your host that runs selenium, mostly `localhost`
- set the `SELENIUM_PORT` environment variable to your selenium port, mostly `4444`

Run `yarn run acceptance-tests-ocis <feature-files-to-test>`.

The feature files are located in the "tests/acceptance/features" subdirectories.

see [available settings](#available-settings-to-be-set-by-environment-variables) for further setup if needed

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

## Tipps

### too many open files
If tests were running fine and then suddenly start to fail your system might run into open file limits.
In that case you will see messages in the OCIS log output that look like this:
`2020-05-12 11:33:43.974552 I | http: Accept error: accept tcp [::]:9200: accept4: too many open files; retrying in 1s`

In that case increase the open file limits, how to do that would be beyond the scope of this documentation.

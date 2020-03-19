BOO

# ownCloud-Phoenix

Pushing a new design and frontend concept to ownCloud

![image](https://user-images.githubusercontent.com/25989331/63966638-fd4e0080-ca9b-11e9-931a-8dd9bf3ba82f.png)

[See this online Demo](https://phoenix.owncloud.com/custom/phoenix/index.html#/login) (user: demo, password: demo)

## Prerequisites

Decide on which host and port Phoenix will be running, for example `https://phoenix-host:8300/phoenix-path/`.
In this document, we will refer to the following:
- `<phoenix-url>` as the full URL, for example `https://phoenix-host:8300/phoenix-path/`
- `<phoenix-domain>` as the protocol, domain and port, for example: `https://phoenix-host:8300`

## Setting up

### Setting up the ownCloud Server

Make sure you have an [ownCloud Server](https://owncloud.org/download/#owncloud-server) already installed.

#### Adjusting config.php

Add the following entries to config/config.php:

- tell ownCloud where Phoenix is located:
```
'phoenix.baseUrl' => '<phoenix-url>',
```

- add a CORS domain entry for Phoenix in config.php:
```
'cors.allowed-domains' => ['<phoenix-domain>'],
```

- optional: when developing against unstable APIs (technical preview), these need to be enabled in the server core:
```
dav.enable.tech_preview => true,
```

#### Setting up OAuth2

To connect to the ownCloud server, it is necessary to set it up with OAuth2.

Install and enable the [oauth2 app](https://marketplace.owncloud.com/apps/oauth2):
```bash
% occ market:install oauth2
% occ app:enable oauth2
```

Login as administrator in the ownCloud Server web interface and go to the "User Authentication" section in the admin settings and add an entry for Phoenix as follows:

- pick an arbitrary name for the client
- set the redirection URI to `<phoenix-url>/oidc-callback.html`
- make sure to take note of the **client identifier** value as it will be needed in the Phoenix configuration later on

### Setting up Phoenix

In the local Phoenix checkout, copy the `config.json.sample` file to `config.json` and adjust it accordingly:

- Set the "server" key to the URL of the ownCloud server including path. If the URL contains a path, please also add a **trailing slash** there.
- Set the "clientId" key to the **client identifier** as copied from the "User Authentication" section before.
- Adjust "url" and "authUrl" using the ownCloud server URL as prefix for both
- Optionally adjust "apps" for the list of apps to be loaded. These match the app names inside the "apps" folder.

## Building Phoenix

- Run `yarn install` to build core
- Run `yarn install-all` to install dependencies of all apps and core
- Run `yarn dist` to build all apps configured in `config.json`

## Running Phoenix

- optionally provide custom domain name: `export SERVER_HOST=0.0.0.0:8300`
- run a webpack dev server `yarn watch` (`yarn watch-all` if you want to watch apps as well)

## Running acceptance tests

### Running Browser and Selenium for acceptance tests
setup selenium and browser in either of the following ways:
1. `yarn run selenium`: This runs selenium-docker similar to command below.

    Needs setting `SELENIUM_HOST` as `localhost` and `SERVER_HOST` in the format `http://<ip_addr>:9100`. To find ip of the docker host, use

    ```sh
        docker inspect -f "{{ .NetworkSettings.Gateway }}" selenium
    ```

2. use docker to start the browser and selenium e.g.:
    ```sh
    docker run -d -p 4444:4444 -p 5900:5900 -v /dev/shm:/dev/shm -v <repo_path>/tests/acceptance/filesForUpload:/uploads --name selenium selenium/standalone-chrome-debug
    ```
3. install the Chrome browser and let yarn start & run selenium (remember to set `LOCAL_UPLOAD_DIR` though)
4. Use standalone selenium server (remember to set `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR`).

### Running acceptance tests using ownCloud10 backend
- clone and install testing app into ownCloud from http://github.com/owncloud/testing
- build, configure and run phoenix
- run `yarn run acceptance-tests <feature-files-to-test>`
- to run federation tests:
   1. Install and setup a second ownCloud server-instance that is accessible by a different URL. That second server-instance must have its own database and data directory.
   2. clone and install testing app into the second ownCloud server-instance from http://github.com/owncloud/testing .
   3. when running the acceptance tests use `REMOTE_BACKEND_HOST` environment variable to define its address. for e.g. `REMOTE_BACKEND_HOST=http://<ip_address_of_second_ownCloud_server-instance> yarn run acceptance-tests <feature-files-to-test>` .
- available settings to be set by environment variables:

### Running acceptance tests using OCIS backend

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
    - Run `ocis-phoenix` and provide `PHOENIX_ASSET_PATH=/<path to phoenix dist dir>/` to use the latest version of phoenix and `PHOENIX_WEB_CONFIG=/<path to phoneix config file>/`

        **You need to create a new phoenix config.json file. Use [this config](https://github.com/owncloud/phoenix/blob/master/tests/drone/ocis-config.json) with necessary changes in the urls**

        **If you choose to run selenium and the browser inside a docker container then your `server`, `metadata_url` and `authority` needs to be accessible from inside the docker container**

    - Run `ocis-reva` using the ldap user driver and also provide redis server url with `REVA_STORAGE_OWNCLOUD_REDIS_ADDR=localhost:6379`

    - Run `ocis-konnectd` using the same ldap server used with `ocis-reva`

        **You need to create a new identifier registration file. Use [this file](https://github.com/owncloud/phoenix/blob/master/tests/drone/identifier-registration.yml) with necessary changes in the urls**

        **If you choose to run selenium and the browser inside a docker container then your `redirect_uris` needs to be accessible from inside the docker container**

- clone and build phoenix with `yarn dist`
- run `yarn run acceptance-tests <feature-files-to-test>`

### Running acceptance tests with Docker Desktop for Mac
In order to run acceptance tests with selenium running in Docker Desktop for Mac while having ownCloud Server and Phoenix running as services
on the host machine, `localhost` will not work as URL. Use the Docker host ip `172.17.0.1` or its alias `host.docker.internal` instead.
This requires to adjust all relevant config files to use `host.docker.internal` instead of `localhost` (config.json in Phoenix and
config/config.php in oC10) and to change the phoenix OIDC-callback url. Set the `SERVER_HOST` and `BACKEND_HOST` environment variables
accordingly. In order to use the same url for development on the host machine, define it as an alias to `127.0.0.1` in `/etc/hosts`.
After all these changes Phoenix will be accessible at `http://host.docker.internal:8300` for both development and acceptance tests.

### Available Settings to be set by Environment Variables
These values can be set using the environment Variables to match your local test environment.

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

## Updating dependencies

- Run `yarn upgrade-all` to update core and app dependencies

## Cleaning up the workspace

- Run `yarn clean-all` to remove node_modules and dist folder

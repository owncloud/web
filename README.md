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

- clone and install testing app into ownCloud from http://github.com/owncloud/testing
- set `skeletondirectory` of ownCloud to `<oc-root>/apps/testing/data/webUISkeleton` e.g. `occ config:system:set skeletondirectory --value=/var/www/owncloud/apps/testing/data/webUISkeleton`
- build, configure and run phoenix
- setup selenium and browser in either of the following ways:
    1. `yarn run selenium`: This runs selenium-docker similar to command below.

        Needs setting `SELENIUM_HOST` as `localhost` and `SERVER_HOST` in the format `http://<ip_addr>:8300`. To find ip of the docker host, use

        ```sh
          docker inspect -f "{{ .NetworkSettings.Gateway }}" selenium
        ```

    2. use docker to start the browser and selenium e.g.:
        ```sh
        docker run -d -p 4444:4444 -p 5900:5900 -v /dev/shm:/dev/shm -v <repo_path>/tests/acceptance/filesForUpload:/uploads --name selenium selenium/standalone-chrome-debug
        ```
    3. install the Chrome browser and let yarn start & run selenium (remember to set `LOCAL_UPLOAD_DIR` though)
    4. Use standalone selenium server (remember to set `SELENIUM_HOST`, `SELENIUM_PORT` and `LOCAL_UPLOAD_DIR`).
- run `yarn run acceptance-tests <feature-files-to-test>`
- available settings to be set by environment variables:

| setting             | meaning                                                                | default               |
|-------------------- | -----------------------------------------------------------------------| ----------------------|
| `SERVER_HOST`       | phoenix URL                                                            | http://localhost:8300 |
| `BACKEND_HOST`      | ownCloud server URL                                                    | http://localhost:8080 |
| `BACKEND_USERNAME`  | ownCloud administrator username                                        | admin                 |
| `BACKEND_PASSWORD`  | ownCloud administrator password                                        | admin                 |
| `SELENIUM_HOST`     | selenium server host, if not set yarn will start selenium automatically<br/>if running the selenium docker container as mentioned above set to `localhost` |                       |
| `SELENIUM_PORT`     | port of selenium server                                                   | 4444                  |
| `SCREEN_RESOLUTION` | width and height in px to set the browser resolution to e.g. 375x812      | empty = fullscreen    |
| `REMOTE_UPLOAD_DIR` | path to `filesForUpload` directory, used when uploading files through api | `./tests/acceptance/filesForUpload` |
| `LOCAL_UPLOAD_DIR`  | `filesForUpload` directory available for selenium for direct uploads<br/>If using selenium-docker and example above, set it as `/uploads`.<br/>If running local selenium, set value same as `REMOTE_UPLOAD_DIR` (please, remember to use absolute path)| `/uploads` |

## Updating dependencies

- Run `yarn upgrade-all` to update core and app dependencies

## Cleaning up the workspace

- Run `yarn clean-all` to remove node_modules and dist folder

## Phoenix as an ownCloud app

### Building the Phoenix ownCloud app

- run `yarn install && yarn dist && yarn build`
- run `make -f Makefile.release` dist

### Deploying the Phoenix app to ownCloud

- Grab build/dist/phoenix.tar.gz
- Move to the apps folder on your ownCloud installation
- `tar -xzf phoenix.tar.gz`
- Run `./occ apps:enable phoenix`
- Refresh your webui and see Phoenix in the app menu


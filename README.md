# ownCloud-Phoenix

Pushing a new design and frontend concept to ownCloud

![image](https://user-images.githubusercontent.com/25989331/63966638-fd4e0080-ca9b-11e9-931a-8dd9bf3ba82f.png)

[See this online Demo](https://phoenix.owncloud.com/custom/phoenix/index.html#/login)

## How to build

- Run `yarn install` to build core
- Run `yarn install-all` to install dependencies of all apps and core
- Run `yarn dist` to build all apps configured in config.json

## ownCloud server prerequisites
### When running with oauth2
- installed and enabled oauth2 app
- entry for Phoenix in User Authentication in admin settings with Redirection URI: `<phoenix-env>/oidc-callback.html`
- enabled CORS domain entry for Phoenix in config.php:
```
'cors.allowed-domains' => [
'<phoenix-env>',
]
```

## Create config.json
- For reference look into config.json.sample (example with oauth2)

## Run

- optionally provide custom domain name: `export SERVER_HOST=0.0.0.0:8300`
- run a webpack dev server `yarn watch` (`yarn watch-all` if you want to watch apps as well)

## Run acceptance tests
- clone and install testing app into owncloud from http://github.com/owncloud/testing
- set `skeletondirectory` of ownCloud to `<oc-root>/apps/testing/data/webUISkeleton` e.g. `occ config:system:set skeletondirectory --value=/var/www/owncloud/apps/testing/data/webUISkeleton`
- build, configure and run phoenix
- setup selenium & browser
    - install the Chrome browser and let yarn start & run selenium OR
    - use docker to start the browser and selenium e.g.: `docker run -d -p 4445:4444 -p 5900:5900 -v /dev/shm:/dev/shm --name selenium selenium/standalone-chrome-debug`
- run `yarn run acceptance-tests <feature-files-to-test>`
- available settings to be set by environment variables:

| setting            | meaning                                                                | default               |
|--------------------| -----------------------------------------------------------------------| ----------------------|
| `SERVER_HOST`      | phoenix URL                                                            | http://localhost:8300 |
| `BACKEND_HOST`     | owncloud server URL                                                    | http://localhost:8080 |
| `BACKEND_USERNAME` | owncloud administrator username                                        | admin                 |
| `BACKEND_PASSWORD` | owncloud administrator password                                        | admin                 |
| `SELENIUM_HOST`    | selenium server host, if not set yarn will start selenum automatically<br/>if running the selenium docker container as mentioned above set to `localhost` |                       |
| `SELENIUM_PORT`    | port of selenium server                                                | 4445                  |

## Update dependencies
- Run `yarn upgrade-all` to update core and app dependencies

## Cleanup workspace
- Run `yarn clean-all` to remove node_modules and dist folder

## How to build Phoenix as ownCloud app

- run `yarn install && yarn dist && yarn build`
- run `make -f Makefile.release` dist

## How to deploy the app to ownCloud

- Grab build/dist/phoenix.tar.gz
- Move to the apps folder on your ownCloud installation
- `tar -xzf phoenix.tar.gz`
- Run `./occ apps:enable phoenix`
- Refresh your webui and see Phoenix in the app menu

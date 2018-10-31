# ownCloud-Phoenix

Pushing a new design and frontend concept to ownCloud

![bildschirmfoto von 2018-03-14 17-28-06](https://user-images.githubusercontent.com/1005065/37416039-20817b4c-27ad-11e8-9f14-cbe12936fd64.png)
![bildschirmfoto von 2018-03-14 17-27-40](https://user-images.githubusercontent.com/1005065/37416040-20ad906a-27ad-11e8-8a56-ad5f824743a0.png)



[See this online Demo](http://dev.felix.click/OWC.007.16/0.1.0/)

## How to build

Run `yarn install`

## Run

Run a test server `yarn run watch`
For running with a domain other than localhost `export SERVER_HOST="example.com:8300"` and run `yarn run watch` after, or `yarn run watch example:8300`

## Run linter

Run lint-test `yarn run lint`
Run lint autofix `yarn run lint-fix`

## Run acceptance tests

- build, configure and run phoenix
- install the Chrome browser
- run `yarn run acceptance-tests`

## How to build Phoeinx as ownCloud app

Run `make clean && make`
Run `make -f Makefile.release` dist


## How to deploy the app to ownCloud

Grab build/dist/phoenix.tar.gz
Move to the apps folder on your ownCloud installation
tar -xzf phoenix.tar.gz
Run `./occ apps:enable phoenix`
Refresh your webui and see Phoenix in the app menu

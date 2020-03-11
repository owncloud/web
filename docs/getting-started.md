---
title: "Getting Started"
date: 2018-05-02T00:00:00+00:00
weight: 20
geekdocRepo: https://github.com/owncloud/phoenix
geekdocEditPath: edit/master/docs
geekdocFilePath: getting-started.md
---

{{< toc >}}

## Installation

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

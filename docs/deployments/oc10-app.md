---
title: "Deploy as an app in ownCloud 10"
date: 2018-05-02T00:00:00+00:00
weight: 1
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/deployments
geekdocFilePath: oc10-app.md
---

{{< toc >}}

One of the build artifacts of the ownCloud Web is a ownCloud 10 app bundle.

## Prerequisites
- Running [ownCloud 10 server](https://owncloud.com/download-server/) with version 10.6
- Installed [oauth2 app](https://marketplace.owncloud.com/apps/oauth2)

## Deploying ownCloud Web
To download the ownCloud Web, go to https://github.com/owncloud/web/releases and pick your desired version. In the release, you will find a file called `web-app.tar.gz`.
Download this file and move it into the `apps` folder in your ownCloud 10 server.

{{< hint info >}}
The app bundle is provided only from version 1.0.0
{{< /hint >}}

To unpack the app, run the following command: 
```bash
tar -xzf web-app.tar.gz && rm -Rf web-app.tar.gz
```

Next step is to enable the app:
```bash
cd ../ && occ apps:enable web
```

## Configure oauth2
In the `Admin` of ownCloud 10, head into `User Authentication` and add a new client with arbitrary name and redirection URL `https://<your-owncloud-server>/apps/web/oidc-callback.html`.

## Configure ownCloud 10
To display ownCloud Web in the app switcher and to redirect all private and public links to the new WebUI, add the following config into `config/config.php`:

```php
'web.baseUrl' => 'https://<your-owncloud-server>/apps/web',
```

## Configure ownCloud Web
There are a few config values which need to be set in order for ownCloud Web to work correctly. Navigate into `apps/web` and adjust `config.json` according to the following example:

```json
{
  "server" : "https://<your-owncloud-server>", // ownCloud 10 server address
  "theme": "owncloud", // Theme to be used in ownCloud Web pointing to a json file inside of `themes` folder
  "auth": {
    "clientId": "<client-id-from-oauth2>", // Client ID received when adding ownCloud Web in the `User Authentication` section in `Admin`
    "url": "https://<your-owncloud-server>/index.php/apps/oauth2/api/v1/token",
    "authUrl": "https://<your-owncloud-server>/index.php/apps/oauth2/authorize"
  },
  "apps" : [ // List of extensions to be loaded
    "files"
  ],
  "applications" : [] // Apps to be displayed in the application switcher
}
```

## Accessing ownCloud Web
After following all the steps, you should see a new entry in the application switcher called `New Design` which points to the ownCloud web.

{{< figure src="/web/static/application-switcher-oc10.jpg" >}}

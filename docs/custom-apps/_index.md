---
title: "Custom Apps"
date: 2021-08-26T00:00:00+00:00
weight: 55
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/custom-apps
geekdocFilePath: _index.md
geekdocCollapseSection: true
---

{{< toc >}}

## Introduction

In the new `web` frontend, the way custom/external apps are handled has fundamentally changed from the approach of PHP-based ownCloud X stack.
Now, all you have to do is provide a bundled Vue app and reference it in your configuration! Please note that any existing apps you may be used to can not simply be ported from the old to the new frontend.

This page documents how you can set up an example app within your frontend repo and play around with different kinds of apps and extensions. This way, you can explore how to provide users of your ownCloud with more functionality.

## Setting up the example "skeleton app"

{{< hint info >}}
This guide assumes you have either an oCIS or ownCloud 10 backend running and followed the [getting started guide]({{< ref "../getting-started.md" >}}) for setting up a development environment with the `web` frontend, having it running via either `yarn serve` or `yarn build:w`. You should be able to use the web UI on localhost using the respective port you've assigned (defaults are `:8080` for OC10 and `:9200` for oCIS) and see changes to your .
{{< /hint >}}

From the root of the [web repository](https://github.com/owncloud/web), change into the example skeleton app by running

```sh
cd packages/web-app-skeleton/
```

Then, you can install the necessary dependencies, bundle the code and start a development server by running

```sh
yarn install && yarn serve
```

In your terminal, you should see a success message and rollup (our bundler of choice) serving the content under `localhost:3000`. However, there's nothing to find under this address.


In your `config/config.json`, add the skeleton example app to the `"external_apps"` array like below:


```json
{
    "id": "skeleton",
    "path": "http://localhost:3000/app.js"
}
```

After saving the config file (make sure it's still a valid `JSON` format), your running `web` app should be updated automatically. Open your browser's development tools, reload the page and watch for `(SKELETON)` messages in the browser console.

## Configuration options

```
To be defined/documented
- Name, ID, logo
- Nav items, appswitcher items, quick actions
- ...
```

## Ways of providing an app

```
To be defined/documented (Bundling, CDN, app store, ...)
```

## Types of apps

```
To be defined/documented
- Application (renderable), e.g. iFrame
- Extension, e.g. media-viewer
- Quick action, e.g. based on WOPI/Appserver
- ...
```

## Accessing existing functionality

```
To be defined/documented
- Styles, Theming
- Notifications
- Authentication, SDK
- ...
```

---
title: 'Getting Started'
date: 2018-05-02T00:00:00+00:00
weight: 10
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: getting-started.md
---

{{< toc >}}

## Installation

### Docker

Make sure to have Docker, Docker-Compose, Node.js and pnpm installed.

{{< hint info >}}
This setup currently doesn't work on Windows out of the box.

<details>
  <summary>Workaround</summary>
  One of our contributors has opened a PR to a dependency that prevents us from successfully bundling the frontend.
  Feel free to check out [his changes](https://github.com/egoist/rollup-plugin-postcss/pull/384) and build them locally if you absolutely want to work on Windows.
</details>
{{< /hint >}}

After cloning the [source code](https://github.com/owncloud/web), install the dependencies via `pnpm install` and bundle the frontend code by running `pnpm build:w`.

Then, you can start the server by running `docker-compose up ocis` and access it via [https://host.docker.internal:9200](https://host.docker.internal:9200). If you're not using Docker Desktop, you might have to modify your `/etc/hosts` and add `127.0.0.1 host.docker.internal` to make the `host.docker.internal` links work.

The bundled frontend code automatically gets mounted into the Docker containers, recompiles on changes and you can log in using the demo user (admin/admin) and take a look around!

For more details on how to set up Web for development, please see [tooling]({{< ref "tooling.md#development-setup" >}}).

### Source Code

The source code is hosted at [https://github.com/owncloud/web](https://github.com/owncloud/web).
Please refer to the [build documentation for Web]({{< ref "./building.md" >}}).

## Configuration

Depending on the backend you are using, there are sample config files provided in the [config folder](https://github.com/owncloud/web/tree/master/config) of the ownCloud Web git repository. See below for available backends. Also, find some of the configuration details below.

- `customTranslations` You can specify one or multiple files to overwrite existing translations. For example set this option to `[{url: "https://localhost:9200/customTranslations.json"}]`.

#### Options

- `options.homeFolder` You can specify a folder that is used when the user navigates `home`. Navigating home gets triggered by clicking on the `All files`
  menu item. The user will not be jailed in that directory. It simply serves as a default location. You can either provide a static location, or you can use
  variables of the user object to come up with a user specific home path. This uses twig template variable style and allows you to pick a value or a
  substring of a value of the authenticated user. Examples are `/Shares`, `/{{.Id}}` and `/{{substr 0 3 .Id}}/{{.Id}`.
- `options.openAppsInTab` Configures whether apps and extensions generally should open in a new tab. Defaults to false.
- `options.disablePreviews` Set this option to `true` to disable previews in all the different file listing views. The only list view that is not affected
  by this is the trash bin, as that doesn't allow showing previews at all.
- `options.previewFileMimeTypes` Specifies which mimeTypes will be previewed in the ui. For example to only preview jpg and text files set this option to `["image/jpeg", "text/plain"]`.
- `options.accountEditLink` This accepts an object with the following optional fields to have a link on the account page:
    - `options.accountEditLink.href` Set a different target URL for the edit link. Make sure to prepend it with `http(s)://`.
- `options.disableFeedbackLink` Set this option to `true` to disable the feedback link in the topbar. Keeping it enabled (value `false` or absence of the option)
  allows ownCloud to get feedback from your user base through a dedicated survey website.
- `options.feedbackLink` This accepts an object with the following optional fields to customize the feedback link in the topbar:
    - `options.feedbackLink.href` Set a different target URL for the feedback link. Make sure to prepend it with `http(s)://`. Defaults to `https://owncloud.com/web-design-feedback`.
    - `options.feedbackLink.ariaLabel` Since the link only has an icon, you can set an e.g. screen reader accessible label. Defaults to `ownCloud feedback survey`.
    - `options.feedbackLink.description` Provide any description you want to see as tooltip and as accessible description. Defaults to `Provide your feedback: We'd like to improve the web design and would be happy to hear your feedback. Thank you! Your ownCloud team.`
- `options.sharingRecipientsPerPage` Sets the amount of users shown as recipients in the dropdown when sharing resources. Default amount is 200.
- `options.sidebar.shares.showAllOnLoad` Sets the list of (link) shares list in the sidebar to be initially expanded (default is a collapsed state, only showing the first three shares).
- `options.runningOnEos` Set this option to `true` if running on an [EOS storage backend](https://eos-web.web.cern.ch/eos-web/) to enable its specific features. Defaults to `false`, and we recommend reaching out to [the ownCloud web team](https://talk.owncloud.com/channel/web) if you're not CERN and thinking about enabling this feature flag.
- `options.cernFeatures` Enabling this will activate CERN-specific features. Defaults to `false`.
- `options.hoverableQuickActions` Set this option to `true` to hide the quick actions (buttons appearing on file rows), and only show them when the user
  hovers the row with his mouse. Defaults to `false`.
- `option.routing` This accepts an object with the following fields to customize the routing behaviour:
    - `options.routing.idBased` Enable or disable fileIds being added to the URL. Defaults to `true` because otherwise e.g. spaces with name clashes can't be resolved correctly. Only disable this if you can guarantee server side that spaces of the same namespace can't have name clashes.
- `options.upload.xhr.timeout` Specifies the timeout for XHR uploads in milliseconds.
- `options.editor.autosaveEnabled` Specifies if the autosave for the editor apps is enabled.
- `options.editor.autosaveInterval` Specifies the time interval for the autosave of editor apps in seconds.
- `options.contextHelpersReadMore` Specifies whether the "Read more" link should be displayed or not.
- `options.openLinksWithDefaultApp` Specifies whether single file link shares should be opened with default app or not.
- `options.tokenStorageLocal` Specifies whether the access token will be stored in the local storage when set to `true` or in the session storage when set to `false`. If stored in the local storage, login state will be persisted across multiple browser tabs, means no additional logins are required. Defaults to `true`.

#### Scripts and Styles

Web supports adding additional CSS and JavaScript files to further customize the user experience and adapt it to your specific needs. Please consider opening a feature request if you feel like your customization could be a benefit to the upstream project, and keep an eye open for future major releases of `web` since this API may change.

- `styles` expects an array of objects that specify a `href` attribute, pointing to the path/URL of your stylesheet, like `[{ "href": "css/custom.css" }]`.
- `scripts` expects an array of objects that specify a `src` attribute, pointing to the path/URL of your script, and an optional `async` attribute (defaults to false), like `[{ "src": "js/custom.js", "async": true }]`.

### Sentry

Web supports [Sentry](https://sentry.io/welcome/) to provide monitoring and error tracking.
To enable sending data to a Sentry instance, you can use the following configuration keys:

- `sentry.dsn` Should contain the DSN for your sentry project.
- `sentry.environment`: Lets you specify the environment to use in Sentry. Defaults to `production`.

Any other key under `sentry` will be forwarded to the Sentry initialization. You can find out more
settings in the [Sentry docs](https://docs.sentry.io/platforms/javascript/configuration/).

{{< hint info >}}
If you are using an old version of Sentry (9 and before), you might want to add the setting `sentry.autoSessionTracking: false` to avoid errors related to breaking changes introduced in the
integration libraries.
{{< /hint >}}

## Setting up backend and running

Newer versions of Web (> 7.0.2) can only run against [oCIS](https://github.com/owncloud/ocis), whereas older versions (< 7.1.0) can run against [ownCloud 10](https://github.com/owncloud/core/) as well.
Depending which one you chose, please check the matching section:

- [Setting up with oCIS as backend]({{< ref "backend-ocis.md" >}})
- [Setting up with ownCloud as backend]({{< ref "backend-oc10.md" >}})

## Running

- [Running with oCIS as backend]({{< ref "backend-ocis.md#running-web" >}})
- [Running with ownCloud as backend]({{< ref "backend-oc10.md#running-web" >}})

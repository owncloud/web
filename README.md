<div align=center>
  
  
[![Matrix](https://img.shields.io/matrix/ocis%3Amatrix.org?logo=matrix)](https://app.element.io/#/room/#ocis:matrix.org)
[![Build Status](https://drone.owncloud.com/api/badges/owncloud/web/status.svg)](https://drone.owncloud.com/owncloud/web)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web&metric=security_rating)](https://sonarcloud.io/dashboard?id=owncloud_web)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=owncloud_web&metric=coverage)](https://sonarcloud.io/dashboard?id=owncloud_web)
[![web docker image](https://img.shields.io/docker/v/owncloud/web?label=web%20docker%20image&logo=docker&sort=semver)](https://hub.docker.com/r/owncloud/web)

# ownCloud Web

With ownCloud Web you can manage your ownCloud in your browser.

</div>
<img width="100%" alt="Screenshot of ownCloud Web" src="https://user-images.githubusercontent.com/26610733/168603602-5ba37b4d-2ee1-413c-9a55-03380c79cd3d.png">

ownCloud Web is a single page, standalone frontend, based on modern web technologies. It brings new features as well as improved user flows and can be deployed independent of the backend server.

## Compatiblity

Usage of Web UI and [ownCloud 10](https://github.com/owncloud/core) as backend is **not** recommended starting with version `7.1.0` of the Web UI, meaning newer versions only support [ownCloud Infinite Scale](https://github.com/owncloud/ocis). If you want to use the Web UI with ownCloud 10, please use App version `7.0.2`. Critical bugs can be fixed upon request.

## Examples

Here are some examples of what you can do with ownCloud Web:

- 🗂 **Files**: Upload, download, search and manage files (as you may know it for example from Dropbox, OneDrive, Google Drive etc.).
- 👥 **Share:** Allow fine-grained access to files and whole folders directly with other users on your ownCloud.
- 🔗 **Links**: Create links and share them with anyone in the world - optional password-protection available.
- 📝 **Write**: Edit your documents with the editor of your choice like ONLYOFFICE, Collabora or Microsoft Word and more.
- 🤝 **Collaborate** in real-time on documents.
- 🚀 **Spaces**: You have to manage important projects? Let Spaces, the new special folders, keep order.
- ◀️ **Versioning** Saved the wrong version? We have the time machine you were looking for! Easily go back in time and restore older versions of your files.
- 📥 **Drop-folders:** Collect files from other people in one folder via a simple link, ex. homework from pupils or photos from your family - optional password-protection available.
- 🔒 **Privacy first:** ownCloud Web is GDPR compliant and can both be used completely internally or together with external people. It also will never "phone home".
- 🛡 **Secure:** ownCloud Web is an open source project which means that you can track every action, update and dependency of the software.
- ♿ **Inclusive:** Our goal is to be accessible for kids as well as seniors and for newbies as well as experts - since we are all affected by physical and cognitive limitations, depending on our personal situation.
- 🧩 **Extensible:** ownCloud Web is build as a plattform that can be extended in the most developer friendly way.
- 🌗 **Darkmode:** Initialized with your browser settings, and easily switched to please your eyes better.
- 🎭 **Themes**: Customize to your branding needs or personal taste in no time.
- 👉 and many more...

While the `web` frontend provides a performant, elegant, accessible and themeable base, it also aims to be extendable with custom extensions provided by external developers.

## Live Demos

- **Infinitescale** - Try the latest commit on the master branch with an ownCloud Infinite Scale backend:
  - Demo: [https://demo.owncloud.com/](https://demo.owncloud.com/)

## Repository structure

The backbone of this project is built by the following parts of the `packages`:

- **client:** Generated TypeScript client for communications with the ownCloud Infinite Scale graph API
- **container:** Static assets and rarely changing base files
- **extension-sdk:** Provides utilities for developing and integrating custom extensions
- **pkg:** Shared logic for various places inside the codebase
- **runtime:** Central place of (user) authentication, provisioning of the user interface layout, client side storage, routing, theming, dependencies and (sub)application handling

The repository's `packages` also contains the following apps, which can be en-/disabled via the `config.json`:

- **activities:** An extension that provides a detailed activity stream, showing recent updates
- **admin-settings:** An extension that allows administrators to manage users, groups, spaces and generic settings for their ownCloud instance efficiently
- **app-store:** An extension that allows users to browse and download additional apps and extensions directly from the web interface
- **epub-reader:** An extension for opening ebook files
- **external:** An extension for creating, opening and editing files using the WOPI server
- **files:** The default extension and core part of the project, responsible for file sync-and-share - up- and downloading, sharing with other users/groups or via links, version management and more
- **ocm:** Open cloud mesh integration to allow for collaboration across ownCloud instances
- **pdf-viewer:** An extension for opening PDF files without leaving the UI
- **preview:** An extension for opening audio, video and image files
- **search:** An extension for registering search providers, which then get rendered into the layout in the **runtime** using a portal
- **text-editor:** An extension for creating, opening and editing plain text files, like e.g. `.md` or `.txt`
- **webfinger:** Redirect app for the oCIS webfinger service

The full documentation on all available packages and the general repository structure [can be found in the docs](https://owncloud.dev/clients/web/development/repo-structure/).

## Releases

We currently publish a new release every couple of weeks, strictly following [semver](https://semver.org/). Releases and their corresponding changelogs can be found on the [release page](https://github.com/owncloud/web/releases) on GitHub.

## Documentation

The documentation is an important part of this project and can be found on [owncloud.dev](https://owncloud.dev/clients/web).
If you want to contribute to the documentation you can find the source files in the [docs](https://github.com/owncloud/web/tree/master/docs) folder of this repository.

## Contribution

Contribution in the form of bug reports, user feedback or actual code is always welcome! We do have a [contribution guide](https://github.com/owncloud/web/blob/master/.github/CONTRIBUTING.md), actively use the [good-first-issue](https://github.com/owncloud/web/issues?q=is%3Aopen+is%3Aissue+label%3ATopic%3Agood-first-issue) label and try to feedback on issues and pull requests in a timely manner. There is also a [setup guide](https://owncloud.dev/clients/web/getting-started/) for building and running `web` locally.

## Tests

We assert the quality of this project by running an [automated CI](https://drone.owncloud.com/owncloud/web), while a guide on running the tests locally can be found in the [testing documentation](https://owncloud.dev/clients/web/testing/testing/).

## Jobs

At ownCloud, we are always looking for new additions to our team. You are welcome to take a look at [our open positions](https://owncloud.com/career/).

## License

GNU Affero General Public License - [Details](https://github.com/owncloud/web/blob/master/LICENSE)

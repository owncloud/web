---
title: "Getting Started"
date: 2018-05-02T00:00:00+00:00
weight: 10
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs
geekdocFilePath: getting-started.md
---

{{< toc >}}

## Installation

### Docker

TBD

### Binaries

TBD

### Source code

The source code is hosted at https://github.com/owncloud/web
Please refer to the [build documentation for Web]({{< ref "building.md" >}}).

## Configuration

Depending on the backend you are using, there are sample config files provided in the [ownCloud Web](https://github.com/owncloud/web) git repository.
Please refer to the configuration details below.

#### Options
- `options.hideSearchBar` Lets you hide the search bar at the top of the screen for all users.
- `options.homeFolder` You can specify a folder that is used when the user navigates `home`. Navigating home gets triggered by clicking on the `All files` 
menu item. The user will not be jailed in that directory. It simply serves as a default location. You can either provide a static location, or you can use 
variables of the user object to come up with a user specific home path. This uses twig template variable style and allows you to pick a value or a 
substring of a value of the authenticated user. Examples are `/Shares`, `/{{.Id}}` and `/{{substr 0 3 .Id}}/{{.Id}`.
- `options.disablePreviews` Set this option to `true` to disable previews in all the different file listing views. The only list view that is not affected
by this is the trash bin, as that doesn't allow showing previews at all. 

## Setting up backend and running

Web can run against either [ownCloud 10](https://github.com/owncloud/core/) as backend or [OCIS](https://github.com/owncloud/ocis).
Depending which one you chose, please check the matching section:

- [Setting up with ownCloud as backend]({{< ref "backend-oc10.md" >}})
- [Setting up with OCIS as backend]({{< ref "backend-ocis.md" >}})

## Running

- [Running with ownCloud as backend]({{< ref "backend-oc10.md#running-web" >}})
- [Running with OCIS as backend]({{< ref "backend-ocis.md#running-web" >}})


---
title: "Extensions framework"
date: 2020-05-25T00:00:00+00:00
weight: 20
geekdocRepo: https://github.com/owncloud/phoenix
geekdocEditPath: edit/master/docs
geekdocFilePath: extensions-framework.md
---

{{< toc >}}

## UI Bundle
### Format
The resulting UI bundle provided by the extension must be an [AMD module](https://en.wikipedia.org/wiki/Asynchronous_module_definition).

### Index file
To make sure that all the UI parts are loaded correctly, it is necessary to have an index file which follows our predefined structure.

#### AppInfo
All necessary information about the extension.

```js
const appInfo = {
  name: 'Example extension',
  id: 'example-extension',
  icon: 'folder',
  // Following values are part of files app extension points which makes them optional
  // In case the extension is a file editor, you can register it by providing file extensions
  extensions: [
    {
      extension: 'txt',
      // Optionally you can register an action inside of the Create new menu
      newFileMenu: {
        menuTitle: () => 'New plain text file'
      }
    }
  ],
  // Right sidebar with the highlighted file as context
  fileSideBars: [
    {
      app: 'example-sidebar',
      component: ExampleSidebarComponent,
      enabled: () => true
    }
  ]
}
```

#### Routes and nav items
```js
const routes = [
  {
    name: 'example-route',
    path: '/',
    components: {
      app: ExampleExtensionComponent
    }
  }
]

const navItems = [
  {
    name: 'Example nav item',
    iconMaterial: 'home',
    route: {
      name: 'example-route'
    }
  }
]
```

#### Final export
Do not forget to export all defined parts of the extension.

```js
export default {
  appInfo,
  routes,
  navItems,
  // Imported store and translations
  store,
  translations
}
```

## Extension points
As of today, there are several extension points inside of Phoenix.

### App switcher
Enables navigation between different extensions. An entry for the extension gets registered automatically in the case that at least one nav item is defined.

If you wish to register an entry manually, you can do so in the config.json

### App container
Container for the UI of the extension which lives directly under the top bar.

### Routes
Routes used by [Vue Router](https://router.vuejs.org/) to enable navigating inside of the extension.

### Nav items in the navigation sidebar
Nav items pointing to their assigned routes.

### Store
A global store which can be accessed by any other extension.

## How to load extension inside Phoenix
Because extensions need to be loaded into the Phoenix during runtime, we are using the [RequireJS](https://requirejs.org/). When Phoenix is accessed, all extensions defined in the config.json are loaded before the user can enter the UI.

## Example
If you want to see a live example of oCIS extension which provides also own UI, you can take a tour inside [ocis-hello](https://github.com/owncloud/ocis-hello).
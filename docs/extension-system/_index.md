---
title: 'Extension system'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system
geekdocFilePath: _index.md
geekdocCollapseSection: true
---

{{< toc >}}

The ownCloud Web can be extended through various entry points with custom **apps** and **extensions**.

## Concepts and building blocks

### Apps

#### Abstract

An Application in the context of ownCloud Web is an artifact which can be distributed to and installed by an ownCloud admin.
It serves two main purposes:
1. It makes the full app viewport (everything below the top bar) available to the application developer for any custom 
application code. This includes the ability to define views with routes, navigation items for the left side bar, and more.
2. Through the `extensions` key in the application interface the developer can register extensions of any extension type.
Those extensions will become available in standardized extension points and for being queried from the extension registry 
for custom use.

Both parts are optional. This means that an application can be a file editor without any custom extensions, or even contain
no custom application code at all and only host extensions to be registered in the extension registry, or a combination of both.

#### Technical Details

To get started, define a `src/index.ts`. Below is the most basic example of its content:

```ts
// Install '@ownclouders/web-pkg' as a devDependency first (only relevant for types and autocompletion, dependency is already provided by the ownCloud Web at runtime). 
import {
  AppWrapperRoute,
  ApplicationFileExtension,
  defineWebApplication
} from '@ownclouders/web-pkg'


export default defineWebApplication({
  setup({ applicationConfig }) {
    // Here, you have access to the full injection context, meaning you can use all composable that we provide via web-pkg

    // Needs to be unique within all installed extensions in any ownCloud web instance
    // Should be short, unique and expressive as it gets prefixed on all routes within your application
    const appId = 'your-extension' 

    // See extensions section below
    const extensions = [
        ...
    ]

    // See details below
    const navItems = [
      ...
    ]

    // See details below
    const routes = [
        ...
    ]

    return {
      appInfo: {
        name: $gettext('Your extension'),
        id: appId,
        icon: 'aliens', // See https://owncloud.design/#/Design%20Tokens/IconList for available options
      },
      extensions,
      navItems,
      routes
    }
  }
})
```

By defining an application via `defineWebApplication` you can provide the following:
- `appInfo` - the application metadata, which is used to make the application available via the app switcher and the app registry
- `navItems` - the statically defined navigation items for the left side bar. Only gets rendered when more than 1 navigation item exists at runtime. 
Additional dynamic navigation items can be registered via the extension registry.
- `routes` - the routes to the different views of your application. May be referenced within the `navItems`. Authentication requirements can be defined per item.
- `extensions` - the extensions to be registered in the extension registry. For more details see the `Extensions` section below.

### Extensions

#### Abstract

In contrast to applications, extensions usually have a rather small scope and dedicated functionality.

#### Extension Registry

The globally available extension registry provided by the ownCloud Web runtime can be used to both register and query extensions. All extensions
which are being made available via an `app` get registered in the extension registry automatically. In your custom application code you can
then query any of the available extensions by providing a `type` string and optionally a list of `scopes`. Throughout the ownCloud Web platform
and most prominently also in the `files` app we have defined some extension points which automatically use certain extensions, see the 
`Extension Points` section below.

#### Extension Types

Building an extension is limited to the extension types that are defined by the ownCloud Web extension system. See the full list of available extension types below.

1. `ActionExtension` (type `action`) - An extension that can register `Action` items which then get shown in various places (e.g. context menus, batch actions), depending on their 
respective scope. Most commonly used for file and folder actions (e.g. copy, rename, delete, etc.).
2. `SearchExtension` (type `search`) - An extension that can register additional search providers. Please see the dedicated [documentation on search extensions]().
3. `SidebarNavExtension` (type `sidebarNav`) - An extension that can register additional navigation items to the left sidebar. These can be scoped to specific apps, and programmatically enabled/disabled.
4. `SidebarPanelExtension`, (type `sidebarPanel`) - An extension that can register panels to the right sidebar.
5. `FolderViewExtension` (type `folderView`) - An extension that can register additional ways of displaying the content of a folder (resources, so spaces, folders or files) to the user.

#### Extension Base Configuration

Any extension is required to define at least an `id`, which is supposed to be unique throughout the ownCloud Web ecosystem, and a `type` out of the ones listed above.
The `scopes` are optional and can be used to further limit the usage of an extension, see the `Scopes` section below.

In order to keep `id`s readable for humans we didn't want to enforce uniqueness through e.g. uuids. Instead, we chose to use 
dot-formatted namespaces like e.g. `com.github.owncloud.web.files.search`. 

#### Scopes

<!-- Where does an extension get used // where is it available -->

#### Extension Points

There are standardized components and places where extensions are being used automatically. These are the ones that are currently provided:

1. Left Sidebar for Navigation
2. Right Sidebar in any file(s) context 
3. Folder Views in the files app 
4. Right click context menu in the files app 
5. Batch actions in the files app
6. Search results in the search app


## Further information (digging deeper)

AKA "under the hood"

### - What can / can't I do with an extension?

### js-package / commonjs-file

- current limitations

### extension-sdk

- Rename to application-sdk?

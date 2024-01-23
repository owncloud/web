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

#### Extension Types

Building an extension is limited to the extension types that are defined by the ownCloud Web extension system. See the full list of available extension types below.

1. `ActionExtension` - An extension that can register `Action` items which then get shown in various places (e.g. context menus, batch actions), depending on their 
respective scope. Most commonly used for file and folder actions (e.g. copy, rename, delete, etc).
2. `SearchExtension` - An extension that can register additional search providers. Please see the dedicated [documentation on search extensions]().
3. `SidebarNavExtension` - An extension that can register additional navigation items to the left side bar. These can be scoped to specific apps, and programmatically enabled/disabled.
4. `SidebarPanelExtension` - An extension that can register panels to the right side bar.
5. `FolderViewExtension` - An extension that can register additional ways of displaying the content of a folder (resources, so spaces, folders or files) to the user.

#### Extension Points

There are standardized components and places where extensions are being used automatically. These are the ones that are currently provided:

1. Left Sidebar for Navigation
2. Right Sidebar in any file(s) context 
3. Folder Views in the files app 
4. Right click context menu in the files app 
5. Batch actions in the files app
6. Search results in the search app

#### Extension Base Configuration

<!-- Add best practices for id naming, explain types and scopes -->

#### Scopes

<!-- Where does an extension get used // where is it available -->


## Further information (digging deeper)

AKA "under the hood"

### Global Extension Registry

- What is Global Extension Registry?

### - What can / can't I do with an extension?



### js-package / commonjs-file

- current limitations

### extension-sdk

- Rename to application-sdk?

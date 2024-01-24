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

## Concepts and Building Blocks

The ownCloud Web can be extended through various entry points with custom **apps** and **extensions**.

### Distinction between Apps and Extensions

An Application in the context of ownCloud Web is an artifact which can be distributed to and installed by an ownCloud admin.
It serves two main purposes:
1. It makes the full app viewport (everything below the top bar) available to the application developer for any custom
   application code. This includes the ability to define views with routes, navigation items for the left sidebar, and more.
2. Through the `extensions` key in the application interface the developer can register extensions of any extension type.
   Those extensions will become available in standardized extension points and for being queried from the extension registry
   for custom use.

Both parts are optional. This means that an application can be a file editor without any custom extensions, or even contain
no custom application code at all and only host extensions to be registered in the extension registry, or a combination of both.

### Apps

To get started, define a `src/index.ts`. Below is the most basic example of its content:

```typescript
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
- `navItems` - the statically defined navigation items for the left sidebar. Only gets rendered when more than 1 navigation item exists at runtime. 
Additional dynamic navigation items can be registered via the extension registry.
- `routes` - the routes to the different views of your application. May be referenced within the `navItems`. Authentication requirements can be defined per item.
- `extensions` - the extensions to be registered in the extension registry. For more details see the `Extensions` section below.

### Extensions

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
respective scope. Most commonly used for file and folder actions (e.g. copy, rename, delete, etc.). For details, please refer to the [action docs]({{< ref "extension-types/actions.md" >}})
2. `SearchExtension` (type `search`) - An extension that can register additional search providers. For details, please refer to the [search docs]({{< ref "extension-types/search.md" >}})
3. `SidebarNavExtension` (type `sidebarNav`) - An extension that can register additional navigation items to the left sidebar. These can be scoped to specific apps, and programmatically enabled/disabled.
For details, please refer to the [sidebar nav docs]({{< ref "extension-types/left-sidebar-menu-item.md" >}})
4. `SidebarPanelExtension`, (type `sidebarPanel`) - An extension that can register panels to the right sidebar. For details, please refer to the [sidebar panel docs]({{< ref "extension-types/right-sidebar-panels.md" >}})
5. `FolderViewExtension` (type `folderView`) - An extension that can register additional ways of displaying the content of a folder (resources, so spaces, folders or files) to the user.
For details, please refer to the [folder view docs]({{< ref "extension-types/folder-view.md" >}})

You're free to introduce your own extension types within your application code and use the extension registry to query the available ones. However, if you have the impression
that an important extension type is missing, please reach out to us by opening a [GitHub issue](https://github.com/owncloud/web/issues/new/choose).

#### Extension Base Configuration

Any extension is required to define at least an `id` and a `type`.

The `id` is supposed to be unique throughout the ownCloud Web ecosystem. In order to keep `id`s readable for humans we didn't want to enforce uniqueness through e.g. uuids. 
Instead, we chose to use dot-formatted namespaces like e.g. `com.github.owncloud.web.files.search`. We'd like to encourage you to follow the same format for your own extensions.

For the `type` you can choose from the ones listed above or define a custom one.

In addition, you can also pass optional `scopes` to further limit the usage of an extension. The extension system predefines some scopes which are then used in the default extension
points (see section below). Those include:
- `resource` - For extensions which are meant to work with a `file`, `folder` or `space` as data context.
- `user` - For extensions which are meant to work with a `user` as data context.
- `group` - For extensions which are meant to work with a `group` as data context.

Similar to the extension types, you are always free to define and handle custom scopes within your own application. If you have the impression
that an important scope is missing, please reach out to us by opening a [GitHub issue](https://github.com/owncloud/web/issues/new/choose).

{{< hint info >}}
Scopes are meant to be defined in singular form, e.g. `resource` instead of `resources`, even when the data context holds multiple items.
{{< /hint >}}

#### Extension Points

There are standardized components and places where extensions are being used automatically. These are the ones that are currently provided:

1. Left Sidebar for Navigation
2. Right Sidebar in any file(s) context 
3. Folder Views in the files app 
4. Right click context menu in the files app 
5. Batch actions in the files app
6. Search results in the search app

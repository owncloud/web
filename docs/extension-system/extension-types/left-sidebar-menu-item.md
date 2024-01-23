---
title: 'Left sidebar menu item extensions'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system/extension-types
geekdocFilePath: left-sidebar-menu-item.md
geekdocCollapseSection: true
---

{{< toc >}}


# Left sidebar menu item extension type

One possible extension type is left sidebar menu items. Registered left sidebar menu items get rendered in the left sidebar, as long as there is more than one available.

## Configuration

An example of a left sidebar menu item extension configuration can be found below:

```js
const leftSidebarMenuItemExtension = {
    id: string,
    type: 'sidebarNav',
    scopes?: ExtensionScope[],
    navItem: {
        // Please check the AppNavigationItem section below
    }
}
```

For `id`, `type`, and `scopes`, please see [extension base section]({{< ref "extension-system/_index.md#extension-base-configuration" >}}) in top level docs.


### AppNavigationItem

The most important configuration options are:
- `icon` - The icon to be displayed, can be picked from https://owncloud.design/#/Design%20Tokens/IconList
- `name` - The text to be displayed
- `route` - The string/route to navigate to, if the nav item should be a `<router-link>` (Mutually exclusive with `handler`)
- `handler` - The action to perform upon click, if the nav item should be a `<button>` (Mutually exclusive with `route`)

Please check the `AppNavigationItem` type for a full list of configuration options.

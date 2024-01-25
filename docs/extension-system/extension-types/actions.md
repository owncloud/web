---
title: 'Action extensions'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system/extension-types
geekdocFilePath: actions.md
geekdocCollapseSection: true
---

{{< toc >}}

## Action extension type

Actions are one of the possible extension types. Registered actions get rendered in various places across the UI, depending on their scope and targets.

### Configuration

This is what the ActionExtension interface looks like:

```typescript
interface ActionExtension {
    id: string
    type: 'action'
    scopes?: ExtensionScope[]
    action: Action // Please check the Action section below
}
```

For `id`, `type`, and `scopes`, please see [extension base section]({{< ref "../_index.md#extension-base-configuration" >}}) in top level docs.

#### Action

The most important configuration options are:
- `icon` - The icon to be displayed, can be picked from https://owncloud.design/#/Design%20Tokens/IconList
- `name` - The name of the action (not displayed in the UI)
- `label` - The text to be displayed
- `route` - The string/route to navigate to, if the nav item should be a `<router-link>`
- `handler` - The action to perform upon click, if the nav item should be a `<button>`
- `componentType` - Either `'button'` or `'router-link'`, depending on whether the action should be a link or button
- `isEnabled` - Determines whether the action is displayed to the user

Please check the [`Action` type](https://github.com/owncloud/web/blob/236c185540fc6758dc7bd84985c8834fa4145530/packages/web-pkg/src/composables/actions/types.ts#L6) for a full list of configuration options.

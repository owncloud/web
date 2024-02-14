---
title: 'Custom component extensions'
date: 2024-02-14T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system/extension-types
geekdocFilePath: custom-components.md
geekdocCollapseSection: true
---

{{< toc >}}

## Extension Type CustomComponent

CustomComponent extensions need to define one or multiple `extensionPointId`s as render target. A `CustomComponentTarget` component for this very 
extension point needs to be mounted in the current view.

### Configuration

To define a custom component extension, you implement the `CustomComponentExtension` interface.
Here's how it looks like:

```typescript
interface CustomComponentExtension {
  id: string,
  type: 'customComponent',
  extensionPointIds: string[],
  content: Slot
}
```

For `id`, `type`, and `extensionPointIds`, please see [extension base section]({{< ref "../_index.md#extension-base-configuration" >}}) in the top level docs.

The `content` object configures the actual custom component to render in the target extension point.

### Example

A simple example for a custom component extension would be the `NyanCat` progress bar component, being
targeted at the `global-progress-bar` extension point as render target.

```typescript
({
    id: 'com.github.owncloud.web.app.progress-bars.nyan-cat',
    type: 'customComponent',
    extensionPointIds: ['app.runtime.global-progress-bar'],
    content: (slots) => [h(NyanCat, slots)],
    userPreference: {
      optionLabel: $gettext('Nyan Cat progress bar')
    }
})
```

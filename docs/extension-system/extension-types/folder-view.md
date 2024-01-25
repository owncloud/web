---
title: 'Folder View extensions'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system/extension-types
geekdocFilePath: folder-view.md
geekdocCollapseSection: true
---

## Folder view extension type

The folder view is one of the possible extension types. Registered folder view can be used to render multiple resources (folders, files, spaces) in the UI.

### Configuration

This is what the FolderViewExtension interface looks like:

```typescript
interface FolderViewExtension {
    id: string
    scopes?: ExtensionScope[]
    type: 'folderView'
    folderView: FolderView // See FolderView section below
}

```

For `id`, `type`, and `scopes`, please see [extension base section]({{< ref "../_index.md#extension-base-configuration" >}}) in top level docs.

#### FolderView

For the folderView object, you have the following configuration options:

- `name` - The name of the action (not displayed in the UI)
- `label` - The text to be displayed to the user when switching between different FolderView options
- `icon` - Object, expecting an icon `name` and a corresponding `IconFillType`, see https://owncloud.design/#/Design%20Tokens/IconList for available options
- `isScrollable` - Optional boolean, determines whether the user can scroll inside the component or it statically fills the viewport
- `component` - The Vue component to render the resources. It should expect a prop of type `Resource[]`
- `componentAttrs` - Optional additional configuration for the component mentioned above

---
title: 'Embed Mode'
date: 2023-10-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/embed-mode
geekdocFilePath: _index.md
geekdocCollapseSection: true
---

{{< toc >}}

The ownCloud Web can be consumed by another application in a stripped down version called "Embed mode". This mode is supposed to be used in the context of selecting or sharing resources. If you're looking for even more minimalistic approach, you can take a look at the [File picker](https://owncloud.dev/integration/file_picker/).

## Getting started

To integrate ownCloud Web into your application, add an iframe element pointing to your ownCloud Web deployed instance with additional query parameter `mode=embed`.

```html
<iframe src="<web-url>?mode=embed"></iframe>
```

## Events

The app is emitting various events depending on the goal of the user. All events are prefixed with `owncloud-embed:` to prevent any naming conflicts with other events.

| Event name | Payload | Description |
| --- | --- | --- |
| **owncloud-embed:select** | Resource[] | Gets emitted when user selects resources via the "Attach as copy" action |
| **owncloud-embed:share** | string[] | Gets emitted when user selects resources and shares them via the "Share links" action |
| **owncloud-embed:cancel** | void | Gets emitted when user attempts to close the embedded instance via "Cancel" action |

### Example

```html
<iframe src="https://my-owncloud-web-instance?mode=embed"></iframe>

<script>
  function selectEventHandler(event) {
    const resources = event.detail

    doSomethingWithSelectedResources(resources)
  }

  window.addEventListener('owncloud-embed:select', selectEventHandler)
</script>
```

## Location picker

By default, the Embed mode allows users to select resources. In certain cases (e.g. uploading a file), this needs to be changed to allow selecting a location. This can be achieved by running the embed mode with additional parameter `embed-target=location`. With this parameter, resource selection is disabled and the selected resources array always includes the current folder as the only item.

### Example

```html
<iframe src="https://my-owncloud-web-instance?mode=embed&embed-target=location"></iframe>

<script>
  function selectEventHandler(event) {
    const currentFolder = event.detail[0]

    uploadIntoCurrentFolder(currentFolder)
  }

  window.addEventListener('owncloud-embed:select', selectEventHandler)
</script>
```

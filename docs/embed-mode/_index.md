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

## Communication

To establish seamless cross-origin communication between the embedded instance and the parent application, our approach involves emitting events using the `postMessage` method. These events can be conveniently captured by utilizing the standard `window.addEventListener('message', listener)` pattern.

### Target origin

By default, the `postMessage` method does not specify the `targetOrigin` parameter. However, it is recommended best practice to explicitly pass in the URI of the iframe origin (not the parent application). To enhance security, you can specify this value by modifying the config option `options.embed.messagesOrigin`.

### Events

To maintain uniformity and ease of handling, each event encapsulates the same structure within its payload: `{ name: string, data: any }`.

| Name | Data | Description |
| --- | --- | --- |
| **owncloud-embed:select** | Resource[] | Gets emitted when user selects resources or location via the select action |
| **owncloud-embed:share** | string[] | Gets emitted when user selects resources and shares them via the "Share links" action |
| **owncloud-embed:cancel** | null | Gets emitted when user attempts to close the embedded instance via "Cancel" action |

### Example

```html
<iframe src="https://my-owncloud-web-instance?mode=embed"></iframe>

<script>
  function selectEventHandler(event) {
    if (event.data?.name !== 'owncloud-embed:select') {
      return
    }

    const resources = event.data.data

    doSomethingWithSelectedResources(resources)
  }

  window.addEventListener('message', selectEventHandler)
</script>
```

## Location picker

By default, the Embed mode allows users to select resources. In certain cases (e.g. uploading a file), this needs to be changed to allow selecting a location. This can be achieved by running the embed mode with additional parameter `embed-target=location`. With this parameter, resource selection is disabled and the selected resources array always includes the current folder as the only item.

### Example

```html
<iframe src="https://my-owncloud-web-instance?mode=embed&embed-target=location"></iframe>

<script>
  function selectEventHandler(event) {
    if (event.data?.name !== 'owncloud-embed:select') {
      return
    }

    const resources = event.data.data[0]

    doSomethingWithSelectedResources(resources)
  }

  window.addEventListener('message', selectEventHandler)
</script>
```

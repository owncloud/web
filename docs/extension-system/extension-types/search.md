---
title: 'Search extensions'
date: 2024-01-23T00:00:00+00:00
weight: 60
geekdocRepo: https://github.com/owncloud/web
geekdocEditPath: edit/master/docs/extension-system/extension-types
geekdocFilePath: search.md
geekdocCollapseSection: true
---

{{< toc >}}

# Search extensions

One possible extension type is search. Registered search extensions are available when using the search field in the topbar.

## Configuration

An example of a search extension configuration can be found below:

```typescript
interface SearchExtension {
  id: string
  type: 'search'
  scopes?: ExtensionScope[]
  searchProvider: {
    id: string
    available: boolean
    displayName?: string
    previewSearch?: SearchPreview // See SearchPreview section below
    listSearch?: SearchList // See SearchList section below
  }
}
```

For `id`, `type`, and `scopes`, please see [extension base section]({{< ref "extension-system/_index.md#extension-base-configuration" >}}) in top level docs.

The `searchProvider` object configures the actual provider. It consist of the following:
- `id` - Since your extension has an `id` and can only have one searchProvider, you can reuse the same value
- `available` - Can be used to programmatically disable/enable any searchProvider, e.g. by dynamically checking backend capabilities
- `displayName` - Optional, used to add a small hint to indicate the connection between search providers and their corresponding results
- `previewSearch` - See below
- `listSearch` - See below


### ListSearch

The listSearch object consists of:

- `component` - Vue component that can render the values from the SearchResult below
- `search(term: string)` - Function that exectues the search, based on a given term. The term is formatted in [KQL](https://owncloud.dev/services/search/#query-language). Please note that the returned values needs to be formatted to fit either `SearchResource`  or `GenericSearchResultItem` type

### PreviewSearch

The previewSearch object extends the listSearch with one additional attribute:

- `available` - Indicates whether a preview underneath the search bar is available for this search provider

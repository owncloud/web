import { SearchResource } from '@ownclouders/web-client/src/webdav/search'

export interface GenericSearchResultItem {
  id: string
  displayName: string
  icon?: string
}

export interface SearchResultValue {
  id: string
  // FIXME: SearchResource is very specific for webdav search
  data: GenericSearchResultItem | SearchResource
}

export interface SearchResult {
  totalResults: number | null
  values: SearchResultValue[]
}

export interface SearchList {
  component: unknown // Component needs to match SearchResultValue

  search(term: string): Promise<SearchResult>
}

export interface SearchPreview extends SearchList {
  available: boolean
}

export interface SearchProvider {
  id: string
  available: boolean
  displayName?: string
  previewSearch?: SearchPreview
  listSearch?: SearchList
}

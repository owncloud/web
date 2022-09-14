export interface SearchResultValue {
  id: string
  data: unknown
}

export interface SearchResult {
  totalResults: number | null
  values: SearchResultValue[]
}

export interface SearchList {
  component: unknown

  search(term: string): Promise<SearchResult>
}

export interface SearchPreview extends SearchList {
  available: boolean

  activate(searchResult: SearchResultValue): void
}

export interface SearchProvider {
  id: string
  available: boolean
  label?: string

  previewSearch?: SearchPreview
  listSearch?: SearchList

  reset(): void

  activate(term: string)

  updateTerm(term: string)
}

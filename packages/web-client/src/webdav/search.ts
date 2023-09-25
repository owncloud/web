import { Resource, buildResource } from '../helpers'
import { WebDavOptions } from './types'
import { DavProperties, DavProperty } from './constants'

export interface SearchResource extends Resource {
  highlights: string
}

export type SearchOptions = {
  davProperties?: DavProperty[]
  searchLimit?: number
  useSpacesEndpoint?: boolean
}

export type SearchResult = {
  resources: SearchResource[]
  totalResults: number
}

export const SearchFactory = ({ sdk }: WebDavOptions) => {
  return {
    async search(
      term: string,
      { davProperties = DavProperties.Default, searchLimit, useSpacesEndpoint }: any
    ): Promise<SearchResult> {
      const { range, results } = await sdk.files.search(
        term,
        searchLimit,
        davProperties,
        useSpacesEndpoint
      )

      return {
        resources: results.map((r) => ({
          ...buildResource(r),
          highlights: r.fileInfo[DavProperty.Highlights] || ''
        })),
        totalResults: range ? parseInt(range?.split('/')[1]) : null
      }
    }
  }
}

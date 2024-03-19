import { Resource, buildResource } from '../helpers'
import { WebDavOptions } from './types'
import { DavProperties, DavProperty, DavPropertyValue } from './constants'
import { DAV, buildAuthHeader } from './client'
import { unref } from 'vue'

export interface SearchResource extends Resource {
  highlights: string
}

export type SearchOptions = {
  davProperties?: DavPropertyValue[]
  searchLimit?: number
}

export type SearchResult = {
  resources: SearchResource[]
  totalResults: number
}

export const SearchFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    async search(
      term: string,
      { davProperties = DavProperties.Default, searchLimit }: SearchOptions
    ): Promise<SearchResult> {
      const path = '/spaces/'
      const headers = buildAuthHeader(unref(accessToken))
      const { range, results } = await dav.report(path, {
        pattern: term,
        limit: searchLimit,
        properties: davProperties,
        headers
      })

      return {
        resources: results.map((r) => ({
          ...buildResource(r),
          highlights: r.props[DavProperty.Highlights] || ''
        })),
        totalResults: range ? parseInt(range?.split('/')[1]) : null
      }
    }
  }
}

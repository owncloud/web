import { buildResource } from '../helpers/resource'
import { DavProperties, DavPropertyValue } from './constants'

import { urlJoin } from '../utils'
import { DAV, DAVRequestOptions } from './client'
import { WebDavOptions } from './types'
import { ListFilesResult } from './listFiles'

export type ListFilesByIdOptions = {
  depth?: number
  davProperties?: DavPropertyValue[]
} & DAVRequestOptions

export const ListFilesByIdFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    async listFilesById(
      { fileId }: { fileId?: string },
      { depth = 1, davProperties, ...opts }: ListFilesByIdOptions = {}
    ): Promise<ListFilesResult> {
      const webDavPath = urlJoin('/spaces', fileId)
      const webDavResources = await dav.propfind(webDavPath, {
        depth,
        properties: davProperties || DavProperties.Default,
        ...opts
      })
      const resources = webDavResources.map(buildResource)
      return { resource: resources[0], children: resources.slice(1) } as ListFilesResult
    }
  }
}

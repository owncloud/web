import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { DAV } from './client'
import { buildResource } from '../helpers'

export const ListFileVersionsFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    async listFileVersions(id: string) {
      const [currentFolder, ...versions] = await dav.propfind(
        urlJoin('meta', id, 'v', { leadingSlash: true })
      )
      return versions.map(buildResource)
    }
  }
}

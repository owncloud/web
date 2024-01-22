import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { DAV, buildAuthHeader } from './client'
import { buildResource } from '../helpers'
import { unref } from 'vue'

export const ListFileVersionsFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    async listFileVersions(id: string) {
      const headers = buildAuthHeader(unref(accessToken))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [currentFolder, ...versions] = await dav.propfind(
        urlJoin('meta', id, 'v', { leadingSlash: true }),
        { headers }
      )
      return versions.map(buildResource)
    }
  }
}

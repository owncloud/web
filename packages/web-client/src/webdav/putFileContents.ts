import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { ProgressEventCallback } from 'webdav'

export const PutFileContentsFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async putFileContents(
      space: SpaceResource,
      {
        path,
        content = '',
        previousEntityTag = '',
        headers = {},
        overwrite,
        onUploadProgress = null
      }: {
        path?: string
        content?: string | ArrayBuffer
        previousEntityTag?: string
        headers?: Record<string, string>
        overwrite?: boolean
        onUploadProgress?: ProgressEventCallback
      }
    ) {
      await dav.put(urlJoin(space.webDavPath, path), content, {
        previousEntityTag,
        overwrite,
        onUploadProgress,
        headers
      })

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}

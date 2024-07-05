import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'
import { DAV, DAVRequestOptions } from './client'
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
        overwrite,
        onUploadProgress = null,
        ...opts
      }: {
        path?: string
        content?: string | ArrayBuffer
        previousEntityTag?: string
        overwrite?: boolean
        onUploadProgress?: ProgressEventCallback
      } & DAVRequestOptions
    ) {
      await dav.put(urlJoin(space.webDavPath, path), content, {
        previousEntityTag,
        overwrite,
        onUploadProgress,
        ...opts
      })

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}

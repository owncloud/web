import { Resource, SpaceResource } from '../helpers'
import { ListFilesFactory, ListFilesOptions } from './listFiles'

export const GetFileInfoFactory = (listFilesFactory: ReturnType<typeof ListFilesFactory>) => {
  return {
    async getFileInfo(
      space: SpaceResource,
      resource?: { path?: string; fileId?: string | number },
      options?: ListFilesOptions
    ): Promise<Resource> {
      return (
        await listFilesFactory.listFiles(space, resource, {
          depth: 0,
          ...options
        })
      ).resource
    }
  }
}

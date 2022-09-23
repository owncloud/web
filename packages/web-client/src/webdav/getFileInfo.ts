import { Resource, SpaceResource } from '../helpers'
import { ListFilesFactory, ListFilesOptions } from './listFiles'
import { WebDavOptions } from './types'

export const GetFileInfoFactory = (
  listFilesFactory: ReturnType<typeof ListFilesFactory>,
  { sdk }: WebDavOptions
) => {
  return {
    async getFileInfo(
      space: SpaceResource,
      { path }: { path?: string },
      options?: ListFilesOptions
    ): Promise<Resource> {
      return (
        await listFilesFactory.listFiles(
          space,
          {
            path
          },
          {
            depth: 0,
            ...options
          }
        )
      )[0]
    }
  }
}

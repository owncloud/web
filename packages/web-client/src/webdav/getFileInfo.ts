import { Resource, SpaceResource } from '../helpers'
import { ListFilesFactory } from './listFiles'
import { WebDavOptions } from './types'

export const GetFileInfoFactory = (
  listFilesFactory: ReturnType<typeof ListFilesFactory>,
  { sdk }: WebDavOptions
) => {
  return {
    async getFileInfo(space: SpaceResource, { path }: { path?: string }): Promise<Resource> {
      return (
        await listFilesFactory.listFiles(space, {
          path,
          depth: 0
        })
      )[0]
    }
  }
}

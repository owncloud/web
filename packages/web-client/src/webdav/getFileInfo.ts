import { OwnCloudSdk } from 'web-pkg/src/services'
import { Resource, SpaceResource } from '../helpers'
import { ListFilesFactory } from './listFiles'

export const GetFileInfoFactory = (
  listFilesFactory: ReturnType<typeof ListFilesFactory>,
  sdk: OwnCloudSdk
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

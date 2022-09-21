import { OwnCloudSdk } from 'web-pkg/src/services'
import { isPublicSpaceResource, Resource, SpaceResource } from '../helpers'

export const ListFilesFactory = (sdk: OwnCloudSdk) => {
  return {
    async listFiles(space: SpaceResource, path: string): Promise<Resource[]> {
      if (isPublicSpaceResource(space)) {
        return sdk.publicFiles.list()
      }
    }
  }
}

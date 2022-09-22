import { buildResource } from 'files/src/helpers/resources'
import { DavProperties } from 'web-pkg/src/constants'
import { OwnCloudSdk } from 'web-pkg/src/services'
import { isPublicSpaceResource, Resource, SpaceResource } from '../helpers'

export const GetFileInfoFactory = (sdk: OwnCloudSdk) => {
  return {
    async getFileInfo(space: SpaceResource, { path }: { path?: string }): Promise<Resource> {
      let resource: Resource
      if (isPublicSpaceResource(space)) {
        resource = await sdk.publicFiles.list(
          `${space.webDavPath}/${path || ''}`.replace(/^\/public-files/, ''),
          space.publicLinkPassword,
          DavProperties.PublicLink,
          '0'
        )

        // We remove the /${publicLinkToken} prefix so the name is relative to the public link root
        // At first we tried to do this in buildResource but only the public link root resource knows it's a public link
        resource.name = resource.name.split('/').slice(2).join('/')
      } else {
        resource = await sdk.files.list(
          `${space.webDavPath}/${path || ''}`,
          '0',
          DavProperties.Default
        )
      }

      return buildResource(resource)
    }
  }
}

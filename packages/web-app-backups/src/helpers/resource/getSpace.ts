import { Resource, SpaceResource } from 'web-client'
import { buildShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg'

export const getSpaceFromResource = ({
  spaces,
  resource
}: {
  spaces: SpaceResource[]
  resource: Resource
}): SpaceResource => {
  const storageId = resource.storageId
  // FIXME: Once we have the shareId in the OCS response, we can check for that and early return the share
  const space = spaces.find((space) => space.id === storageId)
  if (space) {
    return space
  }
  return buildShareSpaceResource({
    shareId: resource.shareId,
    shareName: resource.name,
    serverUrl: configurationManager.serverUrl
  })
}

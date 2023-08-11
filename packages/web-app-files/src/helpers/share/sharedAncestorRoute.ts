import { Resource, SpaceResource } from 'web-client/src/helpers'
import { createLocationSpaces } from 'web-app-files/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { RouteLocationNamedRaw } from 'vue-router'
import { AncestorMetaDataValue } from 'web-pkg/src/types'

export const getSharedAncestorRoute = ({
  resource,
  sharedAncestor,
  matchingSpace
}: {
  resource: Resource
  sharedAncestor: AncestorMetaDataValue
  matchingSpace: SpaceResource
}): RouteLocationNamedRaw => {
  if (!matchingSpace || (resource.shareId && resource.path === '')) {
    return {}
  }
  return createLocationSpaces(
    'files-spaces-generic',
    createFileRouteOptions(matchingSpace, {
      path: sharedAncestor.path,
      fileId: sharedAncestor.id
    })
  )
}

import { SpaceResource } from 'web-client/src/helpers'
import { createLocationSpaces } from 'web-pkg/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { RouteLocationNamedRaw } from 'vue-router'
import { AncestorMetaDataValue } from 'web-pkg/src/types'

export const getSharedAncestorRoute = ({
  sharedAncestor,
  matchingSpace
}: {
  sharedAncestor: AncestorMetaDataValue
  matchingSpace: SpaceResource
}): RouteLocationNamedRaw => {
  if (!matchingSpace) {
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

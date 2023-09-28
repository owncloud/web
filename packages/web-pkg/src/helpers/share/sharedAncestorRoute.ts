import { SpaceResource } from 'web-client/src/helpers'
import { createLocationSpaces } from '../../router'
import { createFileRouteOptions } from '../../helpers/router'
import { RouteLocationNamedRaw } from 'vue-router'
import { AncestorMetaDataValue } from '../../types'

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

import { SpaceResource } from 'web-client/src/helpers'
import { createLocationSpaces } from '@ownclouders/web-pkg/src/router'
import { createFileRouteOptions } from '@ownclouders/web-pkg/src/helpers/router'
import { RouteLocationNamedRaw } from 'vue-router'
import { AncestorMetaDataValue } from '@ownclouders/web-pkg/src/types'

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

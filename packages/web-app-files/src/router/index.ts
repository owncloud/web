import { RouteConfig } from 'vue-router'

import {
  buildRoutes as buildCommonRoutes,
  isLocationCommonActive,
  createLocationCommon
} from './common'
import { buildRoutes as buildDeprecatedRoutes, isLocationActive } from './deprecated'
import {
  buildRoutes as buildOperationsRoutes,
  createLocationOperations,
  isLocationOperationsActive
} from './operations'
import {
  buildRoutes as buildPublicRoutes,
  createLocationPublic,
  isLocationPublicActive
} from './public'
import { RouteComponents } from './router'
import {
  buildRoutes as buildSharesRoutes,
  isLocationSharesActive,
  createLocationShares
} from './shares'
import {
  buildRoutes as buildSpacesRoutes,
  isLocationSpacesActive,
  createLocationSpaces
} from './spaces'
import {
  buildRoutes as buildTrashRoutes,
  isLocationTrashActive,
  createLocationTrash
} from './trash'
import { isAuthenticatedRoute, ActiveRouteDirectorFunc } from './utils'

const ROOT_ROUTE = {
  path: '/',
  redirect: (to) => createLocationSpaces('files-spaces-personal-home', to)
}

const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  ROOT_ROUTE,
  ...buildCommonRoutes(components),
  ...buildSharesRoutes(components),
  ...buildPublicRoutes(components),
  ...buildSpacesRoutes(components),
  ...buildOperationsRoutes(components),
  ...buildTrashRoutes(components),
  ...buildDeprecatedRoutes()
]

export {
  createLocationCommon,
  createLocationShares,
  createLocationSpaces,
  createLocationOperations,
  createLocationPublic,
  isLocationOperationsActive,
  isLocationCommonActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationPublicActive,
  isLocationActive,
  isAuthenticatedRoute,
  isLocationTrashActive,
  createLocationTrash,
  buildRoutes,
  ActiveRouteDirectorFunc
}

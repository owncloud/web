import {
  buildRoutes as buildSpacesRoutes,
  isLocationSpacesActive,
  createLocationSpaces
} from './spaces'
import {
  buildRoutes as buildSharesRoutes,
  isLocationSharesActive,
  createLocationShares
} from './shares'
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
import {
  buildRoutes as buildCommonRoutes,
  isLocationCommonActive,
  createLocationCommon
} from './common'
import { isAuthenticatedRoute } from './utils'
import { buildRoutes as buildDeprecatedRoutes, isLocationActive } from './deprecated'
import { RouteComponents } from './router'
import { RouteConfig } from 'vue-router'

const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  ...buildSharesRoutes(components),
  ...buildPublicRoutes(components),
  ...buildSpacesRoutes(components),
  ...buildOperationsRoutes(components),
  ...buildCommonRoutes(components),
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
  buildRoutes
}

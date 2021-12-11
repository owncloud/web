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
  buildRoutes as buildCommonRoutes,
  isLocationCommonActive,
  createLocationCommon
} from './common'
import { isRoutePublic, isLocationActive } from './utils'
import { buildRoutes as buildDeprecatedRoutes } from './deprecated'
import { RouteComponents } from './router'
import { RouteConfig } from 'vue-router'

const ROOT_ROUTE = {
  path: '/',
  redirect: (to) => createLocationSpaces(to)
}

const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  ROOT_ROUTE,
  ...buildSharesRoutes(components),
  ...buildSpacesRoutes(components),
  ...buildOperationsRoutes(components),
  ...buildCommonRoutes(components),
  ...buildDeprecatedRoutes()
]

// const isLocationOf = isLocationActiveCreator<locationTypes>(createLocationFor)

export {
  createLocationCommon,
  createLocationShares,
  createLocationSpaces,
  createLocationOperations,
  isLocationOperationsActive,
  isLocationCommonActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationActive,
  isRoutePublic,
  buildRoutes
}

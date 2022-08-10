import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { $gettext, createLocation, isLocationActiveDirector } from './utils'

type operationsTypes = 'files-operations-resolver-private-link'

export const createLocationOperations = (name: operationsTypes, location = {}): Location =>
  createLocation(name, location)

const locationResolverPrivateLink = createLocationOperations(
  'files-operations-resolver-private-link'
)

export const isLocationOperationsActive = isLocationActiveDirector<operationsTypes>(
  locationResolverPrivateLink
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    name: locationResolverPrivateLink.name,
    path: '/ops/resolver/private-link/:fileId',
    component: components.PrivateLink,
    meta: { title: $gettext('Resolving private link') }
  }
]

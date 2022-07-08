import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { $gettext, createLocation, isLocationActiveDirector } from './utils'

type operationsTypes = 'files-operations-location-picker' | 'files-operations-resolver-private-link'

export const createLocationOperations = (name: operationsTypes, location = {}): Location =>
  createLocation(name, location)

const locationLocationPicker = createLocationOperations('files-operations-location-picker')
const locationResolverPrivateLink = createLocationOperations(
  'files-operations-resolver-private-link'
)

export const isLocationOperationsActive = isLocationActiveDirector<operationsTypes>(
  locationLocationPicker,
  locationResolverPrivateLink
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    name: locationLocationPicker.name,
    path: '/ops/location-picker/:context/:action/:item*',
    component: components.LocationPicker,
    meta: {
      auth: false,
      patchCleanPath: true
    }
  },
  {
    name: locationResolverPrivateLink.name,
    path: '/ops/resolver/private-link/:fileId',
    component: components.PrivateLink,
    meta: { title: $gettext('Resolving private link') }
  }
]

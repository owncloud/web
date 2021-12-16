import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, isLocationActiveDirector } from './utils'

type operationsTypes = 'files-operations-location-picker'

export const createLocationOperations = (name: operationsTypes, location = {}): Location =>
  createLocation(name, location)

const locationLocationPicker = createLocationOperations('files-operations-location-picker')

export const isLocationOperationsActive =
  isLocationActiveDirector<operationsTypes>(locationLocationPicker)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    name: locationLocationPicker.name,
    path: '/ops/location-picker/:context/:action/:item*',
    components: {
      app: components.LocationPicker
    },
    meta: {
      verbose: true,
      auth: false,
      patchCleanPath: true
    }
  }
]

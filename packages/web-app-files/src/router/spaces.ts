import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

export const createLocationSpaces = (location = {}): Location =>
  createLocation(
    'files-spaces-storage',
    {
      params: {
        storage: 'home',
        namespace: 'personal'
      }
    },
    location
  )
export const isLocationSpacesActive = isLocationActiveDirector(createLocationSpaces())

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/spaces',
    redirect: (to) => createLocationSpaces(to)
  },
  {
    path: '/spaces/:namespace',
    components: {
      app: components.App
    },
    redirect: (to) => createLocationSpaces(to),
    children: [
      {
        name: createLocationSpaces().name,
        path: ':storage/:item*',
        component: components.Personal,
        meta: {
          hasBulkActions: true,
          title: $gettext('All files'),
          patchCleanPath: true
        }
      }
    ]
  }
]

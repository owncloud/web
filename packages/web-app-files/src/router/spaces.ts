import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type shareTypes = 'files-spaces-personal-home'

export const createLocationSpaces = (name: shareTypes, location = {}): Location =>
  createLocation(
    name,
    {
      params: {
        storage: 'home',
        namespace: 'personal'
      }
    },
    location
  )
export const isLocationSpacesActive = isLocationActiveDirector<shareTypes>(
  createLocationSpaces('files-spaces-personal-home')
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/spaces',
    redirect: (to) => createLocationSpaces('files-spaces-personal-home', to)
  },
  {
    path: '/spaces/:namespace',
    components: {
      app: components.App
    },
    redirect: (to) => createLocationSpaces('files-spaces-personal-home', to),
    children: [
      {
        name: createLocationSpaces('files-spaces-personal-home').name,
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

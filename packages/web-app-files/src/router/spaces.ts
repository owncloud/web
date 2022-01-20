import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes = 'files-spaces-personal-home' | 'files-spaces-projects'

export const createLocationSpaces = (name: spaceTypes, location = {}): Location =>
  createLocation(
    name,
    {
      params: {
        ...(name === 'files-spaces-personal-home' && { storage: 'home' })
      }
    },
    location
  )

export const locationSpacesProjects = createLocationSpaces('files-spaces-projects')
export const locationSpacesPersonalHome = createLocationSpaces('files-spaces-personal-home')

export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesProjects,
  locationSpacesPersonalHome
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/spaces',
    components: {
      app: components.App
    },
    children: [
      {
        path: 'projects',
        name: locationSpacesProjects.name,
        component: components.Spaces?.Projects,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          hideAppBar: true,
          title: $gettext('Spaces')
        }
      },
      {
        path: 'personal/:storage/:item*',
        name: locationSpacesPersonalHome.name,
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

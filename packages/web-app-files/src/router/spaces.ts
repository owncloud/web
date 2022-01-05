import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes = 'files-spaces-personal-home' | 'files-spaces-projects'

export const createLocationSpaces = (name: spaceTypes, location = {}): Location =>
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

export const createLocationSpacesProjects = (name: spaceTypes, location = {}): Location =>
  createLocation(name, location)

const locationSpacesPersonalHome = createLocationSpaces('files-spaces-personal-home')
const locationSpacesProjects = createLocationSpacesProjects('files-spaces-projects')

export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesPersonalHome,
  locationSpacesProjects
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/spaces',
    redirect: (to) => createLocationSpaces('files-spaces-personal-home', to)
  },
  {
    path: '/spaces/projects',
    components: {
      app: components.App
    },
    children: [
      {
        name: locationSpacesProjects.name,
        path: '',
        component: components.Spaces,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          hideAppBar: true,
          title: $gettext('Spaces')
        }
      }
    ]
  },
  {
    path: '/spaces/:namespace',
    components: {
      app: components.App
    },
    redirect: (to) => createLocationSpaces('files-spaces-personal-home', to),
    children: [
      {
        name: locationSpacesPersonalHome.name,
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

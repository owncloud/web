import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes = 'files-spaces-personal-home' | 'files-spaces-project' | 'files-spaces-projects'

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

export const locationSpacesProject = createLocationSpaces('files-spaces-project')
export const locationSpacesProjects = createLocationSpaces('files-spaces-projects')
export const locationSpacesPersonalHome = createLocationSpaces('files-spaces-personal-home')

export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesProject,
  locationSpacesProjects,
  locationSpacesPersonalHome
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/spaces',
    component: components.App,
    children: [
      {
        path: 'projects',
        name: locationSpacesProjects.name,
        component: components.Spaces.Projects,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          hideViewOptions: true,
          title: $gettext('Spaces')
        }
      },
      {
        path: 'projects/:storageId?/:item*',
        name: locationSpacesProject.name,
        component: components.Spaces.Project,
        meta: {
          hasBulkActions: true,
          patchCleanPath: true,
          title: $gettext('Space')
        }
      },
      {
        // intentionally not `storageId`, yet, because we use an alphanumeric alias here instead of an id
        path: 'personal/:storage/:item*',
        name: locationSpacesPersonalHome.name,
        component: components.Personal,
        meta: {
          hasBulkActions: true,
          title: $gettext('Personal'),
          patchCleanPath: true
        }
      }
    ]
  }
]

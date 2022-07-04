import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes =
  | 'files-spaces-personal'
  | 'files-spaces-project'
  | 'files-spaces-projects'
  | 'files-spaces-share'

export const createLocationSpaces = (name: spaceTypes, location = {}): Location =>
  createLocation(name, location)

export const locationSpacesProject = createLocationSpaces('files-spaces-project')
export const locationSpacesProjects = createLocationSpaces('files-spaces-projects')
export const locationSpacesPersonal = createLocationSpaces('files-spaces-personal')
export const locationSpacesShare = createLocationSpaces('files-spaces-share')

export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesProject,
  locationSpacesProjects,
  locationSpacesPersonal,
  locationSpacesShare
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
          title: $gettext('Spaces')
        }
      },
      {
        path: 'projects/:storageId?/:item*',
        name: locationSpacesProject.name,
        component: components.Spaces.Project,
        meta: {
          patchCleanPath: true,
          title: $gettext('Space')
        }
      },
      {
        path: ':item*',
        name: locationSpacesPersonal.name,
        component: components.Personal,
        meta: {
          patchCleanPath: true,
          title: $gettext('Personal')
        }
      },
      {
        // FIXME: this is cheating. We rely on shares having a drive alias of `shares/<shareName>` and hardcode it here until we have dynamic routes with drive aliases.
        path: 'shares/:shareName?/:item*',
        name: locationSpacesShare.name,
        component: components.SharedResource,
        meta: {
          patchCleanPath: true,
          title: $gettext('Files shared with me'),
          contextQueryItems: ['shareId']
        }
      }
    ]
  }
]

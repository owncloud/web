import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes = 'files-spaces-projects' | 'files-spaces-generic'

export const createLocationSpaces = (name: spaceTypes, location = {}): Location =>
  createLocation(name, location)

export const locationSpacesProjects = createLocationSpaces('files-spaces-projects')
export const locationSpacesGeneric = createLocationSpaces('files-spaces-generic')

// FIXME: `isLocationSpacesActive('files-spaces-generic') returns true for 'files-spaces-projects' as well
// TODO: if that's fixed, adjust the `loaderSpaceGeneric#isActive` and `loaderShare#isActive`
export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesProjects,
  locationSpacesGeneric
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
        path: ':driveAliasAndItem*',
        name: locationSpacesGeneric.name,
        component: components.Spaces.DriveResolver,
        meta: {
          patchCleanPath: true,
          // FIXME: we'd need to extract the title from the resolved space...
          title: $gettext('Space')
        }
      }
    ]
  }
]

import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type spaceTypes = 'files-spaces-projects' | 'files-spaces-share' | 'files-spaces-generic'

export const createLocationSpaces = (name: spaceTypes, location = {}): Location =>
  createLocation(name, location)

export const locationSpacesProjects = createLocationSpaces('files-spaces-projects')
export const locationSpacesShare = createLocationSpaces('files-spaces-share')
export const locationSpacesGeneric = createLocationSpaces('files-spaces-generic')

// FIXME: `isLocationSpacesActive('files-spaces-generic') returns true for 'files-spaces-projects' and 'files-space-share' as well
// TODO: if that's fixed, adjust the `loaderSpaceGeneric#isActive`
export const isLocationSpacesActive = isLocationActiveDirector<spaceTypes>(
  locationSpacesProjects,
  locationSpacesShare,
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
        // TODO: would be nice to catch this with the generic view as well to reduce code duplication
        // would require special treatment of shares in the `useDriveResolver` composable
        path: 'shares/:shareName?/:item*',
        name: locationSpacesShare.name,
        component: components.SharedResource,
        meta: {
          patchCleanPath: true,
          title: $gettext('Files shared with me'),
          contextQueryItems: ['shareId']
        }
      },
      {
        path: ':driveAliasAndItem*',
        name: locationSpacesGeneric.name,
        component: components.Spaces.DriveResolver,
        meta: {
          patchCleanPath: true,
          // FIXME: we'd need to extract the title from the resolved space...
          title: $gettext('Generic space view... title TBD')
        }
      }
    ]
  }
]

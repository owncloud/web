import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type shareTypes = 'files-public-link' | 'files-public-upload'

export const createLocationPublic = (name: shareTypes, location = {}): Location =>
  createLocation(name, location)

export const locationPublicLink = createLocationPublic('files-public-link')
export const locationPublicUpload = createLocationPublic('files-public-upload')

export const isLocationPublicActive = isLocationActiveDirector<shareTypes>(
  locationPublicLink,
  locationPublicUpload
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/link',
    component: components.App,
    meta: {
      auth: false
    },
    children: [
      {
        name: locationPublicLink.name,
        path: ':driveAliasAndItem*',
        component: components.Spaces.DriveResolver,
        meta: {
          auth: false,
          patchCleanPath: true
        }
      }
    ]
  },
  {
    path: '/upload',
    component: components.App,
    meta: {
      auth: false
    },
    children: [
      {
        name: locationPublicUpload.name,
        path: ':token?',
        component: components.FilesDrop,
        meta: {
          auth: false,
          title: $gettext('Public file upload')
        }
      }
    ]
  }
]

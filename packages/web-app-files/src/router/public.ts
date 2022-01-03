import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type shareTypes = 'files-public-files' | 'files-public-drop'

export const createLocationPublic = (name: shareTypes, location = {}): Location =>
  createLocation(name, location)

const locationPublicFiles = createLocationPublic('files-public-files')
const locationPublicDrop = createLocationPublic('files-public-drop')

export const isLocationPublicActive = isLocationActiveDirector<shareTypes>(
  locationPublicFiles,
  locationPublicDrop
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/public',
    components: {
      app: components.App
    },
    meta: {
      auth: false
    },
    children: [
      {
        name: locationPublicFiles.name,
        path: 'show/:item*',
        component: components.PublicFiles,
        meta: {
          auth: false,
          hasBulkActions: true,
          title: $gettext('Public files'),
          patchCleanPath: true
        }
      }
    ]
  },
  {
    name: locationPublicDrop.name,
    path: '/public/drop/:token',
    components: {
      app: components.FilesDrop
    },
    meta: { auth: false, title: $gettext('Public file upload') }
  }
]

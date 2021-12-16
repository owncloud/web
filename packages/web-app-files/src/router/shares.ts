import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type shareTypes =
  | 'files-shares-public-files'
  | 'files-shares-public-link'
  | 'files-shares-public-drop'
  | 'files-shares-private-link'
  | 'files-shares-with-me'
  | 'files-shares-with-others'
  | 'files-shares-via-link'

export const createLocationShares = (name: shareTypes, location = {}): Location =>
  createLocation(name, location)

const locationSharesPublicFiles = createLocationShares('files-shares-public-files')
const locationSharesPublicLink = createLocationShares('files-shares-public-link')
const locationSharesPublicDrop = createLocationShares('files-shares-public-drop')
const locationSharesPrivateLink = createLocationShares('files-shares-private-link')
const locationSharesWithMe = createLocationShares('files-shares-with-me')
const locationSharesWithOthers = createLocationShares('files-shares-with-others')
const locationSharesViaLink = createLocationShares('files-shares-via-link')

export const isLocationSharesActive = isLocationActiveDirector<shareTypes>(
  locationSharesPublicFiles,
  locationSharesPublicLink,
  locationSharesPublicDrop,
  locationSharesPrivateLink,
  locationSharesWithMe,
  locationSharesWithOthers,
  locationSharesViaLink
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/shares/public',
    components: {
      app: components.App
    },
    meta: {
      auth: false
    },
    children: [
      {
        name: locationSharesPublicFiles.name,
        path: 'files/:item*',
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
    name: locationSharesPublicLink.name,
    path: '/shares/public/link/:token',
    components: {
      fullscreen: components.PublicLink
    },
    meta: {
      auth: false,
      hideHeadbar: true,
      title: $gettext('Resolving public link')
    }
  },
  {
    name: locationSharesPublicDrop.name,
    path: '/shares/public/drop/:token',
    components: {
      app: components.FilesDrop
    },
    meta: { auth: false, title: $gettext('Public file upload') }
  },
  {
    name: locationSharesPrivateLink.name,
    path: '/shares/private/link/:fileId',
    components: {
      fullscreen: components.PrivateLink
    },
    meta: { hideHeadbar: true, title: $gettext('Resolving private link') }
  },
  {
    path: '/shares',
    components: {
      app: components.App
    },
    redirect: locationSharesWithMe,
    children: [
      {
        name: locationSharesWithMe.name,
        path: 'with-me',
        component: components.SharedWithMe,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Files shared with me')
        }
      },
      {
        name: locationSharesWithOthers.name,
        path: 'with-others',
        component: components.SharedWithOthers,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          title: $gettext('Files shared with others')
        }
      },
      {
        name: locationSharesViaLink.name,
        path: 'via-link',
        component: components.SharedViaLink,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          title: $gettext('Files shared via link')
        }
      }
    ]
  }
]

import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'

type shareTypes = 'files-shares-with-me' | 'files-shares-with-others' | 'files-shares-via-link'

export const createLocationShares = (name: shareTypes, location = {}): Location =>
  createLocation(name, location)

export const locationSharesWithMe = createLocationShares('files-shares-with-me')
export const locationSharesWithOthers = createLocationShares('files-shares-with-others')
export const locationSharesViaLink = createLocationShares('files-shares-via-link')

export const isLocationSharesActive = isLocationActiveDirector<shareTypes>(
  locationSharesWithMe,
  locationSharesWithOthers,
  locationSharesViaLink
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/shares',
    component: components.App,
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

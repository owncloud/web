import { Location, RouteConfig } from 'vue-router'
import { RouteComponents } from './router'
import { createLocation, isLocationActiveDirector, $gettext } from './utils'
import get from 'lodash-es/get'
import Vue from 'vue'
import { Store } from 'vuex'

/**
 * retrieve vue store, this is just a transitional solution till we have refactored
 * application loading and can inject it.
 */
const store = (Vue as any).$store as Store<any>

export const createLocationSpaces = (location = {}): Location =>
  createLocation(
    'files-spaces-storage',
    {
      params: {
        get storage() {
          return get(store, 'getters.user.id') || 'public'
        },
        namespace: 'personal'
      }
    },
    location
  )
export const isLocationSpacesActive = isLocationActiveDirector(createLocationSpaces())

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: `/spaces`,
    redirect: (to) => createLocationSpaces(to)
  },
  {
    path: `/spaces/:namespace`,
    components: {
      app: components.App
    },
    redirect: (to) => createLocationSpaces(to),
    children: [
      {
        name: createLocationSpaces().name,
        path: ':storage/:item*',
        component: components.Personal,
        meta: {
          hasBulkActions: true,
          title: $gettext(`All files`),
          patchCleanPath: true
        }
      }
    ]
  }
]

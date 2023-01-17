import { RouteComponents } from './router'
import { RouteLocationNamedRaw, RouteRecordRaw } from 'vue-router'
import { createLocation, isLocationActiveDirector } from './utils'

type trashTypes = 'files-trash-generic'

export const createLocationTrash = (name: trashTypes, location = {}): RouteLocationNamedRaw =>
  createLocation(name, location)

export const locationTrashGeneric = createLocationTrash('files-trash-generic')

export const isLocationTrashActive = isLocationActiveDirector<trashTypes>(locationTrashGeneric)

export const buildRoutes = (components: RouteComponents): RouteRecordRaw[] => [
  {
    path: '/trash',
    component: components.App,
    children: [
      {
        name: locationTrashGeneric.name,
        path: ':driveAliasAndItem(.*)?',
        component: components.Spaces.DriveResolver,
        meta: {
          authContext: 'user',
          patchCleanPath: true
        }
      }
    ]
  }
]

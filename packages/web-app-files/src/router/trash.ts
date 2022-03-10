import { RouteComponents } from './router'
import { Location, RouteConfig } from 'vue-router'
import { createLocation, $gettext, isLocationActiveDirector } from './utils'

type trashTypes = 'files-trash-personal' | 'files-trash-spaces-project'

export const createLocationTrash = (name: trashTypes, location = {}): Location =>
  createLocation(name, location)

export const locationTrashPersonal = createLocationTrash('files-trash-personal')
export const locationTrashProject = createLocationTrash('files-trash-spaces-project')

export const isLocationTrashActive = isLocationActiveDirector<trashTypes>(
  locationTrashPersonal,
  locationTrashProject
)

export const buildRoutes = (components: RouteComponents): RouteConfig[] => [
  {
    path: '/trash',
    redirect: (to) => createLocationTrash('files-trash-personal', to),
    component: components.App,
    children: [
      {
        name: locationTrashPersonal.name,
        path: 'personal',
        component: components.Trashbin,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Deleted files')
        }
      },
      {
        name: locationTrashProject.name,
        path: 'spaces/projects/:spaceId',
        component: components.Spaces.Trashbin,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Deleted files')
        }
      }
    ]
  }
]

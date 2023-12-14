import { computed } from 'vue'
import { SpaceAction } from '../types'
import { useGettext } from 'vue3-gettext'
import { useRouter } from '../../router'
import { Store } from 'vuex'
import { SpaceResource } from '@ownclouders/web-client'
import { createLocationTrash } from '../../../router'
import { createFileRouteOptions } from '../../../helpers'
import { isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'

export const useSpaceActionsNavigateToTrash = ({ store }: { store?: Store<any> } = {}) => {
  const router = useRouter()
  const { $gettext } = useGettext()

  const getTrashLink = (space: SpaceResource) => {
    return createLocationTrash('files-trash-generic', {
      ...createFileRouteOptions(space, { fileId: space.fileId })
    })
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'navigateToTrash',
      icon: 'delete-bin',
      label: () => $gettext('Show deleted files'),
      handler: ({ resources }) => {
        return router.push(getTrashLink(resources[0])) as Promise<void>
      },
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        if (!isProjectSpaceResource(resources[0])) {
          return false
        }

        if (resources[0].disabled) {
          return false
        }

        return true
      },
      componentType: 'button',
      class: 'oc-files-actions-navigate-to-trash-trigger'
    }
  ])

  return {
    actions
  }
}

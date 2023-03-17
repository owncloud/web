import { useFileActionsDeleteResources } from '../helpers/useFileActionsDeleteResources'
import { Store } from 'vuex'
import {
  isLocationPublicActive,
  isLocationSpacesActive,
  isLocationTrashActive,
  isLocationCommonActive
} from '../../../router'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { useCapabilityFilesPermanentDeletion, useRouter, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { computed, unref } from 'vue'

export const useFileActionsDelete = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const hasPermanentDeletion = useCapabilityFilesPermanentDeletion()
  const { displayDialog } = useFileActionsDeleteResources({ store })

  const { $gettext } = useGettext()

  const handler = ({ space, resources }: FileActionOptions) => {
    displayDialog(space, resources)
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'delete',
      icon: 'delete-bin-5',
      label: () => $gettext('Delete'),
      handler,
      isEnabled: ({ space, resources }) => {
        if (
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationPublicActive(router, 'files-public-link') &&
          !isLocationCommonActive(router, 'files-common-search')
        ) {
          return false
        }
        if (resources.length === 0) {
          return false
        }

        if (
          isLocationSpacesActive(router, 'files-spaces-generic') &&
          space?.driveType === 'share' &&
          resources[0].path === '/'
        ) {
          return false
        }

        const deleteDisabled = resources.some((resource) => {
          return !resource.canBeDeleted()
        })
        return !deleteDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-delete-trigger'
    },
    {
      // this menu item is ONLY for the trashbin (permanently delete a file/folder)
      name: 'delete-permanent',
      icon: 'delete-bin-5',
      label: () => $gettext('Delete'),
      handler,
      isEnabled: ({ space, resources }) => {
        if (!isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (!unref(hasPermanentDeletion)) {
          return false
        }

        if (
          isProjectSpaceResource(space) &&
          !space.isEditor(store.getters.user) &&
          !space.isManager(store.getters.user)
        ) {
          return false
        }

        return resources.length > 0
      },
      componentType: 'button',
      class: 'oc-files-actions-delete-permanent-trigger'
    }
  ])

  return {
    actions
  }
}

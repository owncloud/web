import { computed, unref } from 'vue'
import { FileAction, useModals, useResourcesStore } from '../../../composables'
import { CreateShortcutModal } from '../../../components'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'
import { SpaceResource } from '@ownclouders/web-client'

export const useFileActionsCreateNewShortcut = ({ space }: { space: SpaceResource }) => {
  const { dispatchModal } = useModals()
  const { $gettext } = useGettext()

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-shortcut',
        icon: 'external-link',
        handler: () => {
          dispatchModal({
            title: $gettext('Create a Shortcut'),
            confirmText: $gettext('Create'),
            customComponent: CreateShortcutModal,
            customComponentAttrs: () => ({ space })
          })
        },
        label: () => {
          return $gettext('New Shortcut')
        },
        isEnabled: () => {
          return unref(currentFolder)?.canCreate()
        },
        componentType: 'button',
        class: 'oc-files-actions-create-new-shortcut'
      }
    ]
  })

  return {
    actions
  }
}

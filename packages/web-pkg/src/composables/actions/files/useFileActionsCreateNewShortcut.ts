import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { computed, unref } from 'vue'
import { useStore } from '../../store'
import { FileAction } from '../../../composables'
import { CreateShortcutModal } from '../../../components'
import { useGettext } from 'vue3-gettext'

export const useFileActionsCreateNewShortcut = ({ space }: { space: SpaceResource }) => {
  const store = useStore()
  const { $gettext } = useGettext()
  const currentFolder = computed((): Resource => store.getters['Files/currentFolder'])

  const handler = () => {
    return store.dispatch('createModal', {
      title: $gettext('Create a Shortcut'),
      hideActions: true,
      customComponent: CreateShortcutModal,
      customComponentAttrs: () => ({ space })
    })
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-shortcut',
        icon: 'external-link',
        handler,
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

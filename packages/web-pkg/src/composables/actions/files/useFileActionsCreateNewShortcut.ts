import { Resource } from '@ownclouders/web-client/src/helpers'
import { Store } from 'vuex'
import { computed, unref, ref } from 'vue'
import { useStore } from '../../store'
import { FileAction } from '../../../'
import { useGettext } from 'vue3-gettext'

export const useFileActionsCreateNewShortcut = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const currentFolder = computed((): Resource => store.getters['Files/currentFolder'])

  const modalOpen = ref(false)

  const closeModal = () => {
    modalOpen.value = false
  }

  const handler = () => {
    modalOpen.value = true
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
    actions,
    modalOpen,
    closeModal
  }
}

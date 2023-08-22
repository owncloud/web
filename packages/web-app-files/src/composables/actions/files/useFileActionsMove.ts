import { canBeMoved } from '../../../helpers/permissions'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { Store } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { ActionOptions, FileAction } from 'web-pkg/src/composables/actions'
import { computed, unref } from 'vue'
import { useRouter, useStore } from 'web-pkg/src/composables'

export const useFileActionsMove = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const language = useGettext()
  const { $pgettext } = language

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const cutShortcutString = computed(() => {
    if (unref(isMacOs)) {
      return $pgettext('Keyboard shortcut for macOS for cutting files', '⌘ + X')
    }
    return $pgettext('Keyboard shortcut for non-macOS systems for cutting files', 'Ctrl + X')
  })

  const handler = ({ space, resources }: ActionOptions) => {
    store.dispatch('Files/cutSelectedFiles', { ...language, space, resources })
  }
  const actions = computed((): FileAction[] => [
    {
      name: 'cut',
      icon: 'scissors',
      handler,
      shortcut: unref(cutShortcutString),
      label: () => $pgettext('Action in the files list row to initiate cutting resources', 'Cut'),
      isEnabled: ({ resources }) => {
        if (
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationPublicActive(router, 'files-public-link') &&
          !isLocationCommonActive(router, 'files-common-favorites')
        ) {
          return false
        }
        if (resources.length === 0) {
          return false
        }

        if (!store.getters['Files/currentFolder']) {
          return false
        }

        if (resources.length === 1 && resources[0].locked) {
          return false
        }

        const moveDisabled = resources.some((resource) => {
          return canBeMoved(resource, store.getters['Files/currentFolder'].path) === false
        })
        return !moveDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-move-trigger'
    }
  ])

  return {
    actions
  }
}

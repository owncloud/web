import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useGetMatchingSpace } from '../../spaces'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { FileAction, FileActionOptions } from '../types'
import { Resource, SpaceResource } from '@ownclouders/web-client'

export const useFileActionsPaste = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext } = useGettext()

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const pasteShortcutString = computed(() => {
    if (unref(isMacOs)) {
      return $gettext('⌘ + V')
    }
    return $gettext('Ctrl + V')
  })

  const handler = async ({ space: targetSpace }: FileActionOptions) => {
    const resourceSpaceMapping: Record<string, { space: SpaceResource; resources: Resource[] }> =
      store.getters['Files/clipboardResources'].reduce((acc, resource) => {
        if (resource.storageId in acc) {
          acc[resource.storageId].resources.push(resource)
          return acc
        }

        const matchingSpace = getMatchingSpace(resource)

        if (!(matchingSpace.id in acc)) {
          acc[matchingSpace.id] = { space: matchingSpace, resources: [] }
        }

        acc[matchingSpace.id].resources.push(resource)
        return acc
      }, {})
    const promises = Object.values(resourceSpaceMapping).map(
      ({ space: sourceSpace, resources: resourcesToCopy }) => {
        return loadingService.addTask(() => {
          return store.dispatch('Files/pasteSelectedFiles', {
            targetSpace,
            sourceSpace: sourceSpace,
            resources: resourcesToCopy,
            clientService,
            loadingService,
            createModal: (...args) => store.dispatch('createModal', ...args),
            hideModal: (...args) => store.dispatch('hideModal', ...args),
            showMessage: (...args) => store.dispatch('showMessage', ...args),
            showErrorMessage: (...args) => store.dispatch('showErrorMessage', ...args),
            $gettext,
            $ngettext
          })
        })
      }
    )
    await Promise.all(promises)
    store.commit('Files/CLEAR_CLIPBOARD')
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'paste',
      icon: 'clipboard',
      handler,
      label: () => $gettext('Paste'),
      shortcut: unref(pasteShortcutString),
      isEnabled: ({ resources }) => {
        if (store.getters['Files/clipboardResources'].length === 0) {
          return false
        }
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

        const currentFolder = store.getters['Files/currentFolder']
        if (isLocationPublicActive(router, 'files-public-link') && currentFolder) {
          return currentFolder.canCreate()
        }

        // copy can't be restricted in authenticated context, because
        // a user always has their home dir with write access
        return true
      },
      componentType: 'button',
      class: 'oc-files-actions-copy-trigger'
    }
  ])

  return {
    actions
  }
}

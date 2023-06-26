import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import {
  useClientService,
  useGetMatchingSpace,
  useLoadingService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { Resource, SpaceResource } from 'web-client'

export const useFileActionsPaste = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $pgettext, interpolate: $gettextInterpolate, $ngettext } = useGettext()

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const pasteShortcutString = computed(() => {
    if (unref(isMacOs)) {
      return $pgettext('Keyboard shortcut for macOS for pasting files', '⌘ + V')
    }
    return $pgettext('Keyboard shortcut for non-macOS systems for pasting files', 'Ctrl + V')
  })

  const handler = async ({ space: targetSpace }: FileActionOptions) => {
    const paste = async (resources) => {
      const resourceSpaceMapping: Record<string, { space: SpaceResource; resources: Resource[] }> =
        resources.reduce((acc, resource) => {
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
      let i = 0
      const promises = Object.values(resourceSpaceMapping).map(
        ({ space: sourceSpace, resources: resourcesToCopy }) => {
          return loadingService.addTask(async () => {
            ;(resourcesToCopy as any).foo = i++

            console.log('addTask 1', (resourcesToCopy as any).foo)
            await store.dispatch('Files/pasteSelectedFiles', {
              targetSpace,
              sourceSpace: sourceSpace,
              resources: resourcesToCopy,
              clientService,
              loadingService,
              createModal: (...args) => store.dispatch('createModal', ...args),
              hideModal: (...args) => store.dispatch('hideModal', ...args),
              showMessage: (...args) => store.dispatch('showMessage', ...args),
              $gettext,
              $gettextInterpolate,
              $ngettext
            })
            console.log('addTask 2', (resourcesToCopy as any).foo)
          })
        }
      )
      await Promise.all(promises)
    }

    const resourcesRecords = []

    for (const resource of store.getters['Files/clipboardResources']) {
      if (!resourcesRecords.length) {
        resourcesRecords.push([resource])
        continue
      }

      const freeSlot = resourcesRecords.find((duplicateResourceRecord) =>
        duplicateResourceRecord.every((r) => r.name !== resource.name)
      )

      if (freeSlot) {
        freeSlot.push(resource)
        continue
      }

      resourcesRecords.push([resource])
    }

    console.log(store.getters['Files/clipboardResources'])
    console.log(resourcesRecords)

    for (const duplicateResources of resourcesRecords) {
      console.log('I AM RUNNUNG')
      await paste(duplicateResources)
    }

    console.log('Done with running')

    store.commit('Files/CLEAR_CLIPBOARD')
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'paste',
      icon: 'clipboard',
      handler,
      label: () => $pgettext('Action in the files list row to initiate pasting resources', 'Paste'),
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
        if (isLocationPublicActive(router, 'files-public-link')) {
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

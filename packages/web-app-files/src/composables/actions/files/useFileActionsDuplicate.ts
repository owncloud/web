import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../../router'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import {
  useClientService,
  useGetMatchingSpace,
  useLoadingService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'

export const useFileActionsDuplicate = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $pgettext, interpolate: $gettextInterpolate, $ngettext } = useGettext()

  const language = useGettext()

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const duplicateShortcutString = computed(() => {
    if (unref(isMacOs)) {
      return $pgettext('Keyboard shortcut for macOS for copying files', '⌘ + C + V')
    }
    return $pgettext('Keyboard shortcut for non-macOS systems for copying files', 'Ctrl + C + V')
  })

  const handler = async ({ space: targetSpace, resources }: FileActionOptions) => {
    try {
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

      const promises = Object.values(resourceSpaceMapping).map(
        ({ space: sourceSpace, resources: resourcesToCopy }) => {
          return loadingService.addTask(() => {
            return store.dispatch('Files/duplicateSelectedFiles', {
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
          })
        }
      )
      await Promise.all(promises)
    } catch (error) {
      console.error(error)
    }
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'duplicate',
        icon: 'file-copy-2',
        handler,
        shortcut: unref(duplicateShortcutString),
        label: ({ resources }) => {
          const duplicateLabel = $pgettext(
            'Action in the files list row to initiate duplicating resources',
            'Duplicate'
          )

          if (isLocationCommonActive(router, 'files-common-search') && resources.length > 1) {
            const copyableResourcesCount = resources.filter(
              (r) => !isProjectSpaceResource(r)
            ).length
            return `${duplicateLabel} (${copyableResourcesCount.toString()})`
          }

          return duplicateLabel
        },
        isEnabled: ({ resources }) => {
          if (
            !isLocationSpacesActive(router, 'files-spaces-generic') &&
            !isLocationPublicActive(router, 'files-public-link') &&
            !isLocationCommonActive(router, 'files-common-favorites')
          ) {
            return false
          }
          if (isLocationSpacesActive(router, 'files-spaces-projects')) {
            return false
          }
          if (resources.length === 0) {
            return false
          }

          if (isLocationPublicActive(router, 'files-public-link')) {
            return store.getters['Files/currentFolder'].canCreate()
          }

          if (
            isLocationCommonActive(router, 'files-common-search') &&
            resources.every((r) => isProjectSpaceResource(r))
          ) {
            return false
          }

          // duplicate can't be restricted in authenticated context, because
          // a user always has their home dir with write access
          return true
        },
        componentType: 'button',
        class: 'oc-files-actions-duplicate-trigger'
      }
    ]
  })

  return {
    actions
  }
}

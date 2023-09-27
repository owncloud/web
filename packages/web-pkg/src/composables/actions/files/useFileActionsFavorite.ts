import { computed, unref } from 'vue'
import { Store } from 'vuex'
import {
  useCapabilityFilesFavorites,
  useClientService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'

import { isLocationCommonActive, isLocationSpacesActive } from '../../../router'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions, useIsFilesAppActive } from 'web-pkg/src/composables/actions'

export const useFileActionsFavorite = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const hasFavorites = useCapabilityFilesFavorites()
  const isFilesAppActive = useIsFilesAppActive()
  const handler = ({ resources }: FileActionOptions) => {
    store
      .dispatch('Files/markFavorite', {
        client: clientService.owncloudSdk,
        file: resources[0]
      })
      .catch((error) => {
        const title = $gettext(
          'Failed to change favorite state of "%{file}"',
          { file: resources[0].name },
          true
        )
        store.dispatch('showErrorMessage', {
          title,
          error
        })
      })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'favorite',
      icon: 'star',
      handler,
      label: ({ resources }) => {
        if (resources[0].starred) {
          return $gettext('Remove from favorites')
        }
        return $gettext('Add to favorites')
      },
      isEnabled: ({ resources }) => {
        if (
          unref(isFilesAppActive) &&
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationCommonActive(router, 'files-common-favorites')
        ) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }

        return unref(hasFavorites)
      },
      componentType: 'button',
      class: 'oc-files-actions-favorite-trigger'
    }
  ])

  return {
    actions
  }
}

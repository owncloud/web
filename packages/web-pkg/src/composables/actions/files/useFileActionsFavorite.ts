import { computed, unref } from 'vue'
import { Store } from 'vuex'
import { isLocationCommonActive, isLocationSpacesActive } from '../../../router'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions, useIsFilesAppActive } from '../../actions'
import { useStore } from '../../store'
import { useRouter } from '../../router'
import { useClientService } from '../../clientService'
import { useAbility } from '../../ability'
import { useMessages, useCapabilityStore } from '../../piniaStores'

export const useFileActionsFavorite = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { showErrorMessage } = useMessages()
  const capabilityStore = useCapabilityStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const isFilesAppActive = useIsFilesAppActive()
  const ability = useAbility()

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
        showErrorMessage({ title, errors: [error] })
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

        return capabilityStore.filesFavorites && ability.can('create', 'Favorite')
      },
      componentType: 'button',
      class: 'oc-files-actions-favorite-trigger'
    }
  ])

  return {
    actions
  }
}

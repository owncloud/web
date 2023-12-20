import { unref, computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { useSpaceHelpers } from '../../spaces'
import { useClientService } from '../../clientService'
import { useAbility } from '../../ability'
import { useRoute } from '../../router'
import { useStore } from '../../store'
import { SpaceAction, SpaceActionOptions } from '../types'
import { SpaceResource } from '@ownclouders/web-client'
import { useModals, useUserStore } from '../../piniaStores'

export const useSpaceActionsRename = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const userStore = useUserStore()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()
  const { checkSpaceNameModalInput } = useSpaceHelpers()
  const { dispatchModal } = useModals()

  const renameSpace = (space: SpaceResource, name: string) => {
    const graphClient = clientService.graphAuthenticated
    return graphClient.drives
      .updateDrive(space.id, { name }, {})
      .then(() => {
        if (unref(route).name === 'admin-settings-spaces') {
          space.name = name
        }
        store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
          id: space.id,
          field: 'name',
          value: name
        })
        store.dispatch('showMessage', {
          title: $gettext('Space name was changed successfully')
        })
      })
      .catch((error) => {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Failed to rename space'),
          error
        })
      })
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    if (resources.length !== 1) {
      return
    }

    dispatchModal({
      title: $gettext('Rename space') + ' ' + resources[0].name,
      confirmText: $gettext('Rename'),
      hasInput: true,
      inputLabel: $gettext('Space name'),
      inputValue: resources[0].name,
      onConfirm: (name: string) => renameSpace(resources[0], name),
      onInput: checkSpaceNameModalInput
    })
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'rename',
      icon: 'pencil',
      label: () => {
        return $gettext('Rename')
      },
      handler,
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        return resources[0].canRename({ user: userStore.user, ability })
      },
      componentType: 'button',
      class: 'oc-files-actions-rename-trigger'
    }
  ])

  return {
    actions,

    // HACK: exported for unit tests:
    renameSpace
  }
}

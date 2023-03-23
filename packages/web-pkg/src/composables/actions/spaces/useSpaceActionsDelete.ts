import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from 'web-client/src'
import { useClientService, useRoute } from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services'
import { useAbility } from '../../ability'
import { useStore } from '../../store'
import { SpaceAction, SpaceActionOptions } from '../types'
import { Store } from 'vuex'

export const useSpaceActionsDelete = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()

  const filterResourcesToDelete = (resources: SpaceResource[]) => {
    return resources.filter((r) => r.canBeDeleted({ user: store.getters.user, ability }))
  }

  const deleteSpaces = (spaces: SpaceResource[]) => {
    const requests = []
    const graphClient = clientService.graphAuthenticated
    spaces.forEach((space) => {
      const request = graphClient.drives
        .deleteDrive(space.id.toString(), '', {
          headers: {
            Purge: 'T'
          }
        })
        .then(() => {
          store.dispatch('hideModal')
          store.commit('Files/REMOVE_FILES', [{ id: space.id }])
          store.commit('runtime/spaces/REMOVE_SPACE', { id: space.id })
          return true
        })
        .catch((error) => {
          console.error(error)
          store.dispatch('showMessage', {
            title: $gettext('Failed to delete space %{spaceName}', {
              spaceName: space.name
            }),
            status: 'danger'
          })
        })
      requests.push(request)
    })
    return Promise.all(requests).then((result: boolean[]) => {
      if (result.filter(Boolean).length) {
        store.dispatch('showMessage', {
          title: $ngettext(
            'Space was deleted successfully',
            'Spaces were deleted successfully',
            result.filter(Boolean).length
          )
        })
      }

      if (unref(route).name === 'admin-settings-spaces') {
        eventBus.publish('app.admin-settings.list.load')
      }
    })
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    const allowedResources = filterResourcesToDelete(resources)
    if (!allowedResources.length) {
      return
    }
    const message = $ngettext(
      'Are you sure you want to delete the selected space?',
      'Are you sure you want to delete %{count} selected spaces?',
      allowedResources.length,
      { count: allowedResources.length.toString() }
    )
    const confirmText = $gettext('Delete')

    const modal = {
      variation: 'danger',
      title: $ngettext(
        'Delete Space "%{space}"?',
        'Delete %{spaceCount} Spaces?',
        allowedResources.length,
        {
          space: allowedResources[0].name,
          spaceCount: allowedResources.length.toString()
        }
      ),
      cancelText: $gettext('Cancel'),
      confirmText,
      message: message,
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => deleteSpaces(allowedResources)
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'delete',
      icon: 'delete-bin',
      label: ({ resources }) => {
        if (resources.length === 1) {
          return $gettext('Delete')
        }
        const allowedCount = filterResourcesToDelete(resources).length
        return $gettext('Delete (%{count})', { count: allowedCount.toString() })
      },
      handler,
      isEnabled: ({ resources }) => {
        return !!filterResourcesToDelete(resources).length
      },
      componentType: 'button',
      class: 'oc-files-actions-delete-trigger'
    }
  ])

  return {
    actions,

    // HACK: exported for unit tests:
    deleteSpaces
  }
}

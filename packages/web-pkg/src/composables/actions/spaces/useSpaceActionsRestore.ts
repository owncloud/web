import { SpaceResource } from 'web-client'
import { computed, unref } from 'vue'
import { Store } from 'vuex'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useRoute } from '../../router'
import { useAbility, useClientService, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'

export const useSpaceActionsRestore = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()

  const filterResourcesToRestore = (resources): SpaceResource[] => {
    return resources.filter((r) => r.canRestore({ user: store.getters.user, ability }))
  }

  const restoreSpaces = (spaces: SpaceResource[]) => {
    const requests = []
    const graphClient = clientService.graphAuthenticated
    spaces.forEach((space) => {
      const request = graphClient.drives
        .updateDrive(
          space.id.toString(),
          { name: space.name },
          {
            headers: {
              Restore: true
            }
          }
        )
        .then((updatedSpace) => {
          store.dispatch('hideModal')
          if (unref(route).name === 'admin-settings-spaces') {
            space.disabled = false
            space.spaceQuota = updatedSpace.data.quota
          }
          store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
            id: space.id,
            field: 'disabled',
            value: false
          })
          return true
        })
        .catch((error) => {
          console.error(error)
          store.dispatch('showMessage', {
            title: $gettext('Failed to restore space %{spaceName}', {
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
            'Space was restored successfully',
            'Spaces were restored successfully',
            result.filter(Boolean).length
          )
        })
      }
    })
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    const allowedResources = filterResourcesToRestore(resources)
    if (!allowedResources.length) {
      return
    }
    const message = $ngettext(
      'If you enable the selected space, it can be accessed again.',
      'If you enable the %{count} selected spaces, they can be accessed again.',
      allowedResources.length,
      { count: allowedResources.length.toString() }
    )
    const confirmText =
      resources.length === 1
        ? $gettext('Enable')
        : $gettext('Enable (%{count})', { count: allowedResources.length.toString() })

    const modal = {
      variation: 'passive',
      title: $ngettext('Enable Space?', 'Enable Spaces?', allowedResources.length),
      cancelText: $gettext('Cancel'),
      confirmText,
      icon: 'alarm-warning',
      message,
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => restoreSpaces(allowedResources)
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'restore',
      icon: 'play-circle',
      label: ({ resources }) => {
        if (resources.length === 1) {
          return $gettext('Enable')
        }
        const allowedCount = filterResourcesToRestore(resources).length
        return $gettext('Enable (%{count})', { count: allowedCount.toString() })
      },
      handler,
      isEnabled: ({ resources }) => {
        return !!filterResourcesToRestore(resources).length
      },
      componentType: 'button',
      class: 'oc-files-actions-restore-trigger'
    }
  ])

  return {
    actions,

    // HACK: exported for unit tests:
    restoreSpaces
  }
}

import { SpaceResource } from 'web-client'
import { computed, unref } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from '../../router'
import { useStore } from '../../store'
import { useAbility } from '../../ability'
import { useClientService } from 'web-pkg/src/composables'
import { Store } from 'vuex'

export const useSpaceActionsDisable = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()
  const router = useRouter()

  const filterResourcesToDisable = (resources): SpaceResource[] => {
    return resources.filter((r) => r.canDisable({ user: store.getters.user, ability }))
  }

  const disableSpaces = (spaces: SpaceResource[]) => {
    const requests = []
    const graphClient = clientService.graphAuthenticated
    const currentRoute = unref(route)
    spaces.forEach((space) => {
      const request = graphClient.drives
        .deleteDrive(space.id.toString())
        .then(() => {
          store.dispatch('hideModal')
          if (currentRoute.name === 'admin-settings-spaces') {
            space.disabled = true
            space.spaceQuota = { total: space.spaceQuota.total }
          }
          store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
            id: space.id,
            field: 'disabled',
            value: true
          })
          return true
        })
        .catch((error) => {
          console.error(error)
          store.dispatch('showMessage', {
            title: $gettext('Failed to disable space %{spaceName}', {
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
            'Space was disabled successfully',
            'Spaces were disabled successfully',
            result.filter(Boolean).length
          )
        })
      }

      if (currentRoute.name === 'files-spaces-generic') {
        return router.push({ name: 'files-spaces-projects' })
      }
    })
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    const allowedResources = filterResourcesToDisable(resources)
    if (!allowedResources.length) {
      return
    }
    const message = $ngettext(
      'If you disable the selected space, it can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
      'If you disable the %{count} selected spaces, they can no longer be accessed. Only Space managers will still have access. Note: No files will be deleted from the server.',
      allowedResources.length,
      { count: allowedResources.length.toString() }
    )
    const confirmText =
      resources.length === 1
        ? $gettext('Disable')
        : $gettext('Disable (%{count})', { count: allowedResources.length.toString() })
    const modal = {
      variation: 'danger',
      icon: 'alarm-warning',
      title: $ngettext('Disable Space?', 'Disable Spaces?', allowedResources.length),
      cancelText: $gettext('Cancel'),
      confirmText,
      message,
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => disableSpaces(allowedResources)
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'disable',
      icon: 'stop-circle',
      label: ({ resources }) => {
        if (resources.length === 1) {
          return $gettext('Disable')
        }
        const allowedCount = filterResourcesToDisable(resources).length
        return $gettext('Disable (%{count})', { count: allowedCount.toString() })
      },
      handler,
      isEnabled: ({ resources }) => {
        return !!filterResourcesToDisable(resources).length
      },
      componentType: 'button',
      class: 'oc-files-actions-disable-trigger'
    }
  ])

  return {
    actions,

    // HACK: exported for unit tests:
    disableSpaces
  }
}

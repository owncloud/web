import { SpaceResource } from 'web-client'
import { computed, unref } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { useRoute, useRouter } from 'web-pkg/src/composables'
import { useStore } from '../../store'
import { useAbility } from '../../ability'
import { useClientService, useLoadingService } from 'web-pkg/src/composables'
import { Store } from 'vuex'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export const useSpaceActionsDisable = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()
  const router = useRouter()
  const loadingService = useLoadingService()

  const filterResourcesToDisable = (resources): SpaceResource[] => {
    return resources.filter(
      (r) => isProjectSpaceResource(r) && r.canDisable({ user: store.getters.user, ability })
    )
  }

  const disableSpaces = async (spaces: SpaceResource[]) => {
    const currentRoute = unref(route)

    const client = clientService.graphAuthenticated
    const promises = spaces.map((space) =>
      client.drives.disableDrive(space.id.toString()).then(() => {
        if (currentRoute.name === 'files-spaces-generic') {
          router.push({ name: 'files-spaces-projects' })
        }
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
    )
    const results = await loadingService.addTask(() => {
      return Promise.allSettled(promises)
    })
    const succeeded = results.filter((r) => r.status === 'fulfilled')
    if (succeeded.length) {
      const title =
        succeeded.length === 1 && spaces.length === 1
          ? $gettext('Space "%{space}" was disabled successfully', { space: spaces[0].name })
          : $ngettext(
              '%{spaceCount} space was disabled successfully',
              '%{spaceCount} spaces were disabled successfully',
              succeeded.length,
              { spaceCount: succeeded.length.toString() },
              true
            )
      store.dispatch('showMessage', { title })
    }

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) {
      failed.forEach(console.error)

      const title =
        failed.length === 1 && spaces.length === 1
          ? $gettext('Failed to disable space "%{space}"', { space: spaces[0].name })
          : $ngettext(
              'Failed to disable %{spaceCount} space',
              'Failed to disable %{spaceCount} spaces',
              failed.length,
              { spaceCount: failed.length.toString() },
              true
            )
      store.dispatch('showErrorMessage', {
        title,
        errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
      })
    }

    store.dispatch('hideModal')
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
    const confirmText = $gettext('Disable')
    const modal = {
      variation: 'danger',
      title: $ngettext(
        'Disable Space "%{space}"?',
        'Disable %{spaceCount} Spaces?',
        allowedResources.length,
        {
          space: allowedResources[0].name,
          spaceCount: allowedResources.length.toString()
        }
      ),
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
      label: () => $gettext('Disable'),
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

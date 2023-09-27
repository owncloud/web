import { SpaceResource } from 'web-client'
import { computed, unref } from 'vue'
import { Store } from 'vuex'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useRoute } from '../../router'
import {
  useAbility,
  useClientService,
  useLoadingService,
  useStore
} from '@ownclouders/web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export const useSpaceActionsRestore = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const route = useRoute()

  const filterResourcesToRestore = (resources): SpaceResource[] => {
    return resources.filter(
      (r) => isProjectSpaceResource(r) && r.canRestore({ user: store.getters.user, ability })
    )
  }

  const restoreSpaces = async (spaces: SpaceResource[]) => {
    const client = clientService.graphAuthenticated
    const promises = spaces.map((space) =>
      client.drives
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
    )
    const results = await loadingService.addTask(() => {
      return Promise.allSettled(promises)
    })
    const succeeded = results.filter((r) => r.status === 'fulfilled')
    if (succeeded.length) {
      const title =
        succeeded.length === 1 && spaces.length === 1
          ? $gettext('Space "%{space}" was enabled successfully', { space: spaces[0].name })
          : $ngettext(
              '%{spaceCount} space was enabled successfully',
              '%{spaceCount} spaces were enabled successfully',
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
          ? $gettext('Failed to enabled space "%{space}"', { space: spaces[0].name })
          : $ngettext(
              'Failed to enable %{spaceCount} space',
              'Failed to enable %{spaceCount} spaces',
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
    const confirmText = $gettext('Enable')

    const modal = {
      variation: 'passive',
      title: $ngettext(
        'Enable Space "%{space}"?',
        'Enable %{spaceCount} Spaces?',
        allowedResources.length,
        {
          space: allowedResources[0].name,
          spaceCount: allowedResources.length.toString()
        }
      ),
      cancelText: $gettext('Cancel'),
      confirmText,
      icon: 'alert',
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
      label: () => $gettext('Enable'),
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

import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from 'web-client/src'
import { useClientService, useLoadingService, useRoute } from '@ownclouders/web-pkg/src/composables'
import { eventBus } from '@ownclouders/web-pkg/src/services'
import { useAbility } from '../../ability'
import { useStore } from '../../store'
import { SpaceAction, SpaceActionOptions } from '../types'
import { Store } from 'vuex'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export const useSpaceActionsDelete = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const route = useRoute()

  const filterResourcesToDelete = (resources: SpaceResource[]) => {
    return resources.filter(
      (r) => isProjectSpaceResource(r) && r.canBeDeleted({ user: store.getters.user, ability })
    )
  }

  const deleteSpaces = async (spaces: SpaceResource[]) => {
    const client = clientService.graphAuthenticated
    const promises = spaces.map((space) =>
      client.drives.deleteDrive(space.id.toString()).then(() => {
        store.commit('Files/REMOVE_FILES', [{ id: space.id }])
        store.commit('runtime/spaces/REMOVE_SPACE', { id: space.id })
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
          ? $gettext('Space "%{space}" was deleted successfully', { space: spaces[0].name })
          : $ngettext(
              '%{spaceCount} space was deleted successfully',
              '%{spaceCount} spaces were deleted successfully',
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
          ? $gettext('Failed to delete space "%{space}"', { space: spaces[0].name })
          : $ngettext(
              'Failed to delete %{spaceCount} space',
              'Failed to delete %{spaceCount} spaces',
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
    if (unref(route).name === 'admin-settings-spaces') {
      eventBus.publish('app.admin-settings.list.load')
    }
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
      label: () => $gettext('Delete'),
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

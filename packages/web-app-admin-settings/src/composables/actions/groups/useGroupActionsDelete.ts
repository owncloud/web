import { computed } from 'vue'
import { Store } from 'vuex'
import { eventBus } from 'web-pkg'
import { useClientService, useStore } from 'web-pkg/src/composables'
import { GroupAction, GroupActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'

export const useGroupActionsDelete = ({ store }: { store?: Store<any> }) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const clientService = useClientService()

  const deleteGroups = async (groups) => {
    const graphClient = clientService.graphAuthenticated
    const promises = groups.map((group) => graphClient.groups.deleteGroup(group.id))

    try {
      await Promise.all(promises)
      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $ngettext(
          'Group "%{group}" was deleted successfully',
          '%{groupCount} groups were deleted successfully',
          groups.length,
          { groupCount: groups.length, group: groups[0].displayName },
          true
        )
      })
      eventBus.publish('app.admin-settings.list.load')
    } catch (error) {
      console.error(error)
      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $ngettext(
          'Failed to delete group "%{group}"',
          'Failed to delete %{groupCount} groups',
          groups.length,
          { groupCount: groups.length, group: groups[0].displayName },
          true
        ),
        status: 'danger'
      })
    }
  }

  const handler = ({ resources }: GroupActionOptions) => {
    if (!resources.length) {
      return
    }

    const modal = {
      variation: 'danger',
      title: $ngettext(
        'Delete group "%{group}"?',
        'Delete %{groupCount} groups?',
        resources.length,
        {
          group: resources[0].displayName,
          groupCount: resources.length.toString()
        }
      ),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Delete'),
      message: $ngettext(
        'Are you sure you want to delete this group?',
        'Are you sure you want to delete the %{groupCount} selected groups?',
        resources.length,
        {
          groupCount: resources.length.toString()
        }
      ),
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => deleteGroups(resources)
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): GroupAction[] => [
    {
      name: 'delete',
      icon: 'delete-bin',
      label: () => {
        return $gettext('Delete')
      },
      handler,
      isEnabled: ({ resources }) => {
        return !!resources.length && !resources.some((r) => r.groupTypes?.includes('ReadOnly'))
      },
      componentType: 'button',
      class: 'oc-groups-actions-delete-trigger'
    }
  ])

  return {
    actions
  }
}

import { computed, Ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction, useStore } from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/src/generated'
import AddToGroupsModal from '../../../components/Users/AddToGroupsModal.vue'

export const useUserActionsAddToGroups = ({ groups }: { groups: Ref<Group[]> }) => {
  const store = useStore()
  const { $gettext, $ngettext } = useGettext()

  const handler = ({ resources }) => {
    return store.dispatch('createModal', {
      variation: 'passive',
      title: $ngettext(
        'Add user "%{user}" to groups',
        'Add %{userCount} users to groups ',
        resources.length,
        {
          user: resources[0].displayName,
          userCount: resources.length.toString()
        }
      ),
      hideActions: true,
      customComponent: AddToGroupsModal,
      customComponentAttrs: {
        users: [...resources],
        groups: unref(groups)
      }
    })
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'add-to-groups',
      icon: 'add',
      componentType: 'button',
      class: 'oc-users-actions-add-to-groups-trigger',
      label: () => $gettext('Add to groups'),
      isEnabled: ({ resources }) => resources.length > 0,
      handler
    }
  ])

  return {
    actions
  }
}

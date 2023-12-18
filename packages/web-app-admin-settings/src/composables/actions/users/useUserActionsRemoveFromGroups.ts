import { computed, Ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction, useModals } from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/src/generated'
import RemoveFromGroupsModal from '../../../components/Users/RemoveFromGroupsModal.vue'

export const useUserActionsRemoveFromGroups = ({ groups }: { groups: Ref<Group[]> }) => {
  const { registerModal } = useModals()
  const { $gettext, $ngettext } = useGettext()

  const handler = ({ resources }) => {
    registerModal({
      title: $ngettext(
        'Remove user "%{user}" from groups',
        'Remove %{userCount} users from groups ',
        resources.length,
        {
          user: resources[0].displayName,
          userCount: resources.length.toString()
        }
      ),
      customComponent: RemoveFromGroupsModal,
      customComponentAttrs: () => ({
        users: resources,
        groups: unref(groups)
      })
    })
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'remove-users-from-groups',
      icon: 'subtract',
      componentType: 'button',
      class: 'oc-users-actions-remove-from-groups-trigger',
      label: () => $gettext('Remove from groups'),
      isEnabled: ({ resources }) => resources.length > 0,
      handler
    }
  ])

  return {
    actions
  }
}

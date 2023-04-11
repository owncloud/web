import { eventBus } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { UserAction } from 'web-pkg/src/composables/actions'

export const useUserActionsEdit = () => {
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'edit',
      icon: 'pencil',
      label: () => $gettext('Edit'),
      handler: () => eventBus.publish(SideBarEventTopics.openWithPanel, 'EditPanel'),
      isEnabled: ({ resources }) => {
        return resources.length === 1
      },
      componentType: 'button',
      class: 'oc-users-actions-edit-trigger'
    }
  ])

  return {
    actions
  }
}

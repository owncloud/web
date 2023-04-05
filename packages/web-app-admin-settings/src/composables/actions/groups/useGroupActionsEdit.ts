import { eventBus } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { useGettext } from 'vue3-gettext'
import { computed } from 'vue'
import { GroupAction } from 'web-pkg/src/composables/actions'

export const useGroupActionsEdit = () => {
  const { $gettext } = useGettext()

  const actions = computed((): GroupAction[] => [
    {
      name: 'edit',
      icon: 'pencil',
      label: () => $gettext('Edit'),
      handler: () => eventBus.publish(SideBarEventTopics.openWithPanel, 'EditPanel'),
      isEnabled: ({ resources }) => {
        return resources.length === 1 && !resources[0].groupTypes?.includes('ReadOnly')
      },
      componentType: 'button',
      class: 'oc-groups-actions-edit-trigger'
    }
  ])

  return {
    actions
  }
}

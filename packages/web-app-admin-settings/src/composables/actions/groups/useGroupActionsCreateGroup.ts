import { useModals, UserAction } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import CreateGroupModal from '../../../components/Groups/CreateGroupModal.vue'

export const useGroupActionsCreateGroup = () => {
  const { registerModal } = useModals()
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'create-group',
      icon: 'add',
      componentType: 'button',
      class: 'oc-groups-actions-create-group',
      label: () => $gettext('New group'),
      isEnabled: () => true,
      handler: () => {
        registerModal({
          title: $gettext('Create group'),
          customComponent: CreateGroupModal
        })
      }
    }
  ])

  return {
    actions
  }
}

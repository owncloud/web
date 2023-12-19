import { useStore } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from '@ownclouders/web-pkg'
import CreateGroupModal from '../../../components/Groups/CreateGroupModal.vue'

export const useGroupActionsCreateGroup = () => {
  const store = useStore()
  const { $gettext } = useGettext()

  const handler = () => {
    return store.dispatch('createModal', {
      variation: 'passive',
      title: $gettext('Create group'),
      hideActions: true,
      customComponent: CreateGroupModal
    })
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'create-group',
      icon: 'add',
      componentType: 'button',
      class: 'oc-groups-actions-create-group',
      label: () => $gettext('New group'),
      isEnabled: () => true,
      handler
    }
  ])

  return {
    actions
  }
}

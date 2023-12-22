import { useModals } from '@ownclouders/web-pkg'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from '@ownclouders/web-pkg'
import { useCapabilityCreateUsersDisabled } from '@ownclouders/web-pkg'
import CreateUserModal from '../../../components/Users/CreateUserModal.vue'

export const useUserActionsCreateUser = () => {
  const { dispatchModal } = useModals()
  const createUsersDisabled = useCapabilityCreateUsersDisabled()
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'create-user',
      icon: 'add',
      componentType: 'button',
      class: 'oc-users-actions-create-user',
      label: () => $gettext('New user'),
      isEnabled: () => !unref(createUsersDisabled),
      handler: () => {
        dispatchModal({
          title: $gettext('Create user'),
          customComponent: CreateUserModal
        })
      }
    }
  ])

  return {
    actions
  }
}

import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useAbility, useCapabilityReadOnlyUserAttributes } from 'web-pkg'
import { UserAction } from 'web-pkg/src/composables/actions'

export const useUserActionsEditQuota = () => {
  const { $gettext } = useGettext()
  const ability = useAbility()
  const readOnlyUserAttributes = useCapabilityReadOnlyUserAttributes()

  const modalOpen = ref(false)

  const closeModal = () => {
    modalOpen.value = false
  }

  const handler = () => {
    modalOpen.value = true
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'editQuota',
      icon: 'cloud',
      label: () => {
        return $gettext('Edit quota')
      },
      handler,
      isEnabled: ({ resources }) => {
        if (!resources || !resources.length) {
          return false
        }

        if (unref(readOnlyUserAttributes).includes('drive.quota')) {
          return false
        }

        if (!resources.some((r) => r.drive?.quota)) {
          return false
        }

        return ability.can('set-quota-all', 'Space')
      },
      componentType: 'button',
      class: 'oc-users-actions-edit-quota-trigger'
    }
  ])

  return {
    modalOpen,
    closeModal,
    actions
  }
}

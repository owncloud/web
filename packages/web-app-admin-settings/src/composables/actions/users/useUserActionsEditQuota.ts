import { computed, unref, toRaw } from 'vue'
import { useGettext } from 'vue3-gettext'
import {
  QuotaModal,
  useAbility,
  useCapabilityReadOnlyUserAttributes,
  UserAction,
  UserActionOptions,
  useModals
} from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { isPersonalSpaceResource } from '@ownclouders/web-client/src/helpers'
import { User } from '@ownclouders/web-client/src/generated'

export const useUserActionsEditQuota = () => {
  const { registerModal } = useModals()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const readOnlyUserAttributes = useCapabilityReadOnlyUserAttributes()

  const getModalTitle = ({ resources }: { resources: User[] }) => {
    if (resources.length === 1) {
      return $gettext('Change quota for user "%{name}"', {
        name: resources[0].displayName
      })
    }
    return $gettext('Change quota for %{count} users', {
      count: resources.length.toString()
    })
  }

  const getUserDrives = ({ resources }: { resources: User[] }) => {
    const selectedPersonalDrives: SpaceResource[] = []
    resources.forEach((user) => {
      const drive = toRaw(user.drive)
      if (drive === undefined || drive.id === undefined) {
        return
      }
      const spaceResource = {
        id: drive.id,
        name: user.displayName,
        spaceQuota: drive.quota
      } as SpaceResource
      selectedPersonalDrives.push(spaceResource)
    })
    return selectedPersonalDrives
  }

  const handler = ({ resources }: UserActionOptions) => {
    const usersWithoutDrive = resources.filter(
      ({ drive }) => !isPersonalSpaceResource(drive as SpaceResource)
    )

    registerModal({
      title: getModalTitle({ resources }),
      customComponent: QuotaModal,
      customComponentAttrs: () => ({
        spaces: getUserDrives({ resources }),
        resourceType: 'user',
        warningMessage: usersWithoutDrive.length
          ? $gettext('Quota will only be applied to users who logged in at least once.')
          : '',
        warningMessageContextualHelperData: usersWithoutDrive.length
          ? {
              title: $gettext('Unaffected users'),
              text: [...usersWithoutDrive]
                .sort((u1, u2) => u1.displayName.localeCompare(u2.displayName))
                .map((user) => user.displayName)
                .join(', ')
            }
          : {}
      })
    })
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

        return ability.can('set-quota-all', 'Drive')
      },
      componentType: 'button',
      class: 'oc-users-actions-edit-quota-trigger'
    }
  ])

  return {
    actions
  }
}

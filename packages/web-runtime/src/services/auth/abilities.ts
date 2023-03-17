import { SubjectRawRule } from '@casl/ability'
import { AbilityActions, AbilitySubjects } from 'web-pkg'

export const getAbilities = (
  permissions: string[]
): SubjectRawRule<AbilityActions, AbilitySubjects, any>[] => {
  const abilities: Record<string, SubjectRawRule<AbilityActions, AbilitySubjects, any>[]> = {
    'account-management.all': [
      { action: 'create-all', subject: 'Account' },
      { action: 'delete-all', subject: 'Account' },
      { action: 'read-all', subject: 'Account' },
      { action: 'update-all', subject: 'Account' }
    ],
    'group-management.all': [
      { action: 'create-all', subject: 'Group' },
      { action: 'delete-all', subject: 'Group' },
      { action: 'read-all', subject: 'Group' },
      { action: 'update-all', subject: 'Group' }
    ],
    'language-readwrite.all': [
      { action: 'read-all', subject: 'Language' },
      { action: 'update-all', subject: 'Language' }
    ],
    'change-logo.all': [{ action: 'update-all', subject: 'Logo' }],
    'PublicLink.Write.all': [{ action: 'create-all', subject: 'PublicLink' }],
    'role-management.all': [
      { action: 'create-all', subject: 'Role' },
      { action: 'delete-all', subject: 'Role' },
      { action: 'read-all', subject: 'Role' },
      { action: 'update-all', subject: 'Role' }
    ],
    'settings-management.all': [
      { action: 'read-all', subject: 'Setting' },
      { action: 'update-all', subject: 'Setting' }
    ],
    'create-space.all': [{ action: 'create-all', subject: 'Space' }],
    'Drive.ReadWriteEnabled.all': [
      { action: 'delete-all', subject: 'Space' },
      { action: 'update-all', subject: 'Space' }
    ],
    'list-all-spaces.all': [{ action: 'read-all', subject: 'Space' }],
    'Drive.ReadWriteQuota.Project.all': [{ action: 'set-quota-all', subject: 'Space' }]
  }

  return Object.keys(abilities).reduce((acc, permission) => {
    if (permissions.includes(permission)) {
      acc.push(...abilities[permission])
    }
    return acc
  }, [])
}

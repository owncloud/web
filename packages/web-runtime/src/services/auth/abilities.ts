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
    'delete-all-spaces.all': [{ action: 'delete-all', subject: 'Space' }],
    'list-all-spaces.all': [
      { action: 'read-all', subject: 'Space' },
      { action: 'delete-all', subject: 'Space' } // FIXME: Why is this needed? backend issue?
    ],
    'set-space-quota.all': [{ action: 'set-quota-all', subject: 'Space' }]
  }

  return Object.keys(abilities).reduce((acc, permission) => {
    if (permissions.includes(permission)) {
      acc.push(...abilities[permission])
    }
    return acc
  }, [])
}

import { SubjectRawRule } from '@casl/ability'
import { AbilityActions, AbilitySubjects } from 'web-pkg'

export const getAbilities = (
  permissions: string[]
): SubjectRawRule<AbilityActions, AbilitySubjects, any>[] => {
  const abilities: Record<string, SubjectRawRule<AbilityActions, AbilitySubjects, any>[]> = {
    'account-management': [
      { action: 'create', subject: 'Account' },
      { action: 'delete', subject: 'Account' },
      { action: 'read', subject: 'Account' },
      { action: 'update', subject: 'Account' }
    ],
    'group-management': [
      { action: 'create', subject: 'Group' },
      { action: 'delete', subject: 'Group' },
      { action: 'read', subject: 'Group' },
      { action: 'update', subject: 'Group' }
    ],
    'language-readwrite': [
      { action: 'read', subject: 'Language' },
      { action: 'update', subject: 'Language' }
    ],
    'change-logo': [{ action: 'update', subject: 'Logo' }],
    'role-management': [
      { action: 'create', subject: 'Role' },
      { action: 'delete', subject: 'Role' },
      { action: 'read', subject: 'Role' },
      { action: 'update', subject: 'Role' }
    ],
    'settings-management': [
      { action: 'read', subject: 'Setting' },
      { action: 'update', subject: 'Setting' }
    ],
    'create-space': [{ action: 'create', subject: 'Space' }],
    'delete-all-spaces': [{ action: 'delete', subject: 'Space' }],
    'list-all-spaces': [{ action: 'read', subject: 'Space' }],
    'set-space-quota': [{ action: 'set-quota', subject: 'Space' }]
  }

  return Object.keys(abilities).reduce((acc, permission) => {
    if (permissions.includes(permission)) {
      acc.push(...abilities[permission])
    }
    return acc
  }, [])
}

import { SubjectRawRule } from '@casl/ability'
import { AbilityActions, AbilitySubjects } from 'web-pkg'

export const getAbilities = (
  permissions: string[]
): SubjectRawRule<AbilityActions, AbilitySubjects, any>[] => {
  const abilities: SubjectRawRule<AbilityActions, AbilitySubjects, any>[] = []

  // account
  if (permissions.includes('account-management')) {
    abilities.push(
      { action: 'create', subject: 'Account' },
      { action: 'delete', subject: 'Account' },
      { action: 'read', subject: 'Account' },
      { action: 'update', subject: 'Account' }
    )
  }

  // groups
  if (permissions.includes('group-management')) {
    abilities.push(
      { action: 'create', subject: 'Group' },
      { action: 'delete', subject: 'Group' },
      { action: 'read', subject: 'Group' },
      { action: 'update', subject: 'Group' }
    )
  }

  // language
  if (permissions.includes('language-readwrite')) {
    abilities.push({ action: 'read', subject: 'Language' })
    abilities.push({ action: 'update', subject: 'Language' })
  }

  // logo
  if (permissions.includes('change-logo')) {
    abilities.push({ action: 'update', subject: 'Logo' })
  }

  // roles
  if (permissions.includes('role-management')) {
    abilities.push(
      { action: 'create', subject: 'Role' },
      { action: 'delete', subject: 'Role' },
      { action: 'read', subject: 'Role' },
      { action: 'update', subject: 'Role' }
    )
  }

  // settings
  if (permissions.includes('settings-management')) {
    abilities.push({ action: 'read', subject: 'Setting' }, { action: 'update', subject: 'Setting' })
  }

  // spaces
  if (permissions.includes('create-space')) {
    abilities.push({ action: 'create', subject: 'Space' })
  }
  if (permissions.includes('delete-all-spaces')) {
    abilities.push({ action: 'delete', subject: 'Space' })
  }
  if (permissions.includes('list-all-spaces')) {
    abilities.push({ action: 'read', subject: 'Space' })
  }
  if (permissions.includes('set-space-quota')) {
    abilities.push({ action: 'set-quota', subject: 'Space' })
  }

  return abilities
}

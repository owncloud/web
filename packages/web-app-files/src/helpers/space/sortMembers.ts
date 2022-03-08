import { spaceRoleManager } from '../share'

export const sortSpaceMembers = (shares: Array<any>): Array<any> => {
  const sortedManagers = shares
    .filter((share) => share.role.name === spaceRoleManager.name)
    .sort((a, b) => {
      return a.collaborator.displayName.localeCompare(b.collaborator.displayName)
    })

  const sortedRest = shares
    .filter((share) => share.role.name !== spaceRoleManager.name)
    .sort((a, b) => {
      return a.collaborator.displayName.localeCompare(b.collaborator.displayName)
    })

  return [...sortedManagers, ...sortedRest]
}

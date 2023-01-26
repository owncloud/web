import { spaceRoleEditor, spaceRoleManager, spaceRoleViewer } from './role'
import { Share } from './share'
import { ShareTypes } from './type'

export function buildSpaceShare(s, storageId): Share {
  let permissions, role

  switch (s.role) {
    case spaceRoleManager.name:
      permissions = spaceRoleManager.bitmask(true)
      role = spaceRoleManager
      break
    case spaceRoleEditor.name:
      permissions = spaceRoleEditor.bitmask(true)
      role = spaceRoleEditor
      break
    case spaceRoleViewer.name:
      permissions = spaceRoleViewer.bitmask(true)
      role = spaceRoleViewer
      break
  }

  return {
    shareType: ShareTypes.space.value,
    id: storageId,
    collaborator: {
      name: s.onPremisesSamAccountName,
      displayName: s.displayName,
      additionalInfo: null
    },
    permissions,
    role,
    expiration: s.expirationDate,
    expires: new Date(s.expirationDate)
  }
}

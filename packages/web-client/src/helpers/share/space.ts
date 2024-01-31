import { spaceRoleEditor, spaceRoleManager, spaceRoleViewer } from './role'
import { Share } from './types'
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

  let shareType
  if (Object.prototype.hasOwnProperty.call(s, 'share_type')) {
    shareType = parseInt(s.share_type)
  } else if (Object.prototype.hasOwnProperty.call(s, 'kind')) {
    switch (s.kind) {
      case 'user': {
        shareType = ShareTypes.spaceUser.value
        break
      }
      case 'group': {
        shareType = ShareTypes.spaceGroup.value
        break
      }
      default:
        break
    }
  }

  return {
    shareType,
    id: storageId,
    collaborator: {
      name: s.onPremisesSamAccountName,
      displayName: s.displayName,
      additionalInfo: null
    },
    permissions,
    role,
    expiration: s.expirationDate,
    expires: s.expirationDate ? new Date(s.expirationDate) : undefined
  }
}

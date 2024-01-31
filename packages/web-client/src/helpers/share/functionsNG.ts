import { extractDomSelector, extractExtensionFromFile, extractStorageId } from '../resource'
import { ShareTypes } from './type'
import { SHARE_JAIL_ID, buildWebDavSpacesPath } from '../space'
import { DriveItem, UnifiedRoleDefinition, User } from '../../generated'
import { GraphSharePermission, IncomingShareResource, OutgoingShareResource } from './types'
import { urlJoin } from '../../utils'
import { uniq } from 'lodash-es'

export const getShareResourceRoles = ({
  driveItem,
  graphRoles
}: {
  driveItem: DriveItem
  graphRoles: UnifiedRoleDefinition[]
}) => {
  return driveItem.remoteItem?.permissions.reduce<UnifiedRoleDefinition[]>((acc, permission) => {
    permission.roles?.forEach((roleId) => {
      const role = graphRoles.find(({ id }) => id === roleId)
      if (role && !acc.some(({ id }) => id === role.id)) {
        acc.push(role)
      }
    })

    return acc
  }, [])
}

export const getShareResourcePermissions = ({
  driveItem,
  shareRoles
}: {
  driveItem: DriveItem
  shareRoles: UnifiedRoleDefinition[]
}): GraphSharePermission[] => {
  if (!shareRoles.length) {
    // the server lists plain permissions if it doesn't find a corresponding role
    const permissions = driveItem.remoteItem?.permissions.reduce<GraphSharePermission[]>(
      (acc, permission) => {
        const permissions = permission['@libre.graph.permissions.actions'] as GraphSharePermission[]
        if (permissions) {
          acc.push(...permissions)
        }

        return acc
      },
      []
    )
    return [...new Set(permissions)]
  }

  const permissions = shareRoles.reduce((acc, role) => {
    role.rolePermissions.forEach((permission) => {
      acc.push(...permission.allowedResourceActions)
    })
    return acc
  }, [])

  return [...new Set(permissions)]
}

export function buildIncomingShareResource({
  driveItem,
  graphRoles
}: {
  driveItem: DriveItem
  graphRoles: UnifiedRoleDefinition[]
}): IncomingShareResource {
  const resourceName = driveItem.name || driveItem.remoteItem.name
  const storageId = extractStorageId(driveItem.remoteItem.id)

  const shareTypes = uniq(
    driveItem.remoteItem.permissions.map((p) =>
      p.grantedToV2.group ? ShareTypes.group.value : ShareTypes.user.value
    )
  )

  const sharedWith = driveItem.remoteItem.permissions.map(({ grantedToV2 }) => {
    const identity = grantedToV2.group || grantedToV2.user
    return {
      ...identity,
      shareType: grantedToV2.group ? ShareTypes.group.value : ShareTypes.user.value
    }
  })

  const shareRoles = getShareResourceRoles({ driveItem, graphRoles })
  const sharePermissions = getShareResourcePermissions({ driveItem, shareRoles })

  const resource: IncomingShareResource = {
    id: driveItem.remoteItem.permissions[0].id,
    shareId: driveItem.remoteItem.permissions[0].id,
    path: '/',
    name: resourceName,
    fileId: driveItem.remoteItem.id,
    storageId,
    parentFolderId: driveItem.parentReference?.id,
    sdate: driveItem.lastModifiedDateTime, // FIXME: share date is missing in API
    indicators: [],
    tags: [],
    webDavPath: buildWebDavSpacesPath([SHARE_JAIL_ID, driveItem.id].join('!'), '/'),
    sharedBy:
      driveItem.remoteItem.permissions[0].invitation?.invitedBy.user ||
      driveItem.remoteItem.permissions[0].invitation?.invitedBy.group,
    owner: driveItem.remoteItem.createdBy?.user,
    sharedWith,
    shareTypes,
    isFolder: !!driveItem.folder,
    type: !!driveItem.folder ? 'folder' : 'file',
    mimeType: driveItem.file?.mimeType || 'httpd/unix-directory',
    syncEnabled: driveItem['@client.synchronize'],
    hidden: driveItem['@ui.hidden'],
    shareRoles,
    sharePermissions,
    outgoing: false,
    canRename: () => driveItem['@client.synchronize'],
    canDownload: () => sharePermissions.includes(GraphSharePermission.readBasic),
    canUpload: () => sharePermissions.includes(GraphSharePermission.createUpload),
    canCreate: () => sharePermissions.includes(GraphSharePermission.createChildren),
    canBeDeleted: () => sharePermissions.includes(GraphSharePermission.deleteStandard),
    canEditTags: () => sharePermissions.includes(GraphSharePermission.createChildren),
    isMounted: () => false,
    isReceivedShare: () => true,
    canShare: () => false,
    canDeny: () => false,
    getDomSelector: () => extractDomSelector(driveItem.id)
  }

  resource.extension = extractExtensionFromFile(resource)

  return resource
}

export function buildOutgoingShareResource({
  driveItem,
  user
}: {
  driveItem: DriveItem
  user: User
}): OutgoingShareResource {
  const storageId = extractStorageId(driveItem.id)
  const path = urlJoin(driveItem.parentReference.path, driveItem.name)

  const resource: OutgoingShareResource = {
    id: driveItem.permissions[0].id,
    shareId: driveItem.permissions[0].id,
    path,
    name: driveItem.name,
    fileId: driveItem.id,
    storageId,
    parentFolderId: driveItem.parentReference?.id,
    sdate: driveItem.lastModifiedDateTime, // FIXME: share date is missing in API
    indicators: [],
    tags: [],
    webDavPath: buildWebDavSpacesPath(storageId, path),
    sharedBy: { id: user.id, displayName: user.displayName },
    owner: { id: user.id, displayName: user.displayName },
    sharedWith: driveItem.permissions.map((p) => {
      if (p.link) {
        return {
          id: p.id,
          displayName: p.link['@libre.graph.displayName'],
          shareType: ShareTypes.link.value
        }
      }
      if (p.grantedToV2.group) {
        return { ...p.grantedToV2.group, shareType: ShareTypes.group.value }
      }
      return { ...p.grantedToV2.user, shareType: ShareTypes.user.value }
    }),
    shareTypes: driveItem.permissions.map((p) => {
      if (p.link) {
        return ShareTypes.link.value
      }
      if (p.grantedToV2.group) {
        return ShareTypes.group.value
      }
      return ShareTypes.user.value
    }),
    isFolder: !!driveItem.folder,
    type: !!driveItem.folder ? 'folder' : 'file',
    mimeType: driveItem.file?.mimeType || 'httpd/unix-directory',
    outgoing: true,
    canRename: () => true,
    canDownload: () => true,
    canUpload: () => true,
    canCreate: () => true,
    canBeDeleted: () => true,
    canEditTags: () => true,
    isMounted: () => false,
    isReceivedShare: () => true,
    canShare: () => true,
    canDeny: () => true,
    getDomSelector: () => extractDomSelector(driveItem.id)
  }

  resource.extension = extractExtensionFromFile(resource)

  return resource
}

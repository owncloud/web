import orderBy from 'lodash-es/orderBy'
import path from 'path'
import { DateTime } from 'luxon'
import { getIndicators } from './statusIndicators'
import { DavPermission, DavProperty } from 'web-pkg/src/constants'
import {
  LinkShareRoles,
  PeopleShareRoles,
  SharePermissions,
  Share,
  ShareStatus,
  ShareTypes,
  SpacePeopleShareRoles,
  spaceRoleEditor,
  spaceRoleManager,
  spaceRoleViewer,
  spaceRoleDeny
} from './share'
import {
  extractDomSelector,
  extractExtensionFromFile,
  extractStorageId,
  Resource
} from './resource'
import { User } from './user'
import { SHARE_JAIL_ID } from '../services/folder'

export function renameResource(resource, newName, newPath) {
  let resourcePath = '/' + newPath + newName
  if (resourcePath.startsWith('/files') || resourcePath.startsWith('/space')) {
    resourcePath = resourcePath.split('/').splice(3).join('/')
  }

  resource.name = newName
  resource.path = '/' + resourcePath
  resource.webDavPath = '/' + newPath + newName
  resource.extension = extractExtensionFromFile(resource)

  return resource
}

export function buildResource(resource): Resource {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const extension = extractExtensionFromFile(resource)
  let resourcePath

  if (resource.name.startsWith('/files') || resource.name.startsWith('/space')) {
    resourcePath = resource.name.split('/').slice(3).join('/')
  } else {
    resourcePath = resource.name
  }

  if (!resourcePath.startsWith('/')) {
    resourcePath = `/${resourcePath}`
  }

  const id = resource.fileInfo[DavProperty.FileId]

  return {
    id,
    fileId: resource.fileInfo[DavProperty.FileId],
    storageId: extractStorageId(resource.fileInfo[DavProperty.FileId]),
    mimeType: resource.fileInfo[DavProperty.MimeType],
    name: path.basename(resource.name),
    extension: isFolder ? '' : extension,
    path: resourcePath,
    webDavPath: resource.name,
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    mdate: resource.fileInfo[DavProperty.LastModifiedDate],
    size: isFolder
      ? resource.fileInfo[DavProperty.ContentSize]
      : resource.fileInfo[DavProperty.ContentLength],
    indicators: [],
    permissions: resource.fileInfo[DavProperty.Permissions] || '',
    starred: resource.fileInfo[DavProperty.IsFavorite] !== '0',
    etag: resource.fileInfo[DavProperty.ETag],
    sharePermissions: resource.fileInfo[DavProperty.SharePermissions],
    shareTypes: (function () {
      if (resource.fileInfo[DavProperty.ShareTypes]) {
        return resource.fileInfo[DavProperty.ShareTypes].map((v) => parseInt(v))
      }
      return []
    })(),
    privateLink: resource.fileInfo[DavProperty.PrivateLink],
    downloadURL: resource.fileInfo[DavProperty.DownloadURL],
    ownerDisplayName: resource.fileInfo[DavProperty.OwnerDisplayName],
    ownerId: resource.fileInfo[DavProperty.OwnerId],
    canUpload: function () {
      return this.permissions.indexOf(DavPermission.FolderCreateable) >= 0
    },
    canDownload: function () {
      return true
    },
    canBeDeleted: function () {
      return this.permissions.indexOf(DavPermission.Deletable) >= 0
    },
    canRename: function () {
      return this.permissions.indexOf(DavPermission.Renameable) >= 0
    },
    canShare: function () {
      return this.permissions.indexOf(DavPermission.Shareable) >= 0
    },
    canCreate: function () {
      return this.permissions.indexOf(DavPermission.FolderCreateable) >= 0
    },
    isMounted: function () {
      return this.permissions.indexOf(DavPermission.Mounted) >= 0
    },
    isReceivedShare: function () {
      return this.permissions.indexOf(DavPermission.Shared) >= 0
    },
    canDeny: function () {
      return this.permissions.indexOf(DavPermission.Deny) >= 0
    },
    getDomSelector: () => extractDomSelector(id)
  }
}

export function buildSpace(space) {
  let spaceImageData, spaceReadmeData
  let disabled = false
  const spaceRoles = Object.fromEntries(SpacePeopleShareRoles.list().map((role) => [role.name, []]))

  if (space.special) {
    spaceImageData = space.special.find((el) => el.specialFolder.name === 'image')
    spaceReadmeData = space.special.find((el) => el.specialFolder.name === 'readme')

    if (spaceImageData) {
      spaceImageData.webDavUrl = decodeURI(spaceImageData.webDavUrl)
    }

    if (spaceReadmeData) {
      spaceReadmeData.webDavUrl = decodeURI(spaceReadmeData.webDavUrl)
    }
  }

  if (space.root?.permissions) {
    for (const permission of space.root.permissions) {
      for (const role of SpacePeopleShareRoles.list()) {
        if (permission.roles.includes(role.name)) {
          spaceRoles[role.name].push(...permission.grantedTo.map((el) => el.user.id))
        }
      }
    }

    if (space.root.deleted) {
      disabled = space.root.deleted?.state === 'trashed'
    }
  }
  return {
    id: space.id,
    fileId: '',
    storageId: space.id,
    mimeType: '',
    name: space.name,
    description: space.description,
    extension: '',
    path: '',
    webDavPath: buildWebDavSpacesPath(space.id, ''),
    driveType: space.driveType,
    type: 'space',
    isFolder: true,
    mdate: space.lastModifiedDateTime,
    size: '',
    indicators: [],
    permissions: '',
    starred: false,
    etag: '',
    sharePermissions: '',
    shareTypes: (function () {
      return []
    })(),
    privateLink: '',
    downloadURL: '',
    ownerDisplayName: '',
    ownerId: space.owner?.user?.id,
    disabled,
    spaceQuota: space.quota,
    spaceRoles,
    spaceMemberIds: Object.values(spaceRoles).reduce((arr, ids) => arr.concat(ids), []),
    spaceImageData,
    spaceReadmeData,
    canUpload: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canDownload: function () {
      return true
    },
    canBeDeleted: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canRename: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditDescription: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canRestore: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canDisable: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return !this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canShare: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditImage: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditReadme: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditQuota: function ({ user }: { user?: User } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canCreate: function () {
      return true
    },
    isMounted: function () {
      return true
    },
    isReceivedShare: function () {
      return false
    },
    canDeny: function () {
      return false // FIXME
    },
    getDomSelector: () => extractDomSelector(space.id)
  }
}

export function buildWebDavFilesPath(userId, path) {
  return '/' + `files/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavFilesTrashPath(userId, path = '') {
  return '/' + `trash-bin/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavSpacesPath(storageId, path) {
  return '/' + `spaces/${storageId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavSpacesTrashPath(storageId, path = '') {
  return '/' + `/spaces/trash-bin/${storageId}/${path}`.split('/').filter(Boolean).join('/')
}

export function attachIndicators(resource, sharesTree) {
  return (resource.indicators = getIndicators(resource, sharesTree))
}

/**
 * Transforms given shares into a resource format and returns only their unique occurences
 * @param {Array} shares Shares to be transformed into unique resources
 * @param {Boolean} incomingShares Asserts whether the shares are incoming
 * @param {Boolean} allowSharePermission Asserts whether the reshare permission is available
 * @param {Boolean} hasShareJail Asserts whether the share jail is available backend side
 */
export function aggregateResourceShares(
  shares,
  incomingShares = false,
  allowSharePermission,
  hasShareJail
): Resource[] {
  if (incomingShares) {
    shares = addSharedWithToShares(shares)
    return orderBy(shares, ['file_target', 'permissions'], ['asc', 'desc']).map((share) =>
      buildSharedResource(share, incomingShares, allowSharePermission, hasShareJail)
    )
  }

  shares.sort((a, b) => a.path.localeCompare(b.path))
  const resources = addSharedWithToShares(shares)
  return resources.map((share) =>
    buildSharedResource(share, incomingShares, allowSharePermission, hasShareJail)
  )
}

function addSharedWithToShares(shares) {
  const resources = []
  let previousShare = null
  for (const share of shares) {
    if (
      previousShare?.storage_id === share.storage_id &&
      previousShare?.file_source === share.file_source
    ) {
      if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [parseInt(share.share_type)])) {
        previousShare.sharedWith.push({
          username: share.share_with,
          name: share.share_with_displayname,
          displayName: share.share_with_displayname,
          avatar: undefined,
          shareType: parseInt(share.share_type)
        })
      } else if (parseInt(share.share_type) === ShareTypes.link.value) {
        previousShare.sharedWith.push({
          name: share.name || share.token,
          link: true,
          shareType: parseInt(share.share_type)
        })
      }

      continue
    }

    if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [parseInt(share.share_type)])) {
      share.sharedWith = [
        {
          username: share.share_with,
          displayName: share.share_with_displayname,
          name: share.share_with_displayname,
          avatar: undefined,
          shareType: parseInt(share.share_type)
        }
      ]
    } else if (parseInt(share.share_type) === ShareTypes.link.value) {
      share.sharedWith = [
        {
          name: share.name || share.token,
          link: true,
          shareType: parseInt(share.share_type)
        }
      ]
    }

    previousShare = share
    resources.push(share)
  }
  return resources
}

export function buildSharedResource(
  share,
  incomingShares = false,
  allowSharePermission = true,
  hasShareJail = false
): Resource {
  const isFolder = share.item_type === 'folder'
  const resource: Resource = {
    id: share.id,
    fileId: share.item_source,
    storageId: extractStorageId(share.item_source),
    type: share.item_type,
    mimeType: parseInt(share.state) === 0 ? share.mimetype : '',
    isFolder,
    sdate: DateTime.fromSeconds(parseInt(share.stime)).toRFC2822(),
    indicators: [],
    path: undefined,
    webDavPath: undefined
  }

  if (incomingShares) {
    resource.resourceOwner = {
      username: share.uid_file_owner as string,
      displayName: share.displayname_file_owner as string
    }
    resource.owner = [
      {
        username: share.uid_owner as string,
        displayName: share.displayname_owner as string,
        avatar: undefined,
        shareType: ShareTypes.user.value
      }
    ]
    resource.sharedWith = share.sharedWith || []
    resource.status = parseInt(share.state)
    resource.name = path.basename(share.file_target)
    if (hasShareJail) {
      // FIXME, HACK 1: path needs to be '/' because the share has it's own webdav endpoint (we access it's root). should ideally be removed backend side.
      // FIXME, HACK 2: webDavPath points to `files/<user>/Shares/xyz` but now needs to point to a shares webdav root. should ideally be changed backend side.
      resource.path = '/'
      resource.webDavPath = buildWebDavSpacesPath([SHARE_JAIL_ID, resource.id].join('!'), '/')
    } else {
      resource.path = share.file_target
      resource.webDavPath = buildWebDavFilesPath(share.share_with, share.file_target)
    }
    resource.canDownload = () => parseInt(share.state) === ShareStatus.accepted
    resource.canShare = () => SharePermissions.share.enabled(share.permissions)
    resource.canRename = () => SharePermissions.update.enabled(share.permissions)
    resource.canBeDeleted = () => SharePermissions.delete.enabled(share.permissions)
  } else {
    resource.sharedWith = share.sharedWith || []
    resource.shareOwner = share.uid_owner
    resource.shareOwnerDisplayname = share.displayname_owner
    resource.name = path.basename(share.path)
    resource.path = share.path
    resource.webDavPath = buildWebDavFilesPath(share.uid_owner, share.path)
    resource.canDownload = () => true
    resource.canShare = () => true
    resource.canRename = () => true
    resource.canBeDeleted = () => true
    resource.canDeny = () => SharePermissions.deny.enabled(share.permissions)
  }

  resource.extension = extractExtensionFromFile(resource)
  resource.isReceivedShare = () => incomingShares
  resource.canUpload = () => true
  resource.isMounted = () => false
  resource.share = buildShare(share, resource, allowSharePermission)
  resource.getDomSelector = () => extractDomSelector(share.id)

  return resource
}

export function buildShare(s, file, allowSharePermission): Share {
  if (parseInt(s.share_type) === ShareTypes.link.value) {
    return _buildLink(s)
  }
  if (parseInt(s.share_type) === ShareTypes.space.value) {
    return buildSpaceShare(s, file)
  }

  return buildCollaboratorShare(s, file, allowSharePermission)
}

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
    case spaceRoleDeny.name:
      permissions = spaceRoleDeny.bitmask(true)
      role = spaceRoleDeny
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
    role
  }
}

function _buildLink(link): Share {
  let description = ''

  const role = LinkShareRoles.getByBitmask(parseInt(link.permissions), link.item_type === 'folder')
  if (role) {
    description = role.label
  }

  const quicklinkOc10 = ((): boolean => {
    if (typeof link.attributes !== 'string') {
      return false
    }

    return (
      JSON.parse(link.attributes || '[]').find((attr) => attr.key === 'isQuickLink')?.enabled ===
      'true'
    )
  })()
  const quicklinkOcis = link.quicklink === 'true'
  const quicklink = quicklinkOc10 || quicklinkOcis

  return {
    shareType: parseInt(link.share_type),
    id: link.id,
    token: link.token as string,
    url: link.url,
    path: link.path,
    permissions: link.permissions,
    description,
    quicklink,
    stime: link.stime,
    name: typeof link.name === 'string' ? link.name : (link.token as string),
    password: !!(link.share_with && link.share_with_displayname),
    expiration:
      typeof link.expiration === 'string'
        ? DateTime.fromFormat(link.expiration, 'yyyy-MM-dd HH:mm:ss').toFormat('yyyy-MM-dd')
        : null,
    itemSource: link.item_source,
    file: {
      parent: link.file_parent,
      source: link.file_source,
      target: link.file_target
    }
  }
}

function _fixAdditionalInfo(data) {
  if (typeof data !== 'string') {
    return null
  }
  return data
}

export function buildCollaboratorShare(s, file, allowSharePermission): Share {
  const share: Share = {
    shareType: parseInt(s.share_type),
    id: s.id
  }
  if (
    ShareTypes.containsAnyValue(
      [ShareTypes.user, ShareTypes.remote, ShareTypes.group, ShareTypes.guest],
      [share.shareType]
    )
  ) {
    // FIXME: SDK is returning empty object for additional info when empty
    share.collaborator = {
      name: s.share_with,
      displayName: s.share_with_displayname,
      additionalInfo: _fixAdditionalInfo(s.share_with_additional_info)
    }
    share.owner = {
      name: s.uid_owner,
      displayName: s.displayname_owner,
      additionalInfo: _fixAdditionalInfo(s.additional_info_owner)
    }
    share.fileOwner = {
      name: s.uid_file_owner,
      displayName: s.displayname_file_owner,
      additionalInfo: _fixAdditionalInfo(s.additional_info_file_owner)
    }
    share.stime = s.stime
    share.permissions = parseInt(s.permissions)
    share.customPermissions = SharePermissions.bitmaskToPermissions(s.permissions)
    share.role = PeopleShareRoles.getByBitmask(
      parseInt(s.permissions),
      file.isFolder,
      allowSharePermission
    )
    // share.email = 'foo@djungle.com' // hm, where do we get the mail from? share_with_additional_info:Object?
  }

  // expiration:Object if unset, or string "2019-04-24 00:00:00"
  if (typeof s.expiration === 'string' || s.expiration instanceof String) {
    share.expires = new Date(s.expiration)
  }
  share.path = s.path

  return share
}

export function buildDeletedResource(resource): Resource {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const fullName = resource.fileInfo[DavProperty.TrashbinOriginalFilename]
  const extension = extractExtensionFromFile({ name: fullName, type: resource.type } as Resource)
  const id = path.basename(resource.name)
  return {
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    ddate: resource.fileInfo[DavProperty.TrashbinDeletedDate],
    name: path.basename(fullName),
    extension,
    path: resource.fileInfo[DavProperty.TrashbinOriginalLocation],
    id,
    indicators: [],
    canUpload: () => false,
    canDownload: () => false,
    canBeDeleted: () => {
      /** FIXME: once https://github.com/owncloud/ocis/issues/3339 gets implemented,
       * we want to add a check if the permission is set.
       * We might to be careful and do an early return true if DavProperty.Permissions is not set
       * as oc10 does not support it.
       **/
      return true
    },
    canBeRestored: function () {
      /** FIXME: once https://github.com/owncloud/ocis/issues/3339 gets implemented,
       * we want to add a check if the permission is set.
       * We might to be careful and do an early return true if DavProperty.Permissions is not set
       * as oc10 does not support it.
       **/
      return true
    },
    canRename: () => false,
    canShare: () => false,
    canCreate: () => false,
    isMounted: () => false,
    isReceivedShare: () => false,
    getDomSelector: () => extractDomSelector(id)
  }
}

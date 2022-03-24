import orderBy from 'lodash-es/orderBy'
import path from 'path'
import { DateTime } from 'luxon'
import { getIndicators } from './statusIndicators'
import { $gettext } from '../gettext'
import { DavPermission, DavProperty } from 'web-pkg/src/constants'
import {
  PeopleShareRoles,
  SharePermissions,
  ShareStatus,
  ShareTypes,
  SpacePeopleShareRoles,
  spaceRoleEditor,
  spaceRoleManager,
  spaceRoleViewer
} from './share'
import { extractStorageId } from './resource'

function _getFileExtension(name) {
  const extension = path.extname(name)
  if (!extension) {
    return ''
  }
  return extension.replace(/^(.)/, '')
}

export function renameResource(resource, newName, newPath) {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const extension = _getFileExtension(newName)

  let resourcePath = '/' + newPath + newName
  if (resourcePath.startsWith('/files') || resourcePath.startsWith('/space')) {
    resourcePath = resourcePath.split('/').splice(3).join('/')
  }

  resource.name = newName
  resource.path = resourcePath
  resource.webDavPath = '/' + newPath + newName
  resource.extension = isFolder ? '' : extension

  return resource
}

export function buildResource(resource) {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const extension = _getFileExtension(resource.name)
  let resourcePath

  if (resource.name.startsWith('/files') || resource.name.startsWith('/space')) {
    resourcePath = resource.name.split('/').slice(3).join('/')
  } else {
    resourcePath = resource.name
  }

  if (!resourcePath.startsWith('/')) {
    resourcePath = `/${resourcePath}`
  }

  return {
    id: resource.fileInfo[DavProperty.FileId],
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
    }
  }
}

export function buildSpace(space) {
  let spaceImageData, spaceReadmeData
  let disabled = false
  const spaceRoles = SpacePeopleShareRoles.list().reduce((obj, role) => {
    obj[role.name] = []
    return obj
  }, {})

  if (space.special) {
    spaceImageData = space.special.find((el) => el.specialFolder.name === 'image')
    spaceReadmeData = space.special.find((el) => el.specialFolder.name === 'readme')
  }

  if (space.root) {
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
    webDavPath: '',
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
    ownerId: '',
    disabled,
    spaceQuota: space.quota,
    spaceRoles,
    spaceMemberIds: Object.values(spaceRoles).reduce((arr, ids) => arr.concat(ids), []),
    spaceImageData,
    spaceReadmeData,
    canUpload: function ({ user } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canDownload: function () {
      return true
    },
    canBeDeleted: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canRename: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditDescription: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canRestore: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canDisable: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return !this.disabled && user && allowedRoles.includes(user.uuid)
    },
    canShare: function ({ user } = {}) {
      const allowedRoles = [...this.spaceRoles[spaceRoleManager.name]]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditImage: function ({ user } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditReadme: function ({ user } = {}) {
      const allowedRoles = [
        ...this.spaceRoles[spaceRoleManager.name],
        ...this.spaceRoles[spaceRoleEditor.name]
      ]
      return user && allowedRoles.includes(user.uuid)
    },
    canEditQuota: function ({ user } = {}) {
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
    }
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
 * @param {String} server The url of the backend
 * @param {String} token The access token of the authenticated user
 */
export function aggregateResourceShares(
  shares,
  incomingShares = false,
  allowSharePermission,
  server,
  token
) {
  if (incomingShares) {
    return orderBy(shares, ['file_target', 'permissions'], ['asc', 'desc']).map((share) =>
      buildSharedResource(share, incomingShares, allowSharePermission)
    )
  }

  shares.sort((a, b) => a.path.localeCompare(b.path))

  const resources = []
  let previousShare = null
  for (const share of shares) {
    if (
      previousShare?.storage_id === share.storage_id &&
      previousShare?.file_source === share.file_source
    ) {
      if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [share.share_type])) {
        previousShare.sharedWith.push({
          username: share.share_with,
          name: share.share_with_displayname,
          displayName: share.share_with_displayname,
          avatar: undefined,
          shareType: share.share_type
        })
      } else if (share.share_type === ShareTypes.link.value) {
        previousShare.sharedWith.push({
          name: share.name || share.token,
          link: true,
          shareType: share.share_type
        })
      }

      continue
    }

    if (ShareTypes.containsAnyValue(ShareTypes.authenticated, [share.share_type])) {
      share.sharedWith = [
        {
          username: share.share_with,
          displayName: share.share_with_displayname,
          name: share.share_with_displayname,
          avatar: undefined,
          shareType: share.share_type
        }
      ]
    } else if (share.share_type === ShareTypes.link.value) {
      share.sharedWith = [
        {
          name: share.name || share.token,
          link: true,
          shareType: share.share_type
        }
      ]
    }

    previousShare = share
    resources.push(share)
  }

  return resources.map((share) => buildSharedResource(share, incomingShares, allowSharePermission))
}

export function buildSharedResource(share, incomingShares = false, allowSharePermission) {
  const isFolder = share.item_type === 'folder'
  const resource = {
    id: share.id,
    fileId: share.item_source,
    storageId: extractStorageId(share.item_source),
    type: share.item_type,
    mimeType: share.state === 0 ? share.mimetype : '',
    isFolder,
    sdate: DateTime.fromSeconds(share.stime).toRFC2822(),
    indicators: []
  }

  if (incomingShares) {
    resource.resourceOwner = {
      username: share.uid_file_owner,
      displayName: share.displayname_file_owner
    }
    resource.owner = [
      {
        username: share.uid_owner,
        displayName: share.displayname_owner,
        avatar: undefined,
        shareType: ShareTypes.user.value
      }
    ]

    resource.status = share.state
    resource.name = path.basename(share.file_target)
    resource.path = share.file_target
    resource.webDavPath = buildWebDavFilesPath(share.share_with, share.file_target)
    resource.canDownload = () => share.state === ShareStatus.accepted
    resource.canShare = () => SharePermissions.share.enabled(share.permissions)
    resource.canRename = () => SharePermissions.update.enabled(share.permissions)
    resource.canBeDeleted = () => SharePermissions.delete.enabled(share.permissions)
  } else {
    resource.sharedWith = share.sharedWith
    resource.shareOwner = share.uid_owner
    resource.shareOwnerDisplayname = share.displayname_owner
    resource.name = path.basename(share.path)
    resource.path = share.path
    resource.webDavPath = buildWebDavFilesPath(share.uid_owner, share.path)
    resource.canDownload = () => true
    resource.canShare = () => true
    resource.canRename = () => true
    resource.canBeDeleted = () => true
  }

  resource.extension = isFolder ? '' : _getFileExtension(resource.name)
  resource.isReceivedShare = () => incomingShares
  resource.canUpload = () => true
  resource.isMounted = () => false
  resource.share = buildShare(share, resource, allowSharePermission)

  return resource
}

export function buildShare(s, file, allowSharePermission) {
  if (parseInt(s.share_type) === ShareTypes.link.value) {
    return _buildLink(s)
  }
  if (parseInt(s.share_type) === ShareTypes.space.value) {
    return buildSpaceShare(s, file)
  }

  return buildCollaboratorShare(s, file, allowSharePermission)
}

export function buildSpaceShare(s, storageId) {
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
    role
  }
}

function _buildLink(link) {
  let description = ''

  // FIXME: use bitmask matching with constants
  switch (parseInt(link.permissions)) {
    case 1: // read (1)
      description = $gettext('Viewer')
      break
    case 3: // read (1) + update (2)
      description = $gettext('Editor')
      break
    case 5: // read (1) + create (4)
      description = $gettext('Contributor')
      break
    case 4: // create (4)
      description = $gettext('Uploader')
      break
    case 15: // read (1) + update (2) + create (4) + delete (8)
      description = $gettext('Editor')
      break
  }

  return {
    shareType: parseInt(link.share_type),
    id: link.id,
    token: link.token,
    url: link.url,
    path: link.path,
    permissions: link.permissions,
    description,
    stime: link.stime,
    name: typeof link.name === 'string' ? link.name : '',
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

export function buildCollaboratorShare(s, file, allowSharePermission) {
  const share = {
    shareType: parseInt(s.share_type),
    id: s.id
  }
  if (
    ShareTypes.containsAnyValue(
      [ShareTypes.user, ShareTypes.remote, ShareTypes.group],
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

export function buildDeletedResource(resource) {
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const fullName = resource.fileInfo[DavProperty.TrashbinOriginalFilename]
  const extension = isFolder ? '' : _getFileExtension(fullName)
  return {
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    ddate: resource.fileInfo[DavProperty.TrashbinDeletedDate],
    name: path.basename(fullName),
    extension,
    path: resource.fileInfo[DavProperty.TrashbinOriginalLocation],
    id: path.basename(resource.name),
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
    isReceivedShare: () => false
  }
}

import orderBy from 'lodash-es/orderBy'
import path, { basename, join } from 'path'
import { DateTime } from 'luxon'
import { DavProperty } from 'web-client/src/webdav/constants'
import {
  LinkShareRoles,
  PeopleShareRoles,
  SharePermissions,
  Share,
  ShareStatus,
  ShareTypes,
  buildSpaceShare
} from 'web-client/src/helpers/share'
import {
  buildWebDavSpacesPath,
  extractDomSelector,
  extractExtensionFromFile,
  extractStorageId
} from 'web-client/src/helpers/resource'
import { Resource, SpaceResource, SHARE_JAIL_ID } from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'

export function renameResource(space: SpaceResource, resource: Resource, newPath: string) {
  resource.name = basename(newPath)
  resource.path = newPath
  resource.webDavPath = join(space.webDavPath, newPath)
  resource.extension = extractExtensionFromFile(resource)
  return resource
}

export function buildWebDavFilesPath(userId, path) {
  return '/' + `files/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavFilesTrashPath(userId, path = '') {
  return '/' + `trash-bin/${userId}/${path}`.split('/').filter(Boolean).join('/')
}

export function isResourceTxtFileAlmostEmpty(resource: Resource): boolean {
  const mimeType = resource.mimeType || ''
  return mimeType.startsWith('text/') && (resource.size as number) < 30
}

/**
 * Transforms given shares into a resource format and returns only their unique occurences
 * @param {Array} shares Shares to be transformed into unique resources
 * @param {Boolean} incomingShares Asserts whether the shares are incoming
 * @param {Boolean} allowSharePermission Asserts whether the reshare permission is available
 * @param {Boolean} hasShareJail Asserts whether the share jail is available backend side
 * @param {Array} spaces A list of spaces the current user has access to
 */
export function aggregateResourceShares(
  shares,
  incomingShares = false,
  allowSharePermission,
  hasShareJail,
  spaces = []
): Resource[] {
  shares.sort((a, b) => a.path.localeCompare(b.path))
  if (spaces.length) {
    shares = addMatchingSpaceToShares(shares, spaces)
  }
  if (incomingShares) {
    shares = addSharedWithToShares(shares)
    return orderBy(shares, ['file_source', 'permissions'], ['asc', 'desc']).map((share) => {
      const resource = buildSharedResource(
        share,
        incomingShares,
        allowSharePermission,
        hasShareJail
      )
      resource.shareId = share.id
      return resource
    })
  }

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

function addMatchingSpaceToShares(shares, spaces) {
  const resources = []
  for (const share of shares) {
    let matchingSpace
    if (share.path === '/') {
      const storageId = extractStorageId(share.item_source)
      matchingSpace = spaces.find((s) => s.id === storageId && s.driveType === 'project')
    }
    resources.push({ ...share, matchingSpace })
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
  let resource: Resource = {
    id: share.id,
    fileId: share.item_source,
    storageId: extractStorageId(share.item_source),
    parentFolderId: share.file_parent,
    type: share.item_type,
    mimeType: share.mimetype,
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
    resource.name = share.share_type === "6" ? share.name : path.basename(share.file_target)
    if (hasShareJail) {
      // FIXME, HACK 1: path needs to be '/' because the share has it's own webdav endpoint (we access it's root). should ideally be removed backend side.
      // FIXME, HACK 2: webDavPath points to `files/<user>/Shares/xyz` but now needs to point to a shares webdav root. should ideally be changed backend side.
      resource.path = '/'
      resource.webDavPath = buildWebDavSpacesPath([SHARE_JAIL_ID, resource.id].join('!'), '/')
    } else {
      resource.path = share.file_target
      resource.webDavPath = buildWebDavFilesPath(share.share_with, share.file_target)
    }
    resource.canDownload = () => parseInt(share.state) !== ShareStatus.declined
    resource.canShare = () => SharePermissions.share.enabled(share.permissions)
    resource.canRename = () => parseInt(share.state) !== ShareStatus.declined
    resource.canBeDeleted = () => SharePermissions.delete.enabled(share.permissions)
    resource.canEditTags = () =>
      parseInt(share.state) !== ShareStatus.declined &&
      SharePermissions.update.enabled(share.permissions)
  } else {
    resource.sharedWith = share.sharedWith || []
    resource.shareOwner = share.uid_owner
    resource.shareOwnerDisplayname = share.displayname_owner
    resource.name = share.share_type === "6" ? share.name : path.basename(share.path)
    resource.path = share.path
    resource.webDavPath = hasShareJail
      ? buildWebDavSpacesPath(resource.storageId, share.path)
      : buildWebDavFilesPath(share.uid_owner, share.path)
    resource.canDownload = () => true
    resource.canShare = () => true
    resource.canRename = () => true
    resource.canBeDeleted = () => true
    resource.canEditTags = () => true
  }

  resource.extension = extractExtensionFromFile(resource)
  resource.isReceivedShare = () => incomingShares
  resource.canUpload = () => SharePermissions.create.enabled(share.permissions)
  resource.isMounted = () => false
  resource.share = buildShare(share, resource, allowSharePermission)
  resource.canDeny = () => SharePermissions.denied.enabled(share.permissions)
  resource.getDomSelector = () => extractDomSelector(share.id)

  if (share.matchingSpace) {
    resource = { ...resource, ...share.matchingSpace }
  }

  return resource
}

export function buildShare(s, file, allowSharePermission): Share {
  if (parseInt(s.share_type) === ShareTypes.link.value) {
    return _buildLink(s)
  }
  if ([ShareTypes.spaceUser.value, ShareTypes.spaceGroup.value].includes(parseInt(s.share_type))) {
    return buildSpaceShare(s, file)
  }

  return buildCollaboratorShare(s, file, allowSharePermission)
}

function _buildLink(link): Share {
  let description = ''
  const permissions = parseInt(link.permissions)

  const role = LinkShareRoles.getByBitmask(permissions, link.item_type === 'folder')
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
    permissions,
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
    },
    notifyUploads: link.notify_uploads === 'true',
    notifyUploadsExtraRecipients:
      typeof link.notify_uploads_extra_recipients === 'string'
        ? link.notify_uploads_extra_recipients
        : null
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
    id: s.id,
    itemSource: s.item_source,
    file: {
      parent: s.file_parent,
      source: s.file_source,
      target: s.file_target
    }
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
      file.isFolder || file.type === 'folder',
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
    path: urlJoin(resource.fileInfo[DavProperty.TrashbinOriginalLocation], { leadingSlash: true }),
    id,
    parentFolderId: resource.fileInfo[DavProperty.FileParent],
    indicators: [],
    webDavPath: '',
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

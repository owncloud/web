import _ from 'lodash'
import path from 'path'
import moment from 'moment'

import fileIconMappings from '../fileTypeIconMappings.json'
import { getIndicators } from './statusIndicators'
import { bitmaskToRole, checkPermission, permissionsBitmask } from './collaborators'
import { shareTypes, userShareTypes } from './shareTypes'
import { $gettext } from '../gettext'
import { getAvatarSrc } from './user'

// Should we move this to ODS?
export function getFileIcon(extension) {
  const icon = fileIconMappings[extension]

  if (icon) {
    return icon
  }

  return 'file'
}

function _getFileExtension(name) {
  const extension = path.extname(name)
  if (!extension) {
    return ''
  }
  return extension.replace(/^(.)/, '').toLowerCase()
}

export function buildResource(resource) {
  const isFolder = resource.type === 'dir'
  const extension = _getFileExtension(resource.name)
  return {
    id: resource.fileInfo['{http://owncloud.org/ns}fileid'],
    icon: isFolder ? 'folder' : getFileIcon(extension),
    name: path.basename(resource.name),
    extension: isFolder ? '' : extension,
    path: resource.name,
    type: isFolder ? 'folder' : resource.type,
    mdate: resource.fileInfo['{DAV:}getlastmodified'],
    size: isFolder
      ? resource.fileInfo['{http://owncloud.org/ns}size']
      : resource.fileInfo['{DAV:}getcontentlength'],
    indicators: [],
    permissions: resource.fileInfo['{http://owncloud.org/ns}permissions'] || '',
    starred: resource.fileInfo['{http://owncloud.org/ns}favorite'] !== '0',
    etag: resource.fileInfo['{DAV:}getetag'],
    sharePermissions:
      resource.fileInfo['{http://open-collaboration-services.org/ns}share-permissions'],
    shareTypes: (function() {
      let shareTypes = resource.fileInfo['{http://owncloud.org/ns}share-types']
      if (shareTypes) {
        shareTypes = _.chain(shareTypes)
          .filter(
            xmlvalue =>
              xmlvalue.namespaceURI === 'http://owncloud.org/ns' &&
              xmlvalue.nodeName.split(':')[1] === 'share-type'
          )
          .map(xmlvalue => parseInt(xmlvalue.textContent || xmlvalue.text, 10))
          .value()
      }
      return shareTypes || []
    })(),
    privateLink: resource.fileInfo['{http://owncloud.org/ns}privatelink'],
    downloadURL: resource.fileInfo['{http://owncloud.org/ns}downloadURL'],
    canUpload: function() {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function() {
      // TODO: as soon as we allow folder downloads as archive we want to return `true` here without exceptions
      return !isFolder
    },
    canBeDeleted: function() {
      return this.permissions.indexOf('D') >= 0
    },
    canRename: function() {
      return this.permissions.indexOf('N') >= 0
    },
    canShare: function() {
      return this.permissions.indexOf('R') >= 0
    },
    canCreate: function() {
      return this.permissions.indexOf('C') >= 0
    },
    isMounted: function() {
      return this.permissions.indexOf('M') >= 0
    },
    isReceivedShare: function() {
      return this.permissions.indexOf('S') >= 0
    }
  }
}

export function attachIndicators(resource, sharesTree) {
  return (resource.indicators = getIndicators(resource, sharesTree))
}

/**
 * Transforms given shares into a resource format and returns only their unique occurences
 * @param {Array} shares Shares to be transformed into unique resources
 * @param {Boolean} incomingShares Asserts whether the shares are incoming
 * @param {Boolean} allowSharePerm Asserts whether the reshare permission is available
 * @param {String} server The url of the backend
 * @param {String} token The access token of the authenticated user
 * @param {Object} client The ownCloud SDK client
 * @param {Function} updateFn The closure action that gets called on update
 */
export function aggregateResourceShares(
  shares,
  incomingShares = false,
  allowSharePerm,
  server,
  token,
  client,
  updateFn
) {
  if (incomingShares) {
    return _.chain(shares)
      .orderBy(['file_target', 'permissions'], ['asc', 'desc'])
      .map(share =>
        buildSharedResource(share, incomingShares, allowSharePerm, server, token, client, updateFn)
      )
      .value()
  }

  shares.sort((a, b) => a.path.localeCompare(b.path))

  const resources = []
  let prev = null
  for (const share of shares) {
    if (prev && share.path === prev.path) {
      if (userShareTypes.includes(share.share_type)) {
        prev.sharedWith.push({
          username: share.share_with,
          displayName: share.share_with_displayname,
          avatar: undefined
        })
      } else if (share.share_type === shareTypes.link) {
        prev.sharedWith.push({
          name: share.name || share.token,
          link: true
        })
      }

      continue
    }

    if (userShareTypes.includes(share.share_type)) {
      share.sharedWith = [
        {
          username: share.share_with,
          displayName: share.share_with_displayname,
          avatar: undefined
        }
      ]
    } else if (share.share_type === shareTypes.link) {
      share.sharedWith = [
        {
          name: share.name || share.token,
          link: true
        }
      ]
    }

    prev = share
    resources.push(share)
  }

  return resources.map(share =>
    buildSharedResource(share, incomingShares, allowSharePerm, server, token, client, updateFn)
  )
}

export function buildSharedResource(
  share,
  incomingShares = false,
  allowSharePerm,
  server,
  token,
  client,
  updateFn
) {
  const resource = {
    id: share.item_source,
    type: share.item_type
  }
  const isFolder = resource.type === 'folder'

  if (incomingShares) {
    resource.resourceOwner = {
      username: share.uid_file_owner,
      displayName: share.displayname_file_owner
    }
    resource.owner = [
      {
        username: share.uid_owner,
        displayName: share.displayname_owner,
        avatar: undefined
      }
    ]

    resource.status = share.state
    resource.name = path.basename(share.file_target)
    resource.path = share.file_target
    resource.isReceivedShare = () => true
  } else {
    resource.sharedWith = share.sharedWith
    resource.shareOwner = share.uid_owner
    resource.shareOwnerDisplayname = share.displayname_owner
    resource.name = path.basename(share.path)
    resource.path = share.path
    // permissions irrelevant here
    resource.isReceivedShare = () => false
  }
  resource.extension = isFolder ? '' : _getFileExtension(resource.name)
  // FIXME: add actual permission parsing
  resource.canUpload = () => true
  resource.canBeDeleted = () => true
  resource.canRename = () => true
  resource.canShare = () => {
    return checkPermission(share.permissions, 'share')
  }
  resource.isMounted = () => false
  resource.canDownload = () => !isFolder
  resource.share = buildShare(share, resource, allowSharePerm)
  resource.indicators = []
  resource.icon = isFolder ? 'folder' : getFileIcon(resource.extension)
  resource.sdate = share.stime * 1000

  updateResource(async () => {
    const avatars = new Map()
    ;['sharedWith', 'owner'].forEach(k => {
      ;(resource[k] || []).forEach((obj, i) => {
        if (!_.has(obj, 'avatar')) {
          return
        }
        avatars.set(`${k}.[${i}].avatar`, obj.username)
      })
    })

    if (!avatars.size) {
      return
    }

    await Promise.all(
      Array.from(avatars).map(avatar =>
        (async () => {
          let url
          try {
            url = await getAvatarSrc(avatar[1], server, token, client)
          } catch (e) {
            avatars.delete(avatar[0])
            return
          }

          avatars.set(avatar[0], url)
        })()
      )
    )

    if (!avatars.size) {
      return
    }

    const cResource = _.cloneDeep(resource)
    avatars.forEach((value, key) => {
      _.set(cResource, key, value)
    })

    return cResource
  }, updateFn)

  return resource
}

export function buildShare(s, file, allowSharePerm) {
  if (parseInt(s.share_type, 10) === shareTypes.link) {
    return _buildLink(s)
  }
  return buildCollaboratorShare(s, file, allowSharePerm)
}

function _buildLink(link) {
  let description = ''

  // FIXME: use bitmask matching with constants
  switch (link.permissions) {
    case '1': // read (1)
      description = $gettext('Viewer')
      break
    case '5': // read (1) + create (4)
      description = $gettext('Contributor')
      break
    case '4': // create (4)
      description = $gettext('Uploader')
      break
    case '15': // read (1) + update (2) + create (4) + delete (8)
      description = $gettext('Editor')
      break
  }

  return {
    shareType: parseInt(link.share_type, 10),
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
      typeof link.expiration === 'string' ? moment(link.expiration).format('YYYY-MM-DD') : null,
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

export function buildCollaboratorShare(s, file, allowSharePerm) {
  const share = {
    shareType: parseInt(s.share_type, 10),
    id: s.id
  }
  switch (share.shareType) {
    case shareTypes.user: // user share
    // TODO differentiate groups from users?
    // fall through
    case shareTypes.remote:
    // fall through
    case shareTypes.group: // group share
      share.role = bitmaskToRole(s.permissions, file.type === 'folder', allowSharePerm)
      share.permissions = s.permissions
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
      // TODO: Refactor to work with roles / prepare for roles API
      share.customPermissions = {
        update: s.permissions & permissionsBitmask.update,
        create: s.permissions & permissionsBitmask.create,
        delete: s.permissions & permissionsBitmask.delete,
        share: s.permissions & permissionsBitmask.share
      }
      // share.email = 'foo@djungle.com' // hm, where do we get the mail from? share_with_additional_info:Object?
      break
  }

  // expiration:Object if unset, or string "2019-04-24 00:00:00"
  if (typeof s.expiration === 'string' || s.expiration instanceof String) {
    share.expires = new Date(s.expiration)
  }
  share.path = s.path

  return share
}

export function buildDeletedResource(resource) {
  const isFolder = resource.type === 'dir'
  const fullName = resource.fileInfo['{http://owncloud.org/ns}trashbin-original-filename']
  const extension = isFolder ? '' : _getFileExtension(fullName)
  return {
    type: isFolder ? 'folder' : resource.type,
    ddate: resource.fileInfo['{http://owncloud.org/ns}trashbin-delete-datetime'],
    name: path.basename(fullName),
    extension,
    path: resource.fileInfo['{http://owncloud.org/ns}trashbin-original-location'],
    id: path.basename(resource.name),
    icon: isFolder ? 'folder' : getFileIcon(extension),
    indicators: []
  }
}

export const updateResource = (task = async () => {}, cb = () => {}) => {
  ;(async () => {
    let val
    try {
      val = await task()
    } catch (e) {
      return
    }

    if (!val) {
      return
    }

    cb(val)
  })()
}

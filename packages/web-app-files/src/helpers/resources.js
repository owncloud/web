import _ from 'lodash'
import path from 'path'
import filesize from 'filesize'
import moment from 'moment'

import fileIconMappings from '../fileTypeIconMappings.json'
import { getIndicators } from './statusIndicators'
import { checkPermission, bitmaskToRole, permissionsBitmask } from '../helpers/collaborators'
import { shareTypes } from '../helpers/shareTypes'
import { $gettext } from '../gettext'
import { getAvatarSrc } from './user'

/**
 * Returns formatted size of given resource
 * @param {Number} size Unformatted size of the resource
 * @returns {String} formatted size
 */
export function getResourceSize(size) {
  if (size < 0) {
    return ''
  }

  if (isNaN(size)) {
    return '?'
  }

  const mb = 1048576

  // TODO: Pass current language as locale to display correct separator
  return filesize(size, {
    round: size < mb ? 0 : 1
  })
}

// Should we move this to ODS?
export function getFileIcon(extension) {
  const icon = fileIconMappings[extension.toLowerCase()]

  if (icon) {
    return icon
  }

  return 'file'
}

export function getFileExtension(name) {
  const dotIndex = name.lastIndexOf('.')

  return name.substring(dotIndex + 1)
}

export function buildResource(resource) {
  const builtResource = {
    id: resource.fileInfo['{http://owncloud.org/ns}fileid'],
    icon: resource.type === 'dir' ? 'folder' : getFileIcon(getFileExtension(resource.name)),
    name: (() => {
      const name = resource.name

      return name.includes('/') ? name.substring(name.lastIndexOf('/') + 1) : name
    })(),
    path: resource.name,
    type: resource.type === 'dir' ? 'folder' : resource.type,
    mdate: resource.fileInfo['{DAV:}getlastmodified'],
    size:
      resource.type === 'dir'
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
    canUpload: function() {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function() {
      return this.type !== 'folder'
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

  return builtResource
}

export function attatchIndicators(resource, sharesTree) {
  return (resource.indicators = getIndicators(resource, sharesTree))
}

/**
 * Transforms given shares into a resource format and returns only their unique occurences
 * @param {Arrau} data Shares to be transformed into unique resources
 * @param {Boolean} incomingShares Asserts whether the shares are incoming
 * @param {Boolean} allowSharePerm Asserts whether the reshare permission is available
 */
export function aggregateResourceShares(
  shares,
  incomingShares = false,
  allowSharePerm,
  server,
  token
) {
  return Promise.all(
    _(shares)
      .orderBy(['file_target', 'permissions'], ['asc', 'desc'])
      .uniqBy('file_target')
      .map(async share => {
        const resource = {
          id: share.item_source,
          type: share.item_type
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
              avatar: await getAvatarSrc(share.uid_file_owner, server, token)
            }
          ]
          resource.status = share.state
          resource.name = share.file_target.includes('/')
            ? share.file_target.substring(share.file_target.lastIndexOf('/') + 1)
            : share.file_target
          resource.path = share.file_target
          resource.isReceivedShare = () => true
        } else {
          resource.shareOwner = share.uid_owner
          resource.shareOwnerDisplayname = share.displayname_owner
          resource.name = path.basename(share.path)
          resource.basename = path.basename(share.path, resource.extension)
          resource.path = share.path
          // permissions irrelevant here
          resource.isReceivedShare = () => false
        }
        // FIXME: add actual permission parsing
        resource.canUpload = () => true
        resource.canBeDeleted = () => true
        resource.canRename = () => true
        resource.canShare = () => {
          return checkPermission(share.permissions, 'share')
        }
        resource.isMounted = () => false
        resource.canDownload = () => resource.type !== 'folder'
        if (resource.extension) {
          // remove extension from basename like _buildFile does
          resource.basename = resource.basename.substring(
            0,
            resource.basename.length - resource.extension.length - 1
          )
        }
        resource.share = _buildShare(share, resource, allowSharePerm)
        resource.indicators = []
        resource.icon =
          resource.type === 'folder' ? 'folder' : getFileIcon(getFileExtension(resource.name))
        resource.sdate = share.stime * 1000

        return resource
      })
  )
}

function _buildShare(s, file, allowSharePerm) {
  if (parseInt(s.share_type, 10) === shareTypes.link) {
    return _buildLink(s)
  }
  return _buildCollaboratorShare(s, file, allowSharePerm)
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

function _buildCollaboratorShare(s, file, allowSharePerm) {
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

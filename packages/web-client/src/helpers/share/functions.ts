import { DateTime } from 'luxon'
import { Resource } from '../resource'
import { ShareTypes } from './type'
import { SharePermissions } from './permission'
import { buildSpaceShare } from './space'
import { LinkShareRoles, PeopleShareRoles } from './role'
import { ShareResource, Share, OutgoingShareResource, IncomingShareResource } from './types'

export const isShareResource = (resource: Resource): resource is ShareResource => {
  return Object.hasOwn(resource, 'sharedWith')
}

export const isOutgoingShareResource = (resource: Resource): resource is OutgoingShareResource => {
  return isShareResource(resource) && resource.outgoing
}

export const isIncomingShareResource = (resource: Resource): resource is IncomingShareResource => {
  return isShareResource(resource) && !resource.outgoing
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

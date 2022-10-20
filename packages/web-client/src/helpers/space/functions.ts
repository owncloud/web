import { User } from '../user'
import { buildWebDavSpacesPath, extractDomSelector, extractNodeId, Resource } from '../resource'
import { SpacePeopleShareRoles, spaceRoleEditor, spaceRoleManager, spaceRoleViewer } from '../share'
import { PublicSpaceResource, ShareSpaceResource, SpaceResource, SHARE_JAIL_ID } from './types'

import { DavProperty } from '../../webdav/constants'
import { buildWebDavPublicPath } from '../publicLink'
import { urlJoin } from '../../utils'

export function buildPublicSpaceResource(data): PublicSpaceResource {
  const publicLinkPassword = data.publicLinkPassword

  const publicLinkItemType = data.fileInfo?.[DavProperty.PublicLinkItemType]
  const publicLinkPermission = data.fileInfo?.[DavProperty.PublicLinkPermission]
  const publicLinkExpiration = data.fileInfo?.[DavProperty.PublicLinkExpiration]
  const publicLinkShareDate = data.fileInfo?.[DavProperty.PublicLinkShareDate]
  const publicLinkShareOwner = data.fileInfo?.[DavProperty.PublicLinkShareOwner]

  return Object.assign(
    buildSpace({
      ...data,
      driveType: 'public',
      driveAlias: `public/${data.id}`,
      webDavPath: buildWebDavPublicPath(data.id)
    }),
    {
      ...(publicLinkPassword && { publicLinkPassword }),
      ...(publicLinkItemType && { publicLinkItemType }),
      ...(publicLinkPermission && { publicLinkPermission: parseInt(publicLinkPermission) }),
      ...(publicLinkExpiration && { publicLinkExpiration }),
      ...(publicLinkShareDate && { publicLinkShareDate }),
      ...(publicLinkShareOwner && { publicLinkShareOwner })
    }
  )
}

export function buildShareSpaceResource({
  shareId,
  shareName,
  serverUrl
}: {
  shareId: string | number
  shareName: string
  serverUrl: string
}): ShareSpaceResource {
  const space = buildSpace({
    id: [SHARE_JAIL_ID, shareId].join('!'),
    driveAlias: `share/${shareName}`,
    driveType: 'share',
    name: shareName,
    shareId,
    serverUrl
  }) as ShareSpaceResource
  space.rename = (newName: string) => {
    space.driveAlias = `share/${newName}`
    space.name = newName
  }
  return space
}

export function buildSpace(data): SpaceResource {
  let spaceImageData, spaceReadmeData
  let disabled = false
  const spaceRoles = Object.fromEntries(SpacePeopleShareRoles.list().map((role) => [role.name, []]))

  if (data.special) {
    spaceImageData = data.special.find((el) => el.specialFolder.name === 'image')
    spaceReadmeData = data.special.find((el) => el.specialFolder.name === 'readme')

    if (spaceImageData) {
      spaceImageData.webDavUrl = decodeURI(spaceImageData.webDavUrl)
    }

    if (spaceReadmeData) {
      spaceReadmeData.webDavUrl = decodeURI(spaceReadmeData.webDavUrl)
    }
  }

  if (data.root?.permissions) {
    for (const permission of data.root.permissions) {
      for (const role of SpacePeopleShareRoles.list()) {
        if (permission.roles.includes(role.name)) {
          spaceRoles[role.name].push(...permission.grantedTo.map((el) => el.user.id))
        }
      }
    }

    if (data.root?.deleted) {
      disabled = data.root.deleted?.state === 'trashed'
    }
  }

  const webDavPath = urlJoin(data.webDavPath || buildWebDavSpacesPath(data.id), {
    leadingSlash: true
  })
  const webDavUrl = urlJoin(data.serverUrl, 'remote.php/dav', webDavPath)

  const s = {
    id: data.id,
    fileId: data.id,
    storageId: data.id,
    mimeType: '',
    name: data.name,
    description: data.description,
    extension: '',
    path: '/',
    webDavUrl,
    webDavPath,
    driveAlias: data.driveAlias,
    driveType: data.driveType,
    type: 'space',
    isFolder: true,
    mdate: data.lastModifiedDateTime,
    size: '',
    indicators: [],
    permissions: '',
    starred: false,
    etag: '',
    shareId: data.shareId,
    sharePermissions: '',
    shareTypes: (function () {
      return []
    })(),
    privateLink: '',
    downloadURL: '',
    ownerDisplayName: '',
    ownerId: data.owner?.user?.id,
    disabled,
    root: data.root,
    spaceQuota: data.quota,
    spaceRoles,
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
    canCreate: function () {
      return true
    },
    isMounted: function () {
      return true
    },
    isReceivedShare: function () {
      return false
    },
    canDeny: () => false,
    getDomSelector: () => extractDomSelector(data.id),
    getDriveAliasAndItem({ path }: Resource): string {
      return urlJoin(this.driveAlias, path, {
        leadingSlash: false
      })
    },
    getWebDavUrl(resource: Resource): string {
      return urlJoin(this.webDavUrl, resource.path)
    },
    isViewer(uuid: string): boolean {
      return this.spaceRoles[spaceRoleViewer.name].includes(uuid)
    },
    isEditor(uuid: string): boolean {
      return this.spaceRoles[spaceRoleEditor.name].includes(uuid)
    },
    isManager(uuid: string): boolean {
      return this.spaceRoles[spaceRoleManager.name].includes(uuid)
    }
  }
  Object.defineProperty(s, 'nodeId', {
    get() {
      return extractNodeId(this.id)
    }
  })
  return s
}

import { User } from '../user'
import { buildWebDavSpacesPath, extractDomSelector, Resource } from '../resource'
import { SpacePeopleShareRoles, spaceRoleEditor, spaceRoleManager } from '../share'
import { PublicSpaceResource, SpaceResource } from './types'
import { DavProperty } from 'web-pkg/src/constants'

export function buildPublicSpaceResource(space): PublicSpaceResource {
  const publicLinkItemType = space.fileInfo?.[DavProperty.PublicLinkItemType]
  const publicLinkPermission = space.fileInfo?.[DavProperty.PublicLinkPermission]
  const publicLinkExpiration = space.fileInfo?.[DavProperty.PublicLinkExpiration]
  const publicLinkShareDate = space.fileInfo?.[DavProperty.PublicLinkShareDate]
  const publicLinkShareOwner = space.fileInfo?.[DavProperty.PublicLinkShareOwner]
  return Object.assign(buildSpace(space), {
    publicLinkPassword: space.publicLinkPassword,
    ...(publicLinkItemType && { publicLinkItemType }),
    ...(publicLinkPermission && { publicLinkPermission: parseInt(publicLinkPermission) }),
    ...(publicLinkExpiration && { publicLinkExpiration }),
    ...(publicLinkShareDate && { publicLinkShareDate }),
    ...(publicLinkShareOwner && { publicLinkShareOwner })
  })
}

export function buildSpace(space): SpaceResource {
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

    if (space.root?.deleted) {
      disabled = space.root.deleted?.state === 'trashed'
    }
  }
  return {
    id: space.id,
    fileId: space.id,
    storageId: space.id,
    mimeType: '',
    name: space.name,
    description: space.description,
    extension: '',
    path: '',
    webDavPath: space.webDavPath || buildWebDavSpacesPath(space.id, ''),
    driveAlias: space.driveAlias,
    driveType: space.driveType,
    type: 'space',
    isFolder: true,
    mdate: space.lastModifiedDateTime,
    size: '',
    indicators: [],
    permissions: '',
    starred: false,
    etag: '',
    shareId: space.shareId,
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
    getDomSelector: () => extractDomSelector(space.id),
    getDriveAliasAndItem({ path }: Resource): string {
      return `${this.driveAlias}/${path.replace(/^\//, '')}`
    }
  }
}

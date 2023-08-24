import { basename } from 'path'
import { urlJoin } from '../../utils'
import { DavPermission, DavProperty } from '../../webdav/constants'
import { Resource } from './types'

const fileExtensions = {
  complex: ['tar.bz2', 'tar.gz', '.tar.xz']
}

export function buildWebDavSpacesPath(storageId: string | number, path?: string) {
  return urlJoin('spaces', storageId, path, {
    leadingSlash: true
  })
}

export function buildWebDavSpacesTrashPath(storageId, path = '') {
  return urlJoin('spaces', 'trash-bin', storageId, path, {
    leadingSlash: true
  })
}

export const extractDomSelector = (str: string): string => {
  return str.replace(/[^A-Za-z0-9\-_]/g, '')
}

const extractIdSegment = (id: string, index: number): string => {
  if (!id || typeof id !== 'string') {
    return ''
  }
  return id.indexOf('!') >= 0 ? id.split('!')[index] : ''
}

export const extractStorageId = (id?: string): string => {
  return extractIdSegment(id, 0)
}

export const extractNodeId = (id?: string): string => {
  return extractIdSegment(id, 1)
}

export const extractNameWithoutExtension = (resource?: Resource): string => {
  const extension = resource.extension || ''
  const name = resource.name || ''
  if (!extension.length) {
    return name
  }
  const extensionIndexInName = name.lastIndexOf(`.${extension}`)
  return name.substring(0, extensionIndexInName)
}

export const extractExtensionFromFile = (resource: Resource): string => {
  const name = resource.name
  if (resource.type === 'dir' || resource.type === 'folder' || resource.isFolder) {
    return ''
  }

  const parts = name.split('.')
  if (parts.length > 2) {
    for (let i = 0; i < parts.length; i++) {
      const possibleExtension = parts.slice(i, parts.length).join('.')
      if (fileExtensions.complex.includes(possibleExtension)) {
        return possibleExtension
      }
    }
  }
  // Fallback if file extension is unknown or no extension
  if (parts.length < 2) {
    return ''
  }
  return parts[parts.length - 1]
}

export function buildResource(resource): Resource {
  const name = resource.fileInfo[DavProperty.Name] || basename(resource.name)
  const isFolder = resource.type === 'dir' || resource.type === 'folder'
  const extension = extractExtensionFromFile({ ...resource, name })
  let resourcePath

  if (resource.name.startsWith('/files') || resource.name.startsWith('/space')) {
    resourcePath = resource.name.split('/').slice(3).join('/')
  } else {
    resourcePath = resource.name
  }

  if (!resourcePath.startsWith('/')) {
    resourcePath = `/${resourcePath}`
  }

  const lock = resource.fileInfo[DavProperty.LockDiscovery]
  let activeLock
  if (lock) {
    activeLock = lock[DavProperty.ActiveLock]
  }
  const id = resource.fileInfo[DavProperty.FileId]
  const r = {
    id,
    fileId: id,
    storageId: extractStorageId(id),
    parentFolderId: resource.fileInfo[DavProperty.FileParent],
    mimeType: resource.fileInfo[DavProperty.MimeType],
    name,
    extension: isFolder ? '' : extension,
    path: resourcePath,
    webDavPath: resource.name,
    type: isFolder ? 'folder' : resource.type,
    isFolder,
    locked: activeLock ? true : false,
    lockOwner: activeLock ? activeLock[DavProperty.LockOwner] : '',
    processing: resource.processing || false,
    mdate: resource.fileInfo[DavProperty.LastModifiedDate],
    size: isFolder
      ? resource.fileInfo[DavProperty.ContentSize]
      : resource.fileInfo[DavProperty.ContentLength],
    indicators: [],
    permissions: (resource.fileInfo[DavProperty.Permissions] as string) || '',
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
    shareId: resource.fileInfo[DavProperty.ShareId],
    shareRoot: resource.fileInfo[DavProperty.ShareRoot],
    ownerId: resource.fileInfo[DavProperty.OwnerId],
    ownerDisplayName: resource.fileInfo[DavProperty.OwnerDisplayName],
    tags: (resource.fileInfo[DavProperty.Tags] || '').split(',').filter(Boolean),
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
    canEditTags: function () {
      return (
        this.permissions.indexOf(DavPermission.Updateable) >= 0 ||
        this.permissions.indexOf(DavPermission.FileUpdateable) >= 0
      )
    },
    isMounted: function () {
      return this.permissions.indexOf(DavPermission.Mounted) >= 0
    },
    isReceivedShare: function () {
      return this.permissions.indexOf(DavPermission.Shared) >= 0
    },
    isShareRoot(): boolean {
      return resource.fileInfo[DavProperty.ShareRoot]
        ? resource.name.split('/').length === 3
        : false
    },
    canDeny: function () {
      return this.permissions.indexOf(DavPermission.Deny) >= 0
    },
    getDomSelector: () => extractDomSelector(id)
  }
  Object.defineProperty(r, 'nodeId', {
    get() {
      return extractNodeId(this.id)
    }
  })
  return r
}

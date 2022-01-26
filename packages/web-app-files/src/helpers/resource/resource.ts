import { User } from '../user'
import fileExtensions from '../extensions/fileExtensions'

// TODO: find a good location for the Resource interface. Needed in other repos as well, so it needs to be deployed to npm.
// TODO: add more fields to the resource interface. Extend into different resource types: FileResource, FolderResource, ShareResource, IncomingShareResource, OutgoingShareResource, ...
export interface Resource {
  id: number | string
  fileId?: string
  storageId?: string
  name?: string
  path: string
  webDavPath?: string
  downloadURL?: string
  type?: string
  status?: number
  spaceRoles?: any[]
  mimeType?: string
  isFolder?: boolean
  sdate?: string
  mdate?: string
  indicators?: any[]
  size?: number
  permissions?: number
  starred?: boolean
  etag?: string
  sharePermissions?: number
  shareTypes?: number[]
  privateLink?: string

  canCreate?(): boolean
  canUpload?(): boolean
  canDownload?(): boolean
  canShare?(): boolean
  canRename?(): boolean
  canBeDeleted?(): boolean
  canBeRestored?(): boolean
  canDeny?(): boolean

  isReceivedShare?(): boolean
  isMounted?(): boolean

  getDomSelector?(): string

  resourceOwner?: User
  owner?: User[]
  ownerDisplayName?: string
  ownerId?: string
  sharedWith?: string
  shareOwner?: string
  shareOwnerDisplayname?: string

  extension?: string
  share?: any

  ddate?: string
}

export const extractStorageId = (id?: string): string => {
  if (!id || typeof id !== 'string') {
    return ''
  }
  return id.indexOf('!') >= 0 ? id.split('!')[0] : ''
}

export const extractDomSelector = (str: string): string => {
  return str.replace(/[^A-Za-z0-9\-_]/g, '')
}

export const extractNameWithoutExtension = (resource?: Resource): string => {
  const extension = resource.extension || ''
  const name = resource.name || ''
  if (!extension.length) return name
  const extensionIndexInName = name.lastIndexOf(`.${extension}`)
  return name.substring(0, extensionIndexInName)
}

export const extractExtensionFromFile = (resource: Resource): string => {
  const name = resource.name
  if (resource.type === 'dir' || resource.type === 'folder' || resource.isFolder) return ''

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
  if (parts.length < 2) return ''
  return parts[parts.length - 1]
}

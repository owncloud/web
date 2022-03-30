import { User } from '../user'

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

  isReceivedShare?(): boolean
  isMounted?(): boolean

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

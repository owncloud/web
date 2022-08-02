import { User } from '../user'

// TODO: add more fields to the resource interface. Extend into different resource types: FileResource, FolderResource, ShareResource, IncomingShareResource, OutgoingShareResource, ...
export interface Resource {
  id: number | string
  fileId?: string
  storageId?: string
  name?: string
  tags?: string[]
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
  permissions?: string
  starred?: boolean
  etag?: string
  sharePermissions?: number
  shareTypes?: number[]
  privateLink?: string
  tags?: string[]

  canCreate?(): boolean
  canUpload?(): boolean
  canDownload?(): boolean
  canShare?(): boolean
  canRename?(): boolean
  canBeDeleted?(): boolean
  canBeRestored?(): boolean
  canEditTags?(): boolean

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

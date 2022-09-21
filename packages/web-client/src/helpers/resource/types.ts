import { User } from '../user'

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
  spaceRoles?: {
    [k: string]: any[];
  }
  spaceQuota?: any[]
  spaceImageData?: any
  spaceReadmeData?: any
  mimeType?: string
  isFolder?: boolean
  sdate?: string
  mdate?: string
  indicators?: any[]
  size?: number | string // FIXME
  permissions?: string
  starred?: boolean
  etag?: string
  sharePermissions?: number | string // FIXME
  shareId?: string
  shareRoot?: string
  shareTypes?: number[]
  privateLink?: string
  description?: string
  disabled?: boolean
  driveType?: 'personal' | 'project' | 'share' | (string & unknown)
  driveAlias?: string

  canCreate?(): boolean
  canUpload?(): boolean
  canDownload?(): boolean
  canShare?(): boolean
  canRename?(): boolean
  canBeDeleted?(): boolean
  canBeRestored?(): boolean
  canDeny?(): boolean
  canEditDescription?(): boolean
  canRestore?(): boolean
  canDisable?(): boolean
  canEditImage?(): boolean
  canEditReadme?(): boolean

  isReceivedShare?(): boolean
  isMounted?(): boolean

  getDomSelector?(): string

  matchingSpace?: any

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

export interface SpaceResource extends Resource {
  getDriveAliasAndItem?(resource: Resource): string
}

export interface PersonalSpaceResource extends SpaceResource {}
export const isPersonalSpaceResource = (resource: Resource): resource is PersonalSpaceResource => {
  return resource.driveType === 'personal'
}

export interface ProjectSpaceResource extends SpaceResource {}
export const isProjectSpaceResource = (resource: Resource): resource is ProjectSpaceResource => {
  return resource.driveType === 'project'
}

export interface ShareSpaceResource extends SpaceResource {}
export const isShareSpaceResource = (resource: Resource): resource is ShareSpaceResource => {
  return resource.driveType === 'share'
}

export interface PublicSpaceResource extends SpaceResource {}
export const isPublicSpaceResource = (resource: Resource): resource is PublicSpaceResource => {
  return resource.driveType === 'public'
}

import { User } from '../user'

export interface SpaceRole {
  id: string
  displayName: string
  expirationDate: string
  kind: 'user' | 'group'
  isMember(u: User): boolean
}

// TODO: add more fields to the resource interface. Extend into different resource types: FileResource, FolderResource, ShareResource, IncomingShareResource, OutgoingShareResource, ...
export interface Resource {
  id: number | string
  fileId?: string
  parentFolderId?: string
  storageId?: string
  readonly nodeId?: string
  name?: string
  tags?: string[]
  disabled?: boolean
  path: string
  webDavPath?: string
  downloadURL?: string
  type?: string
  thumbnail?: string
  status?: number
  processing?: boolean
  spaceRoles?: {
    [k: string]: SpaceRole[]
  }
  spaceQuota?: any
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
  driveType?: 'personal' | 'project' | 'share' | 'public' | (string & unknown)
  driveAlias?: string

  canCreate?(): boolean
  canUpload?({ user }: { user?: User }): boolean
  canDownload?(): boolean
  canShare?({ user }: { user?: User }): boolean
  canRename?({ user }: { user?: User }): boolean
  canBeDeleted?({ user }: { user?: User }): boolean
  canBeRestored?(): boolean
  canDeny?(): boolean
  canEditDescription?({ user }: { user?: User }): boolean
  canRestore?({ user }: { user?: User }): boolean
  canDisable?({ user }: { user?: User }): boolean
  canEditImage?({ user }: { user?: User }): boolean
  canEditReadme?({ user }: { user?: User }): boolean
  canEditSpaceQuota?(): boolean
  canEditTags?(): boolean

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

// These interfaces have empty (unused) __${type}SpaceResource properties which are only
// there to make the types differ, in order to make TypeScript type narrowing work correctly
// With empty types TypeScript does not accept this code
// ```
//   if(isPublicSpaceResource(resource)) { console.log(resource.id) } else { console.log(resource.id) }
// ```
// because in the else block resource gets the type never. If this is changed in a later TypeScript version
// or all types get different members, the underscored props can be removed.
export interface FolderResource extends Resource {
  __folderResource?: any
}

export interface FileResource extends Resource {
  __fileResource?: any
}

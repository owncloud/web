import { DavFileInfoResponse } from '@ownclouders/web-client/src/webdav/constants'
import { User } from '../user'
import { MongoAbility, SubjectRawRule } from '@casl/ability'
import { DAVResultResponseProps, FileStat } from 'webdav'
import { Audio, GeoCoordinates } from '../../generated'
import { Item } from '../item'

export type AbilityActions =
  | 'create'
  | 'create-all'
  | 'delete'
  | 'delete-all'
  | 'read'
  | 'read-all'
  | 'set-quota'
  | 'set-quota-all'
  | 'update'
  | 'update-all'

export type AbilitySubjects =
  | 'Account'
  | 'Drive'
  | 'Favorite'
  | 'Group'
  | 'Language'
  | 'Logo'
  | 'PublicLink'
  | 'ReadOnlyPublicLinkPassword'
  | 'Role'
  | 'Setting'
  | 'Share'

export type Ability = MongoAbility<[AbilityActions, AbilitySubjects]>
export type AbilityRule = SubjectRawRule<AbilityActions, AbilitySubjects, any>

export interface SpaceRole {
  id: string
  displayName: string
  expirationDate: string
  kind: 'user' | 'group'
  isMember(u: User): boolean
}

// TODO: add more fields to the resource interface. Extend into different resource types: FileResource, FolderResource, ShareResource, IncomingShareResource, OutgoingShareResource, ...
export interface Resource extends Item {
  fileId?: string
  parentFolderId?: string
  storageId?: string
  readonly nodeId?: string
  name?: string
  tags?: string[]
  audio?: Audio
  location?: GeoCoordinates
  disabled?: boolean
  path: string
  webDavPath?: string
  downloadURL?: string
  type?: string
  thumbnail?: string
  status?: number
  processing?: boolean
  locked?: boolean
  lockOwnerName?: string
  lockTime?: string
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
  driveType?: 'mountpoint' | 'personal' | 'project' | 'share' | 'public' | (string & unknown)
  driveAlias?: string

  canCreate?(): boolean
  canUpload?({ user }: { user?: User }): boolean
  canDownload?(): boolean
  canShare?({ user, ability }?: { user?: User; ability?: Ability }): boolean
  canRename?({ user }?: { user?: User; ability?: Ability }): boolean
  canBeDeleted?({ user }?: { user?: User; ability?: Ability }): boolean
  canBeRestored?(): boolean
  canDeny?(): boolean
  canEditDescription?({ user }: { user?: User; ability?: Ability }): boolean
  canRestore?({ user }: { user?: User; ability?: any }): boolean
  canDisable?({ user }: { user?: User; ability?: any }): boolean
  canEditImage?({ user }: { user?: User }): boolean
  canEditReadme?({ user }: { user?: User }): boolean
  canRemoveFromTrashbin?({ user }: { user?: User }): boolean

  canEditSpaceQuota?(): boolean
  canEditTags?(): boolean

  isReceivedShare?(): boolean

  isShareRoot?(): boolean

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
  hidden?: boolean

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

export interface WebDavResponseTusSupport {
  extension?: string[]
  maxSize?: number
  resumable?: string
  version?: string[]
}

export interface WebDavResponseResource extends Omit<FileStat, 'props'> {
  props?: Omit<DAVResultResponseProps, 'getcontentlength'> & DavFileInfoResponse
  processing?: boolean
  tusSupport?: WebDavResponseTusSupport
}

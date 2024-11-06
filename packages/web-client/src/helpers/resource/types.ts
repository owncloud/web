import { DavFileInfoResponse } from '@ownclouders/web-client/webdav'
import { Audio, GeoCoordinates, Identity, Image, Photo, User } from '../../graph/generated'
import { MongoAbility, SubjectRawRule } from '@casl/ability'
import { DAVResultResponseProps, FileStat } from 'webdav'

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

export type ResourceIndicatorCategory = 'system' | 'sharing'

export interface ResourceIndicator {
  id: string
  accessibleDescription: string
  label: string
  icon: string
  fillType: 'fill' | 'line' | 'none'
  type: string
  category: ResourceIndicatorCategory
  handler?: (resource: Resource) => void
}

// FIXME: almost all of the properties are non-optional, the interface should reflect that
export interface Resource {
  id: string
  fileId?: string
  parentFolderId?: string
  storageId?: string
  readonly nodeId?: string
  name?: string
  tags?: string[]
  audio?: Audio
  location?: GeoCoordinates
  image?: Image
  photo?: Photo
  path: string
  webDavPath?: string
  downloadURL?: string
  type?: string
  thumbnail?: string
  processing?: boolean
  locked?: boolean
  lockOwner?: string
  lockTime?: string
  mimeType?: string
  isFolder?: boolean
  mdate?: string
  indicators?: ResourceIndicator[]
  size?: number | string // FIXME
  permissions?: string
  starred?: boolean
  etag?: string
  shareTypes?: number[]
  privateLink?: string
  owner?: Identity
  extension?: string

  // necessary for incoming share resources and resources inside shares
  remoteItemId?: string
  remoteItemPath?: string

  canCreate?(): boolean
  canUpload?({ user }: { user?: User }): boolean
  canDownload?(): boolean
  canShare?(args?: { user?: User; ability?: Ability }): boolean
  canRename?(args?: { user?: User; ability?: Ability }): boolean
  canBeDeleted?(args?: { user?: User; ability?: Ability }): boolean
  canDeny?(): boolean
  canEditTags?(): boolean

  getDomSelector?(): string

  isReceivedShare?(): boolean
  isShareRoot?(): boolean
  isMounted?(): boolean
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

export interface TrashResource extends Resource {
  ddate: string
  canBeRestored(): boolean
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

export interface SearchResource extends Resource {
  highlights: string
}

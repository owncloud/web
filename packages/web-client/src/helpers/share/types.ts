import { Identity, UnifiedRoleDefinition } from '../../generated'
import { Resource } from '../resource'
import type { User } from '../user'
import type { ShareRole } from './role'
import type { SharePermission } from './permission'

export enum GraphSharePermission {
  createUpload = 'libre.graph/driveItem/upload/create',
  createPermissions = 'libre.graph/driveItem/permissions/create',
  createChildren = 'libre.graph/driveItem/children/create',
  readBasic = 'libre.graph/driveItem/basic/read',
  readPath = 'libre.graph/driveItem/path/read',
  readQuota = 'libre.graph/driveItem/quota/read',
  readContent = 'libre.graph/driveItem/content/read',
  readChildren = 'libre.graph/driveItem/children/read',
  readDeleted = 'libre.graph/driveItem/deleted/read',
  updatePath = 'libre.graph/driveItem/path/update',
  updateDeleted = 'libre.graph/driveItem/deleted/update',
  deleteStandard = 'libre.graph/driveItem/standard/delete'
}

export interface ShareResource extends Resource {
  sharedWith: Array<{ shareType: number } & Identity>
  sharedBy: Identity
  outgoing: boolean
}
export interface OutgoingShareResource extends ShareResource {}

export interface IncomingShareResource extends ShareResource {
  hidden: boolean
  syncEnabled: boolean
  shareRoles: UnifiedRoleDefinition[]
  sharePermissions: GraphSharePermission[]
}

/** @deprecated */
export interface Share {
  shareType: number
  id: string
  collaborator?: User
  permissions?: number
  role?: ShareRole
  token?: string
  url?: string
  path?: string
  description?: string
  stime?: string
  name?: string
  password?: boolean
  expiration?: string
  itemSource?: string
  file?: { parent: string; source: string; target: string }
  owner?: User
  fileOwner?: User
  customPermissions?: SharePermission[]
  expires?: Date
  quicklink?: boolean
  outgoing?: boolean
  indirect?: boolean
  notifyUploads?: boolean
  notifyUploadsExtraRecipients?: string
}

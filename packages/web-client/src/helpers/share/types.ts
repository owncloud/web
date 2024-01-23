import { Identity, UnifiedRoleDefinition } from '../../generated'
import { Resource } from '../resource'

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
  shareType: number

  syncEnabled?: boolean
  shareRoles?: UnifiedRoleDefinition[]
  sharePermissions?: GraphSharePermission[]
  sharedWith?: Identity[]
  sharedBy?: Identity
  hidden?: boolean

  status?: number // FIXME: remove in favour of syncEnabled
  share?: any // FIXME: type DriveItem OR remove? do we want to expose the share on each resource?
}

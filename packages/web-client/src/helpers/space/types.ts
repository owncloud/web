// These interfaces have empty (unused) __${type}SpaceResource properties which are only
// there to make the types differ, in order to make TypeScript type narrowing work correctly
// With empty types TypeScript does not accept this code
// ```
//   if(isPublicSpaceResource(resource)) { console.log(resource.id) } else { console.log(resource.id) }
// ```
// because in the else block resource gets the type never. If this is changed in a later TypeScript version
// or all types get different members, the underscored props can be removed.
import { Resource } from '../resource'
import { User } from '../user'

export const SHARE_JAIL_ID = 'a0ca6a90-a365-4782-871e-d44447bbc668'

export interface SpaceResourceRemoteItem {
  id: string
  name: string
  path: string
  rootId: string
}

export interface SpaceResourceRoot {
  id: string
  remoteItem: SpaceResourceRemoteItem
  webDavUrl: string
}

export interface SpaceResource extends Resource {
  disabled?: boolean
  webDavTrashPath: string
  root: SpaceResourceRoot
  getWebDavUrl({ path }: { path: string }): string
  getWebDavTrashUrl({ path }: { path: string }): string
  getDriveAliasAndItem(resource: Resource): string
  isViewer(uuid: User): boolean
  isEditor(uuid: User): boolean
  isManager(uuid: User): boolean
}

export interface PersonalSpaceResource extends SpaceResource {
  __personalSpaceResource?: any
}
export const isPersonalSpaceResource = (resource: Resource): resource is PersonalSpaceResource => {
  return resource?.driveType === 'personal'
}

export interface ProjectSpaceResource extends SpaceResource {
  __projectSpaceResource?: any
}
export const isProjectSpaceResource = (resource: Resource): resource is ProjectSpaceResource => {
  return resource?.driveType === 'project'
}

export interface ShareSpaceResource extends SpaceResource {
  __shareSpaceResource?: any
  rename(newName: string): void
}
export const isShareSpaceResource = (resource: Resource): resource is ShareSpaceResource => {
  return resource?.driveType === 'share'
}

export interface MountPointSpaceResource extends SpaceResource {
  __mountPointSpaceResource?: any
}
export const isMountPointSpaceResource = (
  resource: Resource
): resource is MountPointSpaceResource => {
  return resource?.driveType === 'mountpoint'
}

export interface PublicSpaceResource extends SpaceResource {
  publicLinkPassword?: string
  publicLinkItemType?: string
  publicLinkPermission?: number
  publicLinkExpiration?: string
  publicLinkShareDate?: string
  publicLinkShareOwner?: string
}
export const isPublicSpaceResource = (resource: Resource): resource is PublicSpaceResource => {
  return resource?.driveType === 'public'
}

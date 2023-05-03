import type { User } from '../user'
import type { ShareRole } from './role'
import type { SharePermission } from './permission'

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
  notifyUploads?: boolean
  notifyUploadsExtraRecipients?: string
}

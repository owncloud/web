import { Item } from '../item'
import { User as ApiUser } from '../../generated/api'

export interface User extends Item, ApiUser {
  uuid?: string
  name?: string
  username?: string
  displayName?: string
  avatar?: string
  shareType?: number
  additionalInfo?: any
  role?: any
  roles?: any[]
}

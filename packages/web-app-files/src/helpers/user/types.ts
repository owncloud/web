import type { ShareType, ShareTypes } from "../share"

export interface User {
  uuid?: string
  name?: string
  username?: string
  displayName?: string
  avatar?: string
  shareType?: number
  additionalInfo?: any
}

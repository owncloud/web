import { User } from '../../types'

export interface LoginAdapter {
  login({ user }: { user: User }): Promise<void>
}

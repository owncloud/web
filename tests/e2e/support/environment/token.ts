import { createdTokenStore } from '../store/token'
import { Token, User } from '../types'

export class TokenEnvironment {
  getToken({ user }: { user: User }): Token {
    if (!createdTokenStore.has(user.id)) {
      throw new Error(`token for user '${user.id}' not found`)
    }

    return createdTokenStore.get(user.id)
  }

  createToken({ user, token }: { user: User; token: Token }): Token {
    createdTokenStore.set(user.id, token)
    return token
  }

  removeToken({ user }: { user: User }): void {
    createdTokenStore.delete(user.id)
  }
}

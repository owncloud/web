import { createdKeycloakAccessTokenStore, createdKeycloakRefreshTokenStore, createdTokenStore } from '../store/token'
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

  createKeycloakAccessToken({ token }: { token: Token }): Token {
    createdKeycloakAccessTokenStore.set('keycloakAdmin', token)
    return token
  }

  getKeycloakAccessToken(): Token {
    if (!createdKeycloakAccessTokenStore.has('keycloakAdmin')) {
      throw new Error(`token for user 'keycloakAdmin' not found`)
    }
    return createdKeycloakAccessTokenStore.get('keycloakAdmin')
  }

  createKeycloakRefreshToken({ token }: { token: Token }): Token {
    createdKeycloakRefreshTokenStore.set('keycloakAdmin', token)
    return token
  }

  getKeycloakRefreshToken(): Token {
    if (!createdKeycloakRefreshTokenStore.has('keycloakAdmin')) {
      throw new Error(`token for user 'keycloakAdmin' not found`)
    }
    return createdKeycloakRefreshTokenStore.get('keycloakAdmin')
  }
}

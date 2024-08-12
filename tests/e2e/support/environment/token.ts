import { createdTokenStore, keycloakTokenStore } from '../store/token'
import { Token, User } from '../types'

export type TokenProviderType = 'keycloak' | null | undefined
export type TokenEnvironmentType = KeycloakTokenEnvironment | IdpTokenEnvironment

export function TokenEnvironmentFactory(type?: TokenProviderType) {
  switch (type) {
    case 'keycloak':
      return new KeycloakTokenEnvironment()
    default:
      return new IdpTokenEnvironment()
  }
}

class IdpTokenEnvironment {
  getToken({ user }: { user: User }): Token {
    return createdTokenStore.get(user.id)
  }

  setToken({ user, token }: { user: User; token: Token }): Token {
      if (createdTokenStore.has(user.id)){
          throw new Error(`Token of '${user}' already exist`)
      }
    createdTokenStore.set(user.id, token)
    return token
  }

  updateToken({user,token}: {user:User; token:Token}):Map<string, Token> {
      if (!createdTokenStore.has(user.id)){
          throw new Error(`Token of '${user}' not found`)
      }
      createdTokenStore.delete(user.id)
      return createdTokenStore.set(user.id, token)
  }

  deleteToken({ user }: { user: User }): void {
    createdTokenStore.delete(user.id)
  }
}

class KeycloakTokenEnvironment {
  getToken({ user }: { user: User }): Token {
    return keycloakTokenStore.get(user.id)
  }

  setToken({ user, token }: { user: User; token: Token }): Token {
    keycloakTokenStore.set(user.id, token)
    return token
  }

    updateToken({user,token}: {user:User; token:Token}):Map<string, Token> {
        if (!keycloakTokenStore.has(user.id)){
            throw new Error(`Token of '${user}' not found`)
        }
        keycloakTokenStore.delete(user.id)
        return keycloakTokenStore.set(user.id, token)
    }

  deleteToken({ user }: { user: User }): void {
    keycloakTokenStore.delete(user.id)
  }
}

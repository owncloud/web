import { Group, User } from '../types'
import {
  dummyUserStore,
  dummyGroupStore,
  createdUserStore,
  createdGroupStore,
  keycloakCreatedUser,
  federatedUserStore
} from '../store'
import { config } from '../../config'
import { dummyKeycloakGroupStore } from '../store/keycloak'

export class UsersEnvironment {
  getUser({ key }: { key: string }): User {
    const userKey = key.toLowerCase()

    if (!dummyUserStore.has(userKey)) {
      throw new Error(`user with key '${userKey}' not found`)
    }

    return dummyUserStore.get(userKey)
  }

  createUser({ key, user }: { key: string; user: User }): User {
    const userKey = key.toLowerCase()

    if (dummyUserStore.has(userKey)) {
      throw new Error(`user with key '${userKey}' already exists`)
    }

    dummyUserStore.set(userKey, user)

    return user
  }

  storeCreatedUser({ user }: { user: User }): User {
    const store = config.federatedServer ? federatedUserStore : createdUserStore
    if (store.has(user.id)) {
      throw new Error(`user '${user.id}' already exists`)
    }
    store.set(user.id, user)
    return user
  }

  getCreatedUser({ key }: { key: string }): User {
    const store = config.federatedServer ? federatedUserStore : createdUserStore
    const userKey = key.toLowerCase()
    if (!store.has(userKey)) {
      throw new Error(`user with key '${userKey}' not found`)
    }

    return store.get(userKey)
  }

  updateCreatedUser({ key, user }: { key: string; user: User }): User {
    const userKey = key.toLowerCase()
    if (!createdUserStore.has(userKey)) {
      throw new Error(`user '${userKey}' not found`)
    }
    createdUserStore.delete(userKey)
    createdUserStore.set(user.id, user)

    return user
  }

  removeCreatedUser({ key }: { key: string }): boolean {
    const store = config.federatedServer ? federatedUserStore : createdUserStore
    const userKey = key.toLowerCase()

    if (!store.has(userKey)) {
      throw new Error(`user '${userKey}' not found`)
    }

    return store.delete(userKey)
  }

  getGroup({ key }: { key: string }): Group {
    const groupKey = key.toLowerCase()
    const store = groupKey.startsWith('keycloak') ? dummyKeycloakGroupStore : dummyGroupStore

    if (!store.has(groupKey)) {
      throw new Error(`group with key '${groupKey}' not found`)
    }

    return store.get(groupKey)
  }

  getCreatedGroup({ key }: { key: string }): Group {
    const groupKey = key.toLowerCase()
    return createdGroupStore.get(groupKey)
  }

  storeCreatedGroup({ group }: { group: Group }): Group {
    if (createdGroupStore.has(group.id)) {
      throw new Error(`group with key '${group.id}' already exists`)
    }
    createdGroupStore.set(group.id, group)

    return group
  }

  storeCreatedKeycloakUser({ user }: { user: User }): User {
    if (keycloakCreatedUser.has(user.id)) {
      throw new Error(`Keycloak user '${user.id}' already exists`)
    }
    keycloakCreatedUser.set(user.id, user)
    return user
  }

  getCreatedKeycloakUser({ key }: { key: string }): User {
    const userKey = key.toLowerCase()
    if (!keycloakCreatedUser.has(userKey)) {
      throw new Error(`Keycloak user with key '${userKey}' not found`)
    }

    return keycloakCreatedUser.get(userKey)
  }

  removeCreatedKeycloakUser({ key }: { key: string }): boolean {
    const userKey = key.toLowerCase()

    if (!keycloakCreatedUser.has(userKey)) {
      throw new Error(`Keycloak user with key '${userKey}' not found`)
    }

    return keycloakCreatedUser.delete(userKey)
  }
}

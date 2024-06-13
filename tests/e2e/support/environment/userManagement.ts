import { Group, User } from '../types'
import {
  dummyUserStore,
  dummyGroupStore,
  createdUserStore,
  createdGroupStore,
  KeycloakCreatedUser
} from '../store'

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
    if (createdUserStore.has(user.id)) {
      throw new Error(`user '${user.id}' already exists`)
    }
    createdUserStore.set(user.id, user)

    return user
  }

  getCreatedUser({ key }: { key: string }): User {
    const userKey = key.toLowerCase()
    if (!createdUserStore.has(userKey)) {
      throw new Error(`user with key '${userKey}' not found`)
    }

    return createdUserStore.get(userKey)
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
    const userKey = key.toLowerCase()

    if (!createdUserStore.has(userKey)) {
      throw new Error(`user '${userKey}' not found`)
    }

    return createdUserStore.delete(userKey)
  }

  getGroup({ key }: { key: string }): Group {
    const groupKey = key.toLowerCase()

    if (!dummyGroupStore.has(groupKey)) {
      throw new Error(`group with key '${groupKey}' not found`)
    }

    return dummyGroupStore.get(groupKey)
  }

  getCreatedGroup({ key }: { key: string }): Group {
    const groupKey = key.toLowerCase()

    if (!createdGroupStore.has(groupKey)) {
      throw new Error(`group with key '${groupKey}' not found`)
    }

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
    if (KeycloakCreatedUser.has(user.id)) {
      throw new Error(`user '${user.id}' already exists`)
    }
    KeycloakCreatedUser.set(user.id, user)
    return user
  }

  getCreatedKeycloakUser({ key }: { key: string }): User {
    const userKey = key.toLowerCase()
    if (!KeycloakCreatedUser.has(userKey)) {
      throw new Error(`user with key '${userKey}' not found`)
    }

    return KeycloakCreatedUser.get(userKey)
  }

  removeCreatedKeycloakUser({ key }: { key: string }): boolean {
    const userKey = key.toLowerCase()

    if (!KeycloakCreatedUser.has(userKey)) {
      throw new Error(`user '${userKey}' not found`)
    }

    return KeycloakCreatedUser.delete(userKey)
  }
}

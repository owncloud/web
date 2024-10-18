import { Group, User } from '../types'
import {
  dummyUserStore,
  dummyGroupStore,
  createdUserStore,
  createdGroupStore,
  keycloakCreatedUser, newUserStore
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
 storeNewCreatedUser({ user }: { user: User }, instanceName: string): User {
  // Check if the outer Map has an entry for the instance
  if (!newUserStore.has(instanceName)) {
    // If not, create a new inner Map for this instance
    newUserStore.set(instanceName, new Map<string, User>())
  }

  const instanceUsers = newUserStore.get(instanceName)
  // Check if the user already exists in the inner Map
  if (instanceUsers && instanceUsers.has(user.id)) {
    throw new Error(`User '${user.id}' already exists in '${instanceName}'`)
  }

  // Store the new user in the inner Map for the current instance
  instanceUsers?.set(user.id, user) // Use user.id as the key

  return user // Return the user object
}
 getNewCreatedUser({ instanceName, userId }: { instanceName: string; userId: string }): User {
  const userKey = userId.toLowerCase() // Normalize user ID (if needed)
  if (!newUserStore.has(instanceName)) {
    throw new Error(`Instance '${instanceName}' not found`)
  }

  const instanceUsers = newUserStore.get(instanceName)
  if (!instanceUsers || !instanceUsers.has(userKey)) {
    throw new Error(`User '${userKey}' not found in '${instanceName}'`)
  }

  return instanceUsers.get(userKey)! // Return the user, using non-null assertion
}
}

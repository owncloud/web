import { Group, User } from '../types'
import { dummyUserStore, dummyGroupStore } from '../store'
import { createdUserStore } from '../store/user'

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
    const uniqueKey = key.toLowerCase()

    if (!dummyGroupStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' not found`)
    }

    return dummyGroupStore.get(uniqueKey)
  }

  getCreatedGroup({ key }: { key: string }): Group {
    const uniqueKey = key.toLowerCase()

    if (!createdGroupStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' not found`)
    }
    console.log(createdGroupStore.get(uniqueKey))
    return createdGroupStore.get(uniqueKey)
  }

  createGroup({ key, group }: { key: string; group: Group }): Group {
    const uniqueKey = key.toLowerCase()

    if (dummyUserStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' already exists`)
    }

    dummyGroupStore.set(uniqueKey, group)

    return group
  }

  storeGroup({ group }: { group: Group }): Group {
    if (createdGroupStore.has(group.id)) {
      throw new Error(`user with key '${group.id}' already exists`)
    }
    createdGroupStore.set(group.id, group)

    return group
  }
}

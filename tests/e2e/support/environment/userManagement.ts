import { Group, User } from '../types'
import { dummyUserStore, dummyGroupStore } from '../store'

export class UsersEnvironment {
  getUser({ key }: { key: string }): User {
    const uniqueKey = key.toLowerCase()

    if (!dummyUserStore.has(uniqueKey)) {
      throw new Error(`user with key '${uniqueKey}' not found`)
    }

    return dummyUserStore.get(uniqueKey)
  }

  createUser({ key, user }: { key: string; user: User }): User {
    const uniqueKey = key.toLowerCase()

    if (dummyUserStore.has(uniqueKey)) {
      throw new Error(`user with key '${uniqueKey}' already exists`)
    }

    dummyUserStore.set(uniqueKey, user)

    return user
  }

  getGroup({ key }: { key: string }): Group {
    const uniqueKey = key.toLowerCase()

    if (!dummyGroupStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' not found`)
    }

    return dummyGroupStore.get(uniqueKey)
  }

  createGroup({ key, group }: { key: string; group: Group }): Group {
    const uniqueKey = key.toLowerCase()

    if (dummyUserStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' already exists`)
    }

    dummyGroupStore.set(uniqueKey, group)

    return group
  }
}

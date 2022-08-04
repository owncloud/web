import { Group, User } from '../types'
import { userStore, groupStore } from '../store'

export class UsersEnvironment {
  getUser({ key }: { key: string }): User {
    const uniqueKey = key.toLowerCase()

    if (!userStore.has(uniqueKey)) {
      throw new Error(`user with key '${uniqueKey}' not found`)
    }

    return userStore.get(uniqueKey)
  }

  createUser({ key, user }: { key: string; user: User }): User {
    const uniqueKey = key.toLowerCase()

    if (userStore.has(uniqueKey)) {
      throw new Error(`user with key '${uniqueKey}' already exists`)
    }

    userStore.set(uniqueKey, user)

    return user
  }

  getGroup({ key }: { key: string }): Group {
    const uniqueKey = key.toLowerCase()

    if (!groupStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' not found`)
    }

    return groupStore.get(uniqueKey)
  }

  createGroup({ key, group }: { key: string; group: Group }): Group {
    const uniqueKey = key.toLowerCase()

    if (userStore.has(uniqueKey)) {
      throw new Error(`group with key '${uniqueKey}' already exists`)
    }

    groupStore.set(uniqueKey, group)

    return group
  }
}

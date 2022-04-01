import { User } from '../types'
import { userStore } from '../store'

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
}

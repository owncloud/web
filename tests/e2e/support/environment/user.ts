import { User } from '../types'
import { userStore } from '../store'

export class UsersEnvironment {
  getUser({ id }: { id: string }): User {
    if (!userStore.has(id)) {
      throw new Error(`user with id '${id}' not found`)
    }

    return userStore.get(id)
  }

  createUser(user: User): User {
    if (userStore.has(user.id)) {
      throw new Error(`user with id '${user.id}' already exists`)
    }

    userStore.set(user.id, user)

    return user
  }
}

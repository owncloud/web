import { User } from '../types'
import { store } from '../store'

export class UserEnvironment {
  private store = store.userStore

  get({ id }: { id: string }): User {
    if (!this.store.has(id)) {
      throw new Error(`user with id '${id}' not found`)
    }

    return this.store.get(id)
  }
}

import { User } from '../types'
import { userStore } from '../store'

export class UserContinent {
  private store = userStore

  get({ id }: { id: string }): User {
    if (!this.store.has(id)) {
      throw new Error(`user with id '${id}' not found`)
    }

    return this.store.get(id)
  }
}

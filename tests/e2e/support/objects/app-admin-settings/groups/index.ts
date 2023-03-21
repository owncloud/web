import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import { createGroup, getDisplayedGroups } from './actions'

export class Groups {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }
  getUUID({ key }: { key: string }) {
    const { uuid } = this.#usersEnvironment.getGroup({ key })
    return uuid
  }
  async createGroup({ key }: { key: string }): Promise<string> {
    return await createGroup({ page: this.#page, key: key })
  }
  getDisplayedGroups(): Promise<string[]> {
    return getDisplayedGroups({ page: this.#page })
  }
}

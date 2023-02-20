import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import { changeAccountEnabled } from './actions'

export class Users {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }

  async allowLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
  }

  async forbidLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await changeAccountEnabled({ uuid, value: false, page: this.#page })
  }
}

import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import {
  changeAccountEnabled,
  selectUser,
  changeQuota,
  changeQuotaUsingBatchAction
} from './actions'

export class Users {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }
  async allowLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await changeAccountEnabled({ uuid, value: true, page: this.#page })
  }
  async forbidLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await changeAccountEnabled({ uuid, value: false, page: this.#page })
  }
  async changeQuota({ key, value }: { key: string; value: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await changeQuota({ uuid, value, page: this.#page })
  }
  async selectUser({ key }: { key: string }): Promise<void> {
    const { displayName } = this.#usersEnvironment.getUser({ key })
    await selectUser({ displayName, page: this.#page })
  }
  async changeQuotaUsingBatchAction({ value }: { value: string }): Promise<void> {
    await changeQuotaUsingBatchAction({ value, page: this.#page })
  }
}

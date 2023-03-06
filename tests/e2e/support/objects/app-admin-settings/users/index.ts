import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import {
  addSelectedUsersToGroups,
  changeAccountEnabled,
  changeQuota,
  changeQuotaUsingBatchAction,
  filterUsers,
  getDisplayedUsers,
  removeSelectedUsersFromGroups,
  selectUser,
  changeUser,
  addUserToGroups,
  removeUserFromGroups,
  openEditPanel,
  deleteUserUsingContextMenu,
  deleteUserUsingBatchAction,
  createUser
} from './actions'

export class Users {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }
  getUUID({ key }: { key: string }) {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    return uuid
  }
  async allowLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await changeAccountEnabled({ uuid, value: true, page: this.#page })
  }
  async forbidLogin({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await changeAccountEnabled({ uuid, value: false, page: this.#page })
  }
  async changeQuota({ key, value }: { key: string; value: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await changeQuota({ uuid, value, page: this.#page })
  }
  async selectUser({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await selectUser({ uuid, page: this.#page })
  }
  async changeQuotaUsingBatchAction({ value }: { value: string }): Promise<void> {
    await changeQuotaUsingBatchAction({ value, page: this.#page })
  }
  getDisplayedUsers(): Promise<string[]> {
    return getDisplayedUsers({ page: this.#page })
  }
  async select({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await selectUser({ uuid, page: this.#page })
  }
  async addToGroupsBatchAtion({ groups }: { groups: string[] }): Promise<void> {
    await addSelectedUsersToGroups({ page: this.#page, groups })
  }
  async removeFromGroupsBatchAtion({ groups }: { groups: string[] }): Promise<void> {
    await removeSelectedUsersFromGroups({ page: this.#page, groups })
  }
  async filter({ filter, values }: { filter: string; values: string[] }): Promise<void> {
    await filterUsers({ page: this.#page, filter, values })
  }
  async changeUser({
    key,
    attribute,
    value
  }: {
    key: string
    attribute: string
    value: string
  }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await changeUser({ uuid, attribute: attribute, value: value, page: this.#page })
  }
  async addToGroups({ key, groups }: { key: string; groups: string[] }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await addUserToGroups({ page: this.#page, groups })
  }
  async removeFromGroups({ key, groups }: { key: string; groups: string[] }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid })
    await removeUserFromGroups({ page: this.#page, uuid, groups })
  }
  async deleteUserUsingContextMenu({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await deleteUserUsingContextMenu({ page: this.#page, uuid })
  }
  async deleteUserUsingBatchAction(): Promise<void> {
    await deleteUserUsingBatchAction({ page: this.#page })
  }
  async createUser({
    name,
    displayname,
    email,
    password
  }: {
    name: string
    displayname: string
    email: string
    password: string
  }): Promise<void> {
    await createUser({ page: this.#page, name, displayname, email, password })
  }
}

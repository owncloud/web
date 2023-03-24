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
  createUser,
  waitForEditPanelToBeVisible
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

  getUserIds(users: string[]): string[] {
    const userIds = []
    for (const user of users) {
      userIds.push(this.getUUID({ key: user }))
    }
    return userIds
  }

  async allowLogin({ key, action }: { key: string; action: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeAccountEnabled({ uuid, value: true, page: this.#page })
  }
  async forbidLogin({ key, action }: { key: string; action: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeAccountEnabled({ uuid, value: false, page: this.#page })
  }
  async changeQuota({
    key,
    value,
    action
  }: {
    key: string
    value: string
    action: string
  }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeQuota({ uuid, value, page: this.#page })
  }
  async selectUser({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await selectUser({ uuid, page: this.#page })
  }
  async changeQuotaUsingBatchAction({
    value,
    users
  }: {
    value: string
    users: string[]
  }): Promise<void> {
    const userIds = this.getUserIds(users)
    await changeQuotaUsingBatchAction({ page: this.#page, value, userIds })
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
    value,
    action
  }: {
    key: string
    attribute: string
    value: string
    action: string
  }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeUser({ uuid, attribute: attribute, value: value, page: this.#page })
  }
  async addToGroups({
    key,
    groups,
    action
  }: {
    key: string
    groups: string[]
    action: string
  }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await addUserToGroups({ page: this.#page, groups })
  }
  async removeFromGroups({
    key,
    groups,
    action
  }: {
    key: string
    groups: string[]
    action: string
  }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await removeUserFromGroups({ page: this.#page, uuid, groups })
  }
  async deleteUserUsingContextMenu({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await deleteUserUsingContextMenu({ page: this.#page, uuid })
  }
  async deleteUserUsingBatchAction({ users }: { users: string[] }): Promise<void> {
    const userIds = this.getUserIds(users)
    await deleteUserUsingBatchAction({ page: this.#page, userIds })
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

  async openEditPanel({ key, action }: { key: string; action: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getUser({ key })
    await openEditPanel({ page: this.#page, uuid, action })
  }

  async waitForEditPanelToBeVisible(): Promise<void> {
    await waitForEditPanelToBeVisible({ page: this.#page })
  }
}

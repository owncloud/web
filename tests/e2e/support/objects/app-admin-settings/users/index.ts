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
  getUUID({ key }: { key: string }): string {
    return this.#usersEnvironment.getCreatedUser({ key }).uuid
  }

  async allowLogin({ key, action }: { key: string; action: string }): Promise<void> {
    const uuid = this.getUUID({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeAccountEnabled({ uuid, value: true, page: this.#page })
  }
  async forbidLogin({ key, action }: { key: string; action: string }): Promise<void> {
    const uuid = this.getUUID({ key })
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
    const uuid = this.getUUID({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await changeQuota({ uuid, value, page: this.#page })
  }
  async selectUser({ key }: { key: string }): Promise<void> {
    await selectUser({ page: this.#page, uuid: this.getUUID({ key }) })
  }
  async changeQuotaUsingBatchAction({
    value,
    userIds
  }: {
    value: string
    userIds: string[]
  }): Promise<void> {
    await changeQuotaUsingBatchAction({ page: this.#page, value, userIds })
  }
  getDisplayedUsers(): Promise<string[]> {
    return getDisplayedUsers({ page: this.#page })
  }
  async select({ key }: { key: string }): Promise<void> {
    await selectUser({ page: this.#page, uuid: this.getUUID({ key }) })
  }
  async addToGroupsBatchAtion({
    userIds,
    groups
  }: {
    userIds: string[]
    groups: string[]
  }): Promise<void> {
    await addSelectedUsersToGroups({ page: this.#page, userIds, groups })
  }
  async removeFromGroupsBatchAtion({
    userIds,
    groups
  }: {
    userIds: string[]
    groups: string[]
  }): Promise<void> {
    await removeSelectedUsersFromGroups({ page: this.#page, userIds, groups })
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
    const uuid = this.getUUID({ key })

    await openEditPanel({ page: this.#page, uuid, action })
    await changeUser({ uuid, attribute: attribute, value: value, page: this.#page })
    const currentUser = this.#usersEnvironment.getCreatedUser({ key })

    if (attribute !== 'role') {
      this.#usersEnvironment.updateCreatedUser({
        key: key,
        user: { ...currentUser, [attribute === 'userName' ? 'id' : attribute]: value }
      })
    }
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
    const uuid = this.getUUID({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await addUserToGroups({ page: this.#page, userId: uuid, groups })
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
    const uuid = this.getUUID({ key })
    await openEditPanel({ page: this.#page, uuid, action })
    await removeUserFromGroups({ page: this.#page, userId: uuid, groups })
  }
  async deleteUserUsingContextMenu({ key }: { key: string }): Promise<void> {
    await deleteUserUsingContextMenu({ page: this.#page, uuid: this.getUUID({ key }) })
  }
  async deleteUserUsingBatchAction({ userIds }: { userIds: string[] }): Promise<void> {
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
    const response = await createUser({ page: this.#page, name, displayname, email, password })

    this.#usersEnvironment.storeCreatedUser({
      user: {
        id: response.onPremisesSamAccountName,
        displayName: response.displayName,
        password: password,
        email: response.mail,
        uuid: response.id
      }
    })
  }

  async openEditPanel({ key, action }: { key: string; action: string }): Promise<void> {
    await openEditPanel({ page: this.#page, uuid: this.getUUID({ key }), action })
  }

  async waitForEditPanelToBeVisible(): Promise<void> {
    await waitForEditPanelToBeVisible({ page: this.#page })
  }
}

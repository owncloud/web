import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import {
  createGroup,
  openEditPanel,
  getDisplayedGroups,
  selectGroup,
  deleteGroupUsingContextMenu,
  deleteGrouprUsingBatchAction,
  changeGroup
} from './actions'

export class Groups {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }

  getUUID({ key }: { key: string }): string {
    return this.#usersEnvironment.getCreatedGroup({ key }).uuid
  }

  async createGroup({ key }: { key: string }): Promise<void> {
    const group = this.#usersEnvironment.getGroup({ key })
    const response = await createGroup({ page: this.#page, key: group.displayName })
    this.#usersEnvironment.storeCreatedGroup({
      group: {
        id: key,
        uuid: response['id'],
        displayName: response['displayName']
      }
    })
  }

  getDisplayedGroups(): Promise<string[]> {
    return getDisplayedGroups({ page: this.#page })
  }

  async selectGroup({ key }: { key: string }): Promise<void> {
    await selectGroup({ page: this.#page, uuid: this.getUUID({ key }) })
  }

  async deleteGroupUsingBatchAction({ groupIds }: { groupIds: string[] }): Promise<void> {
    await deleteGrouprUsingBatchAction({ page: this.#page, groupIds })
  }

  async deleteGroupUsingContextMenu({ key }: { key: string }): Promise<void> {
    await deleteGroupUsingContextMenu({ page: this.#page, uuid: this.getUUID({ key }) })
  }

  async changeGroup({
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
    await changeGroup({ uuid, attribute: attribute, value: value, page: this.#page })
  }

  async openEditPanel({ key, action }: { key: string; action: string }): Promise<void> {
    await openEditPanel({ page: this.#page, uuid: this.getUUID({ key }), action })
  }
}

import { Page } from '@playwright/test'
import { UsersEnvironment } from '../../../environment'
import * as po from './actions'

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
    const response = await po.createGroup({ page: this.#page, key: group.displayName })
    this.#usersEnvironment.storeCreatedGroup({
      group: {
        id: key,
        uuid: response['id'],
        displayName: response['displayName']
      }
    })
  }

  getDisplayedGroups(): Promise<string[]> {
    return po.getDisplayedGroups({ page: this.#page })
  }

  async selectGroup({ key }: { key: string }): Promise<void> {
    await po.selectGroup({ page: this.#page, uuid: this.getUUID({ key }) })
  }

  async deleteGroupUsingBatchAction({ groupIds }: { groupIds: string[] }): Promise<void> {
    await po.deleteGrouprUsingBatchAction({ page: this.#page, groupIds })
  }

  async deleteGroupUsingContextMenu({ key }: { key: string }): Promise<void> {
    await po.deleteGroupUsingContextMenu({ page: this.#page, uuid: this.getUUID({ key }) })
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
    await po.openEditPanel({ page: this.#page, uuid, action })
    await po.changeGroup({ uuid, attribute: attribute, value: value, page: this.#page })
  }

  async openEditPanel({ key, action }: { key: string; action: string }): Promise<void> {
    await po.openEditPanel({ page: this.#page, uuid: this.getUUID({ key }), action })
  }
}

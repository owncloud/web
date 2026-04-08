import { Page } from '@playwright/test'
import { UsersEnvironment } from '../../../environment'
import { World } from '../../../../../e2e-playwright/support/world'
import * as po from './actions'

export class Groups {
  #page: Page
  #usersEnvironment: UsersEnvironment
  #world?: World

  constructor({ page, world }: { page: Page; world?: World }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
    this.#world = world
  }

  getUUID({ key }: { key: string }): string {
    const actualKey = this.#world ? this.#world.getGroupId(key) : key
    return this.#usersEnvironment.getCreatedGroup({ key: actualKey }).uuid
  }

  async createGroup({ key }: { key: string }): Promise<void> {
    const group = this.#usersEnvironment.getGroup({ key, world: this.#world })
    const response = await po.createGroup({ page: this.#page, key: group.displayName })
    const actualId = this.#world ? this.#world.getGroupId(key) : key
    this.#usersEnvironment.storeCreatedGroup({
      group: {
        id: actualId,
        uuid: response['id'],
        displayName: response['displayName']
      }
    })
  }

  getDisplayedGroupsIds(): Promise<string[]> {
    return po.getDisplayedGroupsIds({ page: this.#page })
  }

  async getGroupsDisplayName(): Promise<string> {
    return po.getGroupsDisplayName({ page: this.#page })
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
}

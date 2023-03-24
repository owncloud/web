import { Page } from 'playwright'
import { UsersEnvironment } from '../../../environment'
import {
  createGroup,
  getDisplayedGroups,
  selectGroup,
  deleteGroupUsingContextMenu,
  deleteGrouprUsingBatchAction
} from './actions'

export class Groups {
  #page: Page
  #usersEnvironment: UsersEnvironment
  constructor({ page }: { page: Page }) {
    this.#usersEnvironment = new UsersEnvironment()
    this.#page = page
  }
  getUUID({ key }: { key: string }) {
    return this.#usersEnvironment.getGroup({ key }).uuid
  }
  async createGroup({ key }: { key: string }): Promise<string> {
    return await createGroup({ page: this.#page, key: key })
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
}

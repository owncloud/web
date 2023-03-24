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
    const { uuid } = this.#usersEnvironment.getGroup({ key })
    return uuid
  }
  async createGroup({ key }: { key: string }): Promise<string> {
    return await createGroup({ page: this.#page, key: key })
  }
  getDisplayedGroups(): Promise<string[]> {
    return getDisplayedGroups({ page: this.#page })
  }
  async selectGroup({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getGroup({ key })
    await selectGroup({ uuid, page: this.#page })
  }
  async deleteGroupUsingBatchAction({ groups }: { groups: string[] }): Promise<void> {
    const groupIds = []
    for (const group of groups) {
      groupIds.push(this.#usersEnvironment.getGroup({ key: group }).uuid)
    }
    await deleteGrouprUsingBatchAction({ page: this.#page, groupIds })
  }
  async deleteGroupUsingContextMenu({ key }: { key: string }): Promise<void> {
    const { uuid } = this.#usersEnvironment.getGroup({ key })
    await deleteGroupUsingContextMenu({ page: this.#page, uuid })
  }
}

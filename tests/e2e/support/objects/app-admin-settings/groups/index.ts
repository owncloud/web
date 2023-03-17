import { Page } from 'playwright'
import { createGroup } from './actions'

export class Groups {
  #page: Page
  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async createGroup({ key }: { key: string }): Promise<void> {
    await createGroup({ page: this.#page, key: key })
  }
}

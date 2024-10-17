import { Page } from '@playwright/test'
import * as po from './actions'

export class Federation {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async generateInvitation(user): Promise<void> {
    await po.generateInvitation({ page: this.#page, user })
  }

  async acceptInvitation(user): Promise<void> {
    await po.acceptInvitation({ page: this.#page, user })
    // await po.isConnectionVisible({ page: this.#page, connectionInfo })
  }
}

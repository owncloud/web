import { Page } from '@playwright/test'
import * as po from './actions'

export class Federation {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }
  async generateInvitation(): Promise<void> {
    await po.generateInvitation({ page: this.#page })
  }
}

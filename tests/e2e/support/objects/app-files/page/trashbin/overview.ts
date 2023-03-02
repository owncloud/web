import { Page } from 'playwright'

export class Overview {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="files-trash-overview"]').click()
    await this.#page.waitForSelector('#app-loading-spinner', { state: 'detached' })
  }
}

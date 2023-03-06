import { Page } from 'playwright'

export class General {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="admin-settings-general"]').click()
    await this.#page.waitForSelector('#app-loading-spinner', { state: 'detached' })
  }
}

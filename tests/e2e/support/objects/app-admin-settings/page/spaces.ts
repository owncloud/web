import { Page } from '@playwright/test'

export class Spaces {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="admin-settings-spaces"]').click()
    await this.#page.locator('#app-loading-spinner').waitFor({ state: 'detached' })
  }
}

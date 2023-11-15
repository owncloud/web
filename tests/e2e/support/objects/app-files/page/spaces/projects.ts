import { Page } from '@playwright/test'

export class Projects {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="files-spaces-projects"]').click()
    await this.#page.locator('#app-loading-spinner').waitFor({ state: 'detached' })
  }
}

import { Page } from '@playwright/test'

const groupsNavSelector = '//a[@data-nav-name="admin-settings-groups"]'
const appLoadingSpinnerSelector = '#app-loading-spinner'
export class Groups {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(groupsNavSelector).click()
    await this.#page.locator(appLoadingSpinnerSelector).waitFor({ state: 'detached' })
  }
}

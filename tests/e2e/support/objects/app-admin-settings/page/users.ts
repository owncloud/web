import { Page } from '@playwright/test'

const usersNavSelector = '//a[@data-nav-name="admin-settings-users"]'
const appLoadingSpinnerSelector = '#app-loading-spinner'
export class Users {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(usersNavSelector).click()
    await this.#page.locator(appLoadingSpinnerSelector).waitFor({ state: 'detached' })
  }
}

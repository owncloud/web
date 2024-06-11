import { Page } from '@playwright/test'

export class Overview {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('a[data-nav-name="files-trash-overview"]').click()
    await this.#page.locator('#app-loading-spinner').waitFor({ state: 'detached' })
    await this.#page.locator(':is(#files-space-table, #files-trashbin-empty)').waitFor()
  }
}

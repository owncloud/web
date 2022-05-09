import { Page } from 'playwright'

const allFilesSelector = '//a[@data-nav-name="files-spaces-personal-home"]'

export class Personal {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(allFilesSelector).click()
  }
}

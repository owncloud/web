import { Page } from 'playwright'
import { File } from '../../../types'

export class Public {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async open({ url }: { url: string }): Promise<void> {
    await this.#page.goto(url)
  }

  async authenticate({ password }: { password: string }): Promise<void> {
    await this.#page.locator('input[type="password"]').fill(password)
    await this.#page
      .locator(
        '//*[@id="password-submit"]|//*[@id="oc-textinput-3"]/ancestor::div[contains(@class, "oc-mb-s")]/following-sibling::button'
      )
      .click()
  }

  async upload({ resources }: { resources: File[] }): Promise<void> {
    await this.#page
      .locator('//input[@id="fileUploadInput"]')
      .setInputFiles(resources.map((file) => file.path))
  }
}

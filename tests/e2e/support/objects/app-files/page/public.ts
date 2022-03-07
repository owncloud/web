import { Page } from 'playwright'
import { File } from '../../../types'
import util from 'util'
import path from 'path'

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
    const startUrl = this.#page.url()
    const resourceSelector = `//tbody/tr/td[contains(@class, "oc-pl-rm") and contains(text(), "%s")]`
    await this.#page
      .locator('//input[@id="file_upload_start" or @class="dz-hidden-input"]')
      .setInputFiles(resources.map((file) => file.path))
    const names = resources.map((file) => path.basename(file.name))
    await Promise.all(
      names.map((name) => this.#page.waitForSelector(util.format(resourceSelector, name)))
    )
    await this.#page.goto(startUrl)
  }
}

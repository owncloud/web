import { Page } from 'playwright'
import { File } from '../../../types'
import util from 'util'
import path from 'path'

const passwordInput = 'input[type="password"]'
const fileUploadInput = '//input[@id="files-file-upload-input"]'
const resourceNameSelector = '[data-test-resource-name="%s"]'
const publicLinkAuthorizeButton =
  '//*[@id="password-submit"]|//*[@id="oc-textinput-3"]/ancestor::div[contains(@class, "oc-mb-s")]/following-sibling::button'
export class Public {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async open({ url }: { url: string }): Promise<void> {
    await this.#page.goto(url)
  }

  async authenticate({ password }: { password: string }): Promise<void> {
    await this.#page.locator(passwordInput).fill(password)
    await this.#page.locator(publicLinkAuthorizeButton).click()
  }

  async upload({ resources }: { resources: File[] }): Promise<void> {
    const startUrl = this.#page.url()
    await this.#page.locator(fileUploadInput).setInputFiles(resources.map((file) => file.path))
    const names = resources.map((file) => path.basename(file.name))
    await Promise.all(
      names.map((name) => this.#page.waitForSelector(util.format(resourceNameSelector, name)))
    )
    await this.#page.goto(startUrl)
  }
}

import { Download, Page } from 'playwright'
import { File } from '../../../types'
import util from 'util'
import path from 'path'
import {
  downloadResources,
  downloadResourcesArgs,
  renameResource,
  renameResourceArgs,
  uploadResource,
  uploadResourceArgs
} from '../resource/actions'

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

  async dropUpload({ resources }: { resources: File[] }): Promise<void> {
    const startUrl = this.#page.url()
    const resourceSelector = `[data-test-resource-name="%s"]`
    await this.#page
      .locator('//input[@id="files-file-upload-input"]')
      .setInputFiles(resources.map((file) => file.path))
    const names = resources.map((file) => path.basename(file.name))
    await Promise.all(
      names.map((name) => this.#page.waitForSelector(util.format(resourceSelector, name)))
    )
    await this.#page.goto(startUrl)
  }

  async reload(): Promise<void> {
    await this.#page.reload()
  }

  async download(args: Omit<downloadResourcesArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await downloadResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return downloads
  }

  async rename(args: Omit<renameResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await renameResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async upload(args: Omit<uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.locator('body').click()
  }
}

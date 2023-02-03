import { Download, Page } from 'playwright'
import { File } from '../../../types'
import util from 'util'
import path from 'path'
import {
  deleteResource,
  deleteResourceArgs,
  downloadResources,
  downloadResourcesArgs,
  renameResource,
  renameResourceArgs,
  uploadResource,
  uploadResourceArgs
} from '../resource/actions'

const passwordInput = 'input[type="password"]'
const fileUploadInput = '//input[@id="files-file-upload-input"]'
const resourceNameSelector = '[data-test-resource-name="%s"]'
const toggleUploadDetailsButton = '.upload-info-toggle-details-btn'
const uploadInfoSuccessLabelSelector = '.upload-info-success'
const publicLinkAuthorizeButton = '.oc-login-authorize-button'
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
    await this.#page.waitForSelector('#web-content')
  }

  async dropUpload({ resources }: { resources: File[] }): Promise<void> {
    const startUrl = this.#page.url()
    await this.#page.locator(fileUploadInput).setInputFiles(resources.map((file) => file.path))
    const names = resources.map((file) => path.basename(file.name))
    await this.#page.waitForSelector(uploadInfoSuccessLabelSelector)
    await this.#page.locator(toggleUploadDetailsButton).click()
    await Promise.all(
      names.map((name) => this.#page.waitForSelector(util.format(resourceNameSelector, name)))
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

  async uploadInternal(args: Omit<uploadResourceArgs, 'page'> & { link: string }): Promise<void> {
    // link is the public link url
    const { link } = args
    delete args.link
    await uploadResource({ ...args, page: this.#page })
    await this.#page.goto(link)
  }

  async delete(args: Omit<deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }
}

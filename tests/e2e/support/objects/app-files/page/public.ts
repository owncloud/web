import { Download, Page } from 'playwright'
import { File } from '../../../types'
import util from 'util'
import path from 'path'
import * as PO from '../resource/actions'

const passwordInput = 'input[type="password"]'
const fileUploadInput = '//input[@id="files-file-upload-input"]'
const dropUploadResourceSelector = '.upload-info-items [data-test-resource-name="%s"]'
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
      names.map((name) => this.#page.waitForSelector(util.format(dropUploadResourceSelector, name)))
    )
    await this.#page.goto(startUrl)
  }

  async reload(): Promise<void> {
    await this.#page.reload()
  }

  async download(args: Omit<PO.downloadResourcesArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await PO.downloadResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return downloads
  }

  async rename(args: Omit<PO.renameResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.renameResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async upload(args: Omit<PO.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.locator('body').click()
  }

  async uploadInternal(
    args: Omit<PO.uploadResourceArgs, 'page'> & { link: string }
  ): Promise<void> {
    // link is the public link url
    const { link } = args
    delete args.link
    await PO.uploadResource({ ...args, page: this.#page })
    await this.#page.goto(link)
  }

  async delete(args: Omit<PO.deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async expectThatLinkIsDeleted({ url }: { url: string }): Promise<void> {
    await PO.expectThatPublicLinkIsDeleted({ page: this.#page, url })
  }
}

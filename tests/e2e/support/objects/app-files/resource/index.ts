import { Download, Page } from 'playwright'
import {
  createResource,
  createResourceArgs,
  deleteResource,
  deleteResourceArgs,
  downloadResources,
  downloadResourcesArgs,
  moveOrCopyResource,
  moveOrCopyResourceArgs,
  renameResource,
  renameResourceArgs,
  restoreResourceVersion,
  restoreResourceVersionArgs,
  uploadResource,
  uploadResourceArgs
} from './actions'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await createResource({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    await this.#page.waitForSelector('.files-table')
  }

  async upload(args: Omit<uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await uploadResource({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
    // why? o_O
    await this.#page.locator('body').click()
  }

  async download(args: Omit<downloadResourcesArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await downloadResources({ page: this.#page, ...args })
    await this.#page.goto(startUrl)

    return downloads
  }

  async rename(args: Omit<renameResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await renameResource({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }

  async copy(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ page: this.#page, action: 'copy', ...args })
    await this.#page.goto(startUrl)
  }

  async move(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ page: this.#page, action: 'move', ...args })
    await this.#page.goto(startUrl)
  }

  async delete(args: Omit<deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteResource({ page: this.#page, ...args })
    await this.#page.goto(startUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async open(): Promise<void> {}

  async restoreVersion(args: Omit<restoreResourceVersionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await restoreResourceVersion({ page: this.#page, ...args })
    // Files details page does not update after restore button is clicked
    // This is the issue: https://github.com/owncloud/web/issues/6361
    await this.#page.reload()
    await this.#page.goto(startUrl)
  }
}

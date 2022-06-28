import { Download, Page } from 'playwright'
import {
  createResource,
  createResourceArgs,
  deleteResource,
  deleteResourceArgs,
  deleteResourceTrashbin,
  deleteResourceTrashbinArgs,
  downloadResources,
  downloadResourcesArgs,
  downloadResourceVersion,
  downloadResourceVersionArgs,
  emptyTrashBinResources,
  moveOrCopyResource,
  moveOrCopyResourceArgs,
  renameResource,
  renameResourceArgs,
  restoreResourceVersion,
  restoreResourceVersionArgs,
  uploadResource,
  uploadResourceArgs,
  restoreResourceTrashbinArgs,
  restoreResourceTrashbin
} from './actions'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await createResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.waitForSelector('.files-table')
  }

  async upload(args: Omit<uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    // why? o_O
    await this.#page.locator('body').click()
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

  async copy(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ ...args, page: this.#page, action: 'copy' })
    await this.#page.goto(startUrl)
  }

  async move(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ ...args, page: this.#page, action: 'move' })
    await this.#page.goto(startUrl)
  }

  async delete(args: Omit<deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async open(): Promise<void> {}

  async restoreVersion(args: Omit<restoreResourceVersionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await restoreResourceVersion({ ...args, page: this.#page })
    // Files details page does not update after restore button is clicked
    // This is the issue: https://github.com/owncloud/web/issues/6361
    await this.#page.reload()
    await this.#page.goto(startUrl)
  }

  async downloadVersion(args: Omit<downloadResourceVersionArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await downloadResourceVersion({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return downloads
  }

  async emptyTrashBin() {
    return await emptyTrashBinResources(this.#page)
  }

  async deleteTrashBin(args: Omit<deleteResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await deleteResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async restoreTrashBin(args: Omit<restoreResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await restoreResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }
}

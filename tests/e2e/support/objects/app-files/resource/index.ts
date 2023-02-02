import { config } from '../../../../config'
import { Download, Page } from 'playwright'
import {
  createResources,
  createResourceArgs,
  deleteResourceArgs,
  deleteResourceTrashbin,
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
  restoreResourceTrashbin,
  searchResourceGlobalSearch,
  searchResourceGlobalSearchArgs,
  getDisplayedResourcesFromSearch,
  clickResource,
  showHiddenResources,
  editResources,
  editResourcesArgs,
  openFileInViewer,
  openFileInViewerArgs,
  getDeleteResourceButtonVisibility,
  getRestoreResourceButtonVisibility,
  deleteResourceWithOption,
  deleteResourceWithOptionArgs
} from './actions'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await createResources({ ...args, page: this.#page })
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
    // Sidebar remain open after we navigate to startUrl
    // This is the issue: https://github.com/owncloud/web/issues/8172
    if (!config.ocis) {
      await this.#page.reload()
    }
  }

  async move(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ ...args, page: this.#page, action: 'move' })
    await this.#page.goto(startUrl)
    // Sidebar remain open after we navigate to startUrl
    // This is the issue: https://github.com/owncloud/web/issues/8172
    if (!config.ocis) {
      await this.#page.reload()
    }
  }

  async deleteWithOption(args: Omit<deleteResourceWithOptionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteResourceWithOption({ ...args, page: this.#page })
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

  async deleteTrashBin(args: Omit<deleteResourceArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await deleteResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async isDeleteTrashBinButtonVisible(args: Omit<deleteResourceArgs, 'page'>): Promise<boolean> {
    return await getDeleteResourceButtonVisibility({ ...args, page: this.#page })
  }

  async restoreTrashBin(args: Omit<restoreResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await restoreResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async isRestoreTrashBinButtonVisible(
    args: Omit<restoreResourceTrashbinArgs, 'page'>
  ): Promise<boolean> {
    return await getRestoreResourceButtonVisibility({ ...args, page: this.#page })
  }

  async searchResource(args: Omit<searchResourceGlobalSearchArgs, 'page'>): Promise<void> {
    await searchResourceGlobalSearch({ ...args, page: this.#page })
  }

  getDisplayedResources(): Promise<string[]> {
    return getDisplayedResourcesFromSearch(this.#page)
  }

  async openFolder(resource): Promise<void> {
    await clickResource({ page: this.#page, path: resource })
  }

  async showHiddenFiles(): Promise<void> {
    await showHiddenResources(this.#page)
  }

  async editResource(args: Omit<editResourcesArgs, 'page'>): Promise<void> {
    await editResources({ ...args, page: this.#page })
  }

  async openFileInViewer(args: Omit<openFileInViewerArgs, 'page'>): Promise<void> {
    await openFileInViewer({ ...args, page: this.#page })
  }
}

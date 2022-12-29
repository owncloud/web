import { Download, Page } from 'playwright'
import {
  createResources,
  createResourceArgs,
  deleteResource,
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
  addTagsToResource,
  removeTagsFromResource,
  getTagsForResourceVisibilityInFilesTable,
  getTagsForResourceVisibilityInDetailsPanel,
  clickTagArgs,
  clickResourceTag,
  getDisplayedResourcesArgs,
  getDisplayedResourcesFromFilesList,
  resourceTagsArgs
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

  async copy(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>, method: string): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ ...args, page: this.#page, action: 'copy' }, method)
    await this.#page.goto(startUrl)
  }

  async move(args: Omit<moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await moveOrCopyResource({ ...args, page: this.#page, action: 'move' }, 'method')
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

  async areTagsVisibleForResourceInFilesTable(
    args: Omit<resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await getTagsForResourceVisibilityInFilesTable({ ...args, page: this.#page })
  }

  async areTagsVisibleForResourceInDetailsPanel(
    args: Omit<resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await getTagsForResourceVisibilityInDetailsPanel({ ...args, page: this.#page })
  }

  async searchResource(args: Omit<searchResourceGlobalSearchArgs, 'page'>): Promise<void> {
    await searchResourceGlobalSearch({ ...args, page: this.#page })
  }

  getDisplayedResources(args: Omit<getDisplayedResourcesArgs, 'page'>): Promise<string[]> {
    if (args.keyword === 'files list') {
      return getDisplayedResourcesFromFilesList(this.#page)
    } else if (args.keyword === 'search list') {
      return getDisplayedResourcesFromSearch(this.#page)
    } else {
      throw new Error('Unknown keyword')
    }
  }

  async openFolder(resource): Promise<void> {
    await clickResource({ page: this.#page, path: resource })
  }

  async showHiddenFiles(): Promise<void> {
    await showHiddenResources(this.#page)
  }

  async editResourse(args: Omit<editResourcesArgs, 'page'>): Promise<void> {
    await editResources({ ...args, page: this.#page })
  }

  async openFileInViewer(args: Omit<openFileInViewerArgs, 'page'>): Promise<void> {
    await openFileInViewer({ ...args, page: this.#page })
  }

  async addTags(args: Omit<resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await addTagsToResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeTags(args: Omit<resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await removeTagsFromResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async clickTag(args: Omit<clickTagArgs, 'page'>): Promise<void> {
    return await clickResourceTag({ ...args, page: this.#page })
  }
}

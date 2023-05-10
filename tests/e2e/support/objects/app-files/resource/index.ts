import { config } from '../../../../config'
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
  resourceVersionArgs,
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
  expectThatDeleteButtonIsNotVisible,
  expectThatRestoreResourceButtonVisibility,
  deleteResourceTrashbinArgs,
  addTagsToResource,
  removeTagsFromResource,
  getTagsForResourceVisibilityInFilesTable,
  getTagsForResourceVisibilityInDetailsPanel,
  clickTagArgs,
  clickResourceTag,
  getDisplayedResourcesArgs,
  getDisplayedResourcesFromFilesList,
  resourceTagsArgs,
  clickViewModeToggle,
  expectThatResourcesAreTiles,
  createSpaceFromFolder,
  createSpaceFromFolderArgs,
  createSpaceFromSelection,
  createSpaceFromSelectionArgs,
  checkThatFileVersionIsNotAvailable,
  changePageArgs,
  changePagePersonalSpace,
  getFileListFooterText,
  getNumberOfResourcesInThePage,
  changeItemsPerPage,
  changeItemsPerPageArgs,
  expectPageNumberNotToBeVisible
} from './actions'
import { Space } from '../../../types'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await createResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.waitForSelector('#files-view')
  }

  async upload(args: Omit<uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    if (!config.ocis) {
      await this.#page.locator('body').click()
    }
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

  async delete(args: Omit<deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async open(): Promise<void> {}

  async restoreVersion(args: Omit<resourceVersionArgs, 'page'>): Promise<void> {
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

  async expectThatDeleteTrashBinButtonIsNotVisible(
    args: Omit<deleteResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await expectThatDeleteButtonIsNotVisible({ ...args, page: this.#page })
  }

  async restoreTrashBin(args: Omit<restoreResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await restoreResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async expectThatRestoreTrashBinButtonIsNotVisible(
    args: Omit<restoreResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await expectThatRestoreResourceButtonVisibility({ ...args, page: this.#page })
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

  async switchToTilesViewMode(): Promise<void> {
    await clickViewModeToggle({ page: this.#page, target: 'resource-tiles' })
  }

  async expectThatResourcesAreTiles(): Promise<void> {
    await expectThatResourcesAreTiles({ page: this.#page })
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

  async createSpaceFromFolder(args: Omit<createSpaceFromFolderArgs, 'page'>): Promise<Space> {
    return createSpaceFromFolder({ ...args, page: this.#page })
  }

  async createSpaceFromSelection(args: Omit<createSpaceFromSelectionArgs, 'page'>): Promise<Space> {
    return createSpaceFromSelection({ ...args, page: this.#page })
  }

  async checkThatFileVersionIsNotAvailable(args: Omit<resourceVersionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await checkThatFileVersionIsNotAvailable({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async changePagePersonalSpace(args: Omit<changePageArgs, 'page'>): Promise<void> {
    await changePagePersonalSpace({ ...args, page: this.#page })
  }

  async changeItemsPerPage(args: Omit<changeItemsPerPageArgs, 'page'>): Promise<void> {
    await changeItemsPerPage({ ...args, page: this.#page })
  }

  async getFileListFooterText(): Promise<string> {
    return getFileListFooterText({ page: this.#page })
  }

  async getNumberOfResourcesInThePage(): Promise<string> {
    return getNumberOfResourcesInThePage({ page: this.#page })
  }

  async expectPageNumberNotToBeVisible(): Promise<void> {
    await expectPageNumberNotToBeVisible({ page: this.#page })
  }
}

import { Download, Page } from 'playwright'
import * as PO from './actions'
import { Space } from '../../../types'
import { config } from '../../../../config'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<PO.createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.createResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.waitForSelector('#files-view')
  }

  async upload(args: Omit<PO.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    if (!config.ocis) {
      await this.#page.locator('body').click()
    }
  }

  async uploadSmallResources(args: Omit<PO.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.uploadMultipleSmallResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    if (!config.ocis) {
      await this.#page.locator('body').click()
    }
  }

  async dropUpload(args: Omit<PO.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.dropUploadFiles({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
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

  async copy(args: Omit<PO.moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.moveOrCopyResource({ ...args, page: this.#page, action: 'copy' })
    await this.#page.goto(startUrl)
    // Sidebar remain open after we navigate to startUrl
    // This is the issue: https://github.com/owncloud/web/issues/8172
    if (!config.ocis) {
      await this.#page.reload()
    }
  }

  async move(args: Omit<PO.moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.moveOrCopyResource({ ...args, page: this.#page, action: 'move' })
    await this.#page.goto(startUrl)
    // Sidebar remain open after we navigate to startUrl
    // This is the issue: https://github.com/owncloud/web/issues/8172
    if (!config.ocis) {
      await this.#page.reload()
    }
  }

  async delete(args: Omit<PO.deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async open(): Promise<void> {}

  async restoreVersion(args: Omit<PO.resourceVersionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.restoreResourceVersion({ ...args, page: this.#page })
    // Files details page does not update after restore button is clicked
    // This is the issue: https://github.com/owncloud/web/issues/6361
    await this.#page.reload()
    await this.#page.goto(startUrl)
  }

  async downloadVersion(args: Omit<PO.downloadResourceVersionArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await PO.downloadResourceVersion({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return downloads
  }

  async emptyTrashBin() {
    return await PO.emptyTrashBinResources(this.#page)
  }

  async deleteTrashBin(args: Omit<PO.deleteResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await PO.deleteResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async expectThatDeleteTrashBinButtonIsNotVisible(
    args: Omit<PO.deleteResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await PO.expectThatDeleteButtonIsNotVisible({ ...args, page: this.#page })
  }

  async restoreTrashBin(args: Omit<PO.restoreResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await PO.restoreResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async expectThatRestoreTrashBinButtonIsNotVisible(
    args: Omit<PO.restoreResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await PO.expectThatRestoreResourceButtonVisibility({ ...args, page: this.#page })
  }

  async areTagsVisibleForResourceInFilesTable(
    args: Omit<PO.resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await PO.getTagsForResourceVisibilityInFilesTable({ ...args, page: this.#page })
  }

  async areTagsVisibleForResourceInDetailsPanel(
    args: Omit<PO.resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await PO.getTagsForResourceVisibilityInDetailsPanel({
      ...args,
      page: this.#page
    })
  }

  async searchResource(args: Omit<PO.searchResourceGlobalSearchArgs, 'page'>): Promise<void> {
    await PO.searchResourceGlobalSearch({ ...args, page: this.#page })
  }

  getDisplayedResources(args: Omit<PO.getDisplayedResourcesArgs, 'page'>): Promise<string[]> {
    if (args.keyword === 'files list') {
      return PO.getDisplayedResourcesFromFilesList(this.#page)
    } else if (args.keyword === 'search list') {
      return PO.getDisplayedResourcesFromSearch(this.#page)
    } else {
      throw new Error('Unknown keyword')
    }
  }

  async openFolder(resource): Promise<void> {
    await PO.clickResource({ page: this.#page, path: resource })
  }

  async switchToTilesViewMode(): Promise<void> {
    await PO.clickViewModeToggle({ page: this.#page, target: 'resource-tiles' })
  }

  async expectThatResourcesAreTiles(): Promise<void> {
    await PO.expectThatResourcesAreTiles({ page: this.#page })
  }

  async showHiddenFiles(): Promise<void> {
    await PO.showHiddenResources(this.#page)
  }

  async editResource(args: Omit<PO.editResourcesArgs, 'page'>): Promise<void> {
    await PO.editResources({ ...args, page: this.#page })
  }

  async openFileInViewer(args: Omit<PO.openFileInViewerArgs, 'page'>): Promise<void> {
    await PO.openFileInViewer({ ...args, page: this.#page })
  }

  async addTags(args: Omit<PO.resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.addTagsToResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeTags(args: Omit<PO.resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await PO.removeTagsFromResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async clickTag(args: Omit<PO.clickTagArgs, 'page'>): Promise<void> {
    return await PO.clickResourceTag({ ...args, page: this.#page })
  }

  createSpaceFromFolder(args: Omit<PO.createSpaceFromFolderArgs, 'page'>): Promise<Space> {
    return PO.createSpaceFromFolder({ ...args, page: this.#page })
  }

  createSpaceFromSelection(args: Omit<PO.createSpaceFromSelectionArgs, 'page'>): Promise<Space> {
    return PO.createSpaceFromSelection({ ...args, page: this.#page })
  }

  async checkThatFileVersionIsNotAvailable(
    args: Omit<PO.resourceVersionArgs, 'page'>
  ): Promise<void> {
    const startUrl = this.#page.url()
    await PO.checkThatFileVersionIsNotAvailable({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async changePage(args: Omit<PO.changePageArgs, 'page'>): Promise<void> {
    await PO.changePage({ ...args, page: this.#page })
  }

  async changeItemsPerPage(args: Omit<PO.changeItemsPerPageArgs, 'page'>): Promise<void> {
    await PO.changeItemsPerPage({ ...args, page: this.#page })
  }

  getFileListFooterText(): Promise<string> {
    return PO.getFileListFooterText({ page: this.#page })
  }

  countNumberOfResourcesInThePage(): Promise<number> {
    return PO.countNumberOfResourcesInThePage({ page: this.#page })
  }

  async expectPageNumberNotToBeVisible(): Promise<void> {
    await PO.expectPageNumberNotToBeVisible({ page: this.#page })
  }
}

import { Download, Page } from '@playwright/test'
import * as po from './actions'
import { Space } from '../../../types'

export class Resource {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async create(args: Omit<po.createResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.createResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    await this.#page.locator('#files-view').waitFor()
  }

  async upload(args: Omit<po.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.uploadResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async uploadLargeNumberOfResources(args: Omit<po.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.uploadLargeNumberOfResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async dropUpload(args: Omit<po.uploadResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.dropUploadFiles({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  // uploads the file but does check if the upload was successful
  // and does not navigate back to the startUrl
  startUpload(args: Omit<po.uploadResourceArgs, 'page'>): Promise<void> {
    return po.startResourceUpload({ ...args, page: this.#page })
  }

  pauseUpload(): Promise<void> {
    return po.pauseResourceUpload(this.#page)
  }

  async resumeUpload(): Promise<void> {
    const startUrl = this.#page.url()
    await po.resumeResourceUpload(this.#page)
    await this.#page.goto(startUrl)
  }

  cancelUpload(): Promise<void> {
    return po.cancelResourceUpload(this.#page)
  }

  async download(args: Omit<po.downloadResourcesArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await po.downloadResources({ ...args, page: this.#page })
    await this.#page.goto(startUrl)

    return downloads
  }

  async rename(args: Omit<po.renameResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.renameResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async copy(args: Omit<po.moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.moveOrCopyResource({ ...args, page: this.#page, action: 'copy' })
    await this.#page.goto(startUrl)
  }

  async move(args: Omit<po.moveOrCopyResourceArgs, 'page' | 'action'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.moveOrCopyResource({ ...args, page: this.#page, action: 'move' })
    await this.#page.goto(startUrl)
  }

  async copyMultipleResources(args: Omit<po.moveOrCopyMultipleResourceArgs, 'page' | 'action'>) {
    const startUrl = this.#page.url()
    await po.moveOrCopyMultipleResources({ ...args, page: this.#page, action: 'copy' })
    await this.#page.goto(startUrl)
  }

  async moveMultipleResources(args: Omit<po.moveOrCopyMultipleResourceArgs, 'page' | 'action'>) {
    const startUrl = this.#page.url()
    await po.moveOrCopyMultipleResources({ ...args, page: this.#page, action: 'move' })
    await this.#page.goto(startUrl)
  }

  async delete(args: Omit<po.deleteResourceArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.deleteResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async open(): Promise<void> {}

  async restoreVersion(args: Omit<po.resourceVersionArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.restoreResourceVersion({ ...args, page: this.#page })
    // Files details page does not update after restore button is clicked
    // This is the issue: https://github.com/owncloud/web/issues/6361
    await this.#page.reload()
    await this.#page.goto(startUrl)
  }

  async downloadVersion(args: Omit<po.downloadResourceVersionArgs, 'page'>): Promise<Download[]> {
    const startUrl = this.#page.url()
    const downloads = await po.downloadResourceVersion({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return downloads
  }

  async deleteTrashBin(args: Omit<po.deleteResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await po.deleteResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async expectThatDeleteTrashBinButtonIsNotVisible(
    args: Omit<po.deleteResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await po.expectThatDeleteButtonIsNotVisible({ ...args, page: this.#page })
  }

  async restoreTrashBin(args: Omit<po.restoreResourceTrashbinArgs, 'page'>): Promise<string> {
    const startUrl = this.#page.url()
    const message = await po.restoreResourceTrashbin({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
    return message
  }

  async expectThatRestoreTrashBinButtonIsNotVisible(
    args: Omit<po.restoreResourceTrashbinArgs, 'page'>
  ): Promise<void> {
    return await po.expectThatRestoreResourceButtonVisibility({ ...args, page: this.#page })
  }

  async areTagsVisibleForResourceInFilesTable(
    args: Omit<po.resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await po.getTagsForResourceVisibilityInFilesTable({ ...args, page: this.#page })
  }

  async areTagsVisibleForResourceInDetailsPanel(
    args: Omit<po.resourceTagsArgs, 'page'>
  ): Promise<boolean> {
    return await po.getTagsForResourceVisibilityInDetailsPanel({
      ...args,
      page: this.#page
    })
  }

  async searchResource(args: Omit<po.searchResourceGlobalSearchArgs, 'page'>): Promise<void> {
    await po.searchResourceGlobalSearch({ ...args, page: this.#page })
  }

  getDisplayedResources(args: Omit<po.getDisplayedResourcesArgs, 'page'>): Promise<string[]> {
    if (args.keyword === 'files list') {
      return po.getDisplayedResourcesFromFilesList(this.#page)
    } else if (args.keyword === 'search list') {
      return po.getDisplayedResourcesFromSearch(this.#page)
    } else {
      throw new Error('Unknown keyword')
    }
  }

  async openFolder(resource): Promise<void> {
    await po.clickResource({ page: this.#page, path: resource })
  }

  async switchToTilesViewMode(): Promise<void> {
    await po.clickViewModeToggle({ page: this.#page, target: 'resource-tiles' })
  }

  async expectThatResourcesAreTiles(): Promise<void> {
    await po.expectThatResourcesAreTiles({ page: this.#page })
  }

  async showHiddenFiles(): Promise<void> {
    await po.showHiddenResources(this.#page)
  }

  async editResource(args: Omit<po.editResourcesArgs, 'page'>): Promise<void> {
    await po.editResources({ ...args, page: this.#page })
  }

  async openFileInViewer(args: Omit<po.openFileInViewerArgs, 'page'>): Promise<void> {
    await po.openFileInViewer({ ...args, page: this.#page })
  }

  async addTags(args: Omit<po.resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.addTagsToResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async removeTags(args: Omit<po.resourceTagsArgs, 'page'>): Promise<void> {
    const startUrl = this.#page.url()
    await po.removeTagsFromResource({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async clickTag(args: Omit<po.clickTagArgs, 'page'>): Promise<void> {
    return await po.clickResourceTag({ ...args, page: this.#page })
  }

  createSpaceFromFolder(args: Omit<po.createSpaceFromFolderArgs, 'page'>): Promise<Space> {
    return po.createSpaceFromFolder({ ...args, page: this.#page })
  }

  createSpaceFromSelection(args: Omit<po.createSpaceFromSelectionArgs, 'page'>): Promise<Space> {
    return po.createSpaceFromSelection({ ...args, page: this.#page })
  }

  async checkThatFileVersionIsNotAvailable(
    args: Omit<po.resourceVersionArgs, 'page'>
  ): Promise<void> {
    const startUrl = this.#page.url()
    await po.checkThatFileVersionIsNotAvailable({ ...args, page: this.#page })
    await this.#page.goto(startUrl)
  }

  async changePage(args: Omit<po.changePageArgs, 'page'>): Promise<void> {
    await po.changePage({ ...args, page: this.#page })
  }

  async changeItemsPerPage(args: Omit<po.changeItemsPerPageArgs, 'page'>): Promise<void> {
    await po.changeItemsPerPage({ ...args, page: this.#page })
  }

  getFileListFooterText(): Promise<string> {
    return po.getFileListFooterText({ page: this.#page })
  }

  countNumberOfResourcesInThePage(): Promise<number> {
    return po.countNumberOfResourcesInThePage({ page: this.#page })
  }

  async expectPageNumberNotToBeVisible(): Promise<void> {
    await po.expectPageNumberNotToBeVisible({ page: this.#page })
  }

  async expectFileToBeSelected(args: Omit<po.expectFileToBeSelectedArgs, 'page'>): Promise<void> {
    await po.expectFileToBeSelected({ ...args, page: this.#page })
  }
}

import { Page } from '@playwright/test'
import * as po from './actions'

export class Accessibility {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  getSelectors(): { [key: string]: string } {
    return po.selectors
  }

  async getAccessibilityConformityViolations(include: string): Promise<any> {
    return await po.analyzeAccessibilityConformityViolations({ page: this.#page, include })
  }

  async getAccessibilityConformityViolationsWithException(
    include: string,
    exclude: string
  ): Promise<any> {
    return await po.analyzeAccessibilityConformityViolationsWithException({
      page: this.#page,
      include,
      exclude
    })
  }

  async getAccessibilityConformityViolationsWith2Exceptions(
    include: string,
    exclude: string,
    exclude2: string
  ): Promise<any> {
    return await po.analyzeAccessibilityConformityViolationsWith2Exceptions({
      page: this.#page,
      include,
      exclude,
      exclude2
    })
  }

  switchToCondensedTableView(): Promise<void> {
    return po.switchToCondensedTableView({ page: this.#page })
  }

  switchToDefaultTableView(): Promise<void> {
    return po.switchToDefaultTableView({ page: this.#page })
  }

  showDisplayOptions(): Promise<void> {
    return po.showDisplayOptions({ page: this.#page })
  }

  closeDisplayOptions(): Promise<void> {
    return po.closeDisplayOptions({ page: this.#page })
  }

  openFilesContextMenu(): Promise<void> {
    return po.openFilesContextMenu({ page: this.#page })
  }

  exitContextMenu(): Promise<void> {
    return po.exitContextMenu({ page: this.#page })
  }

  selectNew(): Promise<void> {
    return po.selectNew({ page: this.#page })
  }

  selectFolderOptionWithinNew(): Promise<void> {
    return po.selectFolderOptionWithinNew({ page: this.#page })
  }

  cancelCreatingNewFolder(): Promise<void> {
    return po.cancelCreatingNewFolder({ page: this.#page })
  }

  selectUpload(): Promise<void> {
    return po.selectUpload({ page: this.#page })
  }

  selectFileThroughCheckbox(): Promise<void> {
    return po.checkFileCheckbox({ page: this.#page })
  }

  deselectFileThroughCheckbox(): Promise<void> {
    return po.uncheckFileCheckbox({ page: this.#page })
  }
}
